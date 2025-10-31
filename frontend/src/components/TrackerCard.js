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
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="tracker-card">
      <h3>
        <span className='span'>Date: </span>
        {formattedDate}
      </h3>
      <p>
        <span className='span'>Steps: </span>
        {steps || 0}
      </p>
      <p>
        <span className='span'>Calories Burned: </span>
        {caloriesBurned || 0}
      </p>
      <p>
        <span className='span'>Distance Covered: </span>
        {distanceCovered || 0} km
      </p>
      <p>
        <span className='span'>Weight: </span>
        {weight || 0} Kg
      </p>
    </div>
  );
};

export default TrackerCard;