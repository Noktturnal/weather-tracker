import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './WeatherComponent.css';

const WeatherComponent = ({ setWeather, detectedCity }) => {
  const [city, setCity] = useState(detectedCity); // Použije detectedCity jako výchozí hodnotu
  const [weather, setWeatherState] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState('');

  const getWeather = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:4000/weather?city=${city}`);
      setWeatherState(response.data);
      setWeather(response.data);
      setBackgroundImage(getBackgroundImage(response.data.weatherMain));
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }, [city, setWeather]);

  const getForecast = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:4000/weather/forecast?city=${city}`);
      setForecast(response.data.nextDays);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    }
  }, [city]);

  useEffect(() => {
    getWeather();
    getForecast();
  }, [getWeather, getForecast]);

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
          </div>
        )}
        {forecast && (
          <div className="forecast-container">
            <h3>5-Day Forecast</h3>
            <div className="forecast-grid">
              {forecast.map((day, index) => (
                <div key={index} className="forecast-item">
                  <p>{new Date(day.date).toLocaleDateString()}</p>
                  <img
                    src={`http://openweathermap.org/img/wn/${day.icon}.png`}
                    alt="Weather icon"
                  />
                  <p>Max: {Math.round(day.maxTemp)}°C</p>
                  <p>Min: {Math.round(day.minTemp)}°C</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherComponent;