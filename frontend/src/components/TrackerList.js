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
      <h2>📊 Health Records</h2>
      <div className="date-filter">
        <label htmlFor="datePicker">
          Filter by Date:
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
            className="clear-filter-btn"
          >
            Clear Filter
          </button>
        )}
      </div>
      <div className='lists'>
        {
          filteredTracks.length === 0 ? (
            <div className="no-tracks">
              <p>
                {selectedDate 
                  ? '📅 No records found for the selected date.' 
                  : '🏃 No records available yet. Start tracking your health today!'}
              </p>
            </div>
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