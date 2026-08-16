// ============================================================
// HYDERABAD NO2 DOWNSCALING
// PROTOTYPE 2 — NIGHTTIME LIGHTS PIPELINE
// ============================================================
//
// TYPE:
//   Static Urban Feature
//
// SOURCE:
//   VIIRS DNB Nighttime Lights
//
// OUTPUT:
//   grid_id
//   latitude
//   longitude
//   nighttime_lights
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
// 2. ADD LAT/LON
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
// 3. LOAD VIIRS NIGHTTIME LIGHTS
// ============================================================


var lightsCollection =
  ee.ImageCollection(
    'NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG'
  )
  .filterDate(
    '2025-01-01',
    '2025-05-01'
  );


print(
  'VIIRS image count:',
  lightsCollection.size()
);


print(
  'VIIRS first image:',
  lightsCollection.first()
);


var lights =
  lightsCollection
    .select(
      'avg_rad'
    )
    .mean()
    .unmask(0);


print(
  'Night lights image:',
  lights
);


print(
  'Nighttime lights image:',
  lights
);


// ============================================================
// 4. CHECK IMAGE
// ============================================================


print(
  'Lights projection:',
  lights.projection()
);


// ============================================================
// 5. EXTRACT TO GRID
// ============================================================

var lightsGrid =
  lights.reduceRegions({

    collection:
      gridWithLocation,

    reducer:
      ee.Reducer.mean(),

    scale:
      500,

    crs:
      'EPSG:4326',

    tileScale:
      8

  });


// ============================================================
// 6. RENAME FIELD
// ============================================================


lightsGrid =
  lightsGrid.map(
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

          nighttime_lights:
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
  'NIGHTTIME LIGHT DATASET'
);

print(
  '================================'
);


print(
  'Grid records:',
  lightsGrid.size()
);


print(
  'Expected:',
  grid.size()
);


print(
  'First record:',
  lightsGrid.first()
);


// ============================================================
// 8. STATISTICS
// ============================================================


print(
  'Nighttime light statistics:',
  lightsGrid.aggregate_stats(
    'nighttime_lights'
  )
);


// ============================================================
// 9. VISUAL CHECK
// ============================================================


Map.centerObject(
  grid,
  10
);


Map.addLayer(
  lights,
  {
    min:0,
    max:50
  },
  'VIIRS Night Lights'
);


Map.addLayer(
  grid.style({

    color:
      'blue',

    fillColor:
      '00000000',

    width:
      1

  }),
  {},
  'Grid'
);


// ============================================================
// 10. EXPORT
// ============================================================


Export.table.toDrive({

  collection:
    lightsGrid,

  description:
    'Hyderabad_Prototype2_Nighttime_Lights',

  folder:
    'NO2_Downscaling_Hackathon/Prototype2/Urban',

  fileNamePrefix:
    'nighttime_lights_hyderabad',

  fileFormat:
    'CSV'

});