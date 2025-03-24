const express = require('express');
const axios = require('axios');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Connect to the database
const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

client.connect();

// Function to get weather data from OpenWeatherMap API
async function getWeatherData(city) {
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  const response = await axios.get(url);
  return response.data;
}


// Register user
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = 'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *';
  const values = [username, hashedPassword, email];
  try {
    const result = await client.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Login user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = $1';
  const values = [username];
  try {
    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      return res.status(400).send('User not found');
    }
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send('Invalid password');
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get weather data
app.get('/weather', async (req, res) => {
  const { city } = req.query;
  try {
    const weatherData = await getWeatherData(city);
    const query = 'INSERT INTO weather_requests (city, weather_data, requested_at) VALUES ($1, $2, NOW()) RETURNING *';
    const values = [city, weatherData];
    const result = await client.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get past weather requests
app.get('/weather/history', async (req, res) => {
  const { userId } = req.query;
  const query = 'SELECT * FROM weather_requests WHERE user_id = $1 ORDER BY requested_at DESC';
  const values = [userId];
  try {
    const result = await client.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
