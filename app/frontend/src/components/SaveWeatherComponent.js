import React from 'react';
import axios from 'axios';

const SaveWeatherComponent = ({ weather }) => {
  const saveWeather = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:4000/weather/save', weather, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Weather saved:', response.data);
    } catch (error) {
      console.error('Error saving weather data:', error);
    }
  };

  return (
    <button onClick={saveWeather}>Save Weather</button>
  );
};

export default SaveWeatherComponent;