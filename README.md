# AI-Based High Resolution NO₂ Downscaling for Hyderabad

## Overview
This project develops an AI-based air quality downscaling system to generate high-resolution (1 km × 1 km) NO₂ concentration maps for Hyderabad.

The approach combines:
- Satellite observations
- Meteorological data
- Land surface characteristics
- Urban features
- Ground monitoring observations

to estimate spatial NO₂ distribution.

---

# Prototype Evolution

## Prototype 1 — Data Pipeline Development

Objective:
- Build automated pipelines for collecting and processing environmental datasets.

Datasets:
- Sentinel-5P NO₂
- AOD
- ERA5 meteorology
- NDVI
- Terrain features
- Urban features

Achievements:
- Hyderabad 1 km grid generation
- Automated feature extraction pipeline

---

# Prototype 2 — Satellite-Based NO₂ Downscaling

Objective:
Predict high-resolution NO₂ using satellite and environmental features.

Features:
- Sentinel-5P NO₂
- AOD
- NDVI
- Temperature
- Humidity
- Wind speed
- Wind direction
- Rainfall
- Pressure
- Elevation
- Land cover
- Built-up density
- Population
- Nighttime lights
- Road features

Spatial setup:
- Hyderabad region
- 1543 grid cells
- 1 km × 1 km resolution

Validation:
- 4-way spatial validation
- Mean R² ≈ 0.67

---

# Prototype 3 — Ground-Calibrated NO₂ Downscaling

Objective:
Improve satellite-based predictions using real ground monitoring observations.

## Ground NO₂ Processing Pipeline

CPCB 15-minute observations  
↓  
Daily NO₂ aggregation  
↓  
Station metadata generation  
↓  
Station to grid mapping  
↓  
Ground NO₂ target dataset

Dataset:
- 14 monitoring stations
- January 2025 to August 2025
- Daily resolution
- Hyderabad 1 km grid mapping

Output:
`ground_no2_daily_grid.csv`

Contains:
- Date
- Station ID
- Station name
- Grid ID
- Latitude
- Longitude
- Ground NO₂ concentration
- Coverage information

---

# Ground Data Limitation

The ground monitoring network is sparse:

- Total grid cells: 1543
- Ground monitoring locations: 14

Therefore, ground NO₂ values are available only at monitoring locations. Remaining cells are prediction locations.

---

# Prototype 3 Modelling Strategy

Satellite + Environmental Features

↓

Prototype 2 Spatial Model

↓

City-wide NO₂ estimation

+

Ground station calibration

↓

Ground-calibrated NO₂ map

---

# Validation Strategy

Because monitoring stations are limited, random train-test splitting should be avoided.

Recommended:

## Leave-One-Station-Out Validation

Example:

Training:
13 stations

Testing:
1 unseen station

This evaluates spatial generalization.

---

# Project Structure

```
AQI_Downscaling_SIH/

├── data/
│   ├── raw/
│   └── processed/
│
├── src/
│   ├── data/
│   ├── models/
│   └── visualization/
│
├── notebooks/
├── requirements.txt
└── README.md
```

---

# Completed Work

✅ Hyderabad 1 km grid generation  
✅ Satellite NO₂ extraction  
✅ AOD extraction  
✅ Meteorological extraction  
✅ NDVI extraction  
✅ Urban and terrain feature extraction  
✅ Prototype 2 ML dataset  
✅ Prototype 2 spatial validation  
✅ Ground NO₂ collection  
✅ Daily ground NO₂ processing  
✅ Station metadata generation  
✅ Station-grid mapping  
✅ Prototype 3 ground target dataset  

---

# Future Improvements

- Increase ground monitoring coverage
- Improve calibration methods
- Build interactive NO₂ visualization dashboard
- Extend to additional pollutants
- Deploy city-scale air quality monitoring framework

---

# Goal

Develop an AI-powered air quality monitoring framework combining satellite coverage with ground-level accuracy to generate detailed pollution maps.
