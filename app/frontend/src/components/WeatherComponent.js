import React, { useState } from 'react';
import axios from 'axios';

const WeatherComponent = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);

  const getWeather = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/weather?city=${city}`);
      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
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
          <p>Temperature: {weather.weather_data.main.temp}</p>
          <p>Condition: {weather.weather_data.weather[0].description}</p>
        </div>
      )}
    </div>
  );
};

export default WeatherComponent;