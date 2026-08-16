import pandas as pd
import os


GROUND_FILE = (
    "data/processed/Prototype 3/ground_no2_daily.csv"
)


MAPPING_FILE = (
    "data/processed/Prototype 3/station_grid_mapping.csv"
)


OUTPUT_FILE = (
    "data/processed/Prototype 3/ground_no2_daily_grid.csv"
)



def main():

    print("="*60)
    print("CREATING GROUND NO2 GRID DATASET")
    print("="*60)


    ground = pd.read_csv(
        GROUND_FILE
    )


    mapping = pd.read_csv(
        MAPPING_FILE
    )


    print(
        "Ground records:",
        len(ground)
    )


    print(
        "Stations:",
        len(mapping)
    )


    mapping = mapping[
        [
            "station_id",
            "grid_id",
            "latitude",
            "longitude"
        ]
    ]


    merged = ground.merge(
        mapping,
        on="station_id",
        how="left"
    )


    print(
        "\nMissing grid IDs:",
        merged.grid_id.isna().sum()
    )


    merged = merged[
        [
            "date",
            "station_id",
            "station_name",
            "grid_id",
            "latitude",
            "longitude",
            "ground_no2_mean",
            "valid_readings",
            "coverage_percent"
        ]
    ]


    os.makedirs(
        os.path.dirname(OUTPUT_FILE),
        exist_ok=True
    )


    merged.to_csv(
        OUTPUT_FILE,
        index=False
    )


    print("\nDONE 🔥")

    print(
        "Records:",
        len(merged)
    )


    print(
        merged.head()
    )


if __name__=="__main__":
    main()