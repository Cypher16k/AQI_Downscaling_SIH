# Dataset Documentation


# Satellite Data


## Sentinel-5P NO₂

Purpose:

Satellite atmospheric NO₂ observation.


Usage:

Input feature for ML model.


Resolution:

Daily


---

## AOD

Purpose:

Represents atmospheric aerosol loading.

Used to improve NO₂ estimation.


---

## NDVI

Purpose:

Vegetation information.


---

# Meteorological Data

Source:

ERA5


Features:

- Temperature
- Humidity
- Wind speed
- Wind direction
- Rainfall
- Pressure


---

# Static Features


## Terrain

- Elevation


## Urban

- Built-up density
- Population
- Nighttime lights
- Road density
- Distance to roads


---

# Ground Data


Source:

CPCB/TSPCB Hyderabad monitoring stations


Coverage:

14 stations


Period:

January 2025 - August 2025


Processing:

15-minute observations converted to daily averages.


Output:

ground_no2_daily_grid.csv