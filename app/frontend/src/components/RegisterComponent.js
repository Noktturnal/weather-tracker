import React, { useState } from 'react';
import axios from 'axios';

const RegisterComponent = ({ setShowRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const register = async () => {
    try {
      const response = await axios.post('http://localhost:4000/register', {
        username,
        password,
        email,
      });
      console.log('User registered:', response.data);
      setShowRegister(false); // Zavře registrační okno
    } catch (error) {
      console.error('Error registering:', error);
      alert(error.response?.data || 'An error occurred during registration');
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button onClick={register}>Register</button>
    </div>
  );
};

export default RegisterComponent;