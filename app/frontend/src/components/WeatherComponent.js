import React, { useState } from 'react';
import axios from 'axios';

const WeatherComponent = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);

  const getWeather = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/weather?city=${city}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div>
      <h1>Weather App</h1>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city"
      />
      <button onClick={getWeather}>Get Weather</button>
      {weather && (
        <div>
          <h2>Weather in {weather.city}</h2>
          <p>Temperature: {weather.temperature}°C</p>
          <p>Min Temperature: {weather.temp_min}°C</p>
          <p>Max Temperature: {weather.temp_max}°C</p>
          <p>Condition: {weather.weather_main}</p>
          <p>Wind Speed: {weather.wind_speed} m/s</p>
          <p>Humidity: {weather.humidity}%</p>
          <p>Sunrise: {formatTime(weather.sunrise)}</p>
          <p>Sunset: {formatTime(weather.sunset)}</p>
        </div>
      )}
    </div>
  );
};

export default WeatherComponent;