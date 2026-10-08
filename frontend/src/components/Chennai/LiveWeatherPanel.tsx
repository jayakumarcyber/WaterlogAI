'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CloudRain,
  Sun,
  Cloud,
  CloudSun,
  CloudLightning,
  CloudDrizzle,
  Wind,
  Droplets,
  Thermometer,
  RefreshCw,
  Compass,
  AlertCircle,
  Clock,
  Info,
  ShieldCheck,
  Calendar,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000';

interface CurrentWeather {
  temperature_c: number;
  feels_like_c: number;
  weather_condition: string;
  weather_code: number;
  precipitation_mm: number;
  rainfall_mm: number;
  rain_mm?: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  wind_direction_cardinal: string;
  cloud_cover_pct: number;
  last_updated: string;
}

interface ForecastHorizonItem {
  horizon_hours: number;
  period: string;
  rainfall_mm: number;
  rain_probability_pct: number;
  avg_temperature_c?: number;
  context_label?: string;
}

interface HourlyForecastItem {
  iso_time: string;
  display_time: string;
  hour_label: string;
  temperature_c: number;
  precipitation_mm: number;
  rain_probability_pct: number;
  wind_speed_kmh?: number;
  weather_condition: string;
  weather_code: number;
}

interface ForecastSummary {
  period: string;
  rainfall_total_mm: number;
  max_rain_probability_pct: number;
  context_label: string;
}

interface WeatherData {
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
  status: string;
  is_live?: boolean;
  source: string;
  fetched_at: string;
  cached_age_seconds?: number;
  warning?: string;
  current: CurrentWeather;
  forecast?: ForecastHorizonItem[];
  hourly?: HourlyForecastItem[];
  summaries?: {
    next_24h: ForecastSummary;
    next_48h: ForecastSummary;
    next_72h: ForecastSummary;
  };
}

interface LiveWeatherPanelProps {
  selectedDistrict?: string;
  selectedPlaceName?: string;
}

export default function LiveWeatherPanel({
  selectedDistrict = 'Chennai',
  selectedPlaceName,
}: LiveWeatherPanelProps) {
  const { language, t } = useLanguage();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAttemptTime, setLastAttemptTime] = useState<string>('');
  const [lastUpdatedDisplay, setLastUpdatedDisplay] = useState<string>('Just now');
  const [activeHorizon, setActiveHorizon] = useState<number>(24);

  const fetchWeather = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const nowStr = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + ' IST';
    setLastAttemptTime(nowStr);

    const queryStr = forceRefresh ? '?refresh=true' : '';
    // Candidate 1: Next.js server-side proxy route (primary)
    // Candidate 2: Direct backend URL fallback if proxy unavailable
    const fallbackPorts = [8000, 8005, 8001];
    const candidateUrls = Array.from(new Set([
      `/api/v1/weather/chennai${queryStr}`,
      `${API_BASE_URL}/api/v1/weather/chennai${queryStr}`,
      ...fallbackPorts.map((p) => `http://127.0.0.1:${p}/api/v1/weather/chennai${queryStr}`),
      ...fallbackPorts.map((p) => `http://localhost:${p}/api/v1/weather/chennai${queryStr}`)
    ]));

    let lastErrorMsg = 'FRONTEND_FETCH_ERROR: Failed to connect to weather service';
    let successfulData: WeatherData | null = null;

    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json: WeatherData = await res.json();
          if (json && json.current) {
            successfulData = json;
            break;
          }
        } else {
          try {
            const errJson = await res.json();
            const detailStr = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
            lastErrorMsg = url.startsWith('/api')
              ? `PROXY_ERROR: ${detailStr || res.statusText}`
              : `UPSTREAM_${res.status}: ${detailStr || res.statusText}`;
          } catch {
            lastErrorMsg = url.startsWith('/api')
              ? `PROXY_ERROR: HTTP ${res.status} ${res.statusText}`
              : `UPSTREAM_${res.status}: HTTP ${res.statusText}`;
          }
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          lastErrorMsg = 'TIMEOUT: Meteorological request exceeded 8s limit';
        } else {
          lastErrorMsg = `NETWORK_ERROR: ${err?.message || 'Connection refused or unreachable'}`;
        }
      }
    }

    if (successfulData) {
      setData(successfulData);
      setError(null);
    } else {
      // Retry once after brief delay if direct attempt failed
      try {
        await new Promise((r) => setTimeout(r, 600));
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const retryRes = await fetch(`/api/v1/weather/chennai${queryStr}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (retryRes.ok) {
          const retryJson: WeatherData = await retryRes.json();
          if (retryJson?.current) {
            setData(retryJson);
            setError(null);
            setLoading(false);
            setRefreshing(false);
            return;
          }
        }
      } catch {
        // Fall through to error
      }

      setError(lastErrorMsg);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  // Periodic refresh every 10 minutes
  useEffect(() => {
    fetchWeather(false);

    const interval = setInterval(() => {
      fetchWeather(false);
    }, 600000); // 10 minutes

    return () => clearInterval(interval);
  }, [fetchWeather]);

  // Compute friendly relative time for "Last updated"
  useEffect(() => {
    if (!data?.fetched_at) return;

    const updateAge = () => {
      const fetchedTime = new Date(data.fetched_at).getTime();
      const diffMs = Date.now() - fetchedTime;
      const mins = Math.floor(diffMs / 60000);

      if (mins <= 0) {
        setLastUpdatedDisplay(language === 'ta' ? 'சற்றுமுன்' : 'Just now');
      } else if (mins === 1) {
        setLastUpdatedDisplay(language === 'ta' ? '1 நிமிடத்திற்கு முன்' : '1 min ago');
      } else {
        setLastUpdatedDisplay(
          language === 'ta' ? `${mins} நிமிடங்களுக்கு முன்` : `${mins} mins ago`
        );
      }
    };

    updateAge();
    const ticker = setInterval(updateAge, 30000);
    return () => clearInterval(ticker);
  }, [data?.fetched_at, language]);

  // Weather Condition Icon Helper
  const getWeatherIcon = (code: number, size = 'w-6 h-6') => {
    if (code === 0) return <Sun className={`${size} text-amber-400`} />;
    if (code === 1 || code === 2) return <CloudSun className={`${size} text-amber-300`} />;
    if (code === 3) return <Cloud className={`${size} text-slate-300`} />;
    if (code >= 51 && code <= 57) return <CloudDrizzle className={`${size} text-cyan-300`} />;
    if (code >= 61 && code <= 67) return <CloudRain className={`${size} text-blue-400`} />;
    if (code >= 80 && code <= 82) return <CloudRain className={`${size} text-blue-500`} />;
    if (code >= 95) return <CloudLightning className={`${size} text-purple-400`} />;
    return <CloudSun className={`${size} text-blue-300`} />;
  };

  const isLive = data?.status === 'success' || data?.is_live === true;
  const isCached = data?.status === 'CACHED' || data?.is_live === false;

  return (
    <section
      id="live-chennai-weather-card"
      aria-label="Chennai Live Weather Telemetry and Numerical Forecast"
      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl font-sans text-slate-100"
    >
      {/* ── Top Header Strip ──────────────────────────────────────────────── */}
      <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-950/90 border border-blue-800 text-blue-400 shadow-inner">
            <CloudRain className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                {isLive
                  ? (language === 'ta' ? '🌧 நேரடி சென்னை வானிலை' : '🌧 LIVE CHENNAI WEATHER')
                  : (language === 'ta' ? '🌧 சென்னை வானிலை' : '🌧 CHENNAI WEATHER')}
              </h2>

              {/* Status Badge: Distinct LIVE vs CACHED */}
              {data && (
                <>
                  {isLive ? (
                    <span
                      id="weather-status-live"
                      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 tracking-wider shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                      ● {language === 'ta' ? 'நேரடி' : 'LIVE'}
                    </span>
                  ) : (
                    <span
                      id="weather-status-cached"
                      className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 tracking-wider"
                    >
                      <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                      ● {language === 'ta' ? 'சேமிக்கப்பட்ட வானிலை' : 'CACHED / STALE — NOT LIVE'}
                    </span>
                  )}
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    Source: {data.source || 'Open-Meteo'}
                  </span>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
              <span>GCC Core (Chennai) • Lat: 13.08° N, Lon: 80.27° E</span>
              <span className="text-slate-600">•</span>
              <span>Asia/Kolkata (IST)</span>
              {selectedDistrict && selectedDistrict.toLowerCase() !== 'chennai' && (
                <span className="text-amber-400/90 font-medium">
                  (Regional filter: {selectedDistrict})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Refresh & Last Updated Telemetry */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="flex items-center justify-end space-x-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{language === 'ta' ? 'புதுப்பிக்கப்பட்டது:' : 'Last updated:'}</span>
              <span className="font-semibold text-slate-200">{lastUpdatedDisplay}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {data?.fetched_at
                ? new Date(data.fetched_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                  })
                : '--:--:--'}{' '}
              IST
            </div>
          </div>

          <button
            id="btn-refresh-weather"
            onClick={() => fetchWeather(true)}
            disabled={refreshing || loading}
            aria-label="Refresh Live Weather"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>
              {refreshing
                ? language === 'ta'
                  ? 'புதுப்பிக்கிறது...'
                  : 'Refreshing...'
                : language === 'ta'
                ? 'புதுப்பி'
                : 'Refresh'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Stale Cache Notification Warning ──────────────────────────────── */}
      {isCached && data && (
        <div className="bg-amber-950/80 border-b border-amber-800 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>{language === 'ta' ? 'சேமிக்கப்பட்ட வானிலை:' : 'Cached Weather Notice:'}</strong>{' '}
              {language === 'ta'
                ? 'நேரடி வானிலை வழங்குநர் தற்காலிகமாக பதிலளிக்கவில்லை. முந்தைய வெற்றிகரமான தரவு காட்டப்படுகிறது.'
                : `Upstream Open-Meteo telemetry is momentarily unreachable. Showing latest cached response from ${new Date(data.fetched_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}.`}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900 border border-amber-700 text-amber-200 uppercase">
            STALE TELEMETRY
          </span>
        </div>
      )}

      {/* ── True Error State (When neither live nor cache is available) ───── */}
      {error && !data && (
        <div className="p-6 bg-amber-950/70 border-b border-amber-900/60 space-y-3">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-sm text-amber-200 block">
                {language === 'ta'
                  ? 'நேரடி வானிலை தற்காலிகமாக கிடைக்கவில்லை'
                  : 'Live weather temporarily unavailable'}
              </span>
              <p className="text-amber-300/90 leading-relaxed">
                {language === 'ta'
                  ? 'வானிலை வழங்குநர் (Open-Meteo) தொடர்பு தற்காலிகமாக கிடைக்கவில்லை. சென்னை மாநகராட்சி 200 வார்டுகள், நிலப்பரப்பு DEM, வடிகால் வலைப்பின்னல் மற்றும் முந்தைய வரலாற்று மழைப்பொழிவுத் தரவுகள் தொடர்ந்து கிடைக்கின்றன.'
                  : 'Upstream meteorological provider telemetry (Open-Meteo) is momentarily unreachable and no cached telemetry exists yet. Historical rainfall records and CivicPulse GCC risk models remain fully operational.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-amber-400">
                <span>Source: Open-Meteo</span>
                <span>•</span>
                <span>Coordinates: 13.0827° N, 80.2707° E</span>
                {lastAttemptTime && (
                  <>
                    <span>•</span>
                    <span>Last connection attempt: {lastAttemptTime}</span>
                  </>
                )}
                {error && (
                  <>
                    <span>•</span>
                    <span>Technical status: {error}</span>
                  </>
                )}
                <span>•</span>
                <button
                  onClick={() => fetchWeather(true)}
                  className="underline font-bold text-amber-200 hover:text-white cursor-pointer"
                >
                  Try reconnecting now →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Loading State with Progress Bar (Section 8) ──────────────────── */}
      {loading && !data && (
        <div className="p-8 text-center space-y-4">
          <div className="flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-7 h-7 animate-spin text-blue-400" />
            <span className="text-sm font-bold text-slate-200">
              {language === 'ta'
                ? 'சென்னை நேரடி வானிலை பெறப்படுகிறது...'
                : 'Fetching live Chennai weather...'}
            </span>
            <span className="text-xs text-slate-400">
              Connecting to Open-Meteo meteorological telemetry for 13.08° N, 80.27° E
            </span>
          </div>
          {/* Animated loading bar */}
          <div className="max-w-md mx-auto w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full animate-pulse w-3/4 mx-auto" />
          </div>
        </div>
      )}

      {/* ── Main Operational Weather Card Display (Section 7 & 21) ────────── */}
      {data && data.current && (
        <div className="p-4 sm:p-6 space-y-6">

          {/* Core Telemetry Grid (Temp, Humidity, Rainfall, Wind) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">

            {/* 1. TEMPERATURE */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-inner">
              <div>
                <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ta' ? 'வெப்பநிலை' : '🌡 Temperature'}</span>
                </div>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    {data.current.temperature_c.toFixed(1)}°C
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    ({Math.round((data.current.temperature_c * 9) / 5 + 32)}°F)
                  </span>
                </div>
                <div className="text-xs font-bold text-amber-300 mt-1 flex items-center gap-1.5">
                  <span>{data.current.weather_condition}</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {language === 'ta' ? 'உணரப்படும் வெப்பநிலை:' : 'Feels like:'}{' '}
                  <strong className="text-slate-300">{data.current.feels_like_c.toFixed(1)}°C</strong>
                </span>
              </div>
              <div className="p-3.5 rounded-full bg-slate-900 border border-slate-800 shrink-0">
                {getWeatherIcon(data.current.weather_code, 'w-10 h-10')}
              </div>
            </div>

            {/* 2. HUMIDITY */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-inner">
              <div className="flex items-center space-x-1.5 text-cyan-400 mb-1">
                <Droplets className="w-3.5 h-3.5" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {language === 'ta' ? 'ஈரப்பதம்' : '💧 Humidity'}
                </span>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {data.current.humidity_pct}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {data.current.humidity_pct > 75
                    ? 'High Moisture'
                    : data.current.humidity_pct > 50
                    ? 'Moderate'
                    : 'Low Moisture'}
                </div>
              </div>
            </div>

            {/* 3. RAINFALL / PRECIPITATION */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-inner">
              <div className="flex items-center space-x-1.5 text-blue-400 mb-1">
                <CloudRain className="w-3.5 h-3.5" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {language === 'ta' ? 'மழைப்பொழிவு' : '🌧 Rainfall'}
                </span>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {(data.current.rainfall_mm ?? data.current.precipitation_mm ?? 0).toFixed(1)}{' '}
                  <span className="text-xs font-semibold text-slate-400">mm</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {(data.current.rainfall_mm ?? data.current.precipitation_mm ?? 0) > 0
                    ? 'Active Rain'
                    : 'No Rain Currently'}
                </div>
              </div>
            </div>

            {/* 4. WIND SPEED & DIRECTION */}
            <div className="col-span-2 sm:col-span-1 lg:col-span-1 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-inner">
              <div className="flex items-center space-x-1.5 text-emerald-400 mb-1">
                <Wind className="w-3.5 h-3.5" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {language === 'ta' ? 'காற்று' : '💨 Wind'}
                </span>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {data.current.wind_speed_kmh.toFixed(1)}{' '}
                  <span className="text-xs font-semibold text-slate-400">km/h</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-slate-400" />
                  <span>
                    {data.current.wind_direction_deg}° {data.current.wind_direction_cardinal}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ── Forecast Section (12h | 24h | 48h | 72h) (Section 3, 5 & 7) ──── */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>
                  {language === 'ta'
                    ? 'வானிலை முன்னறிவிப்பு (12h • 24h • 48h • 72h)'
                    : 'Numerical Forecast Horizons (12h • 24h • 48h • 72h)'}
                </span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Source: {data.source || 'Open-Meteo'} • Asia/Kolkata
              </span>
            </div>

            {/* Forecast Cards: 12h, 24h, 48h, 72h */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.forecast && data.forecast.length >= 4 ? (
                data.forecast.map((fc) => (
                  <div
                    key={fc.horizon_hours}
                    onClick={() => setActiveHorizon(fc.horizon_hours)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      activeHorizon === fc.horizon_hours
                        ? 'bg-blue-950/70 border-blue-600 ring-1 ring-blue-500 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-blue-400 tracking-wider">
                        {fc.period}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        Forecast
                      </span>
                    </div>

                    <div className="text-xl font-black text-white mt-1.5">
                      {fc.rainfall_mm.toFixed(1)}{' '}
                      <span className="text-xs font-semibold text-slate-400">mm</span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Rain Prob:</span>
                      <span className="font-bold text-blue-300">{fc.rain_probability_pct}%</span>
                    </div>

                    {fc.avg_temperature_c !== undefined && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Avg Temp: {fc.avg_temperature_c}°C
                      </div>
                    )}
                  </div>
                ))
              ) : (
                /* Fallback to summaries if forecast array not formatted */
                [
                  { label: '12 Hours', mm: 0.0, prob: 15 },
                  { label: '24 Hours', mm: data.summaries?.next_24h.rainfall_total_mm ?? 0.0, prob: data.summaries?.next_24h.max_rain_probability_pct ?? 20 },
                  { label: '48 Hours', mm: data.summaries?.next_48h.rainfall_total_mm ?? 0.0, prob: data.summaries?.next_48h.max_rain_probability_pct ?? 25 },
                  { label: '72 Hours', mm: data.summaries?.next_72h.rainfall_total_mm ?? 0.0, prob: data.summaries?.next_72h.max_rain_probability_pct ?? 30 },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800"
                  >
                    <span className="text-xs font-black uppercase text-blue-400 tracking-wider">
                      {item.label}
                    </span>
                    <div className="text-xl font-black text-white mt-1.5">
                      {item.mm.toFixed(1)} <span className="text-xs font-semibold text-slate-400">mm</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Peak Prob: <span className="font-bold text-blue-300">{item.prob}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Hourly Breakdown (Next 24 Hours) ────────────────────────────── */}
          {data.hourly && data.hourly.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {language === 'ta'
                      ? 'அடுத்த 24 மணி நேர மணிநேர முன்னறிவிப்பு'
                      : 'Next 24 Hours — Hourly Telemetry Progression'}
                  </span>
                </span>
                <span className="text-[10px] text-slate-400">Asia/Kolkata (IST)</span>
              </div>

              <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                {data.hourly.slice(0, 24).map((hr, idx) => (
                  <div
                    key={hr.iso_time || idx}
                    className="shrink-0 w-24 bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-center flex flex-col items-center justify-between space-y-1 hover:border-slate-700 transition"
                  >
                    <span className="text-[11px] font-bold text-slate-300 whitespace-nowrap">
                      {hr.display_time}
                    </span>

                    <div className="my-1">{getWeatherIcon(hr.weather_code, 'w-5 h-5')}</div>

                    <span className="text-xs font-black text-white">
                      {Math.round(hr.temperature_c)}°C
                    </span>

                    <div className="text-[10px] text-blue-400 font-semibold flex items-center gap-0.5">
                      <CloudRain className="w-2.5 h-2.5 inline" />
                      <span>{hr.precipitation_mm > 0 ? `${hr.precipitation_mm}mm` : '0mm'}</span>
                    </div>

                    <span className="text-[9px] font-medium text-slate-400">
                      {hr.rain_probability_pct}% rain
                    </span>

                    <span
                      className="text-[8px] font-medium text-slate-400 truncate w-full"
                      title={hr.weather_condition}
                    >
                      {hr.weather_condition}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Provenance & Operational Separation Notice (Sections 6, 14, 15) ── */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px]">
            <div className="flex items-start space-x-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200">
                  {language === 'ta' ? 'வானிலை தரவு மூலம்:' : 'Data Provenance & System Separation:'}
                </span>{' '}
                <span>
                  {language === 'ta'
                    ? 'நேரடி வானிலை Open-Meteo வளிமண்டல அளவீடுகளிலிருந்து பெறப்படுகிறது. மாதிரி மழைப்பொழிவு (Scenario Simulation: 30 mm, 12h) தனித்தனியாக செயல்படுகிறது.'
                    : 'Live weather telemetry is sourced directly from Open-Meteo. The 30 mm / 12h Scenario Simulation operates independently as an interactive what-if municipal planning model.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                GCC Coord: 13.08° N, 80.27° E
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  isLive
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}
              >
                {isLive ? '● TELEMETRY: LIVE' : '● TELEMETRY: CACHED'}
              </span>
            </div>
          </div>

        </div>
      )}
    </section>
  );
}
