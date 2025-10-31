import { useState, useEffect } from "react";
import "./index.css";

const KEY = "923d8fac242249708ba150804252805";

function App() {
  const [city, setCity] = useState("");
  const [weatherDate, setWeatherDate] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
      },
      (err) => {
        console.error("Geolocation error", err.message);
        setError("Failed to get your location");
      }
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    if (!city.trim() && !coords) {
      setWeatherDate(null);
      setError(null);
      return;
    }

    async function getDate() {
      setLoading(true);
      try {
        const query = city.trim()
          ? city
          : `${coords.latitude},${coords.longitude}`;

        const res = await fetch(
          `http://api.weatherapi.com/v1/current.json?key=${KEY}&q=${query}`,
          { signal }
        );
        const data = await res.json();

        if (data.error) {
          setError(data.error.message);
          setWeatherDate(null);
          return;
        }

        setWeatherDate(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setWeatherDate(null);
      } finally {
        setLoading(false);
      }
    }
    getDate();
    return () => {
      controller.abort();
    };
  }, [city, coords]);

  function renderError() {
    return <p>{error}</p>;
  }
  function renderLoading() {
    return <p>Loading...</p>;
  }
  function renderWeatherDate() {
    return (
      <div className="weather-card">
        <h2>{`${weatherDate?.location.name},${weatherDate?.location.country}`}</h2>
        <img
          src={`${weatherDate?.current?.condition?.icon}`}
          alt="icon"
          className="weather-icon"
        />
        <p className="temperature">
          {Math.round(weatherDate?.current?.temp_c)}℃
        </p>
        <p className="condition">{weatherDate?.current?.condition?.text}</p>
        <div className="weather-details">
          <p>Humidity: {weatherDate?.current?.humidity}%</p>
          <p>Wind: {weatherDate?.current?.wind_kph} km/h</p>
        </div>
      </div>
    );
  }
  return (
    <div className="app">
      <div className="widget-container">
        <div className="weather-card-container">
          <h1 className="app-title">Погода</h1>
          <div className="search-container">
            <input
              type="text"
              value={city}
              placeholder="Enter city name"
              className="search-input"
              onChange={(e) => {
                setCity(e.target.value);
              }}
            />
          </div>
        </div>
        {loading && renderLoading()}
        {error && renderError()}
        {!loading && !error && weatherDate && renderWeatherDate()}
      </div>
    </div>
  );
}

export default App;
