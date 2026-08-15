"""
Main entry point for Hyderabad NO2 ML pipeline.

Run from project root:

python src/main.py
"""

from data.load_data import load_dataset
from data.validate_data import validate_dataset

from preprocessing.clean_data import clean_data

from features.create_features import select_features

from models.train import train_model


# ==============================
# Configuration
# ==============================

DATA_PATH = "../data/prototype1_hyderabad_ml_dataset_jan2025.csv"


FEATURE_COLUMNS = [
    "temperature_c",
    "wind_speed_m_s",
    "population_density_persons_per_km2",
    "road_density_km_per_km2"
]

TARGET_COLUMN = "no2_mol_m2"


# ==============================
# Pipeline
# ==============================

def main():

    print("=" * 50)
    print("HYDERABAD NO2 ML PIPELINE")
    print("=" * 50)


    # Load dataset
    print("\n[1] Loading dataset...")
    data = load_dataset(DATA_PATH)


    # Validate dataset
    print("\n[2] Validating dataset...")
    validate_dataset(data)


    # Clean dataset
    print("\n[3] Cleaning dataset...")
    data = clean_data(data)


    # Prepare features
    print("\n[4] Preparing features...")

    X, y = select_features(
        data,
        FEATURE_COLUMNS
    )


    print("Input shape:", X.shape)
    print("Target shape:", y.shape)


    # Train model
    print("\n[5] Training model...")

    model = train_model(
        X,
        y
    )


    print("\nPipeline completed successfully!")

    return model



if __name__ == "__main__":
    main()
