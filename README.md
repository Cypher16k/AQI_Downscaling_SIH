# AQI Downscaling using AI/ML

## Project Overview

This project focuses on developing a machine learning-based NO₂ downscaling system for Hyderabad.

The objective is to generate high-resolution NO₂ estimates by combining satellite observations with meteorological, urban, and land-surface information.

The project uses a Hyderabad ORR 1 km × 1 km master grid containing 1543 spatial cells. All datasets are aligned using the unique `grid_id` assigned to each cell.

---

# Prototype Progress

## Prototype 1 - Baseline Model

Prototype 1 established the initial machine learning pipeline.

### Features Used

- Temperature
- Wind speed
- Population density
- Road density

### Models Tested

- Random Forest
- Extra Trees
- XGBoost

### Evaluation Metrics

- MAE
- RMSE
- R²
- MAPE

Prototype 1 validated the feasibility of using machine learning for NO₂ estimation.

---

# Prototype 2 - Multi-source Feature Integration

Prototype 2 expands the dataset by integrating satellite, meteorological, urban, and land-surface features.

The model uses a 1 km × 1 km Hyderabad grid:

- Spatial resolution: 1 km × 1 km
- Number of cells: 1543
- CRS: EPSG:32644

---

# Features

## Satellite / Atmospheric Features

- Satellite NO₂
- Aerosol Optical Depth (AOD)
- Cloud fraction

## Meteorological Features

- Temperature
- Wind speed
- Wind direction
- Relative humidity
- Surface pressure
- Precipitation
- Dew point
- Solar radiation
- Boundary layer height

## Urban / Emission Proxy Features

- Population density
- Road density
- Distance to road
- Nighttime lights
- Built-up density

## Land / Terrain Features

- Elevation
- NDVI
- Vegetation fraction
- Built-up fraction
- Water fraction
- Cropland fraction
- Bare land fraction
- Distance to water

---

# Data Pipeline

```
Raw Data
    |
    ↓
Data Validation
    |
    ↓
Preprocessing
    |
    ↓
Feature Engineering
    |
    ↓
ML Training
    |
    ↓
Evaluation
    |
    ↓
NO₂ Prediction Maps
```

---

# Repository Structure

```
AQI_DOWNSCALING_SIH

├── data
│   ├── raw
│   ├── processed
│   └── sample
│
├── docs
│
├── gee
│   ├── satellite
│   ├── meteorology
│   ├── urban
│   └── land
│
├── metadata
│   └── GRID_METADATA.md
│
├── outputs
│
├── src
│   ├── data
│   ├── features
│   ├── preprocessing
│   ├── models
│   └── visualization
│
├── requirements.txt
│
└── README.md
```

---

# Grid Information

## Study Area

Hyderabad ORR enclosed study region, Telangana, India.

## Grid Details

- Resolution: 1 km × 1 km
- Number of grid cells: 1543
- Coordinate Reference System: EPSG:32644

Each cell has a unique identifier:

```
HYD_0001
HYD_0002
...
HYD_1543
```

All datasets are joined using:

```
grid_id
```

---

# Data Sources

## Satellite

- Sentinel-5P/TROPOMI NO₂
- Satellite atmospheric products

## Meteorology

- Weather and atmospheric variables

## Urban

- Population density
- Road networks
- Nighttime lights
- Built-up information

## Land

- Elevation
- Vegetation indices
- Land cover
- Water bodies

---

# Installation

Clone the repository:

```bash
git clone <repository-url>
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# Running the Model

Run the main ML pipeline:

```bash
python src/main.py
```

---

# Source Code Structure

The `src` directory contains modular components:

## data/

Handles:

- Dataset loading
- Data validation
- Dataset merging

## preprocessing/

Handles:

- Cleaning
- Missing value processing
- Data preparation

## features/

Handles:

- Feature selection
- Feature engineering

## models/

Contains:

- Random Forest
- Extra Trees
- XGBoost
- Model training
- Evaluation

## visualization/

Contains:

- Prediction plots
- Model performance visualization
- Spatial maps

---

# Current Data Status

| Dataset | Status |
|---|---|
| Satellite NO₂ | Completed |
| Meteorology | Completed |
| Population density | Completed |
| Road density | Completed |
| Nighttime lights | Completed |
| Built-up density | Completed |
| Distance to road | Completed |
| Elevation | Completed |
| NDVI | Completed |
| Land cover fractions | Completed |
| Distance to water | Completed |
| AOD | Under validation |

---

# Future Improvements - Prototype 3

Planned improvements:

## Ground NO₂ Calibration

Integrate ground monitoring station observations to calibrate satellite-derived estimates.

## Temporal Modelling

Add:

- Previous NO₂ values
- Seasonal information
- Time-series features

Possible models:

- LSTM
- Temporal models

## Spatial Validation

Improve evaluation using spatial train-test splitting.

## Explainability

Add:

- SHAP feature importance
- Feature contribution analysis

## Uncertainty Estimation

Generate prediction uncertainty ranges along with NO₂ estimates.

---

# Project Goal

Develop a high-resolution machine learning pipeline capable of estimating NO₂ distribution by combining:

- Satellite observations
- Atmospheric conditions
- Weather patterns
- Urban emission proxies
- Land surface characteristics

