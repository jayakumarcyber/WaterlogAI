export interface DemoLocation {
  location: string;
  latitude: number;
  longitude: number;
  rainfall_24h_mm: number;
  forecast_rainfall_mm: number;
  historical_incidents_30d: number;
  elevation_m: number;
  slope_percent: number;
  drainage_capacity_percent: number;
  population: number;
  critical_facilities: number;
  risk_score: number;
  risk_class: 'HIGH' | 'MEDIUM' | 'LOW';
  priority_score: number;
  priority_rank?: number;
  recommended_action: string;
  risk_factor_contributions: Array<{
    factor: string;
    contribution_points: number;
    weight_pct: number;
    observed: string;
  }>;
  why_reasons: string[];
  data_status_label: string;
}

export interface OptimizationResult {
  status: string;
  optimization_engine: string;
  available_budget: number;
  available_crews: number;
  total_cost_inr: number;
  remaining_budget_inr: number;
  crews_dispatched: number;
  remaining_crews: number;
  selected_locations_count: number;
  unserviced_high_risk_count: number;
  baseline_unplanned_benefit?: number;
  optimized_benefit?: number;
  benefit_delta?: number;
  available_time_hours?: number;
  scenario_rainfall_mm?: number;
  forecast_horizon_hours?: number;
  selected_locations: Array<{
    priority_rank: number;
    location: string;
    risk_class: string;
    risk_score: number;
    population: number;
    critical_facilities: number;
    recommended_action: string;
    action_cost_inr: number;
    crew_assigned: number;
  }>;
}
