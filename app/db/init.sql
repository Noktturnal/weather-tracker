CREATE DATABASE weather_app;

\c weather_app;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS weather_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    city VARCHAR(50) NOT NULL,
    temperature FLOAT NOT NULL,
    temp_min FLOAT,
    temp_max FLOAT,
    weather_main VARCHAR(50),
    weather_icon VARCHAR(10),
    wind_speed FLOAT,
    humidity INTEGER,
    sunrise BIGINT,
    sunset BIGINT,
    weather_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);