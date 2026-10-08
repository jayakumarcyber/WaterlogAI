from typing import Dict, List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.services.population_service import PopulationService

router = APIRouter()

@router.get(
    "/nilgiris/hierarchy",
    response_model=Dict[str, List[Dict[str, Any]]],
    summary="Get The Nilgiris CD Block & Village Population Hierarchy",
    description="Returns list of CD Blocks mapping to their constituent villages and towns with Census 2011 population."
)
def get_nilgiris_population_hierarchy():
    try:
        return PopulationService.get_nilgiris_hierarchy()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not load Census population dataset: {str(e)}"
        )

@router.get(
    "/theni/hierarchy",
    response_model=Dict[str, List[Dict[str, Any]]],
    summary="Get Theni CD Block & Village Population Hierarchy",
    description="Returns list of CD Blocks mapping to their constituent villages with Census 2011 population from data1."
)
def get_theni_population_hierarchy():
    try:
        return PopulationService.get_theni_hierarchy()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not load Theni Census population dataset: {str(e)}"
        )

@router.get(
    "/chennai/summary",
    response_model=Dict[str, Any],
    summary="Get Chennai Ward Population Summary",
    description="Returns census summary metrics for Greater Chennai Corporation wards."
)
def get_chennai_population_summary():
    return PopulationService.get_chennai_population_summary()

@router.get(
    "/chennai/wards",
    response_model=Dict[str, Any],
    summary="Get All Chennai Wards Population Mapping",
    description="Returns verified Census 2011 population for all 200 GCC wards."
)
def get_chennai_all_wards_population():
    return PopulationService.get_chennai_all_wards_population()

@router.get(
    "/chennai/wards/{ward_id}",
    response_model=Dict[str, Any],
    summary="Get Specific Chennai Ward Population",
    description="Returns verified Census 2011 population data for a specific GCC ward ID (1–200)."
)
def get_chennai_ward_population(ward_id: int):
    res = PopulationService.get_chennai_ward_population(ward_id)
    return res
