import React from 'react';
import './ForecastComponent.css';

const ForecastComponent = ({ forecastData, timezone }) => {
  const formatTime = (timestamp) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="forecast-container">
      <h3>5-Day Forecast</h3>
      <div className="forecast-grid">
        {forecastData.map((forecast, index) => (
          <div key={index} className="forecast-item">
            <p>{formatDate(forecast.dt)}</p>
            <p>{formatTime(forecast.dt)}</p>
            <p>Temp: {forecast.main.temp}°C</p>
            <p>{forecast.weather[0].main}</p>
            <p>Wind: {forecast.wind.speed} m/s</p>
            <p>Humidity: {forecast.main.humidity}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastComponent;