import pandas as pd
import os


INPUT_FILE = (
    "data/processed/Prototype 3/station_list.csv"
)

OUTPUT_FILE = (
    "data/processed/Prototype 3/station_metadata.csv"
)


# Coordinates of Hyderabad CPCB stations
# matched using station names

coordinates = {

"Zoo Park, Hyderabad - TSPCB":
(17.349694,78.451437),

"Bollaram Industrial Area, Hyderabad - TSPCB":
(17.540891,78.358528),

"Central University, Hyderabad - TSPCB":
(17.460103,78.334361),

"ECIL Kapra, Hyderabad - TSPCB":
(17.470000,78.570000),

"ICRISAT Patancheru, Hyderabad - TSPCB":
(17.520000,78.270000),

"IDA Pashamylaram, Hyderabad - TSPCB":
(17.550000,78.220000),

"IITH Kandi, Hyderabad - TSPCB":
(17.590000,78.120000),

"Kokapet, Hyderabad - TSPCB":
(17.420000,78.330000),

"Kompally Municipal Office, Hyderabad - TSPCB":
(17.540000,78.490000),

"Nacharam_TSIIC IALA, Hyderabad - TSPCB":
(17.430000,78.560000),

"New Malakpet, Hyderabad - TSPCB":
(17.370000,78.520000),

"Ramachandrapuram, Hyderabad - TSPCB":
(17.510000,78.300000),

"Sanathnagar, Hyderabad - TSPCB":
(17.460000,78.440000),

"Somajiguda, Hyderabad - TSPCB":
(17.420000,78.450000)

}


def main():

    df = pd.read_csv(
        INPUT_FILE
    )


    df["latitude"] = (
        df["station_name"]
        .map(
            lambda x:
            coordinates[x][0]
            if x in coordinates
            else None
        )
    )


    df["longitude"] = (
        df["station_name"]
        .map(
            lambda x:
            coordinates[x][1]
            if x in coordinates
            else None
        )
    )


    missing = df[
        df["latitude"].isna()
    ]


    if len(missing):

        print(
            "Missing coordinates:"
        )

        print(
            missing["station_name"]
        )


    os.makedirs(
        os.path.dirname(OUTPUT_FILE),
        exist_ok=True
    )


    df.to_csv(
        OUTPUT_FILE,
        index=False
    )


    print("\nDONE 🔥")
    print(df)


if __name__ == "__main__":
    main()