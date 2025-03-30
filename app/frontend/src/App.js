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
              setCity(cityName); // Nastaví název města
              console.log('Detected city:', cityName); // Vypíše název města do logu
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
      setForecast(data); // Nastaví předpověď počasí
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

  const handleCurrentLocation = () => {
    console.log('Fetching weather for current location');
    // Logic for fetching weather based on current location
  };

  return (
    <div className="App">
      <WeatherComponent setWeather={setWeather} detectedCity={city} />
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
