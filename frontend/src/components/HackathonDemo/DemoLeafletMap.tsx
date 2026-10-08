'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DemoLocation } from './types';

interface MapProps {
  locations: DemoLocation[];
  selectedLocation: DemoLocation | null;
  onSelectLocation: (loc: DemoLocation) => void;
  cameraCoords?: [number, number] | null;
  cameraBounds?: [[number, number], [number, number]] | null;
  heightClass?: string;
}

export default function DemoLeafletMap({
  locations,
  selectedLocation,
  onSelectLocation,
  cameraCoords,
  cameraBounds,
  heightClass = 'min-h-[520px] h-[520px]',
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const onSelectLocationRef = useRef(onSelectLocation);
  onSelectLocationRef.current = onSelectLocation;
  const lastFlownLocRef = useRef<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    const map = L.map(containerRef.current, {
      center: [13.0827, 80.2707],
      zoom: 11.5,
      minZoom: 9,
      maxZoom: 19,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (containerRef.current && (containerRef.current as any)._leaflet_id) {
        delete (containerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Update Markers when locations or selection changes
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;

    const lg = layerGroupRef.current;
    lg.clearLayers();

    const getMarkerColor = (riskClass: string) => {
      if (riskClass === 'HIGH') return '#e11d48'; // rose-600
      if (riskClass === 'MEDIUM') return '#d97706'; // amber-600
      return '#059669'; // emerald-600
    };

    locations.forEach((loc) => {
      const isSelected = selectedLocation?.location === loc.location;
      const color = getMarkerColor(loc.risk_class);

      const marker = L.circleMarker([loc.latitude, loc.longitude], {
        radius: isSelected ? 14 : loc.risk_class === 'HIGH' ? 10 : loc.risk_class === 'MEDIUM' ? 8 : 7,
        color: isSelected ? '#ffffff' : color,
        fillColor: color,
        fillOpacity: isSelected ? 0.95 : 0.85,
        weight: isSelected ? 3.5 : 1.5,
      });

      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; padding: 4px; min-width: 200px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: #0f172a; font-size: 12px;">${loc.location}</strong>
            <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; color: #fff; background-color: ${color};">
              ${loc.risk_class}
            </span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; color: #475569; margin-bottom: 6px;">
            <div>Risk Score: <strong style="color: #0f172a;">${loc.risk_score}</strong></div>
            <div>Forecast: <strong style="color: #0f172a;">${loc.forecast_rainfall_mm}mm</strong></div>
            <div>Incidents: <strong style="color: #0f172a;">${loc.historical_incidents_30d}</strong></div>
            <div>Drainage: <strong style="color: #0f172a;">${loc.drainage_capacity_percent}%</strong></div>
            <div>Elevation: <strong style="color: #0f172a;">${loc.elevation_m}m MSL</strong></div>
            <div>Pop: <strong style="color: #0f172a;">${loc.population.toLocaleString()}</strong></div>
          </div>
          <div style="font-size: 10px; color: #1e3a8a; background: #eff6ff; padding: 4px 6px; border-radius: 4px; border: 1px solid #bfdbfe; font-weight: 600;">
            ${loc.recommended_action}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectLocationRef.current(loc);
      });

      marker.addTo(lg);
    });
  }, [locations, selectedLocation?.location]);

  // Fly to selected location
  useEffect(() => {
    if (!selectedLocation || !mapRef.current) return;
    if (selectedLocation.location === lastFlownLocRef.current) return;

    lastFlownLocRef.current = selectedLocation.location;
    mapRef.current.flyTo([selectedLocation.latitude, selectedLocation.longitude], 13, { duration: 1.0 });
  }, [selectedLocation?.location, selectedLocation?.latitude, selectedLocation?.longitude]);

  // External camera trigger (e.g. from LocationSelector)
  useEffect(() => {
    if (!mapRef.current) return;
    if (cameraBounds) {
      mapRef.current.fitBounds(cameraBounds, { padding: [20, 20], maxZoom: 14 });
    } else if (cameraCoords) {
      mapRef.current.flyTo(cameraCoords, 13, { duration: 1.0 });
    }
  }, [cameraCoords, cameraBounds]);

  return <div ref={containerRef} className={`w-full ${heightClass} rounded-md bg-slate-100 z-0`} />;
}
