import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ForecastComponent from './ForecastComponent';
import './WeatherComponent.css';

const WeatherComponent = ({ setWeather }) => {
  const [city, setCity] = useState('Praha');
  const [weather, setWeatherState] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState('');

  const getWeather = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:4000/weather?city=${city}`);
      setWeatherState(response.data);
      setWeather(response.data); // Pass the weather data to the parent component
      setBackgroundImage(getBackgroundImage(response.data.weatherMain));
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }, [city, setWeather]);

  useEffect(() => {
    getWeather();
  }, [getWeather]);

  const getBackgroundImage = (condition) => {
    switch (condition) {
      case 'Rain':
        return 'url(/images/rain.jpg)';
      case 'Clear':
        return 'url(/images/clear.jpg)';
      case 'Clouds':
        return 'url(/images/clouds.jpg)';
      default:
        return 'url(/images/default.jpg)';
    }
  };

  return (
    <div className="App" style={{ backgroundImage }}>
      <div className="weather-container">
        <div className="weather-header">
          <h1>Weather App</h1>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city"
          />
          <button onClick={getWeather}>Get Weather</button>
        </div>
        {weather && (
          <div className="weather-info">
            <div className="current-weather">
              <h2>{weather.city}</h2>
              <p>{weather.temperature}°C</p>
              <p>{weather.weatherMain}</p>
              <p>Min: {weather.tempMin}°C</p>
              <p>Max: {weather.tempMax}°C</p>
              <p>Wind: {weather.windSpeed} m/s</p>
              <p>Humidity: {weather.humidity}%</p>
              <p>Sunrise: {new Date(weather.sunrise * 1000).toLocaleTimeString()}</p>
              <p>Sunset: {new Date(weather.sunset * 1000).toLocaleTimeString()}</p>
            </div>
            <ForecastComponent forecastData={weather.forecastData} timezone={weather.timezone} />
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherComponent;