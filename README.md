# Hyderabad Urban NO₂ Downscaling

> AI/ML-based spatial downscaling of satellite-derived NO₂ over Hyderabad, Telangana, India.

---

## 📌 Project Overview

This project aims to develop an AI/ML-based framework for producing a higher-resolution spatial representation of nitrogen dioxide (NO₂) over Hyderabad, Telangana, India.

The project combines satellite observations with spatial, environmental, meteorological, infrastructure, and other auxiliary datasets to learn the relationship between observed NO₂ concentrations and local-scale features.

The resulting model will be used to generate a high-resolution NO₂ prediction map for the Hyderabad study region.

---

## 🎯 Objectives

The primary objectives of this project are:

1. Obtain satellite-derived NO₂ observations over Hyderabad.
2. Define a consistent spatial analysis grid for the study area.
3. Collect relevant environmental and spatial predictor variables.
4. Aggregate all datasets to a common `grid_id`.
5. Build a machine-learning training dataset.
6. Train and compare multiple ML models.
7. Evaluate model performance using appropriate validation methods.
8. Generate a high-resolution NO₂ prediction map.
9. Analyze the spatial distribution of NO₂ across different types of areas within Hyderabad.

---

# 🗺️ Study Area

## Hyderabad, Telangana, India

The study region is based on the approximately **1,448 km² area associated with Hyderabad's Outer Ring Road (ORR)**.

The ORR-defined region was selected because it contains a diverse combination of:

- Dense metropolitan areas
- Residential areas
- High-traffic regions
- Industrial areas
- Commercial areas
- Peri-urban areas
- Vegetated/green areas
- Open areas

This diversity provides useful spatial variation for developing and evaluating an NO₂ downscaling model.

### Boundary Source

The study boundary was obtained from the:

**Telangana State Remote Sensing Applications Centre (TGRAC)**

Dataset:

**Outer Ring Road - 1448 Sq. Km**

---

# 🧩 Spatial Grid

A fixed approximately **1 km × 1 km master grid** has been created over the study region.

### Grid Specifications

| Property | Value |
|---|---|
| Study region | Hyderabad ORR |
| Approximate study area | 1,448 km² |
| Grid resolution | 1 km × 1 km |
| Number of grid cells | 1,543 |
| Working CRS | EPSG:32644 |
| Grid identifier | `grid_id` |
| ID range | `HYD_0001` – `HYD_1543` |

Each grid cell has a unique identifier.

Example:

```text
HYD_0001
HYD_0002
HYD_0003
...
HYD_1543
