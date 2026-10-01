-- VAYALX weather schema
-- Prerequisite: public.farms(id) must exist before this migration runs.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.weather (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id),
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  temperature INTEGER,
  humidity INTEGER,
  rain_probability INTEGER,
  wind_speed INTEGER,
  condition TEXT,
  forecast_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id),
  alert_type TEXT,
  severity TEXT,
  message TEXT,
  recommendation TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.weather_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id),
  recommendation_type TEXT,
  message TEXT,
  priority INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_farm_id
  ON public.weather(farm_id);

CREATE INDEX IF NOT EXISTS idx_weather_alerts_farm_id
  ON public.weather_alerts(farm_id);

CREATE INDEX IF NOT EXISTS idx_weather_recommendations_farm_id
  ON public.weather_recommendations(farm_id);
