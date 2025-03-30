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

  if (!token) {
    console.log('No token provided');
    return res.status(401).send('Unauthorized');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Invalid token:', err.message);
      return res.status(403).send('Forbidden');
    }
    console.log('Authenticated user:', user); // Log authenticated user
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
  .then(() => console.log(`Connected to the database: ${process.env.PG_DATABASE}`))
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

  console.log('Saving weather request for user:', userId); // Log user ID
  console.log('Request body:', req.body); // Log request body

  try {
    const query = `
      INSERT INTO weather_requests (user_id, city, temperature, temp_min, temp_max, weather_main, weather_icon, wind_speed, humidity, sunrise, sunset, timezone, weather_data, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) 
      RETURNING *`;
    const values = [userId, city, temperature, tempMin, tempMax, weatherMain, weatherIcon, windSpeed, humidity, sunrise, sunset, timezone, weatherData];

    console.log('Executing query with values:', values); // Log query values

    const result = await client.query(query, values);
    console.log('Weather request saved:', result.rows[0]); // Log saved record
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error saving weather request:', err.message); // Log error
    res.status(400).send(err.message);
  }
});

// Function to get weather data from OpenWeatherMap API
async function getWeatherData(city) {
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  console.log('Fetching weather data for city:', city); // Log city name

  try {
    const response = await axios.get(url);
    console.log('Weather data response:', response.data); // Log weather data response

    const lat = response.data.coord.lat;
    const lon = response.data.coord.lon;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    console.log('Fetching forecast data for lat:', lat, 'lon:', lon); // Log coordinates

    const forecastResponse = await axios.get(forecastUrl);
    console.log('Forecast data response:', forecastResponse.data); // Log forecast data response

    const weatherData = response.data;
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
  } catch (err) {
    console.error('Error fetching weather data:', err.message); // Log error
    throw err;
  }
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
  console.log('Login attempt for username:', username); // Log username

  const query = 'SELECT * FROM users WHERE username = $1';
  const values = [username];
  try {
    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      console.log('User not found:', username); // Log if user not found
      return res.status(400).send('User not found');
    }
    const user = result.rows[0];
    console.log('User from DB:', user); // Log user data from DB

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password for username:', username); // Log invalid password
      return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated token for user:', username); // Log generated token
    res.json({ token, username: user.username });
  } catch (err) {
    console.error('Error in /login:', err.message); // Log error
    res.status(400).send(err.message);
  }
});

// Get past weather requests
app.get('/weather/history', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  console.log('Fetching weather history for user:', userId); // Log user ID

  const query = 'SELECT * FROM weather_requests WHERE user_id = $1 ORDER BY created_at DESC';
  const values = [userId];
  try {
    const result = await client.query(query, values);
    console.log('Number of records fetched:', result.rows.length); // Log number of records
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching weather history:', err.message); // Log error
    res.status(400).send(err.message);
  }
});

app.get('/weather/forecast', async (req, res) => {
  const { city } = req.query; // Získá město z dotazu
  if (!city) {
    return res.status(400).send('City is required');
  }

  try {
    const { forecastData } = await getWeatherData(city); // Zavolá funkci getWeatherData s názvem města

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
    delete groupedByDay[today];

    // Data pro následující dny
    const nextDays = Object.entries(groupedByDay).map(([date, items]) => {
      const maxTemp = Math.max(...items.map((i) => i.main.temp_max));
      const minTemp = Math.min(...items.map((i) => i.main.temp_min));

      // Najdi nejčastější ikonu pro daný den
      const iconCounts = items.reduce((acc, i) => {
        const icon = i.weather[0].icon;
        acc[icon] = (acc[icon] || 0) + 1;
        return acc;
      }, {});

      const mostCommonIcon = Object.keys(iconCounts).reduce((a, b) =>
        iconCounts[a] > iconCounts[b] ? a : b
      );

      return { date, maxTemp, minTemp, icon: mostCommonIcon };
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
