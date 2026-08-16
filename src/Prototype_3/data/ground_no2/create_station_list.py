import pandas as pd
import glob
import os


INPUT_DIR = (
    "data/raw/Prototype_3/ground_no2/cpcb"
)

OUTPUT_FILE = (
    "data/processed/Prototype 3/station_list.csv"
)


def main():

    files = glob.glob(
        os.path.join(
            INPUT_DIR,
            "*.csv"
        )
    )

    stations = []


    for file in files:

        print(
            "Reading:",
            file
        )


        df = pd.read_csv(
            file,
            nrows=1
        )


        stations.append({

            "station_id":
                df["Station ID"].iloc[0],

            "station_name":
                df["Station Name"].iloc[0],

            "city":
                df["City"].iloc[0],

            "state":
                df["State"].iloc[0]

        })


    stations = pd.DataFrame(
        stations
    )


    stations = stations.drop_duplicates(
        "station_id"
    )


    os.makedirs(
        os.path.dirname(OUTPUT_FILE),
        exist_ok=True
    )


    stations.to_csv(
        OUTPUT_FILE,
        index=False
    )


    print("\nDONE 🔥")
    print(stations)


if __name__ == "__main__":
    main()