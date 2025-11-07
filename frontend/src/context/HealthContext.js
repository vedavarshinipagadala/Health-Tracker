import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const HealthContext = createContext();

const HealthProvider = ({ children }) => {
  const [tracks, setTracks] = useState([]);

  // Get token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tracks', {
          headers: getAuthHeader()
        });
        console.log('Fetched tracks from backend:', response.data);
        setTracks(response.data);
      } catch (error) {
        console.error('Error fetching health tracks:', error.message);
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload();
        }
      }
    };

    fetchTracks();
  }, []);

  const updateTrack = async (date, newData) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/tracks/${date}`,
        newData,
        {
          headers: getAuthHeader()
        }
      );
      
      setTracks((prevTracks) => {
        const index = prevTracks.findIndex(
          (track) => {
            const trackDate = new Date(track.date).toISOString().split('T')[0];
            return trackDate === date;
          }
        );

        if (index !== -1) {
          // Update existing track
          const updatedTracks = [...prevTracks];
          updatedTracks[index] = response.data;
          return updatedTracks.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
          // Add new track at the beginning
          return [response.data, ...prevTracks];
        }
      });
    } catch (error) {
      console.error('Error updating health track:', error.message);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      }
    }
  };

  const getTracksForDate = (dateString) => {
    console.log('=== getTracksForDate Debug ===');
    console.log('Input dateString:', dateString);
    console.log('Total tracks available:', tracks.length);
    
    if (!dateString) {
      console.log('No date selected, returning all tracks');
      return tracks;
    }
    
    // Filter tracks based on the selected date
    const filteredTracks = tracks.filter((track) => {
      // Get the date part from track.date (handle both Date objects and strings)
      let trackDateString;
      
      if (track.date instanceof Date) {
        trackDateString = track.date.toISOString().split('T')[0];
      } else {
        // Handle string dates from SQL
        const trackDate = new Date(track.date);
        trackDateString = trackDate.toISOString().split('T')[0];
      }
      
      console.log(`Comparing track date: ${trackDateString} with selected: ${dateString}`);
      
      const matches = trackDateString === dateString;
      if (matches) {
        console.log('✓ MATCH FOUND!', track);
      }
      
      return matches;
    });
    
    console.log('Filtered result count:', filteredTracks.length);
    console.log('Filtered tracks:', filteredTracks);
    console.log('=== End Debug ===');
    
    return filteredTracks;
  };

  const value = {
    tracks,
    updateTrack,
    getTracksForDate,
  };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
};

export { HealthContext, HealthProvider };