'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AlertTriangle, MapPin, Building, Layers } from 'lucide-react';

interface MapViewProps {
  layers: {
    wards: boolean;
    roads: boolean;
    drains: boolean;
    waterbodies: boolean;
    incidents: boolean;
    facilities: boolean;
    population: boolean;
    populationExposure?: boolean;
    districts?: boolean;
    state?: boolean;
    citizenComplaints?: boolean;
  };
  geoData: {
    wards: any;
    roads: any;
    drains: any;
    waterbodies: any;
    incidents: any;
    facilities: any;
    population: any;
    populationExposure?: any;
    districts?: any;
    state?: any;
  };
  citizenComplaints?: any[];
  selectedWardId: string | number | null;
  selectedPlace?: any;
  selectedFeature?: any;
  onSelectFeature: (feature: { type: string; properties: any; id?: any; geometry?: any }) => void;
  searchResult: any;
  cameraTrigger?: {
    type: 'india' | 'tn' | 'district' | 'place' | 'ward';
    coords?: [number, number];
    bounds?: [[number, number], [number, number]] | any;
    geometry?: any;
    timestamp?: number;
  } | null;
  selectedDistrict?: string;
  onTrackComplaint?: (complaintId: string) => void;
  onReportAtCoords?: (coords: [number, number]) => void;
}

export interface BasemapProvider {
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

export const BASEMAP_PROVIDERS: Record<string, BasemapProvider> = {
  osm: {
    name: 'OpenStreetMap Standard (Official)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
};

export const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];
export const TAMIL_NADU_CENTER: [number, number] = [11.1271, 78.6569];

export const CHENNAI_BOUNDS = {
  latMin: 12.80,
  latMax: 13.28,
  lonMin: 80.00,
  lonMax: 80.35,
};

export default function MapView({
  layers,
  geoData,
  citizenComplaints = [],
  selectedWardId,
  selectedPlace,
  selectedFeature,
  onSelectFeature,
  searchResult,
  cameraTrigger,
  selectedDistrict = 'Chennai',
  onTrackComplaint,
  onReportAtCoords,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const highlightLayerRef = useRef<L.LayerGroup | null>(null);
  const districtsLayerRef = useRef<L.LayerGroup | null>(null);
  const complaintsLayerRef = useRef<L.LayerGroup | null>(null);

  const [currentZoom, setCurrentZoom] = useState<number>(11.5);
  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number }>({
    lat: CHENNAI_CENTER[0],
    lng: CHENNAI_CENTER[1],
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('municipal-map', {
        center: CHENNAI_CENTER,
        zoom: 11.5,
        minZoom: 6,
        maxZoom: 19,
        zoomControl: false,
      });

      const baseTile = L.tileLayer(BASEMAP_PROVIDERS.osm.url, {
        attribution: BASEMAP_PROVIDERS.osm.attribution,
        maxZoom: BASEMAP_PROVIDERS.osm.maxZoom,
      }).addTo(map);

      tileLayerRef.current = baseTile;
      L.control.zoom({ position: 'topright' }).addTo(map);

      map.on('zoomend', () => setCurrentZoom(map.getZoom()));
      map.on('moveend', () => {
        const c = map.getCenter();
        setCurrentCenter({ lat: Number(c.lat.toFixed(4)), lng: Number(c.lng.toFixed(4)) });
      });

      // Unified Map Click Handler (Supports all Tamil Nadu districts & Chennai complaints)
      map.on('click', (e) => {
        const lat = Number(e.latlng.lat.toFixed(5));
        const lng = Number(e.latlng.lng.toFixed(5));

        const isInsideChennai =
          lat >= CHENNAI_BOUNDS.latMin &&
          lat <= CHENNAI_BOUNDS.latMax &&
          lng >= CHENNAI_BOUNDS.lonMin &&
          lng <= CHENNAI_BOUNDS.lonMax;

        const popupContent = document.createElement('div');
        popupContent.style.fontFamily = 'sans-serif';
        popupContent.style.padding = '4px';
        popupContent.style.fontSize = '12px';

        popupContent.innerHTML = `
          <strong style="color:#0f172a;">${isInsideChennai ? 'Location in Chennai' : `${selectedDistrict || 'Tamil Nadu'} Location`}</strong><br/>
          <span style="color:#475569;font-size:11px;">Coordinates: <strong>${lat}° N, ${lng}° E</strong></span><br/>
          <button id="map-report-btn-${lat}" style="margin-top:6px;background:#2563eb;color:white;border:none;padding:5px 9px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;">
            🚨 Report Waterlogging Here
          </button>
        `;

        L.popup().setLatLng(e.latlng).setContent(popupContent).openOn(map);

        setTimeout(() => {
          const btn = document.getElementById(`map-report-btn-${lat}`);
          if (btn && onReportAtCoords) {
            btn.onclick = () => {
              map.closePopup();
              onReportAtCoords([lat, lng]);
            };
          }
        }, 50);
      });

      districtsLayerRef.current = L.layerGroup().addTo(map);
      layerGroupRef.current = L.layerGroup().addTo(map);
      highlightLayerRef.current = L.layerGroup().addTo(map);
      complaintsLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update District Boundaries Layer
  useEffect(() => {
    const map = mapRef.current;
    const distGroup = districtsLayerRef.current;
    if (!map || !distGroup) return;

    distGroup.clearLayers();

    if (layers.districts !== false && geoData.districts?.features) {
      const distLayer = L.geoJSON(geoData.districts, {
        style: (feature) => {
          const isDistSelected =
            selectedDistrict &&
            feature?.properties?.district?.toLowerCase() === selectedDistrict.toLowerCase();
          return {
            color: isDistSelected ? '#d97706' : '#94a3b8',
            weight: isDistSelected ? 2.5 : 1.0,
            fillColor: isDistSelected ? '#fef3c7' : '#f8fafc',
            fillOpacity: isDistSelected ? 0.15 : 0.05,
            dashArray: isDistSelected ? '4, 4' : '2, 4',
          };
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties || {};
          layer.bindTooltip(
            `<strong>${p.name || p.district}</strong><br/><span style="font-size:10px;color:#64748b;">HQ: ${p.headquarters || 'N/A'} • Pop: ${Number(p.population || 0).toLocaleString()}</span>`,
            { sticky: true }
          );
        },
      });
      distGroup.addLayer(distLayer);
    }
  }, [layers.districts, geoData.districts, selectedDistrict]);

  // Update Standard Layers (Wards, Drainage, Waterbodies, Roads)
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Layer: Wards (Official GCC Boundaries)
    if (layers.wards && geoData.wards?.features) {
      const wardLayer = L.geoJSON(geoData.wards, {
        style: (feature) => {
          const isSelected =
            String(selectedWardId) === String(feature?.properties?.id) ||
            String(selectedWardId) === String(feature?.properties?.ward_number);
          return {
            color: isSelected ? '#1d4ed8' : '#2563eb',
            weight: isSelected ? 3 : 1.2,
            fillColor: isSelected ? '#3b82f6' : '#60a5fa',
            fillOpacity: isSelected ? 0.35 : 0.12,
          };
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties || {};
          const wardTitle = p.name || `Ward ${p.ward_number || p.id}`;
          const zoneInfo = p.zone_name
            ? `Zone ${p.zone_number} (${p.zone_name})`
            : p.zone_number
            ? `Zone ${p.zone_number}`
            : 'Greater Chennai Corporation';
          const areaInfo = p.area_sq_km ? `${p.area_sq_km} km²` : '';
          const popInfo = p.population
            ? `${Number(p.population).toLocaleString()} residents (Census 2011)`
            : 'Population: Data Unavailable';
          const elevInfo =
            p.elevation_m != null
              ? `Elevation: ${p.elevation_m}m MSL • Slope: ${p.slope_percent}%`
              : 'Elevation: Data Unavailable';
          const incInfo =
            p.historical_incident_count != null
              ? `Historical Waterlogging: ${p.historical_incident_count} verified spots`
              : '';

          const tooltipHtml = `
            <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; line-height: 1.4; padding: 2px;">
              <div style="font-weight: 700; color: #1e3a8a; font-size: 12px;">${wardTitle}</div>
              <div style="color: #334155; font-size: 10.5px; margin-top: 2px;">
                <strong>${zoneInfo}</strong>
              </div>
              <div style="color: #475569; font-size: 10px; margin-top: 2px;">
                ${popInfo}
              </div>
              <div style="color: #475569; font-size: 10px; margin-top: 1px;">
                ${elevInfo}
              </div>
              ${incInfo ? `<div style="color: #b45309; font-size: 10px; margin-top: 1px; font-weight: 500;">${incInfo}</div>` : ''}
              <div style="color: #64748b; font-size: 9.5px; margin-top: 2px; border-top: 1px solid #e2e8f0; pt-1;">
                ${areaInfo ? `Area: <strong>${areaInfo}</strong> | ` : ''}Official GCC GIS
              </div>
            </div>
          `;
          layer.bindTooltip(tooltipHtml, { sticky: true });
          layer.on({
            click: () =>
              onSelectFeature({
                type: 'ward',
                properties: feature.properties,
                geometry: feature.geometry,
                id: feature.properties.id || feature.properties.ward_number,
              }),
            mouseover: (e: any) => {
              const l = e.target;
              const isSelected =
                String(selectedWardId) === String(p.id) ||
                String(selectedWardId) === String(p.ward_number);
              if (!isSelected) {
                l.setStyle({ fillOpacity: 0.28, weight: 2, color: '#1e40af' });
              }
            },
            mouseout: (e: any) => {
              const l = e.target;
              const isSelected =
                String(selectedWardId) === String(p.id) ||
                String(selectedWardId) === String(p.ward_number);
              if (!isSelected) {
                l.setStyle({ fillOpacity: 0.12, weight: 1.2, color: '#2563eb' });
              }
            },
          });
        },
      });
      layerGroup.addLayer(wardLayer);
    }

    // Layer: Drainage
    if (layers.drains && geoData.drains?.features) {
      const drainLayer = L.geoJSON(geoData.drains, {
        style: { color: '#0284c7', weight: 2 },
      });
      layerGroup.addLayer(drainLayer);
    }

    // Layer: Waterbodies
    if (layers.waterbodies && geoData.waterbodies?.features) {
      const wbLayer = L.geoJSON(geoData.waterbodies, {
        style: { color: '#2563eb', weight: 1.5, fillColor: '#3b82f6', fillOpacity: 0.3 },
      });
      layerGroup.addLayer(wbLayer);
    }

    // Layer: Roads
    if (layers.roads && geoData.roads?.features) {
      const roadLayer = L.geoJSON(geoData.roads, {
        style: { color: '#f97316', weight: 1.8 },
      });
      layerGroup.addLayer(roadLayer);
    }
  }, [layers, geoData, selectedWardId]);

  // Handle Boundary Highlighting & Automatic Zoom on Selected Location (Place, Ward, District)
  useEffect(() => {
    const map = mapRef.current;
    const highlightGroup = highlightLayerRef.current;
    if (!map || !highlightGroup) return;

    highlightGroup.clearLayers();

    // Helper to normalize bounds to Leaflet LatLngBounds
    const normalizeBounds = (b: any): L.LatLngBounds | null => {
      if (!b) return null;
      try {
        if (Array.isArray(b)) {
          if (b.length === 2 && Array.isArray(b[0]) && Array.isArray(b[1])) {
            return L.latLngBounds([b[0][0], b[0][1]], [b[1][0], b[1][1]]);
          }
          if (b.length === 4 && typeof b[0] === 'number') {
            return L.latLngBounds([b[0], b[1]], [b[2], b[3]]);
          }
        }
      } catch {
        return null;
      }
      return null;
    };

    // Priority 1: Camera Trigger (Direct command from dropdown or search)
    if (cameraTrigger) {
      const { type, coords, bounds, geometry } = cameraTrigger;
      const parsedBounds = normalizeBounds(bounds);

      if (geometry) {
        // Highlight polygon boundary
        const polyLayer = L.geoJSON(geometry, {
          style: {
            color: '#2563eb',
            weight: 3.5,
            fillColor: '#3b82f6',
            fillOpacity: 0.28,
            dashArray: '4, 4',
          },
        });
        highlightGroup.addLayer(polyLayer);

        try {
          if (parsedBounds) {
            map.fitBounds(parsedBounds, { padding: [40, 40], maxZoom: type === 'ward' ? 16 : 15 });
          } else {
            map.fitBounds(polyLayer.getBounds(), { padding: [40, 40], maxZoom: type === 'ward' ? 16 : 15 });
          }
        } catch {
          if (coords) map.flyTo(coords, type === 'ward' ? 15 : 14);
        }
      } else if (parsedBounds) {
        try {
          map.fitBounds(parsedBounds, { padding: [40, 40], maxZoom: type === 'district' ? 11 : 14 });
        } catch {
          if (coords) map.flyTo(coords, type === 'district' ? 10 : 13);
        }
      } else if (coords) {
        const marker = L.circleMarker(coords, {
          radius: 12,
          color: '#2563eb',
          weight: 3,
          fillColor: '#60a5fa',
          fillOpacity: 0.6,
        });
        highlightGroup.addLayer(marker);
        const zoomLvl = type === 'ward' ? 15 : type === 'place' ? 14 : type === 'district' ? 11 : 9;
        map.flyTo(coords, zoomLvl, { duration: 1.2 });
      }
      return;
    }

    // Priority 2: Selected Feature (Place or Ward clicked)
    if (selectedFeature?.geometry) {
      const polyLayer = L.geoJSON(selectedFeature.geometry, {
        style: {
          color: '#2563eb',
          weight: 3.5,
          fillColor: '#3b82f6',
          fillOpacity: 0.28,
        },
      });
      highlightGroup.addLayer(polyLayer);
      map.fitBounds(polyLayer.getBounds(), { padding: [40, 40], maxZoom: 15 });
    } else if (selectedPlace?.geometry) {
      const polyLayer = L.geoJSON(selectedPlace.geometry, {
        style: {
          color: '#2563eb',
          weight: 3.5,
          fillColor: '#3b82f6',
          fillOpacity: 0.28,
        },
      });
      highlightGroup.addLayer(polyLayer);
      if (selectedPlace.bounds) {
        map.fitBounds(selectedPlace.bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [cameraTrigger, selectedFeature, selectedPlace]);

  // Update Citizen Complaints Layer
  useEffect(() => {
    const map = mapRef.current;
    const compGroup = complaintsLayerRef.current;
    if (!map || !compGroup) return;

    compGroup.clearLayers();

    if (layers.citizenComplaints !== false && citizenComplaints && citizenComplaints.length > 0) {
      citizenComplaints.forEach((c) => {
        if (!c.latitude || !c.longitude) return;

        let strokeColor = '#eab308';
        let fillColor = '#fde047';
        let statusLabel = '🟡 Unverified Citizen Report';

        const vs = (c.visual_state || '').toLowerCase();
        if (vs === 'resolved') {
          strokeColor = '#059669';
          fillColor = '#34d399';
          statusLabel = '🟢 Resolved';
        } else if (vs === 'assigned') {
          strokeColor = '#ea580c';
          fillColor = '#fb923c';
          statusLabel = '🟠 Assigned / In Progress';
        } else if (vs === 'under_review') {
          strokeColor = '#2563eb';
          fillColor = '#60a5fa';
          statusLabel = '🔵 Under Review';
        }

        const marker = L.circleMarker([c.latitude, c.longitude], {
          radius: 8,
          color: strokeColor,
          weight: 2.5,
          fillColor: fillColor,
          fillOpacity: 0.9,
        });

        const popupContent = document.createElement('div');
        popupContent.style.fontFamily = 'sans-serif';
        popupContent.style.padding = '3px';
        popupContent.style.fontSize = '12px';
        popupContent.innerHTML = `
          <div style="font-weight:bold;color:#1e3a8a;display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span>${c.complaint_id}</span>
            <span style="font-size:10px;padding:2px 5px;border-radius:4px;background:#f1f5f9;color:#334155;">${c.severity}</span>
          </div>
          <div style="margin-top:2px;font-size:11px;color:#0f172a;">
            <strong>${c.area}</strong> ${c.street ? `<span style="color:#64748b;">(${c.street})</span>` : ''}
          </div>
          <div style="margin-top:4px;font-size:10px;font-weight:600;color:#0f172a;">
            Status: ${statusLabel}
          </div>
          <button id="track-comp-${c.complaint_id}" style="margin-top:6px;width:100%;background:#1e40af;color:white;border:none;padding:4px 8px;border-radius:6px;font-size:10px;font-weight:600;cursor:pointer;">
            🔍 Track Complaint Details
          </button>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          setTimeout(() => {
            const trackBtn = document.getElementById(`track-comp-${c.complaint_id}`);
            if (trackBtn && onTrackComplaint) {
              trackBtn.onclick = () => {
                map.closePopup();
                onTrackComplaint(c.complaint_id);
              };
            }
          }, 50);
        });

        compGroup.addLayer(marker);
      });
    }
  }, [citizenComplaints, layers.citizenComplaints]);

  // Handle Search Result
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !searchResult) return;

    if (searchResult.geometry?.coordinates) {
      const coords = searchResult.geometry.coordinates;
      if (searchResult.geometry.type === 'Point') {
        map.flyTo([coords[1], coords[0]], 14, { duration: 1.2 });
      } else if (
        searchResult.geometry.type === 'Polygon' ||
        searchResult.geometry.type === 'MultiPolygon'
      ) {
        const geoLayer = L.geoJSON(searchResult);
        map.fitBounds(geoLayer.getBounds(), { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [searchResult]);

  const placeLabel = selectedPlace?.name || (selectedWardId ? `Ward ${selectedWardId}` : selectedDistrict);

  return (
    <div className="relative w-full h-full min-h-[550px]">
      {/* Informational Dynamic Status Banner */}
      <div className="absolute top-3 left-3 z-10 bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 shadow-lg text-xs backdrop-blur-md max-w-md text-slate-300 flex items-start gap-2.5">
        <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-snug">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white">Selected Jurisdiction:</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
              {placeLabel}
            </span>
          </div>
          <span className="block text-slate-400 text-[10px] mt-0.5">
            {selectedDistrict.toLowerCase() === 'chennai'
              ? 'Official GCC GIS Active • 200 Wards & 15 Zones with verified 30m DEM terrain.'
              : `${selectedDistrict} District Administrative GIS loaded • Surrounding geography active.`}
          </span>
        </div>
      </div>

      {/* Map Legend Overlay for Citizen Complaints */}
      <div className="absolute bottom-6 right-6 z-10 bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs text-slate-300 space-y-1.5 min-w-[190px]">
        <div className="text-[11px] font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>Map Indicators</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">Live</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-blue-400 shrink-0"></span>
          <span>Selected Boundary</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-300 shrink-0"></span>
          <span>Citizen Report (🟡)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-400 shrink-0"></span>
          <span>Resolved (🟢)</span>
        </div>
      </div>

      {/* Main Leaflet Map Container */}
      <div id="municipal-map" className="w-full h-full min-h-[550px] z-0" />
    </div>
  );
}
