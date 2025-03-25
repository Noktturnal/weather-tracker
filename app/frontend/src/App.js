import React, { useState, useEffect } from 'react';
import './App.css';
import WeatherComponent from './components/WeatherComponent';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import SaveWeatherComponent from './components/SaveWeatherComponent';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [weather, setWeather] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const toggleLogin = () => {
    setShowLogin(!showLogin);
    setShowRegister(false);
  }
  const toggleRegister = () => {
    setShowRegister(!showRegister);
    setShowLogin(false);
  }

  const handleLoginSubmit = async () => {
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }), // Odesílá přihlašovací údaje
      });

      if (!response.ok) {
        const error = await response.text();
        alert(error); // Zobrazí chybu, pokud přihlášení selže
        return;
      }

      const data = await response.json();
      setToken(data.token); // Uloží token při úspěšném přihlášení
      setShowLogin(false); // Zavře login formulář
      console.log('Login successful, token:', data.token);
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
            <button onClick={() => alert('Show search history')}>{username}</button>
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
          <button onClick={handleLoginSubmit}>Submit</button>
        </div>
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
      {weather && token && <SaveWeatherComponent weather={weather} />}
    </div>
  );
}

export default App;
