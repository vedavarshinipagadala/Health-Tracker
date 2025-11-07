const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = '387dc9be65207bb4c3a8b0481231ede876e68b9f46d711be7b59254ad7519545'; // Change this!

app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/healthtracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Health Data Schema
const healthDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  steps: { type: Number, default: 0 },
  caloriesBurned: { type: Number, default: 0 },
  distanceCovered: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Create compound index for unique user-date combinations
healthDataSchema.index({ userId: 1, date: 1 }, { unique: true });

const HealthData = mongoose.model('HealthData', healthDataSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

//----------------------------//
// Authentication Routes
//----------------------------//

// Register new user
app.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or username' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login user
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Verify token
app.get('/auth/verify', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

//----------------------------//
// Health Data Routes (Protected)
//----------------------------//

// Get all tracks for logged-in user
app.get('/tracks', authenticateToken, async (req, res) => {
  try {
    const tracks = await HealthData.find({ userId: req.user.id })
      .sort({ date: -1 })
      .lean();

    // Format dates for frontend
    const formattedTracks = tracks.map(track => ({
      id: track._id,
      date: track.date.toISOString().split('T')[0],
      steps: track.steps,
      calories_burned: track.caloriesBurned,
      distance_covered: track.distanceCovered,
      weight: track.weight
    }));

    res.json(formattedTracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get tracks for a particular day
app.get('/tracks/:date', authenticateToken, async (req, res) => {
  const requestedDate = new Date(req.params.date);
  
  try {
    const track = await HealthData.findOne({
      userId: req.user.id,
      date: requestedDate
    }).lean();

    if (!track) {
      return res.json([]);
    }

    const formattedTrack = {
      id: track._id,
      date: track.date.toISOString().split('T')[0],
      steps: track.steps,
      calories_burned: track.caloriesBurned,
      distance_covered: track.distanceCovered,
      weight: track.weight
    };

    res.json([formattedTrack]);
  } catch (error) {
    console.error('Error fetching tracks for date:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update or create values for a particular day
app.put('/tracks/:date', authenticateToken, async (req, res) => {
  const requestedDate = new Date(req.params.date);
  const { steps, caloriesBurned, distanceCovered, weight } = req.body;
  
  try {
    const track = await HealthData.findOneAndUpdate(
      { userId: req.user.id, date: requestedDate },
      {
        steps: steps || 0,
        caloriesBurned: caloriesBurned || 0,
        distanceCovered: distanceCovered || 0,
        weight: weight || 0
      },
      { new: true, upsert: true, lean: true }
    );

    const formattedTrack = {
      id: track._id,
      date: track.date.toISOString().split('T')[0],
      steps: track.steps,
      calories_burned: track.caloriesBurned,
      distance_covered: track.distanceCovered,
      weight: track.weight
    };

    res.json(formattedTrack);
  } catch (error) {
    console.error('Error updating/creating track:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a track for a particular day
app.delete('/tracks/:date', authenticateToken, async (req, res) => {
  const requestedDate = new Date(req.params.date);
  
  try {
    await HealthData.findOneAndDelete({
      userId: req.user.id,
      date: requestedDate
    });

    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});