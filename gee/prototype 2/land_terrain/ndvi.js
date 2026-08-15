// ============================================================
// HYDERABAD NO2 DOWNSCALING
// PROTOTYPE 2 — NDVI PIPELINE
// ============================================================
//
// SOURCE:
// Sentinel-2 Surface Reflectance
//
// PERIOD:
// Jan-April 2025
//
// OUTPUT:
// grid_id
// latitude
// longitude
// ndvi
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
// 3. LOAD SENTINEL-2
// ============================================================


var s2 =
ee.ImageCollection(
  'COPERNICUS/S2_SR_HARMONIZED'
)
.filterBounds(
  grid.geometry()
)
.filterDate(
  '2025-01-01',
  '2025-05-01'
)
.filter(
  ee.Filter.lt(
    'CLOUDY_PIXEL_PERCENTAGE',
    30
  )
);


print(
  'Sentinel-2 images:',
  s2.size()
);



// ============================================================
// 4. CALCULATE NDVI
// ============================================================


var ndviCollection =
s2.map(
  function(image){

    var ndvi =
      image.normalizedDifference(
        [
          'B8',
          'B4'
        ]
      )
      .rename(
        'NDVI'
      );


    return ndvi.copyProperties(
      image,
      [
        'system:time_start'
      ]
    );

  }
);



var ndvi =
ndviCollection
.mean();



print(
  'Mean NDVI image:',
  ndvi
);



// ============================================================
// 5. VISUAL CHECK
// ============================================================


Map.centerObject(
  grid,
  10
);


Map.addLayer(
  ndvi,
  {
    min:-0.2,
    max:0.8,
    palette:[
      'brown',
      'yellow',
      'green'
    ]
  },
  'NDVI'
);



// ============================================================
// 6. EXTRACT NDVI TO GRID
// ============================================================


var ndviGrid =
ndvi.reduceRegions({

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
// 7. FINAL DATASET
// ============================================================


ndviGrid =
ndviGrid.map(
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

        ndvi:
          feature.get(
            'mean'
          )

      }
    );

  }
);



// ============================================================
// 8. CHECK
// ============================================================


print(
  '================================'
);

print(
  'NDVI DATASET'
);

print(
  '================================'
);


print(
  'Grid records:',
  ndviGrid.size()
);


print(
  'Expected:',
  grid.size()
);


print(
  'First record:',
  ndviGrid.first()
);


print(
  'NDVI statistics:',
  ndviGrid.aggregate_stats(
    'ndvi'
  )
);



// ============================================================
// 9. EXPORT
// ============================================================


Export.table.toDrive({

  collection:
    ndviGrid,

  description:
    'Hyderabad_Prototype2_NDVI',

  folder:
    'NO2_Downscaling_Hackathon/Prototype2/Land',

  fileNamePrefix:
    'ndvi_hyderabad',

  fileFormat:
    'CSV'

});