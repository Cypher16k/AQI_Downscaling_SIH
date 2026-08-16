import pandas as pd
import geopandas as gpd


def load_prediction_data(csv_path):
    """
    Load model prediction output CSV
    """

    df = pd.read_csv(csv_path)

    df["grid_id"] = (
        df["grid_id"]
        .astype(str)
        .str.strip()
    )

    return df



def load_grid_data(shapefile_path):
    """
    Load Hyderabad spatial grid
    """

    grid = gpd.read_file(shapefile_path)

    grid["grid_id"] = (
        grid["grid_id"]
        .astype(str)
        .str.strip()
    )

    return grid



def merge_spatial_data(predictions, grid):

    merged = grid.merge(
        predictions,
        on="grid_id",
        how="inner"
    )

    return merged