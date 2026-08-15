// ============================================================
// HYDERABAD NO2 DOWNSCALING
// PROTOTYPE 2 — DISTANCE TO WATER PIPELINE
// ============================================================
//
// SOURCE:
// JRC Global Surface Water
//
// OUTPUT:
// grid_id
// latitude
// longitude
// distance_to_water_m
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
// 3. LOAD JRC WATER DATA
// ============================================================


var waterOccurrence =
ee.Image(
  'JRC/GSW1_4/GlobalSurfaceWater'
)
.select(
  'occurrence'
);



print(
  'Water occurrence image:',
  waterOccurrence
);



// ============================================================
// 4. CREATE PERMANENT WATER MASK
// ============================================================


var waterMask =
waterOccurrence
  .gt(50);



Map.centerObject(
  grid,
  10
);


Map.addLayer(
  waterMask,
  {
    min:0,
    max:1,
    palette:[
      'white',
      'blue'
    ]
  },
  'Permanent Water'
);



// ============================================================
// 5. GET WATER GEOMETRY
// ============================================================


var waterVector =
waterMask.selfMask()
  .reduceToVectors({

    geometry:
      grid.geometry(),

    scale:
      30,

    geometryType:
      'polygon',

    eightConnected:
      true,

    maxPixels:
      1e9

  });



print(
  'Water polygons:',
  waterVector.size()
);



// ============================================================
// 6. DISTANCE CALCULATION
// ============================================================


var waterGeometry =
waterVector.geometry();



var distanceGrid =
gridWithLocation.map(
  function(cell){

    var centroid =
      cell.geometry()
        .centroid();


    var distance =
      centroid.distance(
        waterGeometry
      );


    return ee.Feature(
      null,
      {

        grid_id:
          cell.get(
            'grid_id'
          ),

        latitude:
          cell.get(
            'latitude'
          ),

        longitude:
          cell.get(
            'longitude'
          ),

        distance_to_water_m:
          distance

      }
    );

  }
);



// ============================================================
// 7. CHECK OUTPUT
// ============================================================


print(
  '================================'
);

print(
  'DISTANCE TO WATER DATASET'
);

print(
  '================================'
);


print(
  'Grid records:',
  distanceGrid.size()
);


print(
  'Expected:',
  grid.size()
);


print(
  'First record:',
  distanceGrid.first()
);


print(
  'Statistics:',
  distanceGrid.aggregate_stats(
    'distance_to_water_m'
  )
);



// ============================================================
// 8. EXPORT
// ============================================================


Export.table.toDrive({

  collection:
    distanceGrid,

  description:
    'Hyderabad_Prototype2_Distance_Water',

  folder:
    'NO2_Downscaling_Hackathon/Prototype2/Land',

  fileNamePrefix:
    'distance_water_hyderabad',

  fileFormat:
    'CSV'

});