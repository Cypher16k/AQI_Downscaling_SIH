# Hyderabad ORR 1 km Master Grid

## Study Area

Hyderabad ORR enclosed study region, Telangana, India.

## Boundary Source

Telangana State Remote Sensing Applications Centre (TGRAC)

Dataset: Outer Ring Road - 1448 Sq. Km

## Grid

Spatial resolution:

1 km × 1 km

Number of grid cells:

1543

Grid CRS:

EPSG:32644 (WGS 84 / UTM Zone 44N)

## Grid IDs

Each cell has a unique identifier:

HYD_0001

HYD_0002

...

HYD_1543

The `grid_id` field is the primary spatial key used to join all
datasets.

## Prototype 2 Data Integration

The official master grid is used for all Prototype 2 feature extraction
pipelines.

All extracted datasets are aligned to this grid:

### Satellite / Atmospheric Features

-   Satellite NO₂
-   AOD
-   Cloud fraction

### Meteorological Features

-   Temperature
-   Wind speed
-   Wind direction
-   Relative humidity
-   Surface pressure
-   Precipitation
-   Dew point
-   Solar radiation
-   Boundary layer height

### Urban / Emission Proxy Features

-   Population density
-   Road density
-   Distance to road
-   Nighttime lights
-   Built-up density

### Land / Terrain Features

-   Elevation
-   NDVI
-   Vegetation fraction
-   Built-up fraction
-   Water fraction
-   Cropland fraction
-   Bare land fraction
-   Distance to water

## Dataset Joining Rules

All future datasets must:

1.  Use the official `grid_id` field.
2.  Maintain the same 1543 grid cells.
3.  Not recreate, modify, or renumber the grid.
4.  Preserve spatial alignment with the master grid.

## Important

This is the project's official master grid.

Team members must not independently recreate, modify, or renumber the
grid.

The `grid_id` field is the primary spatial key for merging all Prototype
2 and future datasets.
