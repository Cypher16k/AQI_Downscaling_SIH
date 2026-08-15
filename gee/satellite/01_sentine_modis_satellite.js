// ============================================================
// HYDERABAD NO2 DOWNSCALING
// PROTOTYPE 2 — SATELLITE DATA PIPELINE
// ============================================================
//
// Continuous period:
//   2025-01-01 → 2026-01-01
//
// Spatial resolution:
//   Hyderabad 1 km master grid
//   1,543 cells
//
// Temporal output:
//   One record per grid cell per UTC day
//
// Variables:
//   satellite_NO2
//   cloud_fraction
//   AOD
//
// Sources:
//   Sentinel-5P/TROPOMI OFFL NO2
//   MODIS MAIAC MCD19A2 AOD
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
  'Number of grid cells:',
  grid.size()
);


// ============================================================
// 2. ADD LATITUDE + LONGITUDE TO EVERY GRID CELL
// ============================================================

var gridWithLocation = grid.map(
  function(cell) {

    var centroid =
      cell.geometry().centroid();

    var coordinates =
      centroid.coordinates();

    return cell.set({

      'latitude':
        coordinates.get(1),

      'longitude':
        coordinates.get(0)

    });

  }
);


print(
  'First grid cell:',
  gridWithLocation.first()
);


// ============================================================
// 3. DATE RANGE
// ============================================================

var startDate =
  ee.Date('2025-01-01');

var endDate =
  ee.Date('2026-01-01');


// ============================================================
// 4. LOAD SENTINEL-5P NO2
// ============================================================

var no2Collection =
  ee.ImageCollection(
    'COPERNICUS/S5P/OFFL/L3_NO2'
  )
  .filterBounds(
    grid.geometry()
  )
  .filterDate(
    startDate,
    endDate
  );

print(
  'Sentinel-5P NO2 images:',
  no2Collection.size()
);


// ============================================================
// 5. LOAD SENTINEL-5P CLOUD
// ============================================================
//
// Separate cloud product.
//
// ============================================================

var cloudCollection =
  ee.ImageCollection(
    'COPERNICUS/S5P/OFFL/L3_CLOUD'
  )
  .filterBounds(
    grid.geometry()
  )
  .filterDate(
    startDate,
    endDate
  );

print(
  'Sentinel-5P cloud images:',
  cloudCollection.size()
);


// ============================================================
// 6. LOAD MODIS MAIAC AOD
// ============================================================

var aodCollection =
  ee.ImageCollection(
    'MODIS/061/MCD19A2_GRANULES'
  )
  .filterBounds(
    grid.geometry()
  )
  .filterDate(
    startDate,
    endDate
  );

print(
  'MODIS AOD images:',
  aodCollection.size()
);


// ============================================================
// 7. FUNCTION — GET DAILY SATELLITE DATA
// ============================================================

function getDailySatelliteData(
  date
) {

  var dayStart =
    ee.Date(date);

  var dayEnd =
    dayStart.advance(
      1,
      'day'
    );


  // ==========================================================
  // SENTINEL-5P NO2 FOR THIS DAY
  // ==========================================================

  var dailyNO2 =
    no2Collection
      .filterDate(
        dayStart,
        dayEnd
      );


  // ==========================================================
  // SENTINEL-5P CLOUD FOR THIS DAY
  // ==========================================================

  var dailyCloud =
    cloudCollection
      .filterDate(
        dayStart,
        dayEnd
      );


  // ==========================================================
  // MODIS AOD FOR THIS DAY
  // ==========================================================

  var dailyAOD =
    aodCollection
      .filterDate(
        dayStart,
        dayEnd
      );


  // ==========================================================
  // DAILY NO2 COMPOSITE
  // ==========================================================

  var no2Image =
    dailyNO2
      .select(
        'tropospheric_NO2_column_number_density'
      )
      .mean()
      .rename(
        'satellite_NO2'
      );


  // ==========================================================
  // DAILY CLOUD FRACTION
  // ==========================================================

  var cloudImage =
    dailyCloud
      .select(
        'cloud_fraction'
      )
      .mean()
      .rename(
        'cloud_fraction'
      );


  // ==========================================================
  // MODIS AOD
  // ==========================================================
  //
  // Optical_Depth_055 scale factor:
  // 0.001
  //
  // QA:
  // bits 0-2:
  //   1 = clear
  //   2 = possibly cloudy
  //   3 = cloudy
  //
  // We keep clear retrievals only.
  //
  // ==========================================================

  var aodWithQA =
    dailyAOD.map(
      function(image) {

        var qa =
          image.select(
            'AOD_QA'
          );

        // Extract cloud-mask bits 0-2.
        var cloudMask =
          qa.bitwiseAnd(7);

        // Keep clear pixels only.
        var clear =
          cloudMask.eq(1);

        var aod =
          image.select(
            'Optical_Depth_055'
          )
          .multiply(0.001)
          .updateMask(
            clear
          )
          .rename(
            'AOD'
          );

        return aod;

      }
    );


  var aodImage =
    aodWithQA.mean()
      .rename(
        'AOD'
      );


  // ==========================================================
  // COMBINE DAILY SATELLITE VARIABLES
  // ==========================================================

  var dailySatellite =
    ee.Image.cat([

      no2Image,

      cloudImage,

      aodImage

    ]);


  // ==========================================================
  // EXTRACT TO GRID
  // ==========================================================
  //
  // Use the grid geometry itself rather than just a centroid
  // so the value represents the 1 km cell.
  //
  // ==========================================================

  var samples =
    dailySatellite.reduceRegions({

      collection:
        gridWithLocation,

      reducer:
        ee.Reducer.mean(),

      scale:
        1000,

      tileScale:
        4

    });


  // ==========================================================
  // ADD TIMESTAMP
  // ==========================================================

  samples =
    samples.map(
      function(feature) {

        return ee.Feature(
          null,
          {

            'grid_id':
              feature.get(
                'grid_id'
              ),

            'latitude':
              feature.get(
                'latitude'
              ),

            'longitude':
              feature.get(
                'longitude'
              ),

            'timestamp_utc':
              dayStart.format(
                "YYYY-MM-dd'T'HH:mm:ss'Z'"
              ),

            'satellite_NO2':
              feature.get(
                'satellite_NO2'
              ),

            'cloud_fraction':
              feature.get(
                'cloud_fraction'
              ),

            'AOD':
              feature.get(
                'AOD'
              )

          }
        );

      }
    );


  return samples;

}


// ============================================================
// 8. CREATE LIST OF DAYS
// ============================================================

var numberOfDays =
  endDate
    .difference(
      startDate,
      'day'
    );


var dayOffsets =
  ee.List.sequence(
    0,
    numberOfDays.subtract(1)
  );


// ============================================================
// 9. RUN DAILY EXTRACTION
// ============================================================
//
// NOTE:
// This creates approximately:
//
// 1,543 cells × 365 days
//
// ≈ 563,195 records.
//
// ============================================================

var dailyCollections =
  dayOffsets.map(
    function(dayOffset) {

      var date =
        startDate.advance(
          ee.Number(dayOffset),
          'day'
        );

      return getDailySatelliteData(
        date
      );

    }
  );


// ============================================================
// 10. FLATTEN
// ============================================================

var satelliteDataset =
  ee.FeatureCollection(
    dailyCollections
  ).flatten();


// ============================================================
// 11. CHECK DATASET
// ============================================================

print(
  '=========================================='
);

print(
  'SATELLITE DATASET'
);

print(
  '=========================================='
);

print(
  'Expected grid cells:',
  grid.size()
);

print(
  'Expected days:',
  numberOfDays
);

print(
  'Expected maximum records:',
  grid.size()
    .multiply(
      numberOfDays
    )
);

print(
  'Actual records:',
  satelliteDataset.size()
);

print(
  'First satellite record:',
  satelliteDataset.first()
);


// ============================================================
// 12. CHECK UNIQUE GRID IDS
// ============================================================

print(
  'Unique grid IDs:',
  satelliteDataset
    .aggregate_array(
      'grid_id'
    )
    .distinct()
    .size()
);


// ============================================================
// 13. CHECK TIMESTAMPS
// ============================================================

print(
  'First timestamps:',
  satelliteDataset
    .aggregate_array(
      'timestamp_utc'
    )
    .distinct()
    .sort()
    .slice(
      0,
      10
    )
);


// ============================================================
// 14. CHECK VALID NO2
// ============================================================

var validNO2 =
  satelliteDataset.filter(
    ee.Filter.notNull([
      'satellite_NO2'
    ])
  );

print(
  'Records with satellite NO2:',
  validNO2.size()
);

print(
  'Records without satellite NO2:',
  satelliteDataset.size()
    .subtract(
      validNO2.size()
    )
);


// ============================================================
// 15. CHECK VALID AOD
// ============================================================

var validAOD =
  satelliteDataset.filter(
    ee.Filter.notNull([
      'AOD'
    ])
  );

print(
  'Records with AOD:',
  validAOD.size()
);

print(
  'Records without AOD:',
  satelliteDataset.size()
    .subtract(
      validAOD.size()
    )
);


// ============================================================
// 16. CHECK CLOUD FRACTION
// ============================================================

var validCloud =
  satelliteDataset.filter(
    ee.Filter.notNull([
      'cloud_fraction'
    ])
  );

print(
  'Records with cloud fraction:',
  validCloud.size()
);

print(
  'Records without cloud fraction:',
  satelliteDataset.size()
    .subtract(
      validCloud.size()
    )
);


// ============================================================
// 17. SATELLITE NO2 STATISTICS
// ============================================================

print(
  'Satellite NO2 statistics:',
  validNO2.aggregate_stats(
    'satellite_NO2'
  )
);


// ============================================================
// 18. AOD STATISTICS
// ============================================================

print(
  'AOD statistics:',
  validAOD.aggregate_stats(
    'AOD'
  )
);


// ============================================================
// 19. CLOUD FRACTION STATISTICS
// ============================================================

print(
  'Cloud fraction statistics:',
  validCloud.aggregate_stats(
    'cloud_fraction'
  )
);


// ============================================================
// 20. EXPORT
// ============================================================
//
// IMPORTANT:
// Because this is a large continuous dataset,
// export satellite data separately.
//
// ============================================================

Export.table.toDrive({

  collection:
    satelliteDataset,

  description:
    'Hyderabad_Prototype2_Satellite_2025',

  folder:
    'NO2_Downscaling_Hackathon',

  fileNamePrefix:
    'prototype2_satellite_hyderabad_2025',

  fileFormat:
    'CSV'

});