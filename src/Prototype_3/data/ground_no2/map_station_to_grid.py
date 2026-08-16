import geopandas as gpd
import pandas as pd
import os


# =====================================================
# PATHS
# =====================================================

STATION_FILE = (
    "data/processed/Prototype 3/station_metadata.csv"
)

GRID_FILE = (
    "data/raw/hyderabad_orr_1km_mastergrid/hyderabad_orr_1km_mastergrid.shp"
)

OUTPUT_FILE = (
    "data/processed/Prototype 3/station_grid_mapping.csv"
)


# =====================================================
# MAIN
# =====================================================

def main():

    print("=" * 60)
    print("STATION TO GRID MAPPING")
    print("=" * 60)


    # -------------------------------------------------
    # Load stations
    # -------------------------------------------------

    print("\nLoading stations...")

    stations = pd.read_csv(
        STATION_FILE
    )


    print(
        "Stations:",
        len(stations)
    )


    # Create geometry points

    geometry = gpd.points_from_xy(
        stations["longitude"],
        stations["latitude"]
    )


    stations_gdf = gpd.GeoDataFrame(
        stations,
        geometry=geometry,
        crs="EPSG:4326"
    )


    # -------------------------------------------------
    # Load grid
    # -------------------------------------------------

    print("\nLoading grid...")


    grid = gpd.read_file(
        GRID_FILE
    )


    print(
        "Grid cells:",
        len(grid)
    )


    grid = grid.to_crs(
        "EPSG:4326"
    )


    # -------------------------------------------------
    # Spatial join
    # -------------------------------------------------

    print(
        "\nPerforming spatial join..."
    )


    mapped = gpd.sjoin(
        stations_gdf,

        grid[
            [
                "grid_id",
                "geometry"
            ]
        ],

        how="left",

        predicate="within"
    )


    # -------------------------------------------------
    # Nearest grid fallback
    # -------------------------------------------------

    missing = mapped[
        mapped["grid_id"].isna()
    ]


    print(
        "\nUnmatched stations before fallback:",
        len(missing)
    )


    if len(missing) > 0:

        print(
            "\nApplying nearest grid fallback..."
        )


        # Use projected CRS for distance calculation

        grid_projected = grid.to_crs(
            "EPSG:3857"
        )


        grid_centroids = grid_projected.copy()


        grid_centroids["geometry"] = (
            grid_centroids.geometry.centroid
        )


        missing_projected = (
            missing.to_crs(
                "EPSG:3857"
            )
        )


        for idx, row in missing_projected.iterrows():


            distances = (
                grid_centroids.geometry
                .distance(row.geometry)
            )


            nearest_idx = (
                distances
                .idxmin()
            )


            nearest_grid = (
                grid_centroids
                .loc[
                    nearest_idx,
                    "grid_id"
                ]
            )


            mapped.loc[
                idx,
                "grid_id"
            ] = nearest_grid


            print(
                row["station_name"],
                "→",
                nearest_grid
            )


    # -------------------------------------------------
    # Final check
    # -------------------------------------------------

    remaining = (
        mapped["grid_id"]
        .isna()
        .sum()
    )


    print(
        "\nUnmatched stations after fallback:",
        remaining
    )


    # -------------------------------------------------
    # Save output
    # -------------------------------------------------

    output = pd.DataFrame(
    mapped.drop(
        columns=[
            "geometry",
            "index_right"
        ],
        errors="ignore"
    )
)


    output = output[
    [
        "station_id",
        "station_name",
        "latitude",
        "longitude",
        "grid_id"
    ]
]


    os.makedirs(
        os.path.dirname(OUTPUT_FILE),
        exist_ok=True
    )


    output.to_csv(
        OUTPUT_FILE,
        index=False
    )


    print(
        "\nDONE 🔥"
    )


    print(
        "Saved:"
    )

    print(
        OUTPUT_FILE
    )


    print(
        "\nFinal Mapping:"
    )

    print(
        output[
            [
                "station_name",
                "grid_id"
            ]
        ]
    )


# =====================================================
# RUN
# =====================================================

if __name__ == "__main__":

    main()