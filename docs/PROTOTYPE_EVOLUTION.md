# Prototype Evolution


# Prototype 1

## Objective

Build the data pipeline.


## Completed

- Hyderabad grid creation
- Satellite data extraction
- Meteorological extraction
- Environmental feature extraction


---

# Prototype 2

## Objective

Predict high-resolution NO₂ using satellite and environmental features.


## Features

### Satellite

- Sentinel-5P NO₂
- AOD
- NDVI


### Meteorology

- Temperature
- Humidity
- Wind
- Rainfall
- Pressure


### Urban/Terrain

- Elevation
- Land cover
- Built-up density
- Population
- Roads


## Model

Models evaluated:

- Random Forest
- Extra Trees
- XGBoost


## Validation

Four-way spatial validation

Result:

Mean R² ≈ 0.67


---

# Prototype 3

## Objective

Calibrate satellite predictions using ground observations.


Added:

- CPCB/TSPCB NO₂ measurements
- Station-grid mapping
- Ground truth dataset

