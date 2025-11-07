import React, { useState, useContext, useEffect } from 'react';
import { HealthContext } from '../context/HealthContext';

const HealthForm = ({ onClose }) => {
  const { updateTrack, getTracksForDate } = useContext(HealthContext);
  const [formData, setFormData] = useState({
    steps: '',
    caloriesBurned: '',
    distanceCovered: '',
    weight: '',
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTracks = getTracksForDate(today);
    
    if (todayTracks.length > 0) {
      const todayData = todayTracks[0];
      setFormData({
        steps: todayData.steps || '',
        caloriesBurned: todayData.calories_burned || '',
        distanceCovered: todayData.distance_covered || '',
        weight: todayData.weight || '',
      });
    }
  }, [getTracksForDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const today = new Date().toISOString().split('T')[0];
    const dataToSend = {
      steps: parseInt(formData.steps) || 0,
      caloriesBurned: parseInt(formData.caloriesBurned) || 0,
      distanceCovered: parseFloat(formData.distanceCovered) || 0,
      weight: parseFloat(formData.weight) || 0,
    };

    await updateTrack(today, dataToSend);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="health-form" onClick={(e) => e.stopPropagation()}>
        <h2>📝 Health Data Entry</h2>
        <form onSubmit={handleSubmit}>
          <label>
            👣 Steps
            <input
              type="number"
              name="steps"
              value={formData.steps}
              onChange={handleChange}
              placeholder="Enter your steps"
            />
          </label>

          <label>
            🔥 Calories Burned
            <input
              type="number"
              name="caloriesBurned"
              value={formData.caloriesBurned}
              onChange={handleChange}
              placeholder="Enter calories burned"
            />
          </label>

          <label>
            📏 Distance Covered (km)
            <input
              type="number"
              step="0.1"
              name="distanceCovered"
              value={formData.distanceCovered}
              onChange={handleChange}
              placeholder="Enter distance in km"
            />
          </label>

          <label>
            ⚖️ Weight (kg)
            <input
              type="number"
              step="0.1"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Enter your weight"
            />
          </label>

          <button type="submit">💾 Save Data</button>
          <button type="button" onClick={onClose}>
            ❌ Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default HealthForm;