import { Router } from "express";
import { config } from "../config.js";

const weatherRouter = Router();

const LAT = 20.1389;
const LON = -98.6733;
const TTL_MS = 5 * 60 * 1000;

let cache: { timestamp: number; payload: unknown } | null = null;

weatherRouter.get("/mineral-del-monte", async (_req, res) => {
  try {
    const now = Date.now();
    if (cache && now - cache.timestamp < TTL_MS) {
    return res.json(cache.payload);
  }

    if (!config.openWeatherApiKey) {
    const fallback = {
      condition: "Clear",
      description: "Cielo despejado",
      temp: 18,
      isDay: true,
    };
    cache = { timestamp: now, payload: fallback };
    return res.json(fallback);
  }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${config.openWeatherApiKey}&units=metric&lang=es`;
    const response = await fetch(url);

    if (!response.ok) {
    return res.status(502).json({ error: "Weather provider unavailable" });
  }

    const raw = (await response.json()) as {
    dt: number;
    sys: { sunrise: number; sunset: number };
    weather: Array<{ main: string; description: string }>;
    main: { temp: number };
  };

    const payload = {
    condition: raw.weather[0]?.main ?? "Clear",
    description: raw.weather[0]?.description ?? "",
    temp: raw.main.temp,
    isDay: raw.dt > raw.sys.sunrise && raw.dt < raw.sys.sunset,
  };

    cache = { timestamp: now, payload };
    return res.json(payload);
  } catch {
    return res.status(502).json({ error: "Weather provider unavailable" });
  }
});

export default weatherRouter;
