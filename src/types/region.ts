export type SavedRegion = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

export type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

/** Quick picks for Korean cities (also searchable via Open-Meteo). */
export const SUGGESTED_CITIES: SavedRegion[] = [
  {
    name: "Seoul",
    latitude: 37.5665,
    longitude: 126.978,
    country: "South Korea",
    admin1: "Seoul",
  },
  {
    name: "Busan",
    latitude: 35.1796,
    longitude: 129.0756,
    country: "South Korea",
    admin1: "Busan",
  },
  {
    name: "Pohang",
    latitude: 36.032,
    longitude: 129.365,
    country: "South Korea",
    admin1: "Gyeongsangbuk-do",
  },
];
