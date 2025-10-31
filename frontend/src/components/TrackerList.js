// src/components/TrackerList.js
import React, { useContext, useState } from 'react';
import { HealthContext } from '../context/HealthContext';
import TrackerCard from './TrackerCard';

const TrackerList = () => {
  const { tracks, getTracksForDate } = useContext(HealthContext);
  const [selectedDate, setSelectedDate] = useState('');

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;
    console.log('Selected Date:', selectedDate);
    setSelectedDate(selectedDate);
  };

  // Show all tracks by default, filter only when date is selected
  const filteredTracks = selectedDate 
    ? getTracksForDate(selectedDate) 
    : tracks;

  console.log('Filtered Tracks:', filteredTracks);

  return (
    <div className="tracker-list">
      <h2>Records List</h2>
      <label htmlFor="datePicker">
        Select a date (optional):
      </label>
      <input
        type="date"
        id="datePicker"
        value={selectedDate}
        onChange={handleDateChange} 
      />
      {selectedDate && (
        <button 
          onClick={() => setSelectedDate('')}
          style={{
            marginLeft: '10px',
            padding: '5px 15px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear Filter
        </button>
      )}
      <div className='lists'>
        {
          filteredTracks.length === 0 ? (
            <p>
              {selectedDate 
                ? 'No tracks found for the selected date.' 
                : 'No tracks available. Add your first health data!'}
            </p>
          ) : (
            filteredTracks.map((data) => (
              <TrackerCard key={data.id || data.date} data={data} />
            ))
          )
        }
      </div>
    </div>
  );
};

export default TrackerList;