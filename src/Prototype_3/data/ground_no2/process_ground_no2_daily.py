import os
import glob
import pandas as pd


INPUT_DIR = (
    "data/raw/Prototype_3/ground_no2/cpcb"
)

OUTPUT_FILE = (
    "data/processed/Prototype 3/ground_no2_daily.csv"
)


START_DATE = "2025-01-01"
END_DATE = "2025-09-01"


MIN_READINGS_PER_DAY = 72


def process_station(file):

    print("\nProcessing:")
    print(file)


    df = pd.read_csv(file)


    # -------------------------------
    # Extract station information
    # -------------------------------

    station_id = df["Station ID"].iloc[0]

    station_name = df["Station Name"].iloc[0]


    # -------------------------------
    # Find columns
    # -------------------------------

    timestamp_col = None
    no2_col = None


    for col in df.columns:

        if "date" in col.lower() or "time" in col.lower():
            timestamp_col = col


        if "no2" in col.lower():
            no2_col = col


    print(
        "Station:",
        station_name
    )

    print(
        "ID:",
        station_id
    )


    df = df[
        [
            timestamp_col,
            no2_col
        ]
    ]


    df.columns = [
        "datetime",
        "ground_no2"
    ]


    # -------------------------------
    # Cleaning
    # -------------------------------

    df["datetime"] = pd.to_datetime(
        df["datetime"],
        errors="coerce"
    )


    df["ground_no2"] = pd.to_numeric(
        df["ground_no2"],
        errors="coerce"
    )


    df = df.dropna(
        subset=["datetime"]
    )


    # -------------------------------
    # Jan-Aug 2025
    # -------------------------------

    df = df[
        (df.datetime >= START_DATE)
        &
        (df.datetime < END_DATE)
    ]


    if len(df)==0:
        return None


    # -------------------------------
    # Daily aggregation
    # -------------------------------

    df["date"] = (
        df.datetime.dt.date
    )


    daily = (
        df.groupby("date")
        .agg(

            ground_no2_mean=
            (
                "ground_no2",
                "mean"
            ),

            valid_readings=
            (
                "ground_no2",
                lambda x:
                x.notna().sum()
            )

        )
        .reset_index()
    )


    daily["total_readings"] = 96


    daily["coverage_percent"] = (
        daily.valid_readings
        /
        96
        *
        100
    )


    # Remove unreliable days

    daily.loc[
        daily.valid_readings < MIN_READINGS_PER_DAY,
        "ground_no2_mean"
    ] = None


    # Add metadata

    daily["station_id"] = station_id

    daily["station_name"] = station_name


    return daily



def main():

    print("="*60)
    print("GROUND NO2 DAILY PROCESSING")
    print("="*60)


    files = glob.glob(
        os.path.join(
            INPUT_DIR,
            "*.csv"
        )
    )


    print(
        "Files found:",
        len(files)
    )


    results=[]


    for file in files:

        data = process_station(file)

        if data is not None:
            results.append(data)



    final = pd.concat(
        results,
        ignore_index=True
    )


    final = final[
        [
            "date",
            "station_id",
            "station_name",
            "ground_no2_mean",
            "valid_readings",
            "total_readings",
            "coverage_percent"
        ]
    ]


    os.makedirs(
        os.path.dirname(OUTPUT_FILE),
        exist_ok=True
    )


    final.to_csv(
        OUTPUT_FILE,
        index=False
    )


    print("\nDONE 🔥")

    print(
        final.head()
    )


    print(
        "Saved:",
        OUTPUT_FILE
    )



if __name__=="__main__":
    main()