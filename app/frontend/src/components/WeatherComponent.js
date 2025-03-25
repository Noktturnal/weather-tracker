import React, { useState } from 'react';
import axios from 'axios';

const WeatherComponent = ({ setWeather }) => {
  const [city, setCity] = useState('');
  const [weather, setWeatherState] = useState(null);

  const getWeather = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/weather?city=${city}`);
      setWeatherState(response.data);
      setWeather(response.data); // Pass the weather data to the parent component
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const formatTime = (timestamp, timezone) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString('en-GB', {
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
          <p>Min Temperature: {weather.tempMin}°C</p>
          <p>Max Temperature: {weather.tempMax}°C</p>
          <p>Condition: {weather.weatherMain}</p>
          <p>Wind Speed: {weather.windSpeed} m/s</p>
          <p>Humidity: {weather.humidity}%</p>
          <p>Sunrise: {formatTime(weather.sunrise, weather.timezone)}</p>
          <p>Sunset: {formatTime(weather.sunset, weather.timezone)}</p>
        </div>
      )}
    </div>
  );
};

export default WeatherComponent;