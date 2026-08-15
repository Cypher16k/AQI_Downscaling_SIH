// ============================================================
// HYDERABAD NO2 DOWNSCALING
// PROTOTYPE 2 — ELEVATION PIPELINE
// ============================================================
//
// SOURCE:
// SRTM DEM
//
// OUTPUT:
// grid_id
// latitude
// longitude
// elevation_m
//
// ============================================================


// ============================================================
// 1. LOAD GRID
// ============================================================


var grid =
  ee.FeatureCollection(
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

    var coords =
      cell.geometry()
        .centroid()
        .coordinates();


    return cell.set({

      latitude:
        coords.get(1),

      longitude:
        coords.get(0)

    });

  }
);


// ============================================================
// 3. LOAD SRTM DEM
// ============================================================


var elevation =
  ee.Image(
    'USGS/SRTMGL1_003'
  )
  .select(
    'elevation'
  );


print(
  'Elevation image:',
  elevation
);


// ============================================================
// 4. VISUAL CHECK
// ============================================================


Map.centerObject(
  grid,
  10
);


Map.addLayer(
  elevation,
  {
    min:400,
    max:700
  },
  'Elevation'
);


// ============================================================
// 5. EXTRACT ELEVATION TO GRID
// ============================================================


var elevationGrid =
elevation.reduceRegions({

  collection:
    gridWithLocation,

  reducer:
    ee.Reducer.mean(),

  scale:
    30,

  tileScale:
    8

});


// ============================================================
// 6. FINAL DATASET
// ============================================================


elevationGrid =
elevationGrid.map(
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

        elevation_m:
          feature.get(
            'mean'
          )

      }
    );

  }
);


// ============================================================
// 7. CHECK
// ============================================================


print(
  '================================'
);

print(
  'ELEVATION DATASET'
);

print(
  '================================'
);


print(
  'Grid records:',
  elevationGrid.size()
);


print(
  'Expected:',
  grid.size()
);


print(
  'First record:',
  elevationGrid.first()
);


print(
  'Elevation statistics:',
  elevationGrid.aggregate_stats(
    'elevation_m'
  )
);


// ============================================================
// 8. EXPORT
// ============================================================


Export.table.toDrive({

  collection:
    elevationGrid,

  description:
    'Hyderabad_Prototype2_Elevation',

  folder:
    'NO2_Downscaling_Hackathon/Prototype2/Land',

  fileNamePrefix:
    'elevation_hyderabad',

  fileFormat:
    'CSV'

});