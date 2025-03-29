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

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const toggleLogin = () => {
    console.log('Toggling login form. Current state:', showLogin);
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
      console.log('Login response:', data); // Logování odpovědi
      setToken(data.token); // Nastaví token
      setUsername(data.username); // Nastaví uživatelské jméno
      setShowLogin(false); // Zavře přihlašovací formulář
    } catch (err) {
      console.error('Error during login:', err);
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
      console.error('Error fetching search history:', err);
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
      console.error('Error fetching forecast:', err);
      alert('Could not fetch forecast');
    }
  };

  const handleCitySubmit = (e) => {
    e.preventDefault();
    if (city) {
      fetchForecast(city);
    }
  };

  console.log('Token:', token);

  return (
    <div className="App">
      <WeatherComponent setWeather={setWeather} />
      <div className="auth-buttons">
        {!token ? (
          <>
            <button onClick={toggleLogin}>Login</button>
            <button onClick={toggleRegister}>Register</button>
          </>
        ) : (
          <div className="user-info">
            {username && (
              <button onClick={() => alert('Show search history')}>{username}</button>
            )}
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
      {showLogin && (
        <>
          {console.log('Rendering login form')}
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
            <button onClick={handleLoginSubmit}>Submit</button>
          </div>
        </>
      )}
      {showRegister && (
        <div className="auth-form">
          <h2>Register</h2>
          <input type="text" placeholder="Username" />
          <input type="password" placeholder="Password" />
          <input type="email" placeholder="Email" />
          <button>Submit</button>
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
