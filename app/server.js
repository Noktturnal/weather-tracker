require('dotenv').config();

const express = require('express');
const axios = require('axios');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Connect to the database
const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

client.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Database connection error:', err.stack));

// Fetch weather data without saving to the database
app.get('/weather', async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).send('City is required');
  }
  try {
    const { temperature, tempMin, tempMax, weatherMain, weatherIcon, windSpeed, humidity, sunrise, sunset, timezone, forecastData } = await getWeatherData(city);
    res.json({ city, temperature, tempMin, tempMax, weatherMain, weatherIcon, windSpeed, humidity, sunrise, sunset, timezone, forecastData });
  } catch (err) {
    console.error('Error fetching weather data:', err);
    res.status(400).send(err.message);
  }
});

// Save weather request to the database (requires authentication)
app.post('/weather/save', authenticateToken, async (req, res) => {
  const { city, temperature, tempMin, tempMax, weatherMain, weatherIcon, windSpeed, humidity, sunrise, sunset, timezone, weatherData } = req.body;
  const userId = req.user.id;
  try {
    const query = `
      INSERT INTO weather_requests (user_id, city, temperature, temp_min, temp_max, weather_main, weather_icon, wind_speed, humidity, sunrise, sunset, timezone, weather_data, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) 
      RETURNING *`;
    const values = [userId, city, temperature, tempMin, tempMax, weatherMain, weatherIcon, windSpeed, humidity, sunrise, sunset, timezone, weatherData];
    const result = await client.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Function to get weather data from OpenWeatherMap API
async function getWeatherData(city) {
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const response = await axios.get(url);
  const weatherData = response.data;

  const lat = weatherData.coord.lat;
  const lon = weatherData.coord.lon;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const forecastResponse = await axios.get(forecastUrl);
  const forecastData = forecastResponse.data.list;

  const temperature = weatherData.main.temp;
  const tempMin = weatherData.main.temp_min;
  const tempMax = weatherData.main.temp_max;
  const weatherMain = weatherData.weather[0].main;
  const weatherIcon = weatherData.weather[0].icon;
  const windSpeed = weatherData.wind.speed;
  const humidity = weatherData.main.humidity;
  const sunrise = weatherData.sys.sunrise;
  const sunset = weatherData.sys.sunset;
  const timezone = weatherData.timezone;

  return { temperature, tempMin, tempMax, weatherMain, weatherIcon, windSpeed, humidity, sunrise, sunset, timezone, forecastData };
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
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get past weather requests
app.get('/weather/history', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const query = 'SELECT * FROM weather_requests WHERE user_id = $1 ORDER BY created_at DESC';
  const values = [userId];
  try {
    const result = await client.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get('/weather/forecast', async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).send('City is required');
  }

  try {
    const { forecastData } = await getWeatherData(city);

    // Skupina dat podle dnů
    const groupedByDay = {};
    forecastData.forEach((item) => {
      const date = new Date(item.dt_txt).toISOString().split('T')[0]; // YYYY-MM-DD
      if (!groupedByDay[date]) {
        groupedByDay[date] = [];
      }
      groupedByDay[date].push(item);
    });

    // Data pro dnešní den
    const today = new Date().toISOString().split('T')[0];
    const todayData = groupedByDay[today] || [];
    delete groupedByDay[today]; // Odstraní dnešní den z dalších dnů

    // Data pro následující dny
    const nextDays = Object.entries(groupedByDay).map(([date, items]) => {
      const maxTemp = Math.max(...items.map((i) => i.main.temp_max));
      const minTemp = Math.min(...items.map((i) => i.main.temp_min));
      const icon = items.find((i) => i.weather[0].icon).weather[0].icon; // Ikona prvního záznamu dne
      return { date, maxTemp, minTemp, icon };
    });

    res.json({ todayData, nextDays });
  } catch (err) {
    console.error('Error fetching forecast data:', err);
    res.status(500).send('Error fetching forecast data');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
