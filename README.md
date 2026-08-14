# AQI_Downscaling_SIH
ML-based spatial downscaling of Sentinel-5P TROPOMI NO₂ from coarse satellite resolution to ~1 km using meteorological, traffic, population, land-cover, terrain, and aerosol features.

# High-Resolution NO₂ Downscaling Using Machine Learning

> A multi-source machine learning pipeline for downscaling Sentinel-5P/TROPOMI NO₂ observations to an approximately 1 km prediction grid using meteorological, traffic, population, land-cover, terrain, nighttime-light, and aerosol information.

---

## 📌 Project Overview

Nitrogen dioxide (NO₂) is an important air pollutant associated with traffic, industrial activity, and other combustion sources. Satellite observations from Sentinel-5P/TROPOMI provide wide spatial coverage of atmospheric NO₂, but the satellite observations are relatively coarse for analyzing pollution variation within urban areas.

This project aims to develop a machine-learning-based spatial downscaling pipeline that combines coarse satellite NO₂ observations with fine-resolution environmental and urban features to produce an approximately 1 km NO₂ prediction surface.

### Core idea

```text
Coarse Sentinel-5P/TROPOMI NO₂
              +
Fine-resolution environmental & urban features
              ↓
       Machine Learning Model
              ↓
      ~1 km NO₂ prediction
