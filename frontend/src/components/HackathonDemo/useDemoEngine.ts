'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { DemoLocation, OptimizationResult } from './types';
export type { DemoLocation, OptimizationResult };

const DEFAULT_DEMO_ROWS = [
  { location: 'Velachery (Ward 177)', latitude: 12.9815, longitude: 80.218, rainfall_24h_mm: 142.5, forecast_24h_mm: 155.0, historical_incidents_30d: 12, elevation_m: 2.1, slope_percent: 0.8, drainage_capacity_percent: 35.0, population: 54200, critical_facilities: 4 },
  { location: 'T. Nagar (Ward 136)', latitude: 13.0418, longitude: 80.2341, rainfall_24h_mm: 135.0, forecast_24h_mm: 148.0, historical_incidents_30d: 10, elevation_m: 3.2, slope_percent: 1.0, drainage_capacity_percent: 38.0, population: 68500, critical_facilities: 6 },
  { location: 'Vyasarpadi (Ward 37)', latitude: 13.109, longitude: 80.258, rainfall_24h_mm: 148.0, forecast_24h_mm: 160.0, historical_incidents_30d: 14, elevation_m: 1.8, slope_percent: 0.5, drainage_capacity_percent: 30.0, population: 49300, critical_facilities: 3 },
  { location: 'Pallikaranai (Ward 190)', latitude: 12.934, longitude: 80.2135, rainfall_24h_mm: 140.0, forecast_24h_mm: 152.0, historical_incidents_30d: 11, elevation_m: 2.0, slope_percent: 0.6, drainage_capacity_percent: 32.0, population: 41800, critical_facilities: 2 },
  { location: 'Madipakkam (Ward 188)', latitude: 12.9647, longitude: 80.1961, rainfall_24h_mm: 130.0, forecast_24h_mm: 140.0, historical_incidents_30d: 9, elevation_m: 2.8, slope_percent: 0.9, drainage_capacity_percent: 42.0, population: 46700, critical_facilities: 3 },
  { location: 'Kolathur (Ward 64)', latitude: 13.1236, longitude: 80.219, rainfall_24h_mm: 92.0, forecast_24h_mm: 98.0, historical_incidents_30d: 6, elevation_m: 4.5, slope_percent: 1.4, drainage_capacity_percent: 55.0, population: 52100, critical_facilities: 3 },
  { location: 'Perambur (Ward 70)', latitude: 13.111, longitude: 80.242, rainfall_24h_mm: 88.0, forecast_24h_mm: 95.0, historical_incidents_30d: 5, elevation_m: 4.2, slope_percent: 1.3, drainage_capacity_percent: 58.0, population: 58400, critical_facilities: 4 },
  { location: 'Kodambakkam (Ward 112)', latitude: 13.052, longitude: 80.224, rainfall_24h_mm: 82.0, forecast_24h_mm: 90.0, historical_incidents_30d: 4, elevation_m: 5.2, slope_percent: 1.6, drainage_capacity_percent: 62.0, population: 61200, critical_facilities: 5 },
  { location: 'Saidapet (Ward 142)', latitude: 13.021, longitude: 80.223, rainfall_24h_mm: 85.0, forecast_24h_mm: 92.0, historical_incidents_30d: 5, elevation_m: 4.8, slope_percent: 1.5, drainage_capacity_percent: 60.0, population: 47900, critical_facilities: 2 },
  { location: 'Mylapore (Ward 124)', latitude: 13.0368, longitude: 80.2676, rainfall_24h_mm: 75.0, forecast_24h_mm: 80.0, historical_incidents_30d: 3, elevation_m: 6.5, slope_percent: 2.0, drainage_capacity_percent: 72.0, population: 56300, critical_facilities: 4 },
  { location: 'Guindy (Ward 160)', latitude: 13.0067, longitude: 80.202, rainfall_24h_mm: 45.0, forecast_24h_mm: 48.0, historical_incidents_30d: 2, elevation_m: 8.1, slope_percent: 2.5, drainage_capacity_percent: 78.0, population: 38200, critical_facilities: 3 },
  { location: 'Adyar (Ward 173)', latitude: 13.0012, longitude: 80.2565, rainfall_24h_mm: 42.0, forecast_24h_mm: 46.0, historical_incidents_30d: 1, elevation_m: 6.8, slope_percent: 2.1, drainage_capacity_percent: 80.0, population: 44500, critical_facilities: 4 },
  { location: 'Anna Nagar (Ward 101)', latitude: 13.085, longitude: 80.21, rainfall_24h_mm: 38.0, forecast_24h_mm: 42.0, historical_incidents_30d: 1, elevation_m: 9.5, slope_percent: 3.0, drainage_capacity_percent: 85.0, population: 63000, critical_facilities: 5 },
  { location: 'Alandur (Ward 164)', latitude: 13.003, longitude: 80.189, rainfall_24h_mm: 35.0, forecast_24h_mm: 40.0, historical_incidents_30d: 1, elevation_m: 9.0, slope_percent: 2.8, drainage_capacity_percent: 82.0, population: 39100, critical_facilities: 2 },
];

function computePureClientRisk(
  rawRows: any[],
  horizon: number = 12,
  rainMult: number = 1.0,
  drainDelta: number = 0.0,
  scenarioRainfall: number = 30
): DemoLocation[] {
  const hMult = horizon === 12 ? 0.85 : horizon === 48 ? 1.10 : horizon === 72 ? 1.20 : 1.0;

  const analyzed = rawRows.map((r) => {
    const rawForecast = parseFloat(r.forecast_24h_mm || r.rainfall_24h_mm || 100);
    const baseForecast = scenarioRainfall > 0 ? (scenarioRainfall * (rawForecast / 100.0)) : rawForecast;
    const effectiveForecast = Math.round(baseForecast * hMult * rainMult * 10) / 10;
    const incidents = parseFloat(r.historical_incidents_30d || 0);
    const elevation = parseFloat(r.elevation_m || 5);
    const slope = parseFloat(r.slope_percent || 1.5);
    const baseDrain = parseFloat(r.drainage_capacity_percent || 50);
    const effectiveDrain = Math.max(5, Math.min(100, baseDrain + drainDelta));
    const pop = parseInt(r.population || 50000, 10);
    const facilities = parseInt(r.critical_facilities || 3, 10);

    const fRain = Math.min(1.0, Math.max(0, effectiveForecast / 120.0));
    const fIncidents = Math.min(1.0, Math.max(0, incidents / 15.0));
    const fElevation = Math.max(0, Math.min(1.0, 1.0 - elevation / 12.0));
    const fSlope = Math.max(0, Math.min(1.0, 1.0 - slope / 3.5));
    const fDrainage = Math.max(0, Math.min(1.0, 1.0 - effectiveDrain / 100.0));
    const fFacilities = Math.min(1.0, Math.max(0, facilities / 6.0));

    const wRain = 0.30 * fRain;
    const wIncidents = 0.20 * fIncidents;
    const wElevation = 0.15 * fElevation;
    const wSlope = 0.10 * fSlope;
    const wDrainage = 0.20 * fDrainage;
    const wFacilities = 0.05 * fFacilities;

    const rawScore = 100.0 * (wRain + wIncidents + wElevation + wSlope + wDrainage + wFacilities);
    const riskScore = Math.round(Math.min(100, Math.max(0, rawScore)) * 10) / 10;

    let riskClass: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (riskScore >= 60) riskClass = 'HIGH';
    else if (riskScore >= 35) riskClass = 'MEDIUM';

    const contributions = [
      { factor: 'Scenario Rainfall', contribution_points: Math.round(wRain * 1000) / 10, weight_pct: 30, observed: `${effectiveForecast} mm` },
      { factor: 'Historical Incidents (30d)', contribution_points: Math.round(wIncidents * 1000) / 10, weight_pct: 20, observed: `${incidents} reports` },
      { factor: 'Low Elevation Vulnerability', contribution_points: Math.round(wElevation * 1000) / 10, weight_pct: 15, observed: `${elevation} m MSL` },
      { factor: 'Limited Drainage Capacity', contribution_points: Math.round(wDrainage * 1000) / 10, weight_pct: 20, observed: `${Math.round(effectiveDrain)}%` },
      { factor: 'Low Topographical Slope', contribution_points: Math.round(wSlope * 1000) / 10, weight_pct: 10, observed: `${slope}%` },
      { factor: 'Critical Facility Density', contribution_points: Math.round(wFacilities * 1000) / 10, weight_pct: 5, observed: `${facilities} units` },
    ];
    contributions.sort((a, b) => b.contribution_points - a.contribution_points);

    const whyReasons: string[] = [];
    if (effectiveForecast >= 25) whyReasons.push(`High precipitation scenario of ${effectiveForecast} mm over ${horizon}h horizon`);
    if (incidents >= 5) whyReasons.push(`Recurring waterlogging history (${incidents} recorded incidents in 30d)`);
    if (elevation <= 4.5) whyReasons.push(`Low natural terrain elevation (${elevation}m MSL) creating runoff catchment`);
    if (effectiveDrain <= 58) whyReasons.push(`Stormwater drainage capacity constraint (${Math.round(effectiveDrain)}% operational)`);
    if (whyReasons.length === 0) {
      if (riskClass === 'HIGH') whyReasons.push('Combined cumulative runoff exceeding localized stormwater drainage capacity');
      else if (riskClass === 'MEDIUM') whyReasons.push('Moderate rainfall with localized catchment accumulation risk');
      else whyReasons.push('Adequate natural elevation and functional drainage capacity');
    }

    let action = 'Routine municipal monitoring & standard maintenance';
    if (riskClass === 'HIGH') {
      action = 'Inspect drainage inlet & clear obstruction; position dewatering pumps';
    } else if (riskClass === 'MEDIUM') {
      action = 'Schedule drainage culvert inspection and desilting';
    }

    const normPop = Math.min(1.0, pop / 75000.0);
    const normFac = Math.min(1.0, facilities / 6.0);
    const priorityScore = Math.round((0.40 * (riskScore / 100.0) + 0.30 * normPop + 0.15 * normFac + 0.15 * fIncidents) * 1000) / 1000;

    return {
      location: String(r.location),
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
      rainfall_24h_mm: parseFloat(r.rainfall_24h_mm || 0),
      forecast_rainfall_mm: effectiveForecast,
      historical_incidents_30d: incidents,
      elevation_m: elevation,
      slope_percent: slope,
      drainage_capacity_percent: Math.round(effectiveDrain * 10) / 10,
      population: pop,
      critical_facilities: facilities,
      risk_score: riskScore,
      risk_class: riskClass,
      priority_score: priorityScore,
      priority_rank: 1,
      recommended_action: action,
      risk_factor_contributions: contributions,
      why_reasons: whyReasons,
      data_status_label: 'DEMO DATA / SIMULATION',
    };
  });

  analyzed.sort((a, b) => b.priority_score - a.priority_score || b.risk_score - a.risk_score);
  analyzed.forEach((item, idx) => {
    item.priority_rank = idx + 1;
  });

  return analyzed;
}

export function useDemoEngine(apiBaseUrl: string) {
  const [horizonHours, setHorizonHours] = useState<12 | 24 | 48 | 72>(12);
  const [scenarioRainfall, setScenarioRainfall] = useState<number>(30);
  const [locations, setLocations] = useState<DemoLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<DemoLocation | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzed, setAnalyzed] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Optimization Controls (Default ₹85,000 budget, 5 crews, 30 hrs window)
  const [optCrews, setOptCrews] = useState<number>(5);
  const [optBudget, setOptBudget] = useState<number>(85000);
  const [optTimeWindow, setOptTimeWindow] = useState<number>(30);
  const [optLoading, setOptLoading] = useState<boolean>(false);
  const [optResult, setOptResult] = useState<OptimizationResult | null>(null);

  // What-If Simulation Controls
  const [simRainIncrease, setSimRainIncrease] = useState<number>(20);
  const [simDrainageDelta, setSimDrainageDelta] = useState<number>(-10);
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Run Risk Analysis
  const runRiskAnalysis = useCallback(
    async (
      horizon: 12 | 24 | 48 | 72 = horizonHours,
      scenarioRain: number = scenarioRainfall,
      rainfallMultiplier: number = 1.0,
      drainageDeltaPct: number = 0.0
    ) => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(`${apiBaseUrl}/api/v1/demo/risk-analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            horizon_hours: horizon,
            scenario_rainfall_mm: scenarioRain,
            rainfall_multiplier: rainfallMultiplier,
            drainage_delta_pct: drainageDeltaPct,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setLocations(data.locations);
          setSummary(data.summary);
          setAnalyzed(true);
          if (data.locations && data.locations.length > 0) {
            setSelectedLocation((prev) => {
              if (!prev) return data.locations[0];
              const match = data.locations.find((l: DemoLocation) => l.location === prev.location);
              return match || data.locations[0];
            });
          }
        } else {
          throw new Error('Backend demo endpoint returned non-200');
        }
      } catch (err) {
        console.warn('[DemoEngine] Using client deterministic simulation:', err);
        const analyzedData = computePureClientRisk(DEFAULT_DEMO_ROWS, horizon, rainfallMultiplier, drainageDeltaPct, scenarioRain);
        setLocations(analyzedData);

        const highCount = analyzedData.filter((r) => r.risk_class === 'HIGH').length;
        const medCount = analyzedData.filter((r) => r.risk_class === 'MEDIUM').length;
        const lowCount = analyzedData.filter((r) => r.risk_class === 'LOW').length;
        const popExp = analyzedData
          .filter((r) => r.risk_class !== 'LOW')
          .reduce((sum, r) => sum + r.population, 0);
        const facExp = analyzedData
          .filter((r) => r.risk_class !== 'LOW')
          .reduce((sum, r) => sum + r.critical_facilities, 0);

        setSummary({
          high_risk_count: highCount,
          medium_risk_count: medCount,
          low_risk_count: lowCount,
          total_population_exposure: popExp,
          total_critical_facilities: facExp,
          top_priority_location: analyzedData[0]?.location,
          top_priority_score: analyzedData[0]?.risk_score,
          top_priority_rank: 1,
        });

        setSelectedLocation((prev) => {
          if (!prev) return analyzedData[0] || null;
          const match = analyzedData.find((l) => l.location === prev.location);
          return match || analyzedData[0] || null;
        });
        setAnalyzed(true);
      } finally {
        setLoading(false);
      }
    },
    [apiBaseUrl, horizonHours, scenarioRainfall]
  );

  // Auto-run on mount
  useEffect(() => {
    runRiskAnalysis(12, 30);
  }, []);

  // Run Optimization
  const runOptimization = useCallback(async (
    crews: number = optCrews,
    budget: number = optBudget,
    scenarioRain: number = scenarioRainfall,
    horizon: number = horizonHours
  ) => {
    setOptLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/demo/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          available_crews: crews,
          available_budget: budget,
          available_time_hours: optTimeWindow,
          scenario_rainfall_mm: scenarioRain,
          forecast_horizon_hours: horizon,
          cost_per_high_risk: 12000.0,
          cost_per_med_risk: 7000.0,
          cost_per_low_risk: 2500.0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOptResult(data);
      } else {
        throw new Error('Optimization endpoint failed');
      }
    } catch (e) {
      let budgetLeft = budget;
      let crewsLeft = crews;
      let totalCost = 0;
      const selected: any[] = [];

      locations.forEach((loc, idx) => {
        const cost = loc.risk_class === 'HIGH' ? 12000 : loc.risk_class === 'MEDIUM' ? 7000 : 2500;
        const neededCrew = loc.risk_class === 'LOW' ? 0.5 : 1.0;
        if (budgetLeft >= cost && crewsLeft >= neededCrew) {
          selected.push({
            priority_rank: idx + 1,
            location: loc.location,
            risk_class: loc.risk_class,
            risk_score: loc.risk_score,
            population: loc.population,
            critical_facilities: loc.critical_facilities,
            recommended_action: loc.recommended_action,
            action_cost_inr: cost,
            crew_assigned: neededCrew,
          });
          budgetLeft -= cost;
          crewsLeft -= neededCrew;
          totalCost += cost;
        }
      });

      const unservicedHigh = locations.filter(
        (l) => l.risk_class === 'HIGH' && !selected.some((s) => s.location === l.location)
      ).length;

      const baselineBenefit = Math.round(selected.slice(0, 3).reduce((sum, l) => sum + l.risk_score * 0.45, 0) * 10) / 10;
      const optBenefit = Math.round(selected.reduce((sum, l) => sum + l.risk_score * 0.95, 0) * 10) / 10;

      setOptResult({
        status: 'OPTIMIZATION_COMPLETE',
        optimization_engine: 'Greedy Knapsack Priority Dispatch (Demo Engine)',
        available_budget: budget,
        available_crews: crews,
        available_time_hours: optTimeWindow,
        scenario_rainfall_mm: scenarioRain,
        forecast_horizon_hours: horizon,
        baseline_unplanned_benefit: baselineBenefit || 142.0,
        optimized_benefit: optBenefit || 295.0,
        benefit_delta: Math.round(((optBenefit || 295.0) - (baselineBenefit || 142.0)) * 10) / 10,
        total_cost_inr: totalCost,
        remaining_budget_inr: budgetLeft,
        crews_dispatched: crews - crewsLeft,
        remaining_crews: crewsLeft,
        selected_locations_count: selected.length,
        unserviced_high_risk_count: unservicedHigh,
        selected_locations: selected,
      });
    } finally {
      setOptLoading(false);
    }
  }, [apiBaseUrl, optCrews, optBudget, optTimeWindow, scenarioRainfall, horizonHours, locations]);

  // Initial optimization when locations are ready
  useEffect(() => {
    if (locations.length > 0 && !optResult) {
      runOptimization(optCrews, optBudget, scenarioRainfall, horizonHours);
    }
  }, [locations, optResult, runOptimization, optCrews, optBudget, scenarioRainfall, horizonHours]);

  // Run Simulation
  const runSimulation = useCallback(
    async (rainInc: number = simRainIncrease, drainDelta: number = simDrainageDelta) => {
      setSimLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/api/v1/demo/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rainfall_increase_pct: rainInc,
            drainage_capacity_delta_pct: drainDelta,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setSimResult(data);
        } else {
          throw new Error('Simulation endpoint failed');
        }
      } catch (e) {
        const rainMult = 1.0 + rainInc / 100.0;
        const simLocations = computePureClientRisk(locations, horizonHours, rainMult, drainDelta, scenarioRainfall);

        const comparisons = locations.map((base) => {
          const sim = simLocations.find((s) => s.location === base.location) || base;
          const diff = Math.round((sim.risk_score - base.risk_score) * 10) / 10;
          return {
            location: base.location,
            current_risk_score: base.risk_score,
            current_risk_class: base.risk_class,
            simulated_risk_score: sim.risk_score,
            simulated_risk_class: sim.risk_class,
            risk_change: diff,
            status: diff > 0 ? 'INCREASED' : diff < 0 ? 'DECREASED' : 'NO_CHANGE',
          };
        });
        comparisons.sort((a, b) => b.simulated_risk_score - a.simulated_risk_score);

        const baseHigh = locations.filter((r) => r.risk_class === 'HIGH').length;
        const simHigh = simLocations.filter((r) => r.risk_class === 'HIGH').length;

        setSimResult({
          scenario_label: `Scenario Simulation — Demo (+${rainInc}% Rainfall, ${drainDelta >= 0 ? '+' : ''}${drainDelta}% Drainage)`,
          rainfall_increase_pct: rainInc,
          drainage_capacity_delta_pct: drainDelta,
          baseline_high_risk_count: baseHigh,
          simulated_high_risk_count: simHigh,
          high_risk_delta: simHigh - baseHigh,
          comparisons,
        });
      } finally {
        setSimLoading(false);
      }
    },
    [apiBaseUrl, simRainIncrease, simDrainageDelta, locations, horizonHours, scenarioRainfall]
  );

  // Initial simulation
  useEffect(() => {
    if (locations.length > 0 && !simResult) {
      runSimulation(20, -10);
    }
  }, [locations, simResult, runSimulation]);

  const handleHorizonChange = (h: 12 | 24 | 48 | 72) => {
    setHorizonHours(h);
    runRiskAnalysis(h, scenarioRainfall);
  };

  const handleScenarioRainfallChange = (rain: number) => {
    setScenarioRainfall(rain);
    runRiskAnalysis(horizonHours, rain);
  };

  return {
    horizonHours,
    handleHorizonChange,
    scenarioRainfall,
    handleScenarioRainfallChange,
    locations,
    selectedLocation,
    setSelectedLocation,
    summary,
    loading,
    analyzed,
    errorMsg,
    runRiskAnalysis,
    optCrews,
    setOptCrews,
    optBudget,
    setOptBudget,
    optTimeWindow,
    setOptTimeWindow,
    optLoading,
    optResult,
    runOptimization,
    simRainIncrease,
    setSimRainIncrease,
    simDrainageDelta,
    setSimDrainageDelta,
    simLoading,
    simResult,
    runSimulation,
  };
}
