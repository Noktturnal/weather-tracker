import React, { useState, useEffect } from 'react';
import './App.css';
import WeatherComponent from './components/WeatherComponent';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import ForecastComponent from './components/ForecastComponent';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [weather, setWeather] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState('Guest');
  const [password, setPassword] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [city, setCity] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
              const cityName = data[0].name;
              setCity(cityName);
            }
          } catch (error) {
            console.error('Error fetching location:', error);
          }
        }, (error) => {
          console.error('Geolocation error:', error);
        });
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    };

    fetchUserLocation();
  }, []);

  const toggleLogin = () => {
    setShowLogin(!showLogin);
    setShowRegister(false);
  };

  const toggleRegister = () => {
    setShowRegister(!showRegister);
    setShowLogin(false);
  };

  const handleLoginSubmit = async () => {
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.text();
        alert(error);
        return;
      }

      const data = await response.json();
      setToken(data.token);
      setShowLogin(false);
    } catch (err) {
      alert('An error occurred during login');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUsername('');
    setWeather(null);
    setShowLogin(false);
    setShowRegister(false);
    localStorage.removeItem('token');
  };

  const fetchSearchHistory = async () => {
    try {
      const response = await fetch('http://localhost:4000/weather/history', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch search history');
      }

      const data = await response.json();
      setSearchHistory(data);
    } catch (err) {
      alert('Could not fetch search history');
    }
  };

  const fetchForecast = async (city) => {
    try {
      const response = await fetch(`http://localhost:4000/weather/forecast?city=${city}`);
      if (!response.ok) {
        throw new Error('Failed to fetch forecast');
      }
      const data = await response.json();
      setForecast(data);
    } catch (err) {
      alert('Could not fetch forecast');
    }
  };

  const saveWeatherRequest = async (weatherData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch('http://localhost:4000/weather/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(weatherData),
      });

      if (!response.ok) {
        return;
      }

      await response.json();
    } catch (err) {
      console.error('Error saving weather request:', err);
    }
  };

  const fetchRequestDetails = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:4000/weather/request/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch request details');
      }

      const data = await response.json();
      setSelectedRequest(data);
    } catch (err) {
      alert('Could not fetch request details');
    }
  };

  const handleCitySubmit = (e) => {
    e.preventDefault();
    if (city) {
      fetchForecast(city);
    }
  };

  const toggleHistory = async () => {
    if (!showHistory) {
      await fetchSearchHistory();
    }
    setShowHistory(!showHistory);
  };

  return (
    <div className="App">
      {city ? (
        <WeatherComponent setWeather={setWeather} detectedCity={city} />
      ) : (
        <p>Loading detected city...</p>
      )}
      <div className="auth-buttons">
        {!token ? (
          <>
            <button onClick={toggleLogin}>Login</button>
            <button onClick={toggleRegister}>Register</button>
          </>
        ) : (
          <div className="user-info">
            <button onClick={toggleHistory}>Recent requests</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>

      {showLogin && (
        <div className="auth-form">
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLoginSubmit}>Login</button>
          <button onClick={() => setShowLogin(false)}>Close</button>
        </div>
      )}

      {showRegister && (
        <div className="auth-form">
          <RegisterComponent setShowRegister={setShowRegister} />
          <button onClick={() => setShowRegister(false)}>Close</button>
        </div>
      )}

      {showHistory && (
        <div className="history-modal">
          <h2>Search History</h2>
          {searchHistory.length > 0 ? (
            <table className="history-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Temperature</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchHistory.map((request, index) => (
                  <tr key={index} className="history-row">
                    <td>{request.city}</td>
                    <td>{request.temperature}°C</td>
                    <td>{new Date(request.created_at).toLocaleString()}</td>
                    <td>
                      <button onClick={() => fetchRequestDetails(request.id)}>View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No search history found.</p>
          )}
          <button onClick={() => setShowHistory(false)}>Close</button>
        </div>
      )}

      {selectedRequest && (
        <div className="request-details-modal">
          <h2>Request Details</h2>
          <p><strong>City:</strong> {selectedRequest.city}</p>
          <p><strong>Temperature:</strong> {selectedRequest.temperature}°C</p>
          <p><strong>Weather:</strong> {selectedRequest.weather_main}</p>
          <p><strong>Wind Speed:</strong> {selectedRequest.wind_speed} m/s</p>
          <p><strong>Humidity:</strong> {selectedRequest.humidity}%</p>
          <p><strong>Sunrise:</strong> {new Date(selectedRequest.sunrise * 1000).toLocaleTimeString()}</p>
          <p><strong>Sunset:</strong> {new Date(selectedRequest.sunset * 1000).toLocaleTimeString()}</p>
          <h3>Forecast</h3>
          {selectedRequest.weather_data.forecastData.map((forecast, index) => (
            <div key={index}>
              <p><strong>Date:</strong> {forecast.dt_txt}</p>
              <p><strong>Temperature:</strong> {forecast.main.temp}°C</p>
              <p><strong>Weather:</strong> {forecast.weather[0].description}</p>
            </div>
          ))}
          <button onClick={() => setSelectedRequest(null)}>Close</button>
        </div>
      )}

      {forecast && (
        <div className="forecast-container">
          <h2>5-Day Forecast</h2>
          <div className="next-days-forecast">
            <div className="daily-forecast">
              {forecast.nextDays.map((day, index) => (
                <div key={index} className="daily-item">
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
        </div>
      )}
    </div>
  );
}

export default App;
