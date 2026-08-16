// ============================================================
// HYDERABAD NO2 DOWNSCALING
// PROTOTYPE 2 — METEOROLOGY DATA PIPELINE
// ============================================================
//
// TEMPORAL RESOLUTION:
//   Daily
//
// SPATIAL GRID:
//   Hyderabad 1 km master grid
//   1,543 cells
//
// DATA SOURCES:
//   ERA5-Land Hourly
//   ERA5 Hourly
//
// VARIABLES:
//   temperature
//   wind_speed
//   wind_direction
//   relative_humidity
//   surface_pressure
//   precipitation
//   dew_point
//   solar_radiation
//   boundary_layer_height
//
// ARCHITECTURE:
//   ONE MONTH PER EXPORT
//
// ============================================================


// ============================================================
// 1. LOAD MASTER GRID
// ============================================================

var grid = ee.FeatureCollection(
  'projects/sih-internal-505509/assets/hyderabad_orr_1km_master_grid_v2'
);

print(
  'Master grid:',
  grid
);

print(
  'Grid cells:',
  grid.size()
);


// ============================================================
// 2. ADD LATITUDE + LONGITUDE
// ============================================================

var gridWithLocation = grid.map(
  function(cell) {

    var centroid =
      cell.geometry().centroid();

    var coords =
      centroid.coordinates();

    return cell.set({

      'latitude':
        coords.get(1),

      'longitude':
        coords.get(0)

    });

  }
);


// ============================================================
// 3. SELECT MONTH
// ============================================================
//
// CHANGE ONLY THESE THREE VALUES.
//
// January:
//   2025-01-01
//   2025-02-01
//   2025_01
//
// February:
//   2025-02-01
//   2025-03-01
//   2025_02
//
// etc.
//
// ============================================================

var monthStart =
  ee.Date('2025-01-01');

var monthEnd =
  ee.Date('2025-02-01');

var monthLabel =
  '2025_01';


// ============================================================
// 4. LOAD ERA5-LAND
// ============================================================
//
// ~11.1 km resolution.
//
// ============================================================

var era5Land =
  ee.ImageCollection(
    'ECMWF/ERA5_LAND/HOURLY'
  )
  .filterBounds(
    grid.geometry()
  )
  .filterDate(
    monthStart,
    monthEnd
  );

print(
  'ERA5-Land image count:',
  era5Land.size()
);


// ============================================================
// 5. LOAD ERA5
// ============================================================
//
// Used specifically for:
//   boundary_layer_height
//
// ~27.8 km resolution.
//
// ============================================================

var era5 =
  ee.ImageCollection(
    'ECMWF/ERA5/HOURLY'
  )
  .filterBounds(
    grid.geometry()
  )
  .filterDate(
    monthStart,
    monthEnd
  );

print(
  'ERA5 image count:',
  era5.size()
);


// ============================================================
// 6. NUMBER OF DAYS
// ============================================================

var numberOfDays =
  monthEnd
    .difference(
      monthStart,
      'day'
    );

print(
  'Days in month:',
  numberOfDays
);


// ============================================================
// 7. FUNCTION TO CALCULATE DAILY METEOROLOGY
// ============================================================

function createDailyWeather(
  dayOffset
) {

  var date =
    monthStart.advance(
      ee.Number(dayOffset),
      'day'
    );

  var nextDate =
    date.advance(
      1,
      'day'
    );

  var dateString =
    date.format(
      'yyyyMMdd'
    );


  // ==========================================================
  // FILTER THIS DAY
  // ==========================================================

  var dailyLand =
    era5Land.filterDate(
      date,
      nextDate
    );

  var dailyERA5 =
    era5.filterDate(
      date,
      nextDate
    );


  // ==========================================================
  // TEMPERATURE
  // ==========================================================
  //
  // Kelvin → Celsius
  //
  // Daily mean.
  //
  // ==========================================================

  var temperature =
    dailyLand
      .select(
        'temperature_2m'
      )
      .mean()
      .subtract(
        273.15
      )
      .rename(
        'temperature'
      );


  // ==========================================================
  // DEW POINT
  // ==========================================================

  var dewPoint =
    dailyLand
      .select(
        'dewpoint_temperature_2m'
      )
      .mean()
      .subtract(
        273.15
      )
      .rename(
        'dew_point'
      );


  // ==========================================================
  // WIND U / V
  // ==========================================================

  var meanU =
    dailyLand
      .select(
        'u_component_of_wind_10m'
      )
      .mean();


  var meanV =
    dailyLand
      .select(
        'v_component_of_wind_10m'
      )
      .mean();


  // ==========================================================
  // WIND SPEED
  // ==========================================================

  var windSpeed =
    meanU
      .pow(2)
      .add(
        meanV.pow(2)
      )
      .sqrt()
      .rename(
        'wind_speed'
      );


  // ==========================================================
  // WIND DIRECTION
  // ==========================================================
  //
  // Meteorological convention:
  //
  // 0°   = North
  // 90°  = East
  // 180° = South
  // 270° = West
  //
  // Direction represents where wind comes FROM.
  //
  // We derive it from the daily mean U/V components
  // rather than averaging compass degrees directly.
  //
  // ==========================================================

  var windDirection =
    meanU
      .multiply(-1)
      .atan2(
        meanV.multiply(-1)
      )
      .multiply(
        180 / Math.PI
      )
      .add(360)
      .mod(360)
      .rename(
        'wind_direction'
      );


  // ==========================================================
  // RELATIVE HUMIDITY
  // ==========================================================
  //
  // Derived from temperature and dew point.
  //
  // Magnus approximation.
  //
  // ==========================================================

  var saturationVaporPressure =
    temperature
      .multiply(17.625)
      .divide(
        temperature.add(
          243.04
        )
      )
      .exp()
      .multiply(
        6.1094
      );


  var actualVaporPressure =
    dewPoint
      .multiply(17.625)
      .divide(
        dewPoint.add(
          243.04
        )
      )
      .exp()
      .multiply(
        6.1094
      );


  var relativeHumidity =
    actualVaporPressure
      .divide(
        saturationVaporPressure
      )
      .multiply(100)
      .clamp(
        0,
        100
      )
      .rename(
        'relative_humidity'
      );


  // ==========================================================
  // SURFACE PRESSURE
  // ==========================================================
  //
  // Pa → hPa
  //
  // ==========================================================

  var surfacePressure =
    dailyLand
      .select(
        'surface_pressure'
      )
      .mean()
      .divide(
        100
      )
      .rename(
        'surface_pressure'
      );


  // ==========================================================
  // PRECIPITATION
  // ==========================================================
  //
  // ERA5-Land total_precipitation:
  // metres of water equivalent.
  //
  // Sum over the day.
  //
  // metres → millimetres.
  //
  // ==========================================================

  var precipitation =
    dailyLand
      .select(
        'total_precipitation'
      )
      .sum()
      .multiply(
        1000
      )
      .rename(
        'precipitation'
      );


  // ==========================================================
  // SOLAR RADIATION
  // ==========================================================
  //
  // Hourly accumulated:
  // J/m²
  //
  // Sum over the day:
  // J/m²/day
  //
  // Convert to daily mean W/m²:
  //
  // divide by 86,400 seconds.
  //
  // ==========================================================

  var solarRadiation =
    dailyLand
      .select(
        'surface_solar_radiation_downwards_hourly'
      )
      .sum()
      .divide(
        86400
      )
      .rename(
        'solar_radiation'
      );


  // ==========================================================
  // BOUNDARY-LAYER HEIGHT
  // ==========================================================
  //
  // Source:
  // ERA5 Hourly
  //
  // Daily mean.
  //
  // ==========================================================

  var boundaryLayerHeight =
    dailyERA5
      .select(
        'boundary_layer_height'
      )
      .mean()
      .rename(
        'boundary_layer_height'
      );


  // ==========================================================
  // COMBINE ALL VARIABLES
  // ==========================================================

  var dailyWeather =
    ee.Image.cat([

      temperature,

      windSpeed,

      windDirection,

      relativeHumidity,

      surfacePressure,

      precipitation,

      dewPoint,

      solarRadiation,

      boundaryLayerHeight

    ]);


  // ==========================================================
  // RETURN DAILY IMAGE
  // ==========================================================

  return dailyWeather
    .set(
      'system:index',
      dateString
    )
    .set(
      'date',
      dateString
    );

}


// ============================================================
// 8. CREATE DAY LIST
// ============================================================

var days =
  ee.List.sequence(
    0,
    numberOfDays.subtract(1)
  );


// ============================================================
// 9. CREATE DAILY WEATHER COLLECTION
// ============================================================

var dailyWeatherCollection =
  ee.ImageCollection(
    days.map(
      createDailyWeather
    )
  );


print(
  'Daily weather images:',
  dailyWeatherCollection.size()
);


// ============================================================
// 10. STACK MONTH
// ============================================================
//
// 9 variables × number of days.
//
// January:
//   9 × 31 = 279 bands
//
// ============================================================

var monthlyWeatherStack =
  dailyWeatherCollection
    .sort(
      'system:index'
    )
    .toBands();


print(
  'Monthly weather band count:',
  monthlyWeatherStack
    .bandNames()
    .size()
);


// ============================================================
// 11. REDUCE TO MASTER GRID
// ============================================================
//
// ONE spatial aggregation for the month.
//
// ============================================================

var monthlyWeatherByGrid =
  monthlyWeatherStack.reduceRegions({

    collection:
      gridWithLocation,

    reducer:
      ee.Reducer.mean(),

    scale:
      11132,

    tileScale:
      4

  });


// ============================================================
// 12. CHECK RESULT
// ============================================================

print(
  '=========================================='
);

print(
  'MONTHLY METEOROLOGY DATASET'
);

print(
  '=========================================='
);

print(
  'Grid records:',
  monthlyWeatherByGrid.size()
);

print(
  'Expected:',
  grid.size()
);

print(
  'First weather record:',
  monthlyWeatherByGrid.first()
);


// ============================================================
// 13. EXPORT
// ============================================================

Export.table.toDrive({

  collection:
    monthlyWeatherByGrid,

  description:
    'Hyderabad_Prototype2_Meteorology_' +
    monthLabel,

  folder:
    'NO2_Downscaling_Hackathon/Prototype2/Meteorology',

  fileNamePrefix:
    'meteorology_' +
    monthLabel,

  fileFormat:
    'CSV'

});