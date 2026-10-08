'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta';

export interface Translations {
  // Navigation & Header
  nav_home: string;
  nav_risk_map: string;
  nav_ward_insights: string;
  nav_historical_data: string;
  nav_priority_actions: string;
  nav_simulation: string;
  nav_data_sources: string;
  nav_contact: string;
  portal_subtitle: string;
  govt_portal_badge: string;
  search_placeholder: string;

  // Civic Actions
  civic_actions_label: string;
  btn_report_waterlogging: string;
  btn_track_complaint: string;
  btn_gcc_ops_queue: string;

  // Top Utility Bar
  util_title: string;
  util_help: string;
  util_accessibility: string;
  util_data_sources: string;
  util_system_status: string;
  util_operational: string;

  // Location Selector
  loc_label: string;
  loc_country: string;
  loc_state: string;
  loc_district: string;
  loc_city: string;
  loc_active_ops: string;
  loc_data_unavailable: string;
  loc_switch_to_chennai: string;
  loc_unsupported_title: string;
  loc_unsupported_desc: string;

  // Hero Section
  hero_authority: string;
  hero_title: string;
  hero_subtitle: string;
  hero_btn_open_map: string;
  hero_btn_view_priority: string;

  // Telemetry Strip
  stat_wards_label: string;
  stat_incidents_label: string;
  stat_evidence_wards_label: string;
  stat_horizons_label: string;

  // CivicPulse Services
  services_section_title: string;
  services_section_subtitle: string;
  service_tile_risk_map: string;
  service_tile_risk_desc: string;
  service_tile_ward_insights: string;
  service_tile_ward_desc: string;
  service_tile_historical: string;
  service_tile_historical_desc: string;
  service_tile_priority: string;
  service_tile_priority_desc: string;
  service_tile_simulation: string;
  service_tile_simulation_desc: string;
  service_tile_data_sources: string;
  service_tile_data_desc: string;

  // Risk Map Section
  map_section_title: string;
  map_section_subtitle: string;
  map_tab_ai_engine: string;
  map_tab_gis_layers: string;
  evidence_risk_status: string;
  evidence_forecast_horizon: string;
  evidence_rainfall: string;
  evidence_terrain: string;
  evidence_historical: string;
  evidence_population: string;
  evidence_infrastructure: string;
  evidence_confidence: string;

  // Historical Section
  historical_section_title: string;
  historical_section_subtitle: string;
  historical_badge: string;
  historical_metric_incidents: string;
  historical_metric_wards: string;
  historical_metric_events: string;
  historical_desc: string;

  // Chennai Identity
  identity_title: string;
  identity_subtitle: string;
  identity_desc: string;
  identity_pillar_evidence: string;
  identity_pillar_prioritization: string;
  identity_pillar_transparency: string;

  // Rainfall Warning Section
  rainfall_section_title: string;
  rainfall_section_subtitle: string;
  rainfall_disclaimer: string;

  // Priority Actions
  priority_section_title: string;
  priority_section_subtitle: string;
  col_ward: string;
  col_risk: string;
  col_exposure: string;
  col_historical_evidence: string;
  col_priority: string;
  col_action_status: string;

  // Simulation
  simulation_section_title: string;
  simulation_section_subtitle: string;
  sim_badge: string;
  sim_ctrl_rainfall: string;
  sim_ctrl_drainage: string;
  sim_ctrl_intervention: string;
  sim_result_predicted_risk: string;
  sim_result_residual_risk: string;
  sim_result_priority_change: string;

  // Data Sources & Provenance
  data_sources_title: string;
  data_sources_subtitle: string;
  col_source: string;
  col_year: string;
  col_status: string;
  col_provenance: string;
  status_verified: string;
  status_derived: string;
  status_secondary: string;
  status_unavailable: string;

  // Emergency & Civic Information
  emergency_section_title: string;
  emergency_section_subtitle: string;
  emergency_verified_badge: string;
  emergency_helpline_gcc: string;
  emergency_helpline_state: string;
  emergency_helpline_district: string;
  emergency_flood_control: string;

  // Footer
  footer_about_title: string;
  footer_about_desc: string;
  footer_quick_links: string;
  footer_resources: string;
  footer_system: string;
  footer_disclaimer: string;
  footer_copyright: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation & Header
    nav_home: 'HOME',
    nav_risk_map: 'RISK MAP',
    nav_ward_insights: 'WARD INSIGHTS',
    nav_historical_data: 'HISTORICAL DATA',
    nav_priority_actions: 'PRIORITY ACTIONS',
    nav_simulation: 'SIMULATION',
    nav_data_sources: 'DATA & SOURCES',
    nav_contact: 'CONTACT',
    portal_subtitle: 'Greater Chennai Corporation • Urban Waterlogging Risk Prediction & Preventive Response',
    govt_portal_badge: 'GOVT PORTAL',
    search_placeholder: 'Search ward or landmark in Chennai...',

    // Civic Actions
    civic_actions_label: 'CIVIC SERVICES / QUICK ACTIONS:',
    btn_report_waterlogging: 'Report Waterlogging',
    btn_track_complaint: 'Track Complaint',
    btn_gcc_ops_queue: 'GCC Operations Queue',

    // Top Utility Bar
    util_title: 'CivicPulse Monsoon • Chennai',
    util_help: 'Help',
    util_accessibility: 'Accessibility',
    util_data_sources: 'Data Sources',
    util_system_status: 'System Status',
    util_operational: 'Operational',

    // Location Selector
    loc_label: 'LOCATION',
    loc_country: 'Country',
    loc_state: 'State / UT',
    loc_district: 'District',
    loc_city: 'City / Town',
    loc_active_ops: '● Active Operations: Chennai (GCC 200 Wards)',
    loc_data_unavailable: '● Data Unavailable for this location',
    loc_switch_to_chennai: 'Switch to Chennai',
    loc_unsupported_title: 'Data Unavailable for this location',
    loc_unsupported_desc: 'Operational coverage is presently active for Greater Chennai Corporation (200 Wards). High-resolution Cop-30 DEM elevation grids, IMD sensor streams, and historical flood databases have not been ingested for this region.',

    // Hero Section
    hero_authority: 'GREATER CHENNAI CORPORATION • MONSOON DECISION SUPPORT',
    hero_title: 'Predict Waterlogging Before It Disrupts Chennai',
    hero_subtitle: 'AI-powered urban waterlogging risk prediction and preventive municipal response.',
    hero_btn_open_map: 'OPEN RISK MAP',
    hero_btn_view_priority: 'VIEW PRIORITY AREAS',

    // Telemetry Strip
    stat_wards_label: 'GCC Wards',
    stat_incidents_label: 'Verified Historical Incidents',
    stat_evidence_wards_label: 'Wards with Historical Evidence',
    stat_horizons_label: 'Risk Horizons',

    // CivicPulse Services
    services_section_title: 'CivicPulse Services & Information',
    services_section_subtitle: 'Municipal decision-support modules and public transparency information desks',
    service_tile_risk_map: 'Risk Map',
    service_tile_risk_desc: 'Interactive 200-ward spatial risk prediction and GIS layers',
    service_tile_ward_insights: 'Ward Insights',
    service_tile_ward_desc: 'Granular terrain elevation, slope, and drainage telemetry',
    service_tile_historical: 'Historical Waterlogging',
    service_tile_historical_desc: '1,325 verified flood incidents from 2015 & 2020 monsoons',
    service_tile_priority: 'Priority Actions',
    service_tile_priority_desc: 'Ranked ward queues for preventive crew prepositioning',
    service_tile_simulation: 'Simulation',
    service_tile_simulation_desc: 'What-if rainfall scenarios and knapsack resource solver',
    service_tile_data_sources: 'Data & Sources',
    service_tile_data_desc: 'Official data provenance, methodology, and limitations',

    // Risk Map Section
    map_section_title: 'Chennai Waterlogging Risk Intelligence',
    map_section_subtitle: 'Real-time spatial risk prediction, GCC ward telemetry, and municipal operations',
    map_tab_ai_engine: 'AI Risk Prediction Engine',
    map_tab_gis_layers: 'Municipal GIS (10 Layers)',
    evidence_risk_status: 'Risk Status',
    evidence_forecast_horizon: 'Forecast Horizon',
    evidence_rainfall: 'Rainfall Evidence',
    evidence_terrain: 'Terrain Evidence',
    evidence_historical: 'Historical Incidents',
    evidence_population: 'Population Exposure',
    evidence_infrastructure: 'Infrastructure Evidence',
    evidence_confidence: 'Confidence / Data Status',

    // Historical Section
    historical_section_title: 'Historical Waterlogging & Community Impact',
    historical_section_subtitle: 'Calibrated against verified municipal disaster logs and citizen inundation records across historic Chennai monsoon events.',
    historical_badge: 'GROUND-TRUTH SPATIAL CALIBRATION • GREATER CHENNAI',
    historical_metric_incidents: 'Verified Incidents',
    historical_metric_wards: 'Wards with Evidence',
    historical_metric_events: 'Verified Event Records',
    historical_desc: 'During the catastrophic 2015 South India floods and Cyclone Nivar in 2020, key arterial corridors suffered extreme inundation. CivicPulse ingests 1,325 geo-located verified inundation logs to calibrate predictive vulnerability curves for every ward.',

    // Chennai Identity
    identity_title: 'Built for Chennai. Designed for Preventive Action.',
    identity_subtitle: 'A dedicated civic intelligence framework developed for the Greater Chennai Corporation monsoon operations.',
    identity_desc: 'CivicPulse combines rainfall, terrain, historical incidents, population and infrastructure evidence to support preventive municipal decision-making before waterlogging disrupts public transit and citizen safety.',
    identity_pillar_evidence: 'Multi-Modal Evidence Integration',
    identity_pillar_prioritization: 'Transparent Decision Prioritization',
    identity_pillar_transparency: 'Democratized Civic Transparency',

    // Rainfall Warning Section
    rainfall_section_title: 'Rainfall & Warning Context',
    rainfall_section_subtitle: 'IMD regional meteorological forecasts and active weather advisory context',
    rainfall_disclaimer: 'Notice: Contextual imagery is illustrative of historic monsoon alerts and is not treated as live sensor inputs.',

    // Priority Actions
    priority_section_title: 'Priority Areas for Preventive Action',
    priority_section_subtitle: 'Administrative ranked monitoring queue for municipal desilting, pumps, and field team deployment.',
    col_ward: 'Ward',
    col_risk: 'Risk',
    col_exposure: 'Exposure',
    col_historical_evidence: 'Historical Evidence',
    col_priority: 'Priority',
    col_action_status: 'Action Status',

    // Simulation
    simulation_section_title: 'Scenario Planning & Simulation',
    simulation_section_subtitle: 'Test rainfall and intervention scenarios before action.',
    sim_badge: 'SIMULATION / DECISION SUPPORT',
    sim_ctrl_rainfall: 'Rainfall Scenario',
    sim_ctrl_drainage: 'Drainage Scenario',
    sim_ctrl_intervention: 'Intervention',
    sim_result_predicted_risk: 'Predicted Risk',
    sim_result_residual_risk: 'Residual Risk',
    sim_result_priority_change: 'Priority Change',

    // Data Sources & Provenance
    data_sources_title: 'Data Sources & Methodology',
    data_sources_subtitle: 'Official audit-ready provenance matrix and multi-source data ingestion integrity.',
    col_source: 'SOURCE',
    col_year: 'YEAR',
    col_status: 'STATUS',
    col_provenance: 'PROVENANCE',
    status_verified: 'Verified',
    status_derived: 'Derived',
    status_secondary: 'Secondary',
    status_unavailable: 'Data Unavailable',

    // Emergency & Civic Information
    emergency_section_title: 'Civic Response & Emergency Information',
    emergency_section_subtitle: 'Direct municipal disaster response helplines and verified Greater Chennai Corporation grievance lines.',
    emergency_verified_badge: 'OFFICIAL MUNICIPAL EMERGENCY DIRECTORY',
    emergency_helpline_gcc: 'GCC 24x7 Flood Helpline',
    emergency_helpline_state: 'TNSDMA State Emergency',
    emergency_helpline_district: 'DDMA District Emergency',
    emergency_flood_control: 'Ripon Building Control Room',

    // Footer
    footer_about_title: 'CIVICPULSE MONSOON',
    footer_about_desc: 'AI-powered urban waterlogging prediction and preventive municipal response platform, calibrated for Greater Chennai Corporation (GCC 200 Wards).',
    footer_quick_links: 'Quick Links',
    footer_resources: 'Resources & Governance',
    footer_system: 'System & Administration',
    footer_disclaimer: 'Predictions are decision-support estimates calibrated for Greater Chennai Corporation.',
    footer_copyright: '© 2026 CivicPulse Monsoon Decision Support System • Greater Chennai Corporation • All Rights Reserved.',
  },
  ta: {
    // Navigation & Header
    nav_home: 'முகப்பு',
    nav_risk_map: 'இடர் வரைபடம்',
    nav_ward_insights: 'வார்டு தகவல்கள்',
    nav_historical_data: 'வரலாற்றுத் தரவுகள்',
    nav_priority_actions: 'முன்னுரிமை நடவடிக்கைகள்',
    nav_simulation: 'சூழ்நிலை உருவகப்படுத்தல்',
    nav_data_sources: 'தரவு மற்றும் ஆதாரங்கள்',
    nav_contact: 'தொடர்பு',
    portal_subtitle: 'பெருநகர சென்னை மாநகராட்சி • நகர்ப்புற நீர்தேக்க இடர் கணிப்பு மற்றும் தடுப்பு நடவடிக்கை',
    govt_portal_badge: 'அரசு தளம்',
    search_placeholder: 'சென்னையில் உள்ள வார்டு அல்லது இடத்தை தேடவும்...',

    // Civic Actions
    civic_actions_label: 'குடிமக்கள் சேவைகள் / உடனடி நடவடிக்கைகள்:',
    btn_report_waterlogging: 'நீர்தேக்கம் குறித்து தெரிவிக்கவும்',
    btn_track_complaint: 'புகாரின் நிலையைப் பார்க்கவும்',
    btn_gcc_ops_queue: 'GCC கள செயல்பாடுகள் வரிசை',

    // Top Utility Bar
    util_title: 'CivicPulse Monsoon • சென்னை',
    util_help: 'உதவி',
    util_accessibility: 'அணுகல்தன்மை',
    util_data_sources: 'தரவு ஆதாரங்கள்',
    util_system_status: 'அமைப்பு நிலை',
    util_operational: 'செயலில் உள்ளது',

    // Location Selector
    loc_label: 'இடம்',
    loc_country: 'நாடு',
    loc_state: 'மாநிலம் / ஒன்றியப் பிரதேசம்',
    loc_district: 'மாவட்டம்',
    loc_city: 'நகரம் / பேரூராட்சி',
    loc_active_ops: '● செயலில் உள்ள செயல்பாடுகள்: சென்னை (GCC 200 வார்டுகள்)',
    loc_data_unavailable: '● தரவு இல்லை (இந்த இடத்திற்கு தரவு கிடைக்கவில்லை)',
    loc_switch_to_chennai: 'சென்னைக்கு மாறவும்',
    loc_unsupported_title: 'இந்த இடத்திற்கான தரவு தற்போது கிடைக்கவில்லை',
    loc_unsupported_desc: 'தற்போது செயல்பாட்டு எல்லை பெருநகர சென்னை மாநகராட்சிக்கு (200 வார்டுகள்) மட்டுமே செயலில் உள்ளது. உயர் தெளிவுத்திறன் Cop-30 DEM உயரக் கட்டமைப்பு, IMD சென்சார் தரவுகள் மற்றும் வரலாற்று வெள்ளப் பதிவுகள் இந்த பகுதிக்கு இன்னும் சேர்க்கப்படவில்லை.',

    // Hero Section
    hero_authority: 'பெருநகர சென்னை மாநகராட்சி • பருவமழை முடிவு ஆதரவு அமைப்பு',
    hero_title: 'சென்னையை பாதிக்கும் முன் நீர்தேக்கத்தை முன்கூட்டியே கணிக்கவும்',
    hero_subtitle: 'செயற்கை நுண்ணறிவு அடிப்படையிலான நகர்ப்புற நீர்தேக்க இடர் கணிப்பு மற்றும் தடுப்பு நகராட்சி பதில் நடவடிக்கை.',
    hero_btn_open_map: 'இடர் வரைபடத்தைத் திறக்கவும்',
    hero_btn_view_priority: 'முன்னுரிமைப் பகுதிகளைப் பார்க்கவும்',

    // Telemetry Strip
    stat_wards_label: 'GCC வார்டுகள்',
    stat_incidents_label: 'சரிபார்க்கப்பட்ட வரலாற்று நிகழ்வுகள்',
    stat_evidence_wards_label: 'வரலாற்று சான்றுகள் உள்ள வார்டுகள்',
    stat_horizons_label: 'இடர் கணிப்பு காலவரம்புகள்',

    // CivicPulse Services
    services_section_title: 'CivicPulse சேவைகள் மற்றும் தகவல்கள்',
    services_section_subtitle: 'நகராட்சி முடிவு ஆதரவு பிரிவுகள் மற்றும் பொது வெளிப்படைத்தன்மை தகவல் மையங்கள்',
    service_tile_risk_map: 'இடர் வரைபடம்',
    service_tile_risk_desc: '200 வார்டுகளுக்கான ஊடாடும் இடஞ்சார்ந்த இடர் கணிப்பு மற்றும் GIS அடுக்குகள்',
    service_tile_ward_insights: 'வார்டு தகவல்கள்',
    service_tile_ward_desc: 'துல்லியமான நிலப்பரப்பு உயரம், சாய்வு மற்றும் வடிகால் தொலைநிலைத் தகவல்கள்',
    service_tile_historical: 'வரலாற்று நீர்தேக்கம்',
    service_tile_historical_desc: '2015 மற்றும் 2020 பருவமழைகளில் பதிவான 1,325 சரிபார்க்கப்பட்ட வெள்ள நிகழ்வுகள்',
    service_tile_priority: 'முன்னுரிமை நடவடிக்கைகள்',
    service_tile_priority_desc: 'தடுப்பு நடவடிக்கைகளுக்கான முன்னுரிமை வார்டு வரிசைப்படுத்தல்',
    service_tile_simulation: 'சூழ்நிலை உருவகப்படுத்தல்',
    service_tile_simulation_desc: 'மழைப்பொழிவு சூழல் உருவகப்படுத்தல் மற்றும் உகந்த வள ஒதுக்கீடு',
    service_tile_data_sources: 'தரவு மற்றும் ஆதாரங்கள்',
    service_tile_data_desc: 'அதிகாரப்பூர்வ தரவு தோற்றம், வழிமுறை மற்றும் வரம்புகள்',

    // Risk Map Section
    map_section_title: 'சென்னை நீர்தேக்க இடர் நுண்ணறிவு',
    map_section_subtitle: 'நிகழ்நேர இடஞ்சார்ந்த இடர் கணிப்பு, GCC வார்டு களத் தகவல்கள் மற்றும் நகராட்சி செயல்பாடுகள்',
    map_tab_ai_engine: 'AI இடர் கணிப்பு இயந்திரம்',
    map_tab_gis_layers: 'நகராட்சி GIS (10 அடுக்குகள்)',
    evidence_risk_status: 'இடர் நிலை',
    evidence_forecast_horizon: 'முன்னறிவிப்பு காலவரம்பு',
    evidence_rainfall: 'மழைப்பொழிவு சான்றுகள்',
    evidence_terrain: 'நிலப்பரப்பு சான்றுகள்',
    evidence_historical: 'வரலாற்று நிகழ்வுகள்',
    evidence_population: 'மக்கள் தொகை பாதிப்பு',
    evidence_infrastructure: 'உள்கட்டமைப்பு சான்றுகள்',
    evidence_confidence: 'நம்பகத்தன்மை / தரவு நிலை',

    // Historical Section
    historical_section_title: 'வரலாற்று நீர்தேக்கம் மற்றும் சமூக பாதிப்பு',
    historical_section_subtitle: 'வரலாற்று சென்னை பருவமழை நிகழ்வுகளில் சரிபார்க்கப்பட்ட பேரிடர் பதிவுகள் மற்றும் குடிமக்கள் வெள்ளத் தரவுகளுடன் அளவீடு செய்யப்பட்டது.',
    historical_badge: 'உண்மை நிலப்பரப்பு அளவீடு • பெருநகர சென்னை',
    historical_metric_incidents: 'சரிபார்க்கப்பட்ட நிகழ்வுகள்',
    historical_metric_wards: 'சான்றுகள் உள்ள வார்டுகள்',
    historical_metric_events: 'சரிபார்க்கப்பட்ட வரலாற்று பதிவுகள்',
    historical_desc: '2015 பெருவெள்ளம் மற்றும் 2020 நிவர் புயலின் போது, நகரின் முக்கிய பகுதிகள் தீவிர வெள்ளப் பாதிப்பை சந்தித்தன. CivicPulse ஒவ்வொரு வார்டின் பாதிப்பு வளைவுகளையும் துல்லியமாக அளவீடு செய்ய 1,325 சரிபார்க்கப்பட்ட வெள்ளத் தரவுகளைப் பயன்படுத்துகிறது.',

    // Chennai Identity
    identity_title: 'சென்னைக்காக உருவாக்கப்பட்டது. முன்னெச்சரிக்கை நடவடிக்கைக்காக வடிவமைக்கப்பட்டது.',
    identity_subtitle: 'பெருநகர சென்னை மாநகராட்சியின் பருவமழை செயல்பாடுகளுக்காக உருவாக்கப்பட்ட பிரத்யேக நகராட்சி நுண்ணறிவு தளம்.',
    identity_desc: 'CivicPulse மழைப்பொழிவு, நிலப்பரப்பு, வரலாற்று நிகழ்வுகள், மக்கள் தொகை மற்றும் உள்கட்டமைப்பு சான்றுகளை இணைத்து, பொதுப் போக்குவரத்து மற்றும் பொதுமக்கள் பாதுகாப்பை உறுதிசெய்ய முன்னெச்சரிக்கை நகராட்சி முடிவெடுப்பதை ஆதரிக்கிறது.',
    identity_pillar_evidence: 'பல்வகை சான்றுகள் ஒருங்கிணைப்பு',
    identity_pillar_prioritization: 'வெளிப்படையான முடிவெடுக்கும் முன்னுரிமை',
    identity_pillar_transparency: 'அனைவருக்கும் வெளிப்படையான தகவல்கள்',

    // Rainfall Warning Section
    rainfall_section_title: 'மழைப்பொழிவு மற்றும் எச்சரிக்கை சூழல்',
    rainfall_section_subtitle: 'IMD வானிலை முன்னறிவிப்புகள் மற்றும் தீவிர வானிலை எச்சரிக்கை சூழல்',
    rainfall_disclaimer: 'குறிப்பு: இங்கே காட்டப்பட்டுள்ள படங்கள் வரலாற்றுப் பருவமழை எச்சரிக்கைகளின் சூழலுக்காக மட்டுமே; அவை நேரடி சென்சார் தரவுகளாக கருதப்படாது.',

    // Priority Actions
    priority_section_title: 'முன்னெச்சரிக்கை நடவடிக்கைக்கான முன்னுரிமைப் பகுதிகள்',
    priority_section_subtitle: 'நகராட்சி தூர்வாருதல், பம்புகள் மற்றும் களப்பணியாளர்கள் பணிக்கான நிர்வாக முன்னுரிமை வரிசை.',
    col_ward: 'வார்டு',
    col_risk: 'இடர் அளவு',
    col_exposure: 'மக்கள் தொகை பாதிப்பு',
    col_historical_evidence: 'வரலாற்று சான்றுகள்',
    col_priority: 'முன்னுரிமை',
    col_action_status: 'நடவடிக்கை நிலை',

    // Simulation
    simulation_section_title: 'சூழ்நிலை திட்டமிடல் மற்றும் உருவகப்படுத்தல்',
    simulation_section_subtitle: 'நடவடிக்கைக்கு முன் மழைப்பொழிவு மற்றும் வடிகால் சூழ்நிலைகளை சோதிக்கவும்.',
    sim_badge: 'சூழ்நிலை உருவகப்படுத்தல் / முடிவு ஆதரவு',
    sim_ctrl_rainfall: 'மழைப்பொழிவு சூழ்நிலை',
    sim_ctrl_drainage: 'வடிகால் சூழ்நிலை',
    sim_ctrl_intervention: 'தடுப்பு நடவடிக்கை',
    sim_result_predicted_risk: 'கணிக்கப்பட்ட இடர்',
    sim_result_residual_risk: 'எஞ்சிய இடர்',
    sim_result_priority_change: 'முன்னுரிமை மாற்றம்',

    // Data Sources & Provenance
    data_sources_title: 'தரவு ஆதாரங்கள் மற்றும் முறைமை',
    data_sources_subtitle: 'அதிகாரப்பூர்வ தணிக்கை-தயாரான தரவு தோற்றம் மற்றும் பல-மூல தரவு ஒருமைப்பாடு.',
    col_source: 'மூலம் (SOURCE)',
    col_year: 'ஆண்டு (YEAR)',
    col_status: 'நிலை (STATUS)',
    col_provenance: 'தரவு விவரம் (PROVENANCE)',
    status_verified: 'சரிபார்க்கப்பட்டது',
    status_derived: 'கணிக்கப்பட்டது',
    status_secondary: 'இரண்டாம் நிலை',
    status_unavailable: 'தரவு இல்லை',

    // Emergency & Civic Information
    emergency_section_title: 'குடிமக்கள் உதவி மற்றும் அவசர கால தகவல்கள்',
    emergency_section_subtitle: 'நேரடி நகராட்சி பேரிடர் உதவி எண்கள் மற்றும் பெருநகர சென்னை மாநகராட்சியின் சரிபார்க்கப்பட்ட அவசர தொடர்புகள்.',
    emergency_verified_badge: 'அதிகாரப்பூர்வ நகராட்சி அவசர தொடர்பு பட்டியல்',
    emergency_helpline_gcc: 'GCC 24x7 வெள்ள அவசர உதவி எண்',
    emergency_helpline_state: 'TNSDMA மாநில பேரிடர் மேலாண்மை',
    emergency_helpline_district: 'DDMA மாவட்ட பேரிடர் உதவி',
    emergency_flood_control: 'ரிப்பன் மாளிகை வெள்ள கட்டுப்பாட்டு அறை',

    // Footer
    footer_about_title: 'CIVICPULSE MONSOON',
    footer_about_desc: 'பெருநகர சென்னை மாநகராட்சிக்காக (200 வார்டுகள்) அளவீடு செய்யப்பட்ட AI அடிப்படையிலான நகர்ப்புற நீர்தேக்க கணிப்பு மற்றும் தடுப்பு முடிவு ஆதரவு தளம்.',
    footer_quick_links: 'விரைவு இணைப்புகள்',
    footer_resources: 'வளங்கள் மற்றும் வழிகாட்டுதல்கள்',
    footer_system: 'கணினி நிர்வாகம்',
    footer_disclaimer: 'கணிப்புகள் பெருநகர சென்னை மாநகராட்சிக்காக வடிவமைக்கப்பட்ட முடிவு ஆதரவு மதிப்பீடுகள் ஆகும்.',
    footer_copyright: '© 2026 CivicPulse Monsoon Decision Support System • பெருநகர சென்னை மாநகராட்சி • அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations.en[key] || '',
});

const STORAGE_KEY = 'civicpulse_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load persisted language from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'ta') {
        setLanguageState(stored);
      }
    } catch {
      // localStorage unavailable or restricted
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const t = (key: keyof Translations): string => {
    return translations[language][key] || translations.en[key] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
