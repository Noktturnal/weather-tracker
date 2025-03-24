import React, { useState } from 'react';
import './App.css';
import WeatherComponent from './components/WeatherComponent';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';

function App() {
  const [token, setToken] = useState(null);

  return (
    <div className="App">
      {!token ? (
        <>
          <LoginComponent setToken={setToken} />
          <RegisterComponent />
        </>
      ) : (
        <WeatherComponent />
      )}
    </div>
  );
}

export default App;
