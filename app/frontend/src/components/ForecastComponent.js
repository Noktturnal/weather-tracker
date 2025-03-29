import React from 'react';
import './ForecastComponent.css';

const ForecastComponent = ({ forecast }) => {
  return (
    <div className="forecast-container">
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
  );
};

export default ForecastComponent;