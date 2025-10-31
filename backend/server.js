const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root', // Change this to your MySQL password
  database: 'healthtracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database and table
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS health_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        steps INT,
        calories_burned INT,
        distance_covered DECIMAL(10, 2),
        weight DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_date (date)
      )
    `);
    
    // Check if data exists
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM health_data');
    
    if (rows[0].count === 0) {
      // Seed initial data
      const initialData = [
        ['2022-01-01', 5000, 200, 2.5, 70],
        ['2022-01-02', 8000, 300, 3.2, 69],
        ['2022-01-03', 6500, 250, 2.8, 69.5],
        ['2022-01-04', 7200, 280, 3.0, 69.2]
      ];
      
      for (const data of initialData) {
        await connection.query(
          'INSERT INTO health_data (date, steps, calories_burned, distance_covered, weight) VALUES (?, ?, ?, ?, ?)',
          data
        );
      }
      console.log('Data seeded successfully.');
    } else {
      console.log('Data already exists. Skipping seed.');
    }
    
    connection.release();
    console.log('MySQL connected successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

initializeDatabase();

//----------------------------//
// Routes
//----------------------------//

// Get all tracks
app.get('/tracks', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, DATE_FORMAT(date, "%Y-%m-%d") as date, steps, calories_burned, distance_covered, weight FROM health_data ORDER BY date DESC'
    );
    console.log('Returning tracks:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get tracks for a particular day
app.get('/tracks/:date', async (req, res) => {
  const requestedDate = req.params.date;
  console.log('Fetching tracks for date:', requestedDate);
  
  try {
    const [rows] = await pool.query(
      'SELECT id, DATE_FORMAT(date, "%Y-%m-%d") as date, steps, calories_burned, distance_covered, weight FROM health_data WHERE date = ?',
      [requestedDate]
    );
    console.log('Found tracks:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tracks for date:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update or create values for a particular day
app.put('/tracks/:date', async (req, res) => {
  const requestedDate = req.params.date;
  const { steps, caloriesBurned, distanceCovered, weight } = req.body;
  
  console.log('PUT request for date:', requestedDate);
  console.log('Data:', { steps, caloriesBurned, distanceCovered, weight });
  
  try {
    // Check if record exists for this date
    const [existing] = await pool.query(
      'SELECT * FROM health_data WHERE date = ?',
      [requestedDate]
    );
    
    if (existing.length > 0) {
      // Update existing record
      await pool.query(
        `UPDATE health_data 
         SET steps = ?, calories_burned = ?, distance_covered = ?, weight = ?
         WHERE date = ?`,
        [steps, caloriesBurned, distanceCovered, weight, requestedDate]
      );
      
      const [updated] = await pool.query(
        'SELECT id, DATE_FORMAT(date, "%Y-%m-%d") as date, steps, calories_burned, distance_covered, weight FROM health_data WHERE date = ?',
        [requestedDate]
      );
      console.log('Updated record:', updated[0]);
      res.json(updated[0]);
    } else {
      // Insert new record
      await pool.query(
        `INSERT INTO health_data (date, steps, calories_burned, distance_covered, weight)
         VALUES (?, ?, ?, ?, ?)`,
        [requestedDate, steps, caloriesBurned, distanceCovered, weight]
      );
      
      const [newRecord] = await pool.query(
        'SELECT id, DATE_FORMAT(date, "%Y-%m-%d") as date, steps, calories_burned, distance_covered, weight FROM health_data WHERE date = ?',
        [requestedDate]
      );
      console.log('Created new record:', newRecord[0]);
      res.status(200).json(newRecord[0]);
    }
  } catch (error) {
    console.error('Error updating/creating track:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a track for a particular day (optional)
app.delete('/tracks/:date', async (req, res) => {
  const requestedDate = req.params.date;
  
  try {
    await pool.query('DELETE FROM health_data WHERE date = ?', [requestedDate]);
    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});