'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  CloudRain,
  Activity,
  Layers,
  MapPin,
  Play,
  Globe,
  Navigation,
  AlertTriangle,
  Search,
  Radio,
  FileText,
  CheckCircle2,
  Clock,
  Truck,
  Sliders,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getApiBaseUrl } from '@/lib/api';
// Location Selector & Unsupported Location Guard
import GovUtilityBar from '@/components/Navigation/GovUtilityBar';
import GovHeader from '@/components/Navigation/GovHeader';
import GovFooter from '@/components/Navigation/GovFooter';
import LocationSelector from '@/components/Navigation/LocationSelector';
import UnsupportedLocationBanner from '@/components/Navigation/UnsupportedLocationBanner';
import {
  INDIA_LOCATION_DATA,
  getDistrictsForState,
  getCitiesForDistrict,
  isLocationOperational,
} from '@/data/locationHierarchy';

// Chennai Product Imagery & Structured Narrative Sections
import HeroSection from '@/components/Chennai/HeroSection';
import LiveDataStrip from '@/components/Chennai/LiveDataStrip';
import CivicPulseServicesSection from '@/components/Chennai/CivicPulseServicesSection';
import HistoricalWaterloggingSection from '@/components/Chennai/HistoricalWaterloggingSection';
import ChennaiIdentitySection from '@/components/Chennai/ChennaiIdentitySection';
import RainfallAlertContextSection from '@/components/Chennai/RainfallAlertContextSection';
import DecisionPipelineSection from '@/components/Chennai/DecisionPipelineSection';
import DataSourcesSection from '@/components/Chennai/DataSourcesSection';
import EmergencyCivicInfoSection from '@/components/Chennai/EmergencyCivicInfoSection';

// GIS Operations Components
import MapViewContainer from '@/components/Map/MapViewContainer';
import FilterPanel from '@/components/Dashboard/FilterPanel';
import FeatureDetailsPanel from '@/components/Dashboard/FeatureDetailsPanel';
import MapLegend from '@/components/Dashboard/MapLegend';
import SearchBar from '@/components/Dashboard/SearchBar';
import PriorityQueuePanel from '@/components/Priority/PriorityQueuePanel';
import ResourcePlannerPanel from '@/components/ResourcePlanner/ResourcePlannerPanel';
import WhatIfSimulatorPanel from '@/components/Simulator/WhatIfSimulatorPanel';

// Live Chennai Weather Component
import LiveWeatherPanel from '@/components/Chennai/LiveWeatherPanel';

// Citizen Complaint Module Components
import ReportWaterloggingModal from '@/components/Complaints/ReportWaterloggingModal';
import ComplaintTrackingModal from '@/components/Complaints/ComplaintTrackingModal';
import OperationsComplaintQueue from '@/components/Complaints/OperationsComplaintQueue';

// Tiny child component to safely read searchParams within Suspense without blocking SSR
function LocationQuerySync({
  currentLocation,
  onLocationSync,
}: {
  currentLocation: { state: string; district: string; city: string };
  onLocationSync: (loc: { country: string; state: string; district: string; city: string }) => void;
}) {
  const searchParams = useSearchParams();
  const lastSyncedKeyRef = useRef<string | null>(null);
  const onLocationSyncRef = useRef(onLocationSync);
  onLocationSyncRef.current = onLocationSync;

  useEffect(() => {
    if (!searchParams) return;
    const qState = searchParams.get('state');
    const qDistrict = searchParams.get('district');
    const qCity = searchParams.get('city');

    if (!qState) return;

    const queryKey = `${qState.toLowerCase()}|${(qDistrict || '').toLowerCase()}|${(qCity || '').toLowerCase()}`;
    if (lastSyncedKeyRef.current === queryKey) return;

    const stateObj = INDIA_LOCATION_DATA.states.find(
      (s) => s.name.toLowerCase() === qState.toLowerCase()
    );
    if (stateObj) {
      const distObj = stateObj.districts.find(
        (d) => d.name.toLowerCase() === (qDistrict || '').toLowerCase()
      ) || stateObj.districts[0];

      const cityObj = distObj?.cities.find(
        (c) => c.name.toLowerCase() === (qCity || '').toLowerCase()
      ) || distObj?.cities[0];

      if (distObj) {
        lastSyncedKeyRef.current = queryKey;
        const newState = stateObj.name;
        const newDistrict = distObj.name;
        const newCity = cityObj ? cityObj.name : '';

        // Guard: only fire if location is actually different from current
        if (
          currentLocation.state.toLowerCase() !== newState.toLowerCase() ||
          currentLocation.district.toLowerCase() !== newDistrict.toLowerCase() ||
          (newCity && currentLocation.city.toLowerCase() !== newCity.toLowerCase())
        ) {
          onLocationSyncRef.current({
            country: 'India',
            state: newState,
            district: newDistrict,
            city: newCity,
          });
        }
      }
    }
  }, [searchParams, currentLocation.state, currentLocation.district, currentLocation.city]);

  return null;
}

export default function Home() {
  const API_BASE_URL = getApiBaseUrl();

  // ─── 0. Hierarchical Location State (Country -> State -> District -> City) ──
  const [location, setLocation] = useState({
    country: 'India',
    state: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Chennai',
  });

  const isOperational = isLocationOperational(location.state, location.district, location.city);
  const { t, language } = useLanguage();

  // ─── 1. Layer Visibility States ───────────────────────────────────────────
  const [layers, setLayers] = useState({
    wards: true,
    roads: true,
    drains: true,
    waterbodies: true,
    incidents: true,
    facilities: true,
    population: false,
    populationExposure: false,
    districts: true,
    state: true,
    citizenComplaints: true,
  });

  // ─── 2. Attribute & Administrative Filters ────────────────────────────────
  const [filters, setFilters] = useState({
    stateId: 'Tamil Nadu',
    districtId: 'Chennai',
    cityId: 'Chennai',
    adminType: 'Urban',
    localBody: 'Greater Chennai Corporation (Zones 1-15)',
    wardId: 'ALL',
    incidentType: 'ALL',
    severity: 'ALL',
    facilityType: 'ALL',
  });

  // ─── 3. Camera Navigation Trigger ────────────────────────────────────────
  const [cameraTrigger, setCameraTrigger] = useState<{
    type: 'india' | 'tn' | 'district' | 'ward' | 'place';
    coords?: [number, number];
    bounds?: [[number, number], [number, number]] | [number, number, number, number] | any;
    geometry?: any;
    timestamp?: number;
  }>({ type: 'district', coords: [13.0827, 80.2707], timestamp: Date.now() });

  // ─── 4. Scenario Rainfall Input ───────────────────────────────────────────
  const [scenarioRainfall, setScenarioRainfall] = useState<number>(30);
  const [forecastHorizon, setForecastHorizon] = useState<number>(12);
  const [scenarioRunning, setScenarioRunning] = useState<boolean>(false);
  const [scenarioStatusText, setScenarioStatusText] = useState<string | null>(null);

  // ─── 5. GeoJSON Data Store ────────────────────────────────────────────────
  const [geoData, setGeoData] = useState<any>({
    wards: null,
    roads: null,
    drains: null,
    waterbodies: null,
    incidents: null,
    facilities: null,
    population: null,
    populationExposure: null,
    districts: null,
    state: null,
  });

  const [wardsList, setWardsList] = useState<any[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('perambur');
  const [selectedWardId, setSelectedWardId] = useState<string | number | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Summary Metrics
  const [highRiskCount, setHighRiskCount] = useState<number>(3);
  const [medRiskCount, setMedRiskCount] = useState<number>(3);
  const [lowRiskCount, setLowRiskCount] = useState<number>(2);
  const [lastScenarioTimestamp, setLastScenarioTimestamp] = useState<number>(Date.now());

  // ─── 6. Citizen Complaint State ───────────────────────────────────────────
  const [citizenComplaints, setCitizenComplaints] = useState<any[]>([]);
  const [complaintSummary, setComplaintSummary] = useState<any>(null);

  // Modal visibility state
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showTrackModal, setShowTrackModal] = useState<boolean>(false);
  const [showOpsQueue, setShowOpsQueue] = useState<boolean>(false);

  // Pre-selected ID to auto-load in tracking modal
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  // Coordinates selected via map click
  const [reportCoords, setReportCoords] = useState<[number, number] | null>(null);

  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // Initial load: Automatically load Perambur as initial place context
  useEffect(() => {
    if (selectedPlaceId) {
      fetch(`${API_BASE_URL}/api/v1/locations/places/${selectedPlaceId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setSelectedFeature({
              type: 'place',
              properties: data,
              geometry: data.geometry,
              id: data.id,
            });
            setCameraTrigger({
              type: 'place',
              bounds: data.bounds,
              coords: [data.centroid_lat, data.centroid_lon],
              geometry: data.geometry,
              timestamp: Date.now(),
            });
          }
        })
        .catch(() => {});
    }
  }, [API_BASE_URL]);

  // ─── Location Hierarchy Handlers (Tamil Nadu -> District -> Place -> Ward) ──
  const handleDistrictSelect = useCallback((distName: string, distObj?: any) => {
    let effectiveDist = distObj;
    if (!effectiveDist) {
      const tn = INDIA_LOCATION_DATA.states.find((s) => s.name === 'Tamil Nadu');
      const found = tn?.districts.find((d) => d.name.toLowerCase() === distName.toLowerCase());
      if (found) {
        effectiveDist = {
          id: found.id,
          name: found.name,
          centroid: { lat: found.coordinates[0], lon: found.coordinates[1] },
          bounds: [
            [found.coordinates[0] - 0.2, found.coordinates[1] - 0.2],
            [found.coordinates[0] + 0.2, found.coordinates[1] + 0.2],
          ],
        };
      }
    }

    setFilters((prev) => ({
      ...prev,
      districtId: distName,
      wardId: 'ALL',
      cityId: '',
    }));
    setSelectedPlaceId('');
    setSelectedWardId(null);
    setSelectedFeature({
      type: 'district',
      properties: effectiveDist || { name: distName, state: 'Tamil Nadu' },
      id: effectiveDist?.id || distName.toLowerCase(),
      geometry: effectiveDist?.geometry,
    });

    const coords = effectiveDist?.centroid
      ? [effectiveDist.centroid.lat, effectiveDist.centroid.lon]
      : effectiveDist?.centroid_lat
      ? [effectiveDist.centroid_lat, effectiveDist.centroid_lon]
      : distName.toLowerCase() === 'chennai'
      ? [13.0827, 80.2707]
      : [11.1271, 78.6569];

    setCameraTrigger({
      type: 'district',
      bounds: effectiveDist?.bounds,
      coords: coords as [number, number],
      geometry: effectiveDist?.geometry,
      timestamp: Date.now(),
    });

    // If district object doesn't have geometry, fetch full district details
    if (!effectiveDist?.geometry) {
      const slug = distName.toLowerCase().replace(/\s+/g, '-');
      fetch(`${API_BASE_URL}/api/v1/locations/districts/${slug}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((dData) => {
          if (dData) {
            setSelectedFeature({
              type: 'district',
              properties: dData,
              id: dData.id,
              geometry: dData.geometry,
            });
            if (dData.geometry || dData.bounds) {
              setCameraTrigger({
                type: 'district',
                bounds: dData.bounds,
                coords: [dData.centroid_lat, dData.centroid_lon],
                geometry: dData.geometry,
                timestamp: Date.now(),
              });
            }
          }
        })
        .catch(() => {});
    }
  }, [API_BASE_URL]);

  const handlePlaceSelect = useCallback((placeObj: any) => {
    setSelectedPlaceId(placeObj.id);
    setSelectedWardId(null);
    setFilters((prev) => ({
      ...prev,
      cityId: placeObj.name,
      wardId: 'ALL',
    }));
    setSelectedFeature({
      type: 'place',
      properties: placeObj,
      geometry: placeObj.geometry,
      id: placeObj.id,
    });

    const coords =
      placeObj.centroid_lat && placeObj.centroid_lon
        ? [placeObj.centroid_lat, placeObj.centroid_lon]
        : placeObj.centroid
        ? [placeObj.centroid.lat, placeObj.centroid.lon]
        : undefined;

    setCameraTrigger({
      type: 'place',
      bounds: placeObj.bounds,
      coords: coords as [number, number] | undefined,
      geometry: placeObj.geometry,
      timestamp: Date.now(),
    });

    // If place doesn't have geometry, fetch full place details
    if (!placeObj.geometry && placeObj.id) {
      fetch(`${API_BASE_URL}/api/v1/locations/places/${placeObj.id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((pData) => {
          if (pData) {
            setSelectedFeature({
              type: 'place',
              properties: pData,
              geometry: pData.geometry,
              id: pData.id,
            });
            setCameraTrigger({
              type: 'place',
              bounds: pData.bounds,
              coords: [pData.centroid_lat, pData.centroid_lon],
              geometry: pData.geometry,
              timestamp: Date.now(),
            });
          }
        })
        .catch(() => {});
    }
  }, [API_BASE_URL]);

  const handleWardSelect = useCallback((wardObj: any) => {
    const rawId = wardObj.ward_number ?? wardObj.id;
    const cleanWardId =
      typeof rawId === 'string' && rawId.startsWith('ward-')
        ? rawId.replace('ward-', '')
        : String(rawId);

    setSelectedWardId(cleanWardId);
    setFilters((prev) => ({ ...prev, wardId: cleanWardId }));
    setSelectedFeature({
      type: 'ward',
      properties: wardObj,
      geometry: wardObj.geometry,
      id: cleanWardId,
    });

    const coords =
      wardObj.centroid_lat && wardObj.centroid_lon
        ? [wardObj.centroid_lat, wardObj.centroid_lon]
        : wardObj.centroid
        ? [wardObj.centroid.lat, wardObj.centroid.lon]
        : undefined;

    setCameraTrigger({
      type: 'ward',
      bounds: wardObj.bounds,
      coords: coords as [number, number] | undefined,
      geometry: wardObj.geometry,
      timestamp: Date.now(),
    });
  }, []);

  // Location Change Handler with strict equality guard (for query params / backwards compatibility)
  const handleLocationChange = useCallback(
    (newLoc: { country: string; state: string; district: string; city: string }) => {
      const cur = locationRef.current;
      if (
        cur.country === newLoc.country &&
        cur.state.toLowerCase() === newLoc.state.toLowerCase() &&
        cur.district.toLowerCase() === newLoc.district.toLowerCase() &&
        cur.city.toLowerCase() === (newLoc.city || '').toLowerCase()
      ) {
        return;
      }

      setLocation(newLoc);
      setFilters((prev) => ({
        ...prev,
        stateId: newLoc.state,
        districtId: newLoc.district,
        cityId: newLoc.city,
        wardId: 'ALL',
        localBody: 'ALL',
      }));

      // Update URL query parameters
      if (typeof window !== 'undefined') {
        const curParams = new URLSearchParams(window.location.search);
        const curS = curParams.get('state') || '';
        const curD = curParams.get('district') || '';
        const curC = curParams.get('city') || '';
        if (
          curS.toLowerCase() !== newLoc.state.toLowerCase() ||
          curD.toLowerCase() !== newLoc.district.toLowerCase() ||
          curC.toLowerCase() !== (newLoc.city || '').toLowerCase()
        ) {
          const params = new URLSearchParams();
          params.set('state', newLoc.state);
          params.set('district', newLoc.district);
          if (newLoc.city) params.set('city', newLoc.city);
          window.history.replaceState(null, '', `?${params.toString()}`);
        }
      }
    },
    []
  );

  // ─── Citizen Complaint Fetch ───────────────────────────────────────────────
  const fetchCitizenComplaints = useCallback(async () => {
    if (!isOperational) return;
    try {
      const [mapRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/complaints/public/map`),
        fetch(`${API_BASE_URL}/api/v1/complaints/operations/summary`),
      ]);

      if (mapRes.ok) {
        const data = await mapRes.json();
        setCitizenComplaints(Array.isArray(data) ? data : []);
      }
      if (summaryRes.ok) {
        const sumData = await summaryRes.json();
        setComplaintSummary(sumData);
      }
    } catch (err) {
      console.warn('[CivicPulse] Could not load citizen complaints:', err);
    }
  }, [API_BASE_URL, isOperational]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleToggleLayer = (layerName: string) => {
    setLayers((prev) => ({ ...prev, [layerName]: !(prev as any)[layerName] }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === 'districtId') {
      handleDistrictSelect(value);
    } else if (key === 'wardId') {
      if (value === 'ALL') {
        setSelectedWardId(null);
      } else {
        const norm = (v: any) => String(v ?? '').replace(/^ward-/, '').trim().toLowerCase();
        const found = geoData.wards?.features?.find(
          (f: any) =>
            norm(f.properties?.id) === norm(value) ||
            norm(f.properties?.ward_number) === norm(value)
        );
        if (found) {
          handleWardSelect(found.properties);
        }
      }
    }
  };

  const handleFocusCamera = (type: 'india' | 'tn' | 'district' | 'ward') => {
    if (type === 'india') {
      setCameraTrigger({
        type: 'india',
        coords: [20.5937, 78.9629],
        bounds: [
          [8.0, 68.0],
          [35.5, 97.0],
        ],
        timestamp: Date.now(),
      });
    } else if (type === 'tn') {
      setCameraTrigger({
        type: 'tn',
        coords: [11.1271, 78.6569],
        bounds: [
          [8.0, 76.0],
          [13.5, 80.5],
        ],
        timestamp: Date.now(),
      });
    } else if (type === 'district') {
      handleDistrictSelect(filters.districtId);
    } else if (type === 'ward') {
      if (selectedFeature?.type === 'ward') {
        setCameraTrigger({
          type: 'ward',
          bounds: selectedFeature.properties?.bounds,
          coords: selectedFeature.properties?.centroid_lat
            ? [selectedFeature.properties.centroid_lat, selectedFeature.properties.centroid_lon]
            : undefined,
          geometry: selectedFeature.geometry,
          timestamp: Date.now(),
        });
      } else if (filters.wardId !== 'ALL') {
        const norm = (v: any) => String(v ?? '').replace(/^ward-/, '').trim().toLowerCase();
        const found = geoData.wards?.features?.find(
          (f: any) =>
            norm(f.properties?.id) === norm(filters.wardId) ||
            norm(f.properties?.ward_number) === norm(filters.wardId)
        );
        if (found) {
          handleWardSelect(found.properties);
        }
      }
    }
  };

  const handleTrackComplaint = (complaintId: string) => {
    setActiveTrackId(complaintId);
    setShowTrackModal(true);
  };

  const handleReportAtCoords = (coords: [number, number]) => {
    setReportCoords(coords);
    setShowReportModal(true);
  };

  const handleComplaintSuccess = (complaintId: string) => {
    fetchCitizenComplaints();
    handleTrackComplaint(complaintId);
  };

  // ─── GeoJSON Fetch ────────────────────────────────────────────────────────
  const fetchGeoJSONLayers = async () => {
    if (!isOperational) return;
    try {
      setLoading(true);

      const buildUrl = (endpoint: string, extraParams: Record<string, string> = {}) => {
        const base = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000');
        const url = new URL(`${base}/api/v1/${endpoint}`);
        if (filters.wardId !== 'ALL') url.searchParams.append('ward_id', filters.wardId);
        if (filters.districtId !== 'ALL') url.searchParams.append('district', filters.districtId);
        if (filters.stateId !== 'ALL') url.searchParams.append('state', filters.stateId);
        Object.entries(extraParams).forEach(([k, v]) => {
          if (v !== 'ALL') url.searchParams.append(k, v);
        });
        return url.toString();
      };

      const [wardsRes, roadsRes, drainsRes, wbRes, incRes, facRes, popRes, distRes, stateRes, popExpRes] =
        await Promise.all([
          fetch(buildUrl('wards/geojson')).catch(() => fetch('/data/chennai_wards_official.geojson')),
          fetch(buildUrl('roads/geojson')),
          fetch(buildUrl('drains/geojson')),
          fetch(buildUrl('waterbodies/geojson')),
          fetch(buildUrl('incidents/geojson', { incident_type: filters.incidentType, severity: filters.severity })),
          fetch(buildUrl('facilities/geojson', { facility_type: filters.facilityType })),
          fetch(buildUrl('population-zones/geojson')),
          fetch(`${API_BASE_URL}/api/v1/districts/geojson`),
          fetch(`${API_BASE_URL}/api/v1/state/geojson`),
          fetch(buildUrl('population/geojson')),
        ]);

      const [wards, roads, drains, waterbodies, incidents, facilities, population, districts, state, popExp] =
        await Promise.all([
          wardsRes.ok ? wardsRes.json() : null,
          roadsRes.ok ? roadsRes.json() : null,
          drainsRes.ok ? drainsRes.json() : null,
          wbRes.ok ? wbRes.json() : null,
          incRes.ok ? incRes.json() : null,
          facRes.ok ? facRes.json() : null,
          popRes.ok ? popRes.json() : null,
          distRes.ok ? distRes.json() : null,
          stateRes.ok ? stateRes.json() : null,
          popExpRes.ok ? popExpRes.json() : null,
        ]);

      setGeoData({
        wards,
        roads,
        drains,
        waterbodies,
        incidents,
        facilities,
        population,
        populationExposure: popExp,
        districts,
        state,
      });

      if (wards?.features) {
        setWardsList(wards.features.map((f: any) => ({
          ward_id: f.properties.ward_id || f.id,
          ward_name: f.properties.ward_name || `Ward ${f.id}`,
          zone_name: f.properties.zone_name,
          zone_number: f.properties.zone_number,
          region: f.properties.region,
          district: f.properties.district || 'Chennai',
          administrative_type: f.properties.administrative_type || 'Urban',
          local_body: f.properties.local_body || 'Greater Chennai Corporation',
        })));

        let high = 0, med = 0, low = 0;
        wards.features.forEach((f: any) => {
          const r = (f.properties.risk_level || '').toUpperCase();
          if (r === 'HIGH' || r === 'CRITICAL') high++;
          else if (r === 'MEDIUM') med++;
          else if (r === 'LOW') low++;
        });
        setHighRiskCount(high || 3);
        setMedRiskCount(med || 3);
        setLowRiskCount(low || 2);
      }
    } catch (err) {
      console.error('Failed to fetch spatial GeoJSON datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPredictionScenario = async () => {
    setScenarioRunning(true);
    setScenarioStatusText('Scenario running...');
    try {
      const payload = {
        expected_rainfall_mm: scenarioRainfall,
        horizon_hours: forecastHorizon,
        district: filters.districtId || 'Chennai',
      };

      let res: Response;
      try {
        res = await fetch(`${API_BASE_URL}/api/v1/predictions/scenario`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (directErr) {
        // Fallback to Next.js relative proxy path
        res = await fetch('/api/v1/predictions/scenario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      // Update summary metric counts
      if (data.summary) {
        setHighRiskCount(data.summary.high_risk_wards ?? 0);
        setMedRiskCount(data.summary.medium_risk_wards ?? 0);
        setLowRiskCount(data.summary.low_risk_wards ?? 0);
      }

      // Dynamically update ward features on Leaflet map
      if (Array.isArray(data.ward_predictions) && geoData.wards?.features) {
        const predMap = new Map();
        data.ward_predictions.forEach((wp: any) => {
          predMap.set(wp.ward_id, wp);
        });

        const updatedFeatures = geoData.wards.features.map((feat: any) => {
          const wNum = feat.properties?.ward_number || feat.id;
          const pred = predMap.get(Number(wNum));
          if (pred) {
            return {
              ...feat,
              properties: {
                ...feat.properties,
                risk_level: pred.risk_level,
                predicted_probability: pred.predicted_probability,
                water_depth_cm: pred.expected_water_depth_cm,
                scenario_rainfall_mm: data.scenario_rainfall_mm,
                scenario_horizon_hours: data.horizon_hours,
                data_status: 'SCENARIO',
              },
            };
          }
          return feat;
        });

        setGeoData((prev: any) => ({
          ...prev,
          wards: {
            ...prev.wards,
            features: updatedFeatures,
          },
        }));
      }

      setScenarioStatusText(
        `✓ Scenario completed: ${data.scenario_rainfall_mm} mm over ${data.horizon_hours} Hours evaluated across GCC wards.`
      );
      setLastScenarioTimestamp(Date.now());
    } catch (err: any) {
      console.error('[CivicPulse] Scenario execution failed:', err);
      setScenarioStatusText(`Unable to run scenario: ${err.message || 'Check backend connection'}`);
    } finally {
      setScenarioRunning(false);
    }
  };

  useEffect(() => {
    fetchGeoJSONLayers();
  }, [API_BASE_URL, filters, isOperational]);

  // Fetch citizen complaints on mount and every 60s
  useEffect(() => {
    fetchCitizenComplaints();
    const refreshInterval = setInterval(fetchCitizenComplaints, 60000);
    return () => clearInterval(refreshInterval);
  }, [fetchCitizenComplaints]);

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-800 flex flex-col font-sans antialiased overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════════════════════
          1. TOP UTILITY BAR (CivicPulse Monsoon • Chennai | Help | Accessibility | Status)
      ═══════════════════════════════════════════════════════════════════════ */}
      <GovUtilityBar systemOperational={isOperational} />

      {/* ═══════════════════════════════════════════════════════════════════════
          2. OFFICIAL GOVERNMENT HEADER & HORIZONTAL NAVIGATION
      ═══════════════════════════════════════════════════════════════════════ */}
      <GovHeader
        onReportWaterlogging={() => {
          setReportCoords(null);
          setShowReportModal(true);
        }}
        onTrackComplaint={() => {
          setActiveTrackId(null);
          setShowTrackModal(true);
        }}
        onOpenOpsQueue={() => setShowOpsQueue(true)}
        searchBarSlot={
          <SearchBar
            geoData={geoData}
            apiBaseUrl={API_BASE_URL}
            selectedDistrict={filters.districtId}
            onSelectLocation={(loc: any) => {
              if (loc.district) {
                handleDistrictSelect(loc.district);
              }
              if (loc.place_id) {
                setSelectedPlaceId(loc.place_id);
              }
            }}
            onSelectSearchResult={(f) => {
              setSearchResult(f);
              setSelectedFeature({
                type: f.properties?.type || (f.properties?.incident_type ? 'incident' : f.properties?.ward_number ? 'ward' : 'place'),
                properties: f.properties,
                geometry: f.geometry,
                id: f.id || f.properties?.id,
              });
              if (f.properties?.district) {
                handleFilterChange('districtId', f.properties.district);
              }
              if (f.properties?.bounds) {
                setCameraTrigger({
                  type: f.properties?.type === 'ward' ? 'ward' : 'place',
                  bounds: f.properties.bounds,
                  geometry: f.geometry,
                  timestamp: Date.now(),
                });
              } else if (f.geometry?.coordinates) {
                setCameraTrigger({
                  type: f.properties?.type === 'ward' ? 'ward' : 'place',
                  coords: f.geometry.type === 'Point' ? [f.geometry.coordinates[1], f.geometry.coordinates[0]] : undefined,
                  geometry: f.geometry,
                  timestamp: Date.now(),
                });
              }
            }}
          />
        }
      />

      {/* Invisible searchParams listener wrapped in Suspense */}
      <Suspense fallback={null}>
        <LocationQuerySync
          currentLocation={location}
          onLocationSync={handleLocationChange}
        />
      </Suspense>

      {/* Main Content Area: Wide Desktop Dashboard */}
      <main className="max-w-[1600px] w-[95%] mx-auto px-3 sm:px-5 lg:px-6 py-5 space-y-6 w-full flex-1">

      {/* ═══════════════════════════════════════════════════════════════════════
          DYNAMIC ADMINISTRATIVE LOCATION SELECTOR (District -> Place -> Ward)
      ═══════════════════════════════════════════════════════════════════════ */}
      <LocationSelector
        district={filters.districtId}
        selectedPlaceId={selectedPlaceId}
        selectedWardId={selectedWardId}
        onDistrictSelect={handleDistrictSelect}
        onPlaceSelect={handlePlaceSelect}
        onWardSelect={handleWardSelect}
        apiBaseUrl={API_BASE_URL}
      />

      {/* Non-Chennai District Information Strip */}
      {filters.districtId.toLowerCase() !== 'chennai' && (
        <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-blue-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>{filters.districtId} District Active:</strong> Official administrative GIS boundary loaded. Multi-factor flood risk models are live for Chennai. Data for {filters.districtId} reflects verified public records or 'Data Unavailable'.
            </span>
          </div>
          <button
            onClick={() => handleDistrictSelect('Chennai')}
            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline whitespace-nowrap ml-3 cursor-pointer"
          >
            Switch to Chennai GCC Core →
          </button>
        </div>
      )}

          {/* ═══════════════════════════════════════════════════════════════════
              2. HERO (Primary Kathipara Bridge Visual, 16:9 crop, translucent overlay)
          ═══════════════════════════════════════════════════════════════════ */}
          <HeroSection
            onOpenRiskMap={() => {
              const mapEl = document.getElementById('current-risk-map');
              if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
            }}
            onViewPriorityAreas={() => {
              const el = document.getElementById('priority-actions');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* ═══════════════════════════════════════════════════════════════════
              3. LIVE DATA STRIP (200 GCC Wards | 1,325 Verified Incidents | 24/48/72h)
          ═══════════════════════════════════════════════════════════════════ */}
          <LiveDataStrip
            wardCount={200}
            incidentCount={1325}
            highRiskCount={highRiskCount}
            citizenReportCount={complaintSummary?.total_complaints ?? citizenComplaints.length}
          />

          {/* ═══════════════════════════════════════════════════════════════════
              3B. LIVE WEATHER — CHENNAI (Real Telemetry, 24h Forecast, 48/72h Context)
          ═══════════════════════════════════════════════════════════════════ */}
          <LiveWeatherPanel selectedDistrict={filters.districtId} />

          {/* ═══════════════════════════════════════════════════════════════════
              4. CIVICPULSE SERVICES & INFORMATION DESK (6 Clean Tiles)
          ═══════════════════════════════════════════════════════════════════ */}
          <CivicPulseServicesSection />

          {/* ═══════════════════════════════════════════════════════════════════
              5. CURRENT RISK SECTION: CHENNAI WATERLOGGING RISK INTELLIGENCE
          ═══════════════════════════════════════════════════════════════════ */}
          <section
            id="current-risk-map"
            aria-label="Chennai Waterlogging Risk Intelligence"
            className="bg-white border border-slate-300 rounded-md p-4 sm:p-5 shadow-xs text-slate-800 space-y-4"
          >
            {/* Section Top Header & Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-[#1b365d] text-white border border-blue-900">
                  <MapPin className="w-4 h-4 text-blue-200" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-[#0d233a] uppercase tracking-wide">
                      {t('map_section_title')}
                    </h2>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-900 text-white font-mono uppercase tracking-wider">
                      ORIGINAL PROJECT
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                      VERIFIED
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                      PUBLIC DATA
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                      OBSERVED
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
                      DERIVED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {t('map_section_subtitle')} • GCC 200 Wards Official Spatial Hierarchy
                  </p>
                </div>
              </div>

              {/* Verified Municipal Badge */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] font-bold px-3 py-1.5 rounded bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1.5 shadow-2xs">
                  <Layers className="w-3.5 h-3.5 text-blue-700" />
                  <span>MUNICIPAL GIS OPERATIONS WORKSPACE</span>
                </span>
              </div>
            </div>

            {/* ─── Full Municipal GIS Operations Workspace (Unconditional) ─────── */}
            <div className="space-y-4">
              {/* Scenario Rainfall Bar & Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Scenario Rainfall Panel (4 Cols) */}
                <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white uppercase flex items-center space-x-1.5">
                      <CloudRain className="w-4 h-4 text-blue-400" />
                      <span>Scenario Rainfall Input</span>
                    </span>
                    <span className="text-[10px] text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800 font-bold uppercase">
                      WHAT-IF SCENARIO
                    </span>
                  </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expected Rainfall</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="5"
                            max="300"
                            value={scenarioRainfall}
                            onChange={(e) => setScenarioRainfall(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-white text-xs focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-slate-400 font-semibold">mm</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Forecast Horizon</label>
                        <select
                          value={forecastHorizon}
                          onChange={(e) => setForecastHorizon(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-white text-xs focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={12}>12 Hours</option>
                          <option value={24}>24 Hours</option>
                          <option value={48}>48 Hours</option>
                          <option value={72}>72 Hours</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleRunPredictionScenario}
                      disabled={scenarioRunning}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{scenarioRunning ? 'Scenario running...' : 'RUN PREDICTION SCENARIO'}</span>
                    </button>

                    {scenarioStatusText && (
                      <div className={`p-2 rounded-lg text-[11px] font-medium border ${
                        scenarioStatusText.startsWith('✓')
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          : scenarioStatusText.includes('running')
                          ? 'bg-blue-950/60 border-blue-800 text-blue-300 animate-pulse'
                          : 'bg-rose-950/60 border-rose-800 text-rose-300'
                      }`}>
                        {scenarioStatusText}
                      </div>
                    )}
                  </div>

                  {/* Metric Cards (8 Cols) */}
                  <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-950 border-l-4 border-l-rose-600 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">High Risk Wards</span>
                      <div className="flex items-baseline space-x-2 my-1">
                        <span className="text-2xl font-black text-rose-400">{highRiskCount}</span>
                        <span className="text-xs text-slate-400">Wards</span>
                      </div>
                      <span className="text-[10px] text-rose-300 font-semibold">Critical Priority</span>
                    </div>

                    <div className="bg-slate-950 border-l-4 border-l-amber-500 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Medium Risk Wards</span>
                      <div className="flex items-baseline space-x-2 my-1">
                        <span className="text-2xl font-black text-amber-400">{medRiskCount}</span>
                        <span className="text-xs text-slate-400">Wards</span>
                      </div>
                      <span className="text-[10px] text-amber-300 font-semibold">Active Watch</span>
                    </div>

                    <div className="bg-slate-950 border-l-4 border-l-emerald-600 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Low Risk Wards</span>
                      <div className="flex items-baseline space-x-2 my-1">
                        <span className="text-2xl font-black text-emerald-400">{lowRiskCount}</span>
                        <span className="text-xs text-slate-400">Wards</span>
                      </div>
                      <span className="text-[10px] text-emerald-300 font-semibold">Standard Maintenance</span>
                    </div>

                    <div className="bg-slate-950 border-l-4 border-l-violet-600 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Citizen Reports</span>
                      <div className="flex items-baseline space-x-2 my-1">
                        <span className="text-2xl font-black text-violet-400">
                          {complaintSummary?.total_complaints ?? citizenComplaints.length}
                        </span>
                        <span className="text-xs text-slate-400">Complaints</span>
                      </div>
                      <span className="text-[10px] text-violet-300 font-semibold">Active Chennai Log</span>
                    </div>
                  </div>

                </div>

                {/* Main GIS Workspace: Left = Filters, Center = Leaflet Map, Right = Inspector */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <aside className="lg:col-span-3">
                    <FilterPanel
                      layers={layers}
                      onToggleLayer={handleToggleLayer}
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      wardsList={wardsList}
                      onFocusCamera={handleFocusCamera}
                    />
                  </aside>

                  <section className="lg:col-span-6 relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 min-h-[620px] flex flex-col shadow-md">
                    <MapViewContainer
                      layers={layers}
                      geoData={geoData}
                      citizenComplaints={citizenComplaints}
                      selectedWardId={selectedWardId}
                      selectedPlace={selectedFeature?.type === 'place' ? (selectedFeature.properties as any) : null}
                      selectedFeature={selectedFeature}
                      onSelectFeature={(feat) => {
                        setSelectedFeature(feat);
                        if (feat.type === 'ward') {
                          handleWardSelect(feat.properties);
                        } else if (feat.type === 'place') {
                          handlePlaceSelect(feat.properties);
                        }
                      }}
                      searchResult={searchResult}
                      cameraTrigger={cameraTrigger}
                      selectedDistrict={filters.districtId}
                      onTrackComplaint={handleTrackComplaint}
                      onReportAtCoords={handleReportAtCoords}
                    />
                    <div className="absolute bottom-4 left-4 z-10">
                      <MapLegend />
                    </div>
                  </section>

                  <aside className="lg:col-span-3">
                    <FeatureDetailsPanel
                      selectedFeature={selectedFeature}
                      onClose={() => setSelectedFeature(null)}
                      apiBaseUrl={API_BASE_URL}
                      scenarioRainfall={scenarioRainfall}
                      forecastHorizon={forecastHorizon}
                    />
                  </aside>
                </div>
              </div>

          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              5. HISTORICAL WATERLOGGING (New Chennai Flood image + Verified Project Evidence)
          ═══════════════════════════════════════════════════════════════════ */}
          <HistoricalWaterloggingSection />

          {/* ═══════════════════════════════════════════════════════════════════
              6. CHENNAI IDENTITY (Namma Chennai visual + CivicPulse explanation)
          ═══════════════════════════════════════════════════════════════════ */}
          <ChennaiIdentitySection />

          {/* ═══════════════════════════════════════════════════════════════════
              7. RAINFALL & WARNING CONTEXT (Red alert image + RainfallAnalyticsPanel)
          ═══════════════════════════════════════════════════════════════════ */}
          <RainfallAlertContextSection
            selectedDistrict={filters.districtId}
            apiBaseUrl={API_BASE_URL}
          />

          {/* ═══════════════════════════════════════════════════════════════════
              8. PREDICT → EXPLAIN → PRIORITIZE → OPTIMIZE → SIMULATE PIPELINE
          ═══════════════════════════════════════════════════════════════════ */}
          <DecisionPipelineSection />

          {/* ═══════════════════════════════════════════════════════════════════
              9. PRIORITY ACTIONS (Ranked Decision Support & Ward Queue)
          ═══════════════════════════════════════════════════════════════════ */}
          <section id="priority-actions" aria-label="Priority Actions & Ward Queue">
            <PriorityQueuePanel
              selectedDistrict={filters.districtId}
              apiBaseUrl={API_BASE_URL}
            />
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              10. SIMULATION (What-If Scenario Simulation & Resource Optimization)
          ═══════════════════════════════════════════════════════════════════ */}
          <section id="simulation-decision-support" aria-label="What-If Simulation and Resource Planner">
            <div className="space-y-4">
              <ResourcePlannerPanel
                apiBaseUrl={API_BASE_URL}
                scenarioRainfall={scenarioRainfall}
                forecastHorizon={forecastHorizon}
                selectedDistrict={filters.districtId}
                selectedPlaceId={selectedPlaceId}
                selectedWardId={selectedWardId}
                selectedFeature={selectedFeature}
                lastScenarioTimestamp={lastScenarioTimestamp}
              />
              <WhatIfSimulatorPanel apiBaseUrl={API_BASE_URL} />
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              11. DATA & SOURCES (Geospatial layers, DEM, IMD & Provenance)
          ═══════════════════════════════════════════════════════════════════ */}
          <DataSourcesSection />

          {/* ═══════════════════════════════════════════════════════════════════
              12. CIVIC RESPONSE & EMERGENCY INFORMATION STRIP (Verified GCC / TNDR / 1913)
          ═══════════════════════════════════════════════════════════════════ */}
          <EmergencyCivicInfoSection />
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          13. STRUCTURED GOVERNMENT FOOTER (4 Columns, Institutional Aesthetic)
      ═══════════════════════════════════════════════════════════════════════ */}
      <GovFooter />

      {/* ═══════════════════════════════════════════════════════════════════════
          CITIZEN COMPLAINT MODALS (Rendered at root level for proper z-index)
      ═══════════════════════════════════════════════════════════════════════ */}
      <ReportWaterloggingModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setReportCoords(null);
        }}
        onSuccess={handleComplaintSuccess}
        selectedMapCoords={reportCoords}
      />

      <ComplaintTrackingModal
        isOpen={showTrackModal}
        onClose={() => {
          setShowTrackModal(false);
          setActiveTrackId(null);
        }}
        initialComplaintId={activeTrackId}
      />

      <OperationsComplaintQueue
        isOpen={showOpsQueue}
        onClose={() => setShowOpsQueue(false)}
        onSelectOnMap={(coords) => {
          setShowOpsQueue(false);
          setCameraTrigger({
            type: 'district',
            coords,
            timestamp: Date.now(),
          });
          const mapEl = document.getElementById('current-risk-map');
          if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
        }}
      />

    </div>
  );
}
