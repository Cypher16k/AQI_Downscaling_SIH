// ============================================================
// HYDERABAD NO2 DOWNSCALING
// PROTOTYPE 2 — POPULATION DENSITY PIPELINE
// ============================================================
//
// SOURCE:
// WorldPop 100m Population
//
// OUTPUT:
// grid_id
// latitude
// longitude
// population_density
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
  'Number of cells:',
  grid.size()
);


// ============================================================
// 2. ADD LATITUDE AND LONGITUDE
// ============================================================

var gridWithLocation = grid.map(
  function(feature){

    var centroid =
      feature.geometry()
        .centroid();


    var coords =
      centroid.coordinates();


    return feature.set({

      latitude:
        coords.get(1),

      longitude:
        coords.get(0)

    });

  }
);


// ============================================================
// 3. LOAD INDIA WORLDPOP
// ============================================================


var population =
  ee.Image(
    'WorldPop/GP/100m/pop/IND_2020'
  );


print(
  'Population image:',
  population
);


print(
  'Population bands:',
  population.bandNames()
);


// ============================================================
// 4. TEST SINGLE HYDERABAD POINT
// ============================================================

var testPoint =
  ee.Geometry.Point(
    [
      78.417,
      17.603
    ]
  );


print(
  'WorldPop value at test point:',
  population.sample({

    region:
      testPoint,

    scale:
      100,

    geometries:
      true

  })
);


// ============================================================
// 5. VISUAL CHECK
// ============================================================

Map.centerObject(
  testPoint,
  12
);


Map.addLayer(
  population,
  {

    min:
      0,

    max:
      5000

  },
  'WorldPop Population'
);


Map.addLayer(
  testPoint,
  {
    color:
      'red'
  },
  'Test Point'
);


// ============================================================
// 6. EXTRACT POPULATION TO GRID
// ============================================================
//
// Using SUM because WorldPop represents population counts.
//
// ============================================================


var populationGrid =
  population.reduceRegions({

    collection:
      gridWithLocation,

    reducer:
      ee.Reducer.sum(),

    scale:
      100,

    crs:
      'EPSG:4326',

    tileScale:
      8

  });


print(
  'Raw extracted first record:',
  populationGrid.first()
);


// ============================================================
// 7. CREATE FINAL DATASET
// ============================================================


populationGrid =
  populationGrid.map(
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


          population_density:
            feature.get(
              'sum'
            )

        }
      );


    }
  );


// ============================================================
// 8. CHECK RESULT
// ============================================================


print(
  '================================'
);

print(
  'POPULATION DATASET'
);

print(
  '================================'
);


print(
  'Grid records:',
  populationGrid.size()
);


print(
  'Expected:',
  grid.size()
);


print(
  'First population record:',
  populationGrid.first()
);


// ============================================================
// 9. STATISTICS
// ============================================================


print(
  'Population statistics:',
  populationGrid.aggregate_stats(
    'population_density'
  )
);


// ============================================================
// 10. EXPORT
// ============================================================


Export.table.toDrive({

  collection:
    populationGrid,

  description:
    'Hyderabad_Prototype2_Population',

  folder:
    'NO2_Downscaling_Hackathon/Prototype2/Urban',

  fileNamePrefix:
    'population_density_hyderabad',

  fileFormat:
    'CSV'

});