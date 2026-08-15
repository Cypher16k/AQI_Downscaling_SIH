// ============================================================
// HYDERABAD NO2 DOWNSCALING
// PROTOTYPE 2 — LAND COVER FRACTIONS
// ============================================================
//
// SOURCE:
// ESA WorldCover 2021
//
// OUTPUT:
// vegetation_fraction
// builtup_fraction
// water_fraction
// cropland_fraction
// bare_fraction
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
// 2. ADD LAT/LON
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
// 3. LOAD ESA WORLDCOVER
// ============================================================


var landcover =
ee.Image(
  'ESA/WorldCover/v200/2021'
)
.select(
  'Map'
);


print(
  'Landcover image:',
  landcover
);



// ============================================================
// 4. CREATE MASKS
// ============================================================


// Vegetation classes:
// 10 tree
// 20 shrub
// 30 grass
// 90 wetland
// 95 mangrove
// 100 moss


var vegetation =
landcover.eq(10)
.or(landcover.eq(20))
.or(landcover.eq(30))
.or(landcover.eq(90))
.or(landcover.eq(95))
.or(landcover.eq(100));



// Built-up

var builtup =
landcover.eq(50);



// Water

var water =
landcover.eq(80);



// Cropland

var cropland =
landcover.eq(40);



// Bare land

var bare =
landcover.eq(60);



// ============================================================
// 5. CONVERT TO BINARY IMAGES
// ============================================================


var vegetationImg =
vegetation.rename(
  'vegetation'
)
.toFloat();


var builtupImg =
builtup.rename(
  'builtup'
)
.toFloat();


var waterImg =
water.rename(
  'water'
)
.toFloat();


var croplandImg =
cropland.rename(
  'cropland'
)
.toFloat();


var bareImg =
bare.rename(
  'bare'
)
.toFloat();



// ============================================================
// 6. VISUAL CHECK
// ============================================================


Map.centerObject(
  grid,
  10
);


Map.addLayer(
  landcover,
  {},
  'ESA Land Cover'
);



// ============================================================
// 7. FUNCTION TO CALCULATE FRACTION
// ============================================================


function getFraction(image, name){

  return image.reduceRegions({

    collection:
      gridWithLocation,

    reducer:
      ee.Reducer.mean(),

    scale:
      10,

    tileScale:
      8

  })
  .map(
    function(feature){

      return feature.set(
        name,
        feature.get('mean')
      );

    }
  );

}



// ============================================================
// 8. CALCULATE ALL FRACTIONS
// ============================================================


var veg =
getFraction(
  vegetationImg,
  'vegetation_fraction'
);


var built =
getFraction(
  builtupImg,
  'builtup_fraction'
);


var waterFrac =
getFraction(
  waterImg,
  'water_fraction'
);


var crop =
getFraction(
  croplandImg,
  'cropland_fraction'
);


var bareFrac =
getFraction(
  bareImg,
  'bare_fraction'
);



// ============================================================
// 9. MERGE RESULTS
// ============================================================


var landcoverGrid =
gridWithLocation.map(
  function(cell){

    var id =
      cell.get(
        'grid_id'
      );


    var v =
      veg.filter(
        ee.Filter.eq(
          'grid_id',
          id
        )
      )
      .first();


    var b =
      built.filter(
        ee.Filter.eq(
          'grid_id',
          id
        )
      )
      .first();


    var w =
      waterFrac.filter(
        ee.Filter.eq(
          'grid_id',
          id
        )
      )
      .first();


    var c =
      crop.filter(
        ee.Filter.eq(
          'grid_id',
          id
        )
      )
      .first();


    var br =
      bareFrac.filter(
        ee.Filter.eq(
          'grid_id',
          id
        )
      )
      .first();



    return ee.Feature(
      null,
      {

        grid_id:
          id,

        latitude:
          cell.get(
            'latitude'
          ),

        longitude:
          cell.get(
            'longitude'
          ),


        vegetation_fraction:
          v.get(
            'vegetation_fraction'
          ),


        builtup_fraction:
          b.get(
            'builtup_fraction'
          ),


        water_fraction:
          w.get(
            'water_fraction'
          ),


        cropland_fraction:
          c.get(
            'cropland_fraction'
          ),


        bare_fraction:
          br.get(
            'bare_fraction'
          )

      }
    );

  }
);



// ============================================================
// 10. CHECK
// ============================================================


print(
  '================================'
);

print(
  'LAND COVER FRACTION DATASET'
);

print(
  '================================'
);


print(
  'Grid records:',
  landcoverGrid.size()
);


print(
  'Expected:',
  grid.size()
);


print(
  'First record:',
  landcoverGrid.first()
);


print(
  'Vegetation statistics:',
  landcoverGrid.aggregate_stats(
    'vegetation_fraction'
  )
);


print(
  'Built-up statistics:',
  landcoverGrid.aggregate_stats(
    'builtup_fraction'
  )
);



// ============================================================
// 11. EXPORT
// ============================================================


Export.table.toDrive({

  collection:
    landcoverGrid,

  description:
    'Hyderabad_Prototype2_Landcover_Fractions',

  folder:
    'NO2_Downscaling_Hackathon/Prototype2/Land',

  fileNamePrefix:
    'landcover_fractions_hyderabad',

  fileFormat:
    'CSV'

});