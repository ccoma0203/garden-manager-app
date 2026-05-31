import type { GeocodingResult, SavedRegion } from "@/types/region";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export type WeatherDay = {
  date: string;
  tempMaxC: number;
  tempMinC: number;
  precipitationMm: number;
  windMaxKmh: number;
};

export type WeatherForecast = {
  locationLabel: string;
  currentTempC: number;
  currentPrecipitationMm: number;
  currentWindKmh: number;
  days: WeatherDay[];
  fetchedAt: string;
};

type GeocodingApiResponse = {
  results?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
  }[];
};

type ForecastApiResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    precipitation?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    wind_speed_10m_max?: number[];
  };
};

export async function searchCities(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    name: trimmed,
    count: "8",
    language: "en",
    format: "json",
  });

  const response = await fetch(`${GEOCODING_URL}?${params}`);
  if (!response.ok) {
    throw new Error("City search failed. Please try again.");
  }

  const data = (await response.json()) as GeocodingApiResponse;
  if (!data.results?.length) return [];

  return data.results.map((result) => ({
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    admin1: result.admin1,
  }));
}

export function geocodingResultToRegion(result: GeocodingResult): SavedRegion {
  return {
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    admin1: result.admin1,
  };
}

export async function fetchWeather(region: SavedRegion): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: String(region.latitude),
    longitude: String(region.longitude),
    current: "temperature_2m,precipitation,wind_speed_10m",
    daily:
      "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
    forecast_days: "4",
    timezone: "auto",
  });

  const response = await fetch(`${FORECAST_URL}?${params}`);
  if (!response.ok) {
    throw new Error("Weather data could not be loaded.");
  }

  const data = (await response.json()) as ForecastApiResponse;

  const times = data.daily?.time ?? [];
  const days: WeatherDay[] = times.slice(0, 4).map((date, index) => ({
    date,
    tempMaxC: data.daily?.temperature_2m_max?.[index] ?? 0,
    tempMinC: data.daily?.temperature_2m_min?.[index] ?? 0,
    precipitationMm: data.daily?.precipitation_sum?.[index] ?? 0,
    windMaxKmh: data.daily?.wind_speed_10m_max?.[index] ?? 0,
  }));

  const locationLabel = [region.name, region.admin1, region.country]
    .filter(Boolean)
    .join(", ");

  return {
    locationLabel,
    currentTempC: data.current?.temperature_2m ?? days[0]?.tempMaxC ?? 0,
    currentPrecipitationMm: data.current?.precipitation ?? 0,
    currentWindKmh: data.current?.wind_speed_10m ?? 0,
    days,
    fetchedAt: new Date().toISOString(),
  };
}
