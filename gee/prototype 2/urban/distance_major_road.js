// ============================================================
// HYDERABAD NO2 DOWNSCALING
// PROTOTYPE 2 — DISTANCE TO ROAD PIPELINE
// ============================================================
//
// SOURCE:
// GRIP4 Roads
//
// OUTPUT:
// grid_id
// latitude
// longitude
// distance_to_road_m
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
// 2. ADD LATITUDE AND LONGITUDE
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
// 3. LOAD GRIP4 ROADS
// ============================================================

var roads =
  ee.FeatureCollection(
    'projects/sat-io/open-datasets/GRIP4/South-East-Asia'
  );


print(
  'Total GRIP4 roads:',
  roads.size()
);


// ============================================================
// 4. FILTER HYDERABAD ROADS
// ============================================================

var hyderabadRoads =
  roads.filterBounds(
    grid.geometry()
  );


print(
  'Hyderabad GRIP4 roads:',
  hyderabadRoads.size()
);


// ============================================================
// 5. USE ALL ROADS
// ============================================================
//
// Reason:
// GRIP4 road density already uses all roads.
// Distance-to-road should represent
// proximity to any traffic source.
//
// ============================================================


var roadGeometry =
  hyderabadRoads.geometry();


print(
  'Road geometry:',
  roadGeometry
);


// ============================================================
// 6. CALCULATE DISTANCE
// ============================================================
//
// Distance:
// grid centroid -> nearest road
//
// Unit:
// meters
//
// ============================================================


var distanceGrid =
  gridWithLocation.map(
    function(cell){

      var centroid =
        cell.geometry()
          .centroid();


      var distance =
        centroid.distance(
          roadGeometry
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

          distance_to_road_m:
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
  'DISTANCE TO ROAD DATASET'
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
  'Distance statistics:',
  distanceGrid.aggregate_stats(
    'distance_to_road_m'
  )
);


// ============================================================
// 8. VISUAL CHECK
// ============================================================


Map.centerObject(
  grid,
  10
);


Map.addLayer(
  hyderabadRoads,
  {
    color:
      'red'
  },
  'GRIP4 Roads'
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
// 9. EXPORT
// ============================================================


Export.table.toDrive({

  collection:
    distanceGrid,

  description:
    'Hyderabad_Prototype2_Distance_Road',

  folder:
    'NO2_Downscaling_Hackathon/Prototype2/Urban',

  fileNamePrefix:
    'distance_to_road_hyderabad',

  fileFormat:
    'CSV'

});