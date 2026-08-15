// ==========================================
// VERIFY HYDERABAD 1 KM MASTER GRID
// ==========================================

var grid = ee.FeatureCollection('projects/sih-internal-505509/assets/hyderabad_orr_1km_master_grid_v2');

// ==========================================
// CREATE DETERMINISTIC GRID IDs
// ==========================================

// Create a deterministic sorting key from row + column.
// 10000 is safely larger than the maximum column index.
var gridWithSortKey = grid.map(function(feature) {
  var row = ee.Number(feature.get('row_index'));
  var col = ee.Number(feature.get('col_index'));

  return feature.set(
    'sort_key',
    row.multiply(10000).add(col)
  );
});

// Sort physically:
// top-to-bottom by row, then left-to-right by column.
var sortedGrid = gridWithSortKey.sort('sort_key');

// Convert to list so we can assign sequential IDs.
var sortedList = sortedGrid.toList(sortedGrid.size());

// Assign HYD_001, HYD_002, ...
var renamedGrid = ee.FeatureCollection(
  ee.List.sequence(0, sortedGrid.size().subtract(1)).map(function(i) {

    var feature = ee.Feature(sortedList.get(i));

    var newId = ee.String('HYD_').cat(
      ee.Number(i).add(1).format('%04d')
    );

    return feature.set('grid_id', newId);
  })
);

// ==========================================
// VERIFY RENAMED GRID
// ==========================================

print('Renamed grid:', renamedGrid);

print(
  'Number of cells:',
  renamedGrid.size()
);

print(
  'First 10 cells:',
  renamedGrid.limit(10)
);

print(
  'First grid ID:',
  renamedGrid.first().get('grid_id')
);

print(
  'Last grid ID:',
  renamedGrid.sort('grid_id', false).first().get('grid_id')
);

// ==========================================
// BASIC GRID INFORMATION
// ==========================================

print(
  'Master grid:',
  renamedGrid
);

print(
  'Number of grid cells:',
  renamedGrid.size()
);

print(
  'First 5 cells:',
  renamedGrid.limit(5)
);

print(
  'First cell properties:',
  renamedGrid.first()
);

// ==========================================
// DISPLAY GRID
// ==========================================

Map.centerObject(
  renamedGrid,
  10
);

Map.addLayer(
  renamedGrid.style({
    color: '0000FF',
    fillColor: '00000000',
    width: 1
  }),
  {},
  'Hyderabad 1 km Master Grid'
);

// ==========================================
// GRID ATTRIBUTE CHECK
// ==========================================

print(
  'First grid ID:',
  renamedGrid.first().get('grid_id')
);

print(
  'Number of unique grid IDs:',
  renamedGrid
    .aggregate_array('grid_id')
    .distinct()
    .size()
);

print(
  'Grid size attribute:',
  renamedGrid.first().get('grid_size_m')
);

// ==========================================
// SENTINEL-5P NO2 TEST
// ==========================================

var startDate = '2025-01-01';
var endDate   = '2025-02-01';

var no2Collection = ee.ImageCollection(
  'COPERNICUS/S5P/OFFL/L3_NO2'
)
.filterBounds(
  renamedGrid.geometry()
)
.filterDate(
  startDate,
  endDate
)
.select([
  'tropospheric_NO2_column_number_density',
  'cloud_fraction'
]);

print(
  'Number of Sentinel-5P images:',
  no2Collection.size()
);

print(
  'First NO2 image:',
  no2Collection.first()
);

// ==========================================
// CREATE MONTHLY NO2 COMPOSITE
// ==========================================

var no2Monthly = no2Collection
  .select(
    'tropospheric_NO2_column_number_density'
  )
  .mean();
  

// ==========================================
// DISPLAY NO2
// ==========================================

Map.addLayer(
  no2Monthly,
  {
    min: 0,
    max: 0.0002,
    palette: [
      'blue',
      'cyan',
      'green',
      'yellow',
      'orange',
      'red'
    ]
  },
  'January 2025 Mean NO2'
);

// ==========================================
// EXTRACT NO2 TO 1 KM GRID
// ==========================================

var gridNO2 = no2Monthly.reduceRegions({
  collection: renamedGrid,
  reducer: ee.Reducer.mean(),
  scale: 1113.2,
  crs: 'EPSG:32644',
  tileScale: 4
});

// ==========================================
// PROTOTYPE 1 — 200 CELL NO2 DATASET
// ==========================================

var prototypeGrid = renamedGrid
  .randomColumn('random', 42)
  .sort('random')
  .limit(200);

print('Prototype grid:', prototypeGrid);
print('Prototype cell count:', prototypeGrid.size());


// ==========================================
// EXTRACT JANUARY 2025 NO2
// ==========================================

var prototypeNO2 = no2Monthly.reduceRegions({
  collection: prototypeGrid,
  reducer: ee.Reducer.mean(),
  scale: 1113.2,
  crs: 'EPSG:32644',
  tileScale: 4
});

print('Prototype NO2 dataset:', prototypeNO2);
print('First prototype record:', prototypeNO2.first());


// ==========================================
// CLEAN PROTOTYPE DATASET
// ==========================================

var prototypeDataset = prototypeNO2.map(function(feature) {

  return ee.Feature(null, {
    grid_id: feature.get('grid_id'),
    no2_mol_m2: feature.get('mean')
  });

});

print('Clean prototype dataset:', prototypeDataset);
print('Prototype dataset size:', prototypeDataset.size());


// ==========================================
// CHECK FOR MISSING VALUES
// ==========================================

var validPrototype = prototypeDataset.filter(
  ee.Filter.notNull(['no2_mol_m2'])
);

print('Prototype cells with NO2:', validPrototype.size());

print(
  'Prototype cells without NO2:',
  prototypeDataset.size()
    .subtract(validPrototype.size())
);


// ==========================================
// EXPORT PROTOTYPE CSV
// ==========================================

Export.table.toDrive({
  collection: validPrototype,
  description: 'Hyderabad_Prototype_NO2_Jan2025_200cells',
  folder: 'NO2_Downscaling_Hackathon',
  fileNamePrefix: 'prototype_no2_jan2025_200cells',
  fileFormat: 'CSV'
});

// ==========================================
// CHECK RESULTS
// ==========================================

print(
  'Grid with NO2:',
  gridNO2
);

print(
  'First grid cell with NO2:',
  gridNO2.first()
);

// ==========================================
// CHECK NO2 COVERAGE
// ==========================================

var validNO2 = gridNO2.filter(
  ee.Filter.notNull([
    'mean'
  ])
);

var totalCells = renamedGrid.size();

var validCells = validNO2.size();

var missingCells = totalCells.subtract(
  validCells
);

print(
  'Total grid cells:',
  totalCells
);

print(
  'Grid cells with NO2:',
  validCells
);

print(
  'Grid cells without NO2:',
  missingCells
);

print(
  'Percentage of grid cells with NO2:',
  validCells
    .divide(totalCells)
    .multiply(100)
);

// ==========================================
// NO2 VALUE SANITY CHECK
// ==========================================

var no2Stats = gridNO2.aggregate_stats(
  'mean'
);

print(
  'NO2 statistics:',
  no2Stats
);

print(
  'Minimum NO2:',
  gridNO2.aggregate_min('mean')
);

print(
  'Maximum NO2:',
  gridNO2.aggregate_max('mean')
);

print(
  'Mean NO2 across grid:',
  gridNO2.aggregate_mean('mean')
);

// ==========================================
// TEST GRIP4 ROAD DATA - HYDERABAD ONLY
// ==========================================

// ==========================================
// GRIP4 ROAD DENSITY
// ==========================================

// Load GRIP4 South-East Asia roads
var roads = ee.FeatureCollection(
  'projects/sat-io/open-datasets/GRIP4/South-East-Asia'
);

// Keep only roads intersecting our study area
var hyderabadRoads = roads.filterBounds(
  renamedGrid.geometry()
);

print(
  'Road features in study area:',
  hyderabadRoads.size()
);


// ==========================================
// CREATE 200-CELL PROTOTYPE
// ==========================================

var prototypeGrid = renamedGrid
  .randomColumn('random', 42)
  .sort('random')
  .limit(200);

print(
  'Prototype cells:',
  prototypeGrid.size()
);


// ==========================================
// CALCULATE ROAD DENSITY PER CELL
// ==========================================
//
// Road density:
//
// total road length inside cell (km)
// -----------------------------------
// cell area (km²)
//
// Result:
// km of road per km²
// ==========================================

var prototypeRoadDensity = prototypeGrid.map(
  function(cell) {

    // Get cell geometry
    var cellGeometry = cell.geometry();

    // Find only roads intersecting this cell
    var roadsInCell = hyderabadRoads.filterBounds(
      cellGeometry
    );

    // Calculate the portion of each road
    // that actually lies inside the cell.
    var roadLengths = roadsInCell.map(
      function(road) {

        var clippedRoad =
          road.geometry().intersection(
            cellGeometry,
            1
          );

        // Convert length from metres to km
        var lengthKm =
          clippedRoad.length().divide(1000);

        return road.set(
          'length_km_in_cell',
          lengthKm
        );

      }
    );

    // Total road length inside this cell
    var totalRoadLengthKm =
      ee.Number(
        roadLengths.aggregate_sum(
          'length_km_in_cell'
        )
      );

    // Cell area in km²
    var cellAreaKm2 =
      cellGeometry
        .area()
        .divide(1000000);

    // Road density
    var roadDensity =
      totalRoadLengthKm
        .divide(cellAreaKm2);

    // Return original cell + road density
    return cell.set({
      'road_length_km':
        totalRoadLengthKm,

      'cell_area_km2':
        cellAreaKm2,

      'road_density_km_per_km2':
        roadDensity
    });

  }
);


// ==========================================
// CHECK RESULTS
// ==========================================

print(
  'Prototype road density:',
  prototypeRoadDensity
);

print(
  'First cell:',
  prototypeRoadDensity.first()
);

print(
  'Road density statistics:',
  prototypeRoadDensity.aggregate_stats(
    'road_density_km_per_km2'
  )
);


// ==========================================
// DISPLAY ROAD DENSITY
// ==========================================

Map.addLayer(
  prototypeRoadDensity,
  {
    color: 'yellow'
  },
  'Prototype Grid'
);

Map.addLayer(
  hyderabadRoads,
  {
    color: 'red'
  },
  'GRIP4 Roads'
);

// Display Hyderabad roads
Map.addLayer(
  hyderabadRoads,
  {
    color: 'FF0000'
  },
  'GRIP4 Roads - Hyderabad'
);

// ============================================================
// WEATHER DATA EXTRACTION
// ERA5-Land | January 2025
// ============================================================
//
// Output per prototype grid cell:
//
// grid_id
// temperature_c
// wind_speed_m_s
//
// IMPORTANT:
// ERA5-Land has approximately 11 km spatial resolution.
// Our master grid is approximately 1 km.
// Therefore, each 1 km cell receives the ERA5-Land
// value sampled at the cell centroid.
//
// ============================================================


// ============================================================
// 1. LOAD ERA5-LAND HOURLY DATA
// ============================================================

var weatherCollection = ee.ImageCollection(
  'ECMWF/ERA5_LAND/HOURLY'
)
.filterDate(
  '2025-01-01',
  '2025-02-01'
)
.filterBounds(
  prototypeGrid.geometry()
);

print(
  'ERA5-Land image count:',
  weatherCollection.size()
);


// ============================================================
// 2. CALCULATE HOURLY WIND SPEED
// ============================================================
//
// Wind speed:
//
// sqrt(u² + v²)
//
// u = east-west wind component
// v = north-south wind component
//
// Units: m/s
// ============================================================

var weatherWithWind = weatherCollection.map(
  function(image) {

    var u = image.select(
      'u_component_of_wind_10m'
    );

    var v = image.select(
      'v_component_of_wind_10m'
    );

    var windSpeed = u
      .pow(2)
      .add(
        v.pow(2)
      )
      .sqrt()
      .rename(
        'wind_speed_m_s'
      );

    return image.addBands(
      windSpeed
    );
  }
);


// ============================================================
// 3. CREATE JANUARY MEAN TEMPERATURE
// ============================================================
//
// ERA5 temperature is stored in Kelvin.
//
// Convert:
// Kelvin - 273.15 = Celsius
// ============================================================

var monthlyTemperature =
  weatherWithWind
    .select(
      'temperature_2m'
    )
    .mean()
    .subtract(273.15)
    .rename(
      'temperature_c'
    );


// ============================================================
// 4. CREATE JANUARY MEAN WIND SPEED
// ============================================================

var monthlyWindSpeed =
  weatherWithWind
    .select(
      'wind_speed_m_s'
    )
    .mean()
    .rename(
      'wind_speed_m_s'
    );


// ============================================================
// 5. COMBINE TEMPERATURE + WIND
// ============================================================

var monthlyWeather =
  monthlyTemperature.addBands(
    monthlyWindSpeed
  );

print(
  'January mean weather image:',
  monthlyWeather
);


// ============================================================
// 6. CREATE CENTROIDS OF THE 200 PROTOTYPE CELLS
// ============================================================
//
// We keep grid_id so that the weather values can be
// matched back to the correct grid cell.
// ============================================================

var gridCentroids =
  prototypeGrid.map(
    function(cell) {

      return ee.Feature(
        cell.geometry().centroid()
      ).set(
        'grid_id',
        cell.get('grid_id')
      );

    }
  );

print(
  'Prototype grid centroids:',
  gridCentroids
);

print(
  'Number of centroids:',
  gridCentroids.size()
);


// ============================================================
// 7. SAMPLE ERA5 AT EACH GRID CENTROID
// ============================================================

var weatherSamples =
  monthlyWeather.sampleRegions({

    collection:
      gridCentroids,

    properties: [
      'grid_id'
    ],

    scale: 11132,

    geometries: false,

    tileScale: 4

  });


// ============================================================
// 8. CHECK WEATHER DATA
// ============================================================

print(
  'Weather samples:',
  weatherSamples
);

print(
  'Number of weather samples:',
  weatherSamples.size()
);

print(
  'First weather sample:',
  weatherSamples.first()
);


// ============================================================
// 9. CHECK MISSING VALUES
// ============================================================

var validWeather =
  weatherSamples.filter(
    ee.Filter.notNull([

      'grid_id',

      'temperature_c',

      'wind_speed_m_s'

    ])
  );

print(
  'Complete weather records:',
  validWeather.size()
);

print(
  'Missing weather records:',
  weatherSamples.size()
    .subtract(
      validWeather.size()
    )
);


// ============================================================
// 10. TEMPERATURE STATISTICS
// ============================================================

print(
  'Temperature statistics:',
  validWeather.aggregate_stats(
    'temperature_c'
  )
);


// ============================================================
// 11. WIND SPEED STATISTICS
// ============================================================

print(
  'Wind speed statistics:',
  validWeather.aggregate_stats(
    'wind_speed_m_s'
  )
);


// ============================================================
// 12. DISPLAY TEMPERATURE
// ============================================================

Map.addLayer(
  monthlyTemperature,
  {
    min: 15,
    max: 30,

    palette: [
      'blue',
      'cyan',
      'green',
      'yellow',
      'orange',
      'red'
    ]
  },

  'January 2025 Mean Temperature °C'
);


// ============================================================
// 13. DISPLAY WIND SPEED
// ============================================================

Map.addLayer(
  monthlyWindSpeed,
  {
    min: 0,
    max: 8,

    palette: [
      'blue',
      'cyan',
      'green',
      'yellow',
      'red'
    ]
  },

  'January 2025 Mean Wind Speed'
);

// ============================================================
// POPULATION DENSITY
// WorldPop ~100 m Population Data
// Prototype: 200 grid cells
// Year: 2020
// ============================================================


// ============================================================
// 1. LOAD WORLDPOP
// ============================================================

var populationCollection = ee.ImageCollection(
  'WorldPop/GP/100m/pop'
)
.filterDate(
  '2020-01-01',
  '2021-01-01'
)
.filterBounds(
  prototypeGrid.geometry()
);

print(
  'WorldPop image count:',
  populationCollection.size()
);


// ============================================================
// 2. CHECK THE AVAILABLE IMAGE
// ============================================================

var populationImage = ee.Image(
  'WorldPop/GP/100m/pop/IND_2020'
);

print(
  'India WorldPop image:',
  populationImage
);

// ============================================================
// 3. SELECT POPULATION BAND
// ============================================================

var population =
  populationImage.select(
    'population'
  );


// ============================================================
// 4. DISPLAY POPULATION
// ============================================================

Map.addLayer(
  population,
  {
    min: 0,
    max: 100,

    palette: [
      'white',
      'yellow',
      'orange',
      'red',
      'darkred'
    ]

  },
  'WorldPop 2020 Population'
);


// ============================================================
// 5. SUM POPULATION INSIDE EACH 1 KM CELL
// ============================================================
//
// The WorldPop population band represents the estimated
// number of people residing in each ~100 m grid cell.
//
// Therefore we SUM the pixels inside each 1 km cell.
//
// ============================================================

var populationByGrid =
  population.reduceRegions({

    collection:
      prototypeGrid,

    reducer:
      ee.Reducer.sum(),

    scale:
      100,

    crs:
      'EPSG:32644',

    tileScale:
      4

  });


// ============================================================
// 6. CALCULATE POPULATION DENSITY
// ============================================================

var populationDensity =
  populationByGrid.map(
    function(cell) {

      // Total population
      var populationTotal =
        ee.Number(
          cell.get('sum')
        );

      // Actual cell area in km²
      var areaKm2 =
        cell.geometry()
          .area()
          .divide(1000000);

      // Population density
      var density =
        populationTotal
          .divide(areaKm2);

      return cell.set({

        'population_total':
          populationTotal,

        'cell_area_km2':
          areaKm2,

        'population_density_persons_per_km2':
          density

      });

    }
  );


// ============================================================
// 7. CHECK RESULTS
// ============================================================

print(
  'Population by grid:',
  populationDensity
);

print(
  'Population grid count:',
  populationDensity.size()
);

print(
  'First population record:',
  populationDensity.first()
);


// ============================================================
// 8. CHECK MISSING VALUES
// ============================================================

var validPopulation =
  populationDensity.filter(
    ee.Filter.notNull([

      'population_total',

      'population_density_persons_per_km2'

    ])
  );

print(
  'Cells with population data:',
  validPopulation.size()
);

print(
  'Cells without population data:',
  populationDensity.size()
    .subtract(
      validPopulation.size()
    )
);


// ============================================================
// 9. POPULATION STATISTICS
// ============================================================

print(
  'Population total statistics:',
  validPopulation.aggregate_stats(
    'population_total'
  )
);

print(
  'Population density statistics:',
  validPopulation.aggregate_stats(
    'population_density_persons_per_km2'
  )
);

// ==========================================
// EXPORT FINAL MASTER GRID TO GEE ASSET
// ==========================================

Export.table.toAsset({
  collection: renamedGrid,
  description: 'Hyderabad_ORR_1km_Master_Grid_v2',
  assetId: 'projects/sih-internal-505509/assets/hyderabad_orr_1km_master_grid_v2'
});

prototypeGrid
prototypeNO2
weatherSamples
prototypeRoadDensity
populationDensity

// ============================================================
// FINAL PROTOTYPE 1 — ML DATASET ASSEMBLY
// ============================================================
//
// 200 Hyderabad grid cells
//
// Features:
//   grid_id
//   date
//   no2_mol_m2
//   temperature_c
//   wind_speed_m_s
//   road_density_km_per_km2
//   population_density_persons_per_km2
//
// ============================================================


// ============================================================
// 1. JOIN ALL FEATURES USING grid_id
// ============================================================

var finalPrototype = prototypeGrid.map(
  function(cell) {

    var gridId = cell.get('grid_id');


    // --------------------------------------------------------
    // NO2
    // --------------------------------------------------------

    var no2Feature =
      prototypeNO2
        .filter(
          ee.Filter.eq(
            'grid_id',
            gridId
          )
        )
        .first();

    var no2Value =
      ee.Algorithms.If(
        no2Feature,
        ee.Feature(no2Feature)
          .get('mean'),
        null
      );


    // --------------------------------------------------------
    // WEATHER
    // --------------------------------------------------------

    var weatherFeature =
      weatherSamples
        .filter(
          ee.Filter.eq(
            'grid_id',
            gridId
          )
        )
        .first();

    var temperatureValue =
      ee.Algorithms.If(
        weatherFeature,
        ee.Feature(weatherFeature)
          .get('temperature_c'),
        null
      );

    var windValue =
      ee.Algorithms.If(
        weatherFeature,
        ee.Feature(weatherFeature)
          .get('wind_speed_m_s'),
        null
      );


    // --------------------------------------------------------
    // ROAD DENSITY
    // --------------------------------------------------------

    var roadFeature =
      prototypeRoadDensity
        .filter(
          ee.Filter.eq(
            'grid_id',
            gridId
          )
        )
        .first();

    var roadDensityValue =
      ee.Algorithms.If(
        roadFeature,
        ee.Feature(roadFeature)
          .get(
            'road_density_km_per_km2'
          ),
        null
      );


    // --------------------------------------------------------
    // POPULATION DENSITY
    // --------------------------------------------------------

    var populationFeature =
      populationDensity
        .filter(
          ee.Filter.eq(
            'grid_id',
            gridId
          )
        )
        .first();

    var populationDensityValue =
      ee.Algorithms.If(
        populationFeature,
        ee.Feature(populationFeature)
          .get(
            'population_density_persons_per_km2'
          ),
        null
      );


    // --------------------------------------------------------
    // CREATE FINAL RECORD
    // --------------------------------------------------------

    return ee.Feature(null, {

      // Spatial identifier
      'grid_id':
        gridId,

      // Time period
      'date':
        '2025-01',

      // Target variable
      'no2_mol_m2':
        no2Value,

      // Meteorological predictors
      'temperature_c':
        temperatureValue,

      'wind_speed_m_s':
        windValue,

      // Road predictor
      'road_density_km_per_km2':
        roadDensityValue,

      // Population predictor
      'population_density_persons_per_km2':
        populationDensityValue

    });

  }
);


// ============================================================
// 2. DISPLAY FINAL DATASET
// ============================================================

print(
  '===================================='
);

print(
  'FINAL PROTOTYPE 1 DATASET:',
  finalPrototype
);

print(
  '===================================='
);


// ============================================================
// 3. CHECK NUMBER OF ROWS
// ============================================================

print(
  'Total prototype rows:',
  finalPrototype.size()
);


// ============================================================
// 4. CHECK FIRST RECORD
// ============================================================

print(
  'First final record:',
  finalPrototype.first()
);


// ============================================================
// 5. CHECK UNIQUE GRID IDs
// ============================================================

print(
  'Unique grid IDs:',
  finalPrototype
    .aggregate_array('grid_id')
    .distinct()
    .size()
);


// ============================================================
// 6. CHECK MISSING NO2
// ============================================================

var missingNO2 =
  finalPrototype.filter(
    ee.Filter.notNull([
      'no2_mol_m2'
    ])
  );

print(
  'Rows with NO2:',
  missingNO2.size()
);

print(
  'Rows missing NO2:',
  finalPrototype.size()
    .subtract(
      missingNO2.size()
    )
);


// ============================================================
// 7. CHECK MISSING TEMPERATURE
// ============================================================

var validTemperature =
  finalPrototype.filter(
    ee.Filter.notNull([
      'temperature_c'
    ])
  );

print(
  'Rows with temperature:',
  validTemperature.size()
);

print(
  'Rows missing temperature:',
  finalPrototype.size()
    .subtract(
      validTemperature.size()
    )
);


// ============================================================
// 8. CHECK MISSING WIND
// ============================================================

var validWind =
  finalPrototype.filter(
    ee.Filter.notNull([
      'wind_speed_m_s'
    ])
  );

print(
  'Rows with wind:',
  validWind.size()
);

print(
  'Rows missing wind:',
  finalPrototype.size()
    .subtract(
      validWind.size()
    )
);


// ============================================================
// 9. CHECK MISSING ROAD DENSITY
// ============================================================

var validRoads =
  finalPrototype.filter(
    ee.Filter.notNull([
      'road_density_km_per_km2'
    ])
  );

print(
  'Rows with road density:',
  validRoads.size()
);

print(
  'Rows missing road density:',
  finalPrototype.size()
    .subtract(
      validRoads.size()
    )
);


// ============================================================
// 10. CHECK MISSING POPULATION
// ============================================================

var validPopulation =
  finalPrototype.filter(
    ee.Filter.notNull([
      'population_density_persons_per_km2'
    ])
  );

print(
  'Rows with population:',
  validPopulation.size()
);

print(
  'Rows missing population:',
  finalPrototype.size()
    .subtract(
      validPopulation.size()
    )
);


// ============================================================
// 11. CREATE COMPLETE DATASET
// ============================================================
//
// Only rows containing ALL required variables
// will be exported to the ML team.
//
// ============================================================

var completePrototype =
  finalPrototype.filter(
    ee.Filter.notNull([

      'grid_id',

      'date',

      'no2_mol_m2',

      'temperature_c',

      'wind_speed_m_s',

      'road_density_km_per_km2',

      'population_density_persons_per_km2'

    ])
  );


// ============================================================
// 12. FINAL COMPLETENESS CHECK
// ============================================================

print(
  '===================================='
);

print(
  'COMPLETE PROTOTYPE ROWS:',
  completePrototype.size()
);

print(
  'INCOMPLETE ROWS:',
  finalPrototype.size()
    .subtract(
      completePrototype.size()
    )
);

print(
  '===================================='
);


// ============================================================
// 13. DISPLAY FIRST 10 ML RECORDS
// ============================================================

print(
  'First 10 ML records:',
  completePrototype.limit(10)
);


// ============================================================
// 14. FINAL FEATURE STATISTICS
// ============================================================

print(
  'NO2 statistics:',
  completePrototype.aggregate_stats(
    'no2_mol_m2'
  )
);

print(
  'Temperature statistics:',
  completePrototype.aggregate_stats(
    'temperature_c'
  )
);

print(
  'Wind statistics:',
  completePrototype.aggregate_stats(
    'wind_speed_m_s'
  )
);

print(
  'Road density statistics:',
  completePrototype.aggregate_stats(
    'road_density_km_per_km2'
  )
);

print(
  'Population density statistics:',
  completePrototype.aggregate_stats(
    'population_density_persons_per_km2'
  )
);


// ============================================================
// 15. EXPORT FINAL PROTOTYPE CSV
// ============================================================

Export.table.toDrive({

  collection:
    completePrototype,

  description:
    'Hyderabad_Prototype1_ML_Dataset_Jan2025',

  folder:
    'NO2_Downscaling_Hackathon',

  fileNamePrefix:
    'prototype1_hyderabad_ml_dataset_jan2025',

  fileFormat:
    'CSV'

});