'use client';

import dynamic from 'next/dynamic';

// Props interface mirrors MapView — forwarded transparently
interface MapViewContainerProps {
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

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-3">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-mono">Initializing Municipal Map Engine...</p>
    </div>
  ),
});

export default function MapViewContainer(props: MapViewContainerProps) {
  return <MapView {...props} />;
}
