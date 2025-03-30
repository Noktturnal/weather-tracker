# Weather Tracker

---

## Project Overview

Weather Tracker is a full-stack web application designed to provide users with real-time weather updates and forecasts. It leverages external APIs for weather and geocoding data and includes features like user authentication and search history management.

---

## Features

- User authentication (register/login/logout)
- Fetch current weather and 5-day forecast for any city
- Save weather search history to a database
- View detailed weather request history

---

## API Documentation

The application uses the following APIs:

1. **Weather API**: Provides current weather and 5-day forecasts.
   - Base URL: `https://api.weatherapi.com`
   - Required Key: `REACT_APP_WEATHER_API_KEY`

2. **Geocoding API**: Converts city names into geographic coordinates.
   - Base URL: `https://opencagedata.com/`
   - Required Key: `REACT_APP_GEOCODE_API_KEY`

Refer to the respective API documentation for more details on endpoints and usage.

---

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning the repository)

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/weather-tracker.git
cd weather-tracker
```

### 2. Install Dependencies

Navigate to the `frontend` directory and install the required dependencies:

```bash
cd app/frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `app/frontend` directory and add the following variables:

```env
REACT_APP_WEATHER_API_KEY=
REACT_APP_GEOCODE_API_KEY=
```

Create a `.env` file in the `app` directory and add the following variables:

```env
PG_USER=
PG_HOST=
PG_DATABASE=
PG_PASSWORD=
PG_PORT=
JWT_SECRET=
WEATHER_API_KEY=
PORT=
```

### 4. Start the Backend Server

Navigate to the `app` directory and start the server:

```bash
node server.js
```

The backend server will run on `http://localhost:4000`.

### 5. Start the Frontend Development Server

Go back to the `frontend` directory and run the following command:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

---

## Deployment Instructions

To deploy the application to a production environment:

1. Build the frontend:
   ```bash
   cd app/frontend
   npm run build
   ```

2. Configure the backend server to serve the built frontend files. Update the backend server's configuration to serve static files from the `app/frontend/build` directory.

3. Set up a production database and update the `.env` file with the production database credentials.

4. Use a process manager like `PM2` or a hosting service to run the backend server.

---

## Testing

To run tests for the application, use the following commands:

### Frontend Tests

```bash
cd app/frontend
npm test
```

### Backend Tests

```bash
cd ../backend
npm test
```

---

## Troubleshooting

### Common Issues

1. **API Key Errors**:
   - Ensure the API keys in the `.env` files are correct and active.

2. **Database Connection Issues**:
   - Verify the database credentials and ensure the PostgreSQL server is running.

3. **Frontend Not Loading**:
   - Check the browser console for errors and ensure the frontend server is running on the correct port.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push the branch.
4. Open a pull request with a detailed description of your changes.

---

## Usage

1. Open the application in your browser at `http://localhost:3000`.
2. Register for an account or log in if you already have one.
3. Search for a city to view its current weather and 5-day forecast.
4. Save your searches to view them later in your history.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

Best regards

Noktturnal the Arcane Magic Wizard or Just a Developer? (Seems the same to me...) 🧙‍♂️💻
