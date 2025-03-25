import React, { useState, useEffect } from 'react';
import './App.css';
import WeatherComponent from './components/WeatherComponent';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import SaveWeatherComponent from './components/SaveWeatherComponent';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  console.log('Token:', token);

  return (
    <div className="App">
      <WeatherComponent setWeather={setWeather} />
      {weather && token && <SaveWeatherComponent weather={weather} />}
      {!token && (
        <>
          <LoginComponent setToken={setToken} />
          <RegisterComponent />
        </>
      )}
    </div>
  );
}

export default App;
