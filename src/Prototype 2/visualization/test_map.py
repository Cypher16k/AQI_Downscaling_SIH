from load_data import *
from no2_map import create_no2_map


pred = load_prediction_data(
    "../../data/spatial_predictions.csv"
)


grid = load_grid_data(
    "../../data/hyderabad_orr_1km_mastergrid.shp"
)


gdf = merge_spatial_data(
    pred,
    grid
)


m = create_no2_map(gdf)


m.save(
    "prototype1_no2_map.html"
)

print("Map generated!")