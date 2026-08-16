// ============================================================
// HYDERABAD NO2 DOWNSCALING
// PROTOTYPE 2 — BUILT-UP DENSITY PIPELINE
// ============================================================
//
// TYPE:
//   Static Urban Feature
//
// SOURCE:
//   ESA WorldCover 10m
//
// OUTPUT:
//   grid_id
//   latitude
//   longitude
//   built_up_density
//
// ============================================================


// ============================================================
// 1. LOAD MASTER GRID
// ============================================================

var grid = ee.FeatureCollection(
  'projects/sih-internal-505509/assets/hyderabad_orr_1km_master_grid_v2'
);


print(
  'Grid cells:',
  grid.size()
);


// ============================================================
// 2. ADD LATITUDE / LONGITUDE
// ============================================================

var gridWithLocation =
  grid.map(
    function(cell){

      var centroid =
        cell.geometry()
          .centroid();


      var coords =
        centroid.coordinates();


      return cell.set({

        latitude:
          coords.get(1),

        longitude:
          coords.get(0)

      });

    }
  );


// ============================================================
// 3. LOAD ESA WORLDCOVER
// ============================================================


var worldCover =
  ee.Image(
    'ESA/WorldCover/v200/2021'
  )
  .select(
    'Map'
  );


print(
  'WorldCover image:',
  worldCover
);


print(
  'Classes:',
  worldCover.reduceRegion({

    reducer:
      ee.Reducer.frequencyHistogram(),

    geometry:
      grid.geometry(),

    scale:
      10,

    maxPixels:
      1e9

  })
);


// ============================================================
// 4. CREATE BUILT-UP MASK
// ============================================================
//
// ESA class:
// 50 = Built-up
//
// ============================================================


var builtUp =
  worldCover
    .eq(50)
    .rename(
      'built_up'
    );


Map.centerObject(
  grid,
  10
);


Map.addLayer(
  builtUp,
  {
    min:0,
    max:1,
    palette:[
      'white',
      'red'
    ]
  },
  'Built-up mask'
);


// ============================================================
// 5. CALCULATE BUILT-UP DENSITY
// ============================================================


var builtUpGrid =
  builtUp.reduceRegions({

    collection:
      gridWithLocation,

    reducer:
      ee.Reducer.mean(),

    scale:
      10,

    tileScale:
      8

  });


// ============================================================
// 6. CREATE FINAL DATASET
// ============================================================


builtUpGrid =
  builtUpGrid.map(
    function(feature){

      return ee.Feature(
        null,
        {

          grid_id:
            feature.get(
              'grid_id'
            ),

          latitude:
            feature.get(
              'latitude'
            ),

          longitude:
            feature.get(
              'longitude'
            ),

          built_up_density:
            feature.get(
              'mean'
            )

        }
      );

    }
  );


// ============================================================
// 7. CHECK RESULT
// ============================================================


print(
  '================================'
);

print(
  'BUILT-UP DENSITY DATASET'
);

print(
  '================================'
);


print(
  'Grid records:',
  builtUpGrid.size()
);


print(
  'Expected:',
  grid.size()
);


print(
  'First record:',
  builtUpGrid.first()
);


// ============================================================
// 8. STATISTICS
// ============================================================


print(
  'Built-up density statistics:',
  builtUpGrid.aggregate_stats(
    'built_up_density'
  )
);


// ============================================================
// 9. EXPORT
// ============================================================


Export.table.toDrive({

  collection:
    builtUpGrid,

  description:
    'Hyderabad_Prototype2_Builtup_Density',

  folder:
    'NO2_Downscaling_Hackathon/Prototype2/Urban',

  fileNamePrefix:
    'builtup_density_hyderabad',

  fileFormat:
    'CSV'

});