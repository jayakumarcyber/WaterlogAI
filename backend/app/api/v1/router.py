from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    wards,
    incidents,
    rainfall,
    roads,
    drains,
    waterbodies,
    facilities,
    geojson,
    analytics,
    predictions,
    explanations,
    graph,
    impact,
    priority,
    optimization,
    simulation,
    osm_search,
    population,
    complaints,
    demo_risk,
    terrain,
    drainage,
    weather,
    locations,
)

api_router = APIRouter()
api_router.include_router(locations.router, prefix="/locations", tags=["Location Hierarchy & Dynamic Places"])

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(weather.router, prefix="/weather", tags=["Live Chennai Weather"])
api_router.include_router(demo_risk.router, prefix="/demo", tags=["Hackathon Demo Risk Prediction"])
api_router.include_router(osm_search.router, tags=["Geocoding Search"])
api_router.include_router(population.router, prefix="/population", tags=["Census Population Data"])
api_router.include_router(terrain.router, prefix="/terrain", tags=["Terrain & Elevation DEM"])
api_router.include_router(drainage.router, prefix="/drainage", tags=["Stormwater Drainage & Road Network"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["What-If Scenario Simulator"])
api_router.include_router(optimization.router, prefix="/optimization", tags=["Municipal Crew & Budget Optimization"])
api_router.include_router(priority.router, prefix="/priority", tags=["Civic Priority Engine"])
api_router.include_router(impact.router, prefix="/impact", tags=["Impact & Spatial Exposure Estimation"])
api_router.include_router(graph.router, prefix="/graph", tags=["Spatial Drainage Graph & Risk Propagation"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Risk Predictions ML"])
api_router.include_router(explanations.router, prefix="/explanations", tags=["Explainable AI & Evidence"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Patterns"])
api_router.include_router(geojson.router, tags=["GeoJSON Operations"])
api_router.include_router(wards.router, tags=["Wards"])
api_router.include_router(incidents.router, tags=["Civic Incidents"])
api_router.include_router(rainfall.router, tags=["Rainfall Records"])
api_router.include_router(roads.router, tags=["Roads"])
api_router.include_router(drains.router, tags=["Drains"])
api_router.include_router(waterbodies.router, tags=["Waterbodies"])
api_router.include_router(facilities.router, tags=["Critical Facilities"])
api_router.include_router(complaints.router, prefix="/complaints", tags=["Citizen Waterlogging Complaints"])
