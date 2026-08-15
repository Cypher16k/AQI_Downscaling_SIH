// ============================================================
// HYDERABAD NO2 DOWNSCALING
// PROTOTYPE 2 — SATELLITE DATA PIPELINE
// ============================================================
//
// PERIOD:
//   2025
//
// TEMPORAL UNIT:
//   DAILY
//
// SPATIAL:
//   1,543 Hyderabad 1-km grid cells
//
// VARIABLES:
//   satellite_NO2
//   cloud_fraction
//   AOD
//
// ARCHITECTURE:
//   ONE MONTH PER EXPORT
//
// ============================================================


// ============================================================
// 1. MASTER GRID
// ============================================================

var grid = ee.FeatureCollection(
  'projects/sih-internal-505509/assets/hyderabad_orr_1km_master_grid_v2'
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
// 3. SENTINEL-5P NO2
// ============================================================

var no2Collection =
  ee.ImageCollection(
    'COPERNICUS/S5P/OFFL/L3_NO2'
  );


// ============================================================
// 4. SENTINEL-5P CLOUD
// ============================================================

var cloudCollection =
  ee.ImageCollection(
    'COPERNICUS/S5P/OFFL/L3_CLOUD'
  );


// ============================================================
// 5. MODIS MAIAC AOD
// ============================================================

var aodCollection =
  ee.ImageCollection(
    'MODIS/061/MCD19A2_GRANULES'
  );


// ============================================================
// 6. CHOOSE MONTH
// ============================================================
//
// CHANGE ONLY THESE TWO VALUES.
//
// Example:
// January = 01
// February = 02
// ...
//
// ============================================================

var monthStart =
  ee.Date('2025-01-01');

var monthEnd =
  ee.Date('2025-02-01');

var monthLabel =
  '2025_01';


// ============================================================
// 7. FILTER MONTHLY COLLECTIONS
// ============================================================

var monthlyNO2 =
  no2Collection
    .filterBounds(
      grid.geometry()
    )
    .filterDate(
      monthStart,
      monthEnd
    );


var monthlyCloud =
  cloudCollection
    .filterBounds(
      grid.geometry()
    )
    .filterDate(
      monthStart,
      monthEnd
    );


var monthlyAOD =
  aodCollection
    .filterBounds(
      grid.geometry()
    )
    .filterDate(
      monthStart,
      monthEnd
    );


print(
  'NO2 images:',
  monthlyNO2.size()
);

print(
  'Cloud images:',
  monthlyCloud.size()
);

print(
  'AOD images:',
  monthlyAOD.size()
);


// ============================================================
// 8. NUMBER OF DAYS IN MONTH
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
// 9. CREATE DAILY IMAGE
// ============================================================

function createDailyImage(
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
  // NO2
  // ==========================================================

  var dailyNO2Collection =
    monthlyNO2.filterDate(
      date,
      nextDate
    );


  var no2Image =
    ee.Image(
      ee.Algorithms.If(

        dailyNO2Collection.size().gt(0),

        dailyNO2Collection
          .select(
            'tropospheric_NO2_column_number_density'
          )
          .mean(),

        ee.Image.constant(0)
          .updateMask(
            ee.Image.constant(0)
          )

      )
    );


  no2Image =
    no2Image.rename(
      ee.String(
        'no2_'
      ).cat(
        dateString
      )
    );


  // ==========================================================
  // CLOUD
  // ==========================================================

  var dailyCloudCollection =
    monthlyCloud.filterDate(
      date,
      nextDate
    );


  var cloudImage =
    ee.Image(
      ee.Algorithms.If(

        dailyCloudCollection.size().gt(0),

        dailyCloudCollection
          .select(
            'cloud_fraction'
          )
          .mean(),

        ee.Image.constant(0)
          .updateMask(
            ee.Image.constant(0)
          )

      )
    );


  cloudImage =
    cloudImage.rename(
      ee.String(
        'cloud_'
      ).cat(
        dateString
      )
    );


  // ==========================================================
  // AOD
  // ==========================================================

  var dailyAODCollection =
    monthlyAOD.filterDate(
      date,
      nextDate
    );


  var qaFilteredAOD =
    dailyAODCollection.map(
      function(image) {

        var qa =
          image.select(
            'AOD_QA'
          );


        var qaBits =
          qa.bitwiseAnd(7);


        var clear =
          qaBits.eq(1);


        return image
          .select(
            'Optical_Depth_055'
          )
          .multiply(0.001)
          .updateMask(
            clear
          );

      }
    );


  var aodImage =
    ee.Image(
      ee.Algorithms.If(

        qaFilteredAOD.size().gt(0),

        qaFilteredAOD.mean(),

        ee.Image.constant(0)
          .updateMask(
            ee.Image.constant(0)
          )

      )
    );


  aodImage =
    aodImage.rename(
      ee.String(
        'aod_'
      ).cat(
        dateString
      )
    );


  // ==========================================================
  // COMBINE
  // ==========================================================

  return ee.Image.cat([

    no2Image,

    cloudImage,

    aodImage

  ])
  .set(
    'system:index',
    dateString
  );

}


// ============================================================
// 10. CREATE DAILY IMAGE COLLECTION
// ============================================================

var days =
  ee.List.sequence(
    0,
    numberOfDays.subtract(1)
  );


var dailySatellite =
  ee.ImageCollection(
    days.map(
      createDailyImage
    )
  );


print(
  'Daily satellite images:',
  dailySatellite.size()
);


// ============================================================
// 11. STACK THIS MONTH ONLY
// ============================================================

var monthlyStack =
  dailySatellite
    .sort(
      'system:index'
    )
    .toBands();


print(
  'Monthly satellite band count:',
  monthlyStack
    .bandNames()
    .size()
);


// ============================================================
// 12. REDUCE TO GRID
// ============================================================

var monthlySatelliteByGrid =
  monthlyStack.reduceRegions({

    collection:
      gridWithLocation,

    reducer:
      ee.Reducer.mean(),

    scale:
      1000,

    tileScale:
      4

  });


print(
  'Monthly grid records:',
  monthlySatelliteByGrid.size()
);


print(
  'Expected:',
  grid.size()
);


print(
  'First record:',
  monthlySatelliteByGrid.first()
);


// ============================================================
// 13. EXPORT
// ============================================================

Export.table.toDrive({

  collection:
    monthlySatelliteByGrid,

  description:
    'Hyderabad_Prototype2_Satellite_' +
    monthLabel,

  folder:
    'NO2_Downscaling_Hackathon/Prototype2/Satellite',

  fileNamePrefix:
    'satellite_' +
    monthLabel,

  fileFormat:
    'CSV'

});