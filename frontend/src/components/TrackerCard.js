// src/components/TrackerCard.js
import React from 'react';

const TrackerCard = ({ data }) => {
  // Handle both camelCase (from form) and snake_case (from database)
  const steps = data.steps;
  const caloriesBurned = data.calories_burned || data.caloriesBurned;
  const distanceCovered = data.distance_covered || data.distanceCovered;
  const weight = data.weight;
  const date = data.date;

  // Format date properly
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="tracker-card">
      <h3>📅 {formattedDate}</h3>
      <p>
        <span className='span'>👣 Steps:</span>
        <span className='value'>{steps || 0}</span>
      </p>
      <p>
        <span className='span'>🔥 Calories:</span>
        <span className='value'>{caloriesBurned || 0}</span>
      </p>
      <p>
        <span className='span'>📏 Distance:</span>
        <span className='value'>{distanceCovered || 0} km</span>
      </p>
      <p>
        <span className='span'>⚖️ Weight:</span>
        <span className='value'>{weight || 0} kg</span>
      </p>
    </div>
  );
};

export default TrackerCard;