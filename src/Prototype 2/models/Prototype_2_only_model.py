# Prototype 2 ML Models
# Extracted from Prototype_2.ipynb
#
# Contains model training, tuning, prediction and evaluation code.
# Dataset preparation and feature engineering remain separate.

# ============================================================
# PROTOTYPE 2 — BASELINE MODEL LEADERBOARD
# Extra Trees vs Random Forest vs XGBoost
# ============================================================

import numpy as np
import pandas as pd

from sklearn.ensemble import ExtraTreesRegressor, RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from xgboost import XGBRegressor


# ------------------------------------------------------------
# 1. DEFINE FEATURES
# ------------------------------------------------------------

target = "satellite_no2"

# Do NOT use grid_id or date as ML features.
# Latitude/longitude are retained as spatial predictors.
feature_cols = [
    "aod_interp",
    "cloud",
    "boundary_layer_height",
    "dew_point",
    "precipitation",
    "relative_humidity",
    "solar_radiation",
    "surface_pressure",
    "temperature",
    "wind_direction",
    "wind_speed",
    "bare_fraction",
    "builtup_fraction",
    "cropland_fraction",
    "vegetation_fraction",
    "water_fraction",
    "ndvi",
    "elevation_m",
    "distance_to_water_m",
    "built_up_density",
    "nighttime_lights",
    "population_density",
    "road_density_km_per_km2",
    "distance_to_road_m",
    "latitude",
    "longitude"
]

# Safety check
missing_features = [
    c for c in feature_cols
    if c not in train_data.columns
]

print("=" * 80)
print("FEATURE CHECK")
print("=" * 80)

print(f"Features requested : {len(feature_cols)}")
print(f"Missing features   : {missing_features}")

assert len(missing_features) == 0
assert train_data[feature_cols].isna().sum().sum() == 0
assert val_data[feature_cols].isna().sum().sum() == 0
assert test_data[feature_cols].isna().sum().sum() == 0


# ------------------------------------------------------------
# 2. CREATE X / y
# ------------------------------------------------------------

X_train = train_data[feature_cols]
y_train = train_data[target]

X_val = val_data[feature_cols]
y_val = val_data[target]

X_test = test_data[feature_cols]
y_test = test_data[target]


print("\nDATA")
print(f"Train : {X_train.shape}")
print(f"Val   : {X_val.shape}")
print(f"Test  : {X_test.shape}")


# ------------------------------------------------------------
# 3. DEFINE BASELINE MODELS
# ------------------------------------------------------------

models = {

    "Extra Trees": ExtraTreesRegressor(
        n_estimators=300,
        random_state=42,
        n_jobs=-1
    ),

    "Random Forest": RandomForestRegressor(
        n_estimators=300,
        random_state=42,
        n_jobs=-1
    ),

    "XGBoost": XGBRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1
    )
}


# ------------------------------------------------------------
# 4. TRAIN + VALIDATION LEADERBOARD
# ------------------------------------------------------------

results = []
trained_models = {}

print("\n" + "=" * 80)
print("BASELINE MODEL TRAINING")
print("=" * 80)

for name, model in models.items():

    print(f"\nTraining: {name}")

    model.fit(X_train, y_train)

    pred_val = model.predict(X_val)

    rmse = np.sqrt(
        mean_squared_error(y_val, pred_val)
    )

    mae = mean_absolute_error(
        y_val, pred_val
    )

    r2 = r2_score(
        y_val, pred_val
    )

    results.append({
        "Model": name,
        "Validation_RMSE": rmse,
        "Validation_MAE": mae,
        "Validation_R2": r2
    })

    trained_models[name] = model

    print(f"RMSE : {rmse:.10f}")
    print(f"MAE  : {mae:.10f}")
    print(f"R²   : {r2:.6f}")


# ------------------------------------------------------------
# 5. LEADERBOARD
# ------------------------------------------------------------

leaderboard = (
    pd.DataFrame(results)
    .sort_values("Validation_RMSE")
    .reset_index(drop=True)
)

print("\n" + "=" * 80)
print("PROTOTYPE 2 — VALIDATION LEADERBOARD")
print("=" * 80)

display(leaderboard)


# ============================================================
# PROTOTYPE 2 — BASELINE MODEL LEADERBOARD
# Extra Trees vs Random Forest vs XGBoost
# ============================================================

import numpy as np
import pandas as pd

from sklearn.ensemble import ExtraTreesRegressor, RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from xgboost import XGBRegressor


# ============================================================
# 1. FEATURES
# ============================================================

target = "satellite_no2"

feature_cols = [
    "aod",
    "cloud",
    "boundary_layer_height",
    "dew_point",
    "precipitation",
    "relative_humidity",
    "solar_radiation",
    "surface_pressure",
    "temperature",
    "wind_direction",
    "wind_speed",
    "bare_fraction",
    "builtup_fraction",
    "cropland_fraction",
    "vegetation_fraction",
    "water_fraction",
    "ndvi",
    "elevation_m",
    "distance_to_water_m",
    "built_up_density",
    "nighttime_lights",
    "population_density",
    "road_density_km_per_km2",
    "distance_to_road_m",
    "latitude",
    "longitude"
]


# ============================================================
# 2. SAFETY CHECKS
# ============================================================

missing_features = [
    col for col in feature_cols
    if col not in train_data.columns
]

print("=" * 80)
print("FEATURE CHECK")
print("=" * 80)

print(f"Features requested : {len(feature_cols)}")
print(f"Missing features   : {missing_features}")

assert len(missing_features) == 0

assert train_data[feature_cols].isna().sum().sum() == 0
assert val_data[feature_cols].isna().sum().sum() == 0
assert test_data[feature_cols].isna().sum().sum() == 0

print("✓ All features present")
print("✓ No missing predictor values")


# ============================================================
# 3. X / y
# ============================================================

X_train = train_data[feature_cols]
y_train = train_data[target]

X_val = val_data[feature_cols]
y_val = val_data[target]

X_test = test_data[feature_cols]
y_test = test_data[target]

print("\nDATA SHAPES")
print(f"Train : {X_train.shape}")
print(f"Val   : {X_val.shape}")
print(f"Test  : {X_test.shape}")


# ============================================================
# 4. BASELINE MODELS
# ============================================================

models = {

    "Extra Trees": ExtraTreesRegressor(
        n_estimators=300,
        random_state=42,
        n_jobs=-1
    ),

    "Random Forest": RandomForestRegressor(
        n_estimators=300,
        random_state=42,
        n_jobs=-1
    ),

    "XGBoost": XGBRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1
    )
}


# ============================================================
# 5. TRAIN + VALIDATION
# ============================================================

results = []
trained_models = {}

print("\n" + "=" * 80)
print("BASELINE MODEL TRAINING")
print("=" * 80)

for name, model in models.items():

    print(f"\nTraining: {name}")

    model.fit(X_train, y_train)

    pred_val = model.predict(X_val)

    rmse = np.sqrt(
        mean_squared_error(y_val, pred_val)
    )

    mae = mean_absolute_error(
        y_val, pred_val
    )

    r2 = r2_score(
        y_val, pred_val
    )

    results.append({
        "Model": name,
        "Validation_RMSE": rmse,
        "Validation_MAE": mae,
        "Validation_R2": r2
    })

    trained_models[name] = model

    print(f"RMSE : {rmse:.10f}")
    print(f"MAE  : {mae:.10f}")
    print(f"R²   : {r2:.6f}")


# ============================================================
# 6. LEADERBOARD
# ============================================================

leaderboard = (
    pd.DataFrame(results)
    .sort_values("Validation_RMSE")
    .reset_index(drop=True)
)

print("\n" + "=" * 80)
print("PROTOTYPE 2 — VALIDATION LEADERBOARD")
print("=" * 80)

display(leaderboard)


# ============================================================
# PROTOTYPE 2 — XGBOOST TUNING
# Validation-driven tuning
# TEST SET REMAINS UNTOUCHED
# ============================================================

import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from itertools import product
from time import time

# ------------------------------------------------------------
# 1. TUNING GRID
# ------------------------------------------------------------

param_grid = {
    "n_estimators": [300, 600],
    "max_depth": [3, 5, 7],
    "learning_rate": [0.03, 0.05],
    "min_child_weight": [1, 5],
    "subsample": [0.8],
    "colsample_bytree": [0.8],
    "gamma": [0],
    "reg_alpha": [0],
    "reg_lambda": [1, 5]
}

keys = list(param_grid.keys())
combinations = list(product(*[param_grid[k] for k in keys]))

print("=" * 80)
print("XGBOOST HYPERPARAMETER TUNING")
print("=" * 80)
print(f"Configurations to test : {len(combinations)}")
print("Selection metric       : Validation RMSE")
print("Test set               : LOCKED / UNTOUCHED")


# ------------------------------------------------------------
# 2. RUN VALIDATION SEARCH
# ------------------------------------------------------------

tuning_results = []

for i, values in enumerate(combinations, 1):

    params = dict(zip(keys, values))

    start = time()

    model = XGBRegressor(
        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1,
        **params
    )

    model.fit(
        X_train,
        y_train,
        verbose=False
    )

    pred_val = model.predict(X_val)

    rmse = np.sqrt(
        mean_squared_error(y_val, pred_val)
    )

    mae = mean_absolute_error(
        y_val, pred_val
    )

    r2 = r2_score(
        y_val, pred_val
    )

    tuning_results.append({
        **params,
        "Validation_RMSE": rmse,
        "Validation_MAE": mae,
        "Validation_R2": r2,
        "Time_sec": time() - start
    })

    print(
        f"[{i:03d}/{len(combinations)}] "
        f"RMSE={rmse:.10f} | "
        f"R²={r2:.6f}"
    )


# ------------------------------------------------------------
# 3. SORT RESULTS
# ------------------------------------------------------------

xgb_tuning_results = (
    pd.DataFrame(tuning_results)
    .sort_values("Validation_RMSE")
    .reset_index(drop=True)
)

print("\n" + "=" * 80)
print("XGBOOST TUNING RESULTS — TOP 10")
print("=" * 80)

display(
    xgb_tuning_results.head(10)
)


# ============================================================
# PROTOTYPE 2 — XGBOOST FINE TUNING
# Focused search around the best validation configuration
# TEST SET REMAINS COMPLETELY UNTOUCHED
# ============================================================

import numpy as np
import pandas as pd
from itertools import product
from time import time

from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


# ------------------------------------------------------------
# 1. FOCUSED SEARCH SPACE
# ------------------------------------------------------------

fine_grid = {
    "n_estimators": [600, 900, 1200],
    "max_depth": [6, 7, 8],
    "learning_rate": [0.02, 0.03, 0.05],
    "min_child_weight": [1, 3, 5, 8],
    "subsample": [0.75, 0.85],
    "colsample_bytree": [0.75, 0.85],
    "reg_lambda": [1, 3, 5]
}

keys = list(fine_grid.keys())

fine_combinations = list(
    product(*[fine_grid[k] for k in keys])
)

print("=" * 80)
print("XGBOOST FINE-TUNING")
print("=" * 80)

print(f"Configurations : {len(fine_combinations)}")
print("Metric         : Validation RMSE")
print("Test set       : LOCKED")


# ------------------------------------------------------------
# 2. RUN FINE-TUNING
# ------------------------------------------------------------

fine_results = []

for i, values in enumerate(fine_combinations, 1):

    params = dict(zip(keys, values))

    start = time()

    model = XGBRegressor(
        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1,
        gamma=0,
        reg_alpha=0,
        **params
    )

    model.fit(
        X_train,
        y_train,
        verbose=False
    )

    pred_val = model.predict(X_val)

    rmse = np.sqrt(
        mean_squared_error(y_val, pred_val)
    )

    mae = mean_absolute_error(
        y_val, pred_val
    )

    r2 = r2_score(
        y_val, pred_val
    )

    fine_results.append({
        **params,
        "Validation_RMSE": rmse,
        "Validation_MAE": mae,
        "Validation_R2": r2,
        "Time_sec": time() - start
    })

    print(
        f"[{i:03d}/{len(fine_combinations)}] "
        f"RMSE={rmse:.10f} | "
        f"R²={r2:.6f}"
    )


# ------------------------------------------------------------
# 3. RANK RESULTS
# ------------------------------------------------------------

xgb_fine_results = (
    pd.DataFrame(fine_results)
    .sort_values(
        ["Validation_RMSE", "Validation_MAE"],
        ascending=True
    )
    .reset_index(drop=True)
)


# ------------------------------------------------------------
# 4. TOP 10
# ------------------------------------------------------------

print("\n" + "=" * 80)
print("XGBOOST FINE-TUNING — TOP 10")
print("=" * 80)

display(
    xgb_fine_results.head(10)
)


# ============================================================
# PROTOTYPE 2 — FINAL UNSEEN SPATIAL TEST
# EXTRA TREES
# ============================================================

import numpy as np
import pandas as pd

from sklearn.ensemble import ExtraTreesRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


# ============================================================
# 1. CONFIRM TEST SET IS STILL UNTOUCHED
# ============================================================

print("=" * 80)
print("FINAL EXTRA TREES — UNSEEN TEST EVALUATION")
print("=" * 80)

print(f"Training samples   : {len(X_train):,}")
print(f"Validation samples : {len(X_val):,}")
print(f"Test samples       : {len(X_test):,}")

print("\nTest grid cells:")
print(f"Train ∩ Test : {len(set(train_data['grid_id']) & set(test_data['grid_id']))}")
print(f"Val   ∩ Test : {len(set(val_data['grid_id']) & set(test_data['grid_id']))}")

assert len(set(train_data["grid_id"]) & set(test_data["grid_id"])) == 0
assert len(set(val_data["grid_id"]) & set(test_data["grid_id"])) == 0

print("\n✓ Test grid cells are spatially unseen")


# ============================================================
# 2. TRAIN LOCKED EXTRA TREES
# ============================================================

final_extra_trees = ExtraTreesRegressor(
    n_estimators=300,
    random_state=42,
    n_jobs=-1
)

print("\nTraining final Extra Trees model...")

final_extra_trees.fit(
    X_train,
    y_train
)

print("✓ Training complete")


# ============================================================
# 3. PREDICT HIDDEN TEST DATA
# ============================================================

print("\nGenerating predictions on hidden test set...")

test_predictions = final_extra_trees.predict(X_test)


# ============================================================
# 4. FINAL TEST METRICS
# ============================================================

test_rmse = np.sqrt(
    mean_squared_error(y_test, test_predictions)
)

test_mae = mean_absolute_error(
    y_test,
    test_predictions
)

test_r2 = r2_score(
    y_test,
    test_predictions
)


# ============================================================
# 5. FINAL RESULT
# ============================================================

print("\n" + "=" * 80)
print("PROTOTYPE 2 — FINAL EXTRA TREES TEST RESULT")
print("=" * 80)

print(f"Test samples : {len(y_test):,}")
print(f"RMSE         : {test_rmse:.10f}")
print(f"MAE          : {test_mae:.10f}")
print(f"R²           : {test_r2:.6f}")

print("\n✓ Test set evaluated")
print("✓ Test set was not used for tuning")
print("✓ Test grid cells were spatially unseen")


# ============================================================
# PROTOTYPE 2 — RANDOM FOREST FINAL TEST
# ============================================================

import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


print("=" * 80)
print("PROTOTYPE 2 — RANDOM FOREST TEST RESULT")
print("=" * 80)


# Train locked Random Forest

final_rf = RandomForestRegressor(
    n_estimators=300,
    random_state=42,
    n_jobs=-1
)


print("Training Random Forest...")

final_rf.fit(
    X_train,
    y_train
)

print("✓ Training complete")


# Predict hidden test

rf_test_predictions = final_rf.predict(
    X_test
)


# Metrics

rf_rmse = np.sqrt(
    mean_squared_error(
        y_test,
        rf_test_predictions
    )
)

rf_mae = mean_absolute_error(
    y_test,
    rf_test_predictions
)

rf_r2 = r2_score(
    y_test,
    rf_test_predictions
)


print("\nFINAL RANDOM FOREST TEST")
print("-"*50)

print(f"Test samples : {len(y_test):,}")
print(f"RMSE         : {rf_rmse:.10f}")
print(f"MAE          : {rf_mae:.10f}")
print(f"R²           : {rf_r2:.6f}")


print("\nPrediction distribution")
print("-"*50)

print(
    pd.Series(rf_test_predictions).describe()
)


# ============================================================
# EXTRA TREES — CYCLIC SPATIAL FEATURES
# ============================================================

from sklearn.ensemble import ExtraTreesRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

spatial_et = ExtraTreesRegressor(
    n_estimators=300,
    random_state=42,
    n_jobs=-1
)

print("Training Extra Trees with cyclic spatial features...")

spatial_et.fit(
    X_train_spatial,
    y_train_spatial
)

print("✓ Training complete")


# ============================================================
# FINAL SPATIAL HOLDOUT TEST
# ============================================================

test_pred_spatial = spatial_et.predict(X_test_spatial)

test_rmse_spatial = np.sqrt(
    mean_squared_error(y_test_spatial, test_pred_spatial)
)

test_mae_spatial = mean_absolute_error(
    y_test_spatial,
    test_pred_spatial
)

test_r2_spatial = r2_score(
    y_test_spatial,
    test_pred_spatial
)

print("=" * 80)
print("PROTOTYPE 2 — CYCLIC SPATIAL EXTRA TREES TEST")
print("=" * 80)

print(f"Test samples : {len(y_test_spatial):,}")
print(f"RMSE         : {test_rmse_spatial:.10f}")
print(f"MAE          : {test_mae_spatial:.10f}")
print(f"R²           : {test_r2_spatial:.6f}")


# ============================================================
# PROTOTYPE 2 — DIAGONAL SPATIAL EXTRA TREES
# TRAIN: NE + SW
# TEST : NW + SE
# ============================================================

from sklearn.ensemble import ExtraTreesRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np
import pandas as pd

# ------------------------------------------------------------
# Features
# ------------------------------------------------------------

feature_cols = [
    "aod",
    "cloud",
    "boundary_layer_height",
    "dew_point",
    "precipitation",
    "relative_humidity",
    "solar_radiation",
    "surface_pressure",
    "temperature",
    "wind_direction",
    "wind_speed",
    "bare_fraction",
    "builtup_fraction",
    "cropland_fraction",
    "vegetation_fraction",
    "water_fraction",
    "ndvi",
    "elevation_m",
    "distance_to_water_m",
    "built_up_density",
    "nighttime_lights",
    "population_density",
    "road_density_km_per_km2",
    "distance_to_road_m"
]

target_col = "satellite_no2"

# ------------------------------------------------------------
# Build matrices
# ------------------------------------------------------------

X_train = train_data[feature_cols]
y_train = train_data[target_col]

X_test = test_data[feature_cols]
y_test = test_data[target_col]

print("=" * 75)
print("PROTOTYPE 2 — DIAGONAL SPATIAL EXTRA TREES")
print("=" * 75)

print(f"Train samples : {len(X_train):,}")
print(f"Test samples  : {len(X_test):,}")
print(f"Features      : {len(feature_cols)}")

# ------------------------------------------------------------
# Train
# ------------------------------------------------------------

print("\nTraining Extra Trees...")

model_diagonal = ExtraTreesRegressor(
    n_estimators=500,
    max_features=1.0,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

model_diagonal.fit(X_train, y_train)

print("✓ Training complete")

# ------------------------------------------------------------
# Predict completely unseen grids
# ------------------------------------------------------------

y_pred = model_diagonal.predict(X_test)

# ------------------------------------------------------------
# Metrics
# ------------------------------------------------------------

rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("\n" + "=" * 75)
print("DIAGONAL SPATIAL TEST RESULT")
print("=" * 75)

print(f"Test samples : {len(y_test):,}")
print(f"RMSE         : {rmse:.10f}")
print(f"MAE          : {mae:.10f}")
print(f"R²           : {r2:.6f}")

print("\nSpatial guarantee:")
print(f"Train grids  : {train_data['grid_id'].nunique():,}")
print(f"Test grids   : {test_data['grid_id'].nunique():,}")
print(
    f"Grid overlap : "
    f"{len(set(train_data['grid_id']) & set(test_data['grid_id']))}"
)

print("\nPrediction distribution:")
print(pd.Series(y_pred).describe())

# ------------------------------------------------------------
# Baseline comparison
# ------------------------------------------------------------

baseline_pred = np.full(
    len(y_test),
    y_train.mean()
)

baseline_rmse = np.sqrt(
    mean_squared_error(y_test, baseline_pred)
)

baseline_mae = mean_absolute_error(
    y_test,
    baseline_pred
)

baseline_r2 = r2_score(
    y_test,
    baseline_pred
)

print("\n" + "=" * 75)
print("BASELINE COMPARISON")
print("=" * 75)

print(f"Baseline RMSE : {baseline_rmse:.10f}")
print(f"Baseline MAE  : {baseline_mae:.10f}")
print(f"Baseline R²   : {baseline_r2:.6f}")

print("\nExtra Trees:")
print(f"RMSE          : {rmse:.10f}")
print(f"MAE           : {mae:.10f}")
print(f"R²            : {r2:.6f}")

print("\nImprovement:")
print(
    f"RMSE improvement: "
    f"{(1 - rmse / baseline_rmse) * 100:.2f}%"
)

print(
    f"MAE improvement : "
    f"{(1 - mae / baseline_mae) * 100:.2f}%"
)


# ============================================================
# PROTOTYPE 2 — REVERSE DIAGONAL EXTRA TREES TEST
# TRAIN: NW + SE
# TEST : NE + SW
# ============================================================

from sklearn.ensemble import ExtraTreesRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np

# Same predictor columns as previous experiment
X_train = train_data[feature_cols].copy()
y_train = train_data["satellite_no2"].copy()

X_test = test_data[feature_cols].copy()
y_test = test_data["satellite_no2"].copy()

print("=" * 75)
print("PROTOTYPE 2 — REVERSE DIAGONAL EXTRA TREES")
print("=" * 75)

print(f"Train samples : {len(X_train):,}")
print(f"Test samples  : {len(X_test):,}")
print(f"Features      : {len(feature_cols)}")

# ------------------------------------------------------------
# SAME MODEL CONFIGURATION AS THE PREVIOUS 0.7166 EXPERIMENT
# ------------------------------------------------------------

model_reverse = ExtraTreesRegressor(
    n_estimators=500,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features=1.0,
    random_state=42,
    n_jobs=-1
)

print("\nTraining Extra Trees...")
model_reverse.fit(X_train, y_train)

print("✓ Training complete")

# ------------------------------------------------------------
# TEST — NEVER USED FOR TRAINING
# ------------------------------------------------------------

y_pred = model_reverse.predict(X_test)

rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("\n" + "=" * 75)
print("REVERSE DIAGONAL TEST RESULT")
print("=" * 75)

print(f"Test samples : {len(y_test):,}")
print(f"RMSE         : {rmse:.10f}")
print(f"MAE          : {mae:.10f}")
print(f"R²           : {r2:.6f}")

print("\nSpatial guarantee:")
print(f"Train grids  : {len(train_grids):,}")
print(f"Test grids   : {len(test_grids):,}")
print(f"Grid overlap : {len(train_grids.intersection(test_grids))}")

# ------------------------------------------------------------
# PREDICTION DISTRIBUTION
# ------------------------------------------------------------

print("\nPrediction distribution:")
print(
    pd.Series(y_pred).describe()
)

# ------------------------------------------------------------
# BASELINE
# ------------------------------------------------------------

baseline_pred = np.full(
    len(y_test),
    y_train.mean()
)

baseline_rmse = np.sqrt(
    mean_squared_error(y_test, baseline_pred)
)

baseline_mae = mean_absolute_error(
    y_test,
    baseline_pred
)

baseline_r2 = r2_score(
    y_test,
    baseline_pred
)

print("\n" + "=" * 75)
print("BASELINE COMPARISON")
print("=" * 75)

print(f"Baseline RMSE : {baseline_rmse:.10f}")
print(f"Baseline MAE  : {baseline_mae:.10f}")
print(f"Baseline R²   : {baseline_r2:.6f}")

print("\nExtra Trees:")
print(f"RMSE          : {rmse:.10f}")
print(f"MAE           : {mae:.10f}")
print(f"R²            : {r2:.6f}")

rmse_improvement = (
    (baseline_rmse - rmse) / baseline_rmse * 100
)

mae_improvement = (
    (baseline_mae - mae) / baseline_mae * 100
)

print("\nImprovement:")
print(f"RMSE improvement : {rmse_improvement:.2f}%")
print(f"MAE improvement  : {mae_improvement:.2f}%")


# ============================================================
# PROTOTYPE 2 — 4-WAY SPATIAL LEAVE-ONE-QUADRANT-OUT
# ============================================================

import numpy as np
import pandas as pd

from sklearn.ensemble import ExtraTreesRegressor
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score
)

print("=" * 80)
print("PROTOTYPE 2 — 4-WAY SPATIAL VALIDATION")
print("=" * 80)

# ------------------------------------------------------------
# QUADRANT DEFINITIONS
# ------------------------------------------------------------

quadrants = ["NW", "NE", "SW", "SE"]

experiments = {
    "SE": ["NW", "NE", "SW"],
    "SW": ["NW", "NE", "SE"],
    "NE": ["NW", "SW", "SE"],
    "NW": ["NE", "SW", "SE"],
}

results = []

# ------------------------------------------------------------
# GRID REFERENCE
# ------------------------------------------------------------

grid_ref = (
    df[["grid_id", "latitude", "longitude"]]
    .drop_duplicates("grid_id")
    .copy()
)

# Use the SAME midpoint used for the diagonal experiments
lat_mid = df["latitude"].median()
lon_mid = df["longitude"].median()

grid_ref["quadrant"] = np.select(
    [
        (grid_ref["latitude"] >= lat_mid) &
        (grid_ref["longitude"] < lon_mid),

        (grid_ref["latitude"] >= lat_mid) &
        (grid_ref["longitude"] >= lon_mid),

        (grid_ref["latitude"] < lat_mid) &
        (grid_ref["longitude"] < lon_mid),

        (grid_ref["latitude"] < lat_mid) &
        (grid_ref["longitude"] >= lon_mid),
    ],
    ["NW", "NE", "SW", "SE"],
    default="UNKNOWN"
)

# ------------------------------------------------------------
# RUN FOUR EXPERIMENTS
# ------------------------------------------------------------

for test_quadrant, train_quadrants in experiments.items():

    print("\n" + "=" * 80)
    print(f"TEST QUADRANT: {test_quadrant}")
    print(f"TRAIN QUADRANTS: {' + '.join(train_quadrants)}")
    print("=" * 80)

    # --------------------------------------------
    # GRID SPLIT
    # --------------------------------------------

    train_grids = set(
        grid_ref.loc[
            grid_ref["quadrant"].isin(train_quadrants),
            "grid_id"
        ]
    )

    test_grids = set(
        grid_ref.loc[
            grid_ref["quadrant"] == test_quadrant,
            "grid_id"
        ]
    )

    overlap = train_grids.intersection(test_grids)

    assert len(overlap) == 0, (
        f"GRID LEAKAGE! {len(overlap)} overlapping grids"
    )

    train_split = df[df["grid_id"].isin(train_grids)].copy()
    test_split = df[df["grid_id"].isin(test_grids)].copy()

    # --------------------------------------------
    # TARGET
    # --------------------------------------------

    y_train = train_split["satellite_no2"]
    y_test = test_split["satellite_no2"]

    # --------------------------------------------
    # FEATURES
    # --------------------------------------------

    X_train = train_split[feature_cols]
    X_test = test_split[feature_cols]

    assert X_train.isna().sum().sum() == 0
    assert X_test.isna().sum().sum() == 0
    assert y_train.isna().sum() == 0
    assert y_test.isna().sum() == 0

    # --------------------------------------------
    # FRESH MODEL
    # --------------------------------------------

    model = ExtraTreesRegressor(
        n_estimators=500,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        max_features=1.0,
        random_state=42,
        n_jobs=-1
    )

    print(f"Train samples : {len(train_split):,}")
    print(f"Test samples  : {len(test_split):,}")
    print(f"Train grids   : {len(train_grids):,}")
    print(f"Test grids    : {len(test_grids):,}")

    print("\nTraining...")
    model.fit(X_train, y_train)

    # --------------------------------------------
    # PREDICTION
    # --------------------------------------------

    y_pred = model.predict(X_test)

    rmse = np.sqrt(
        mean_squared_error(y_test, y_pred)
    )

    mae = mean_absolute_error(
        y_test, y_pred
    )

    r2 = r2_score(
        y_test, y_pred
    )

    # --------------------------------------------
    # BASELINE
    # --------------------------------------------

    baseline_pred = np.full(
        len(y_test),
        y_train.mean()
    )

    baseline_rmse = np.sqrt(
        mean_squared_error(
            y_test,
            baseline_pred
        )
    )

    baseline_mae = mean_absolute_error(
        y_test,
        baseline_pred
    )

    baseline_r2 = r2_score(
        y_test,
        baseline_pred
    )

    rmse_improvement = (
        (baseline_rmse - rmse)
        / baseline_rmse * 100
    )

    mae_improvement = (
        (baseline_mae - mae)
        / baseline_mae * 100
    )

    # --------------------------------------------
    # OUTPUT
    # --------------------------------------------

    print("\nRESULT")
    print("-" * 60)

    print(f"RMSE : {rmse:.10f}")
    print(f"MAE  : {mae:.10f}")
    print(f"R²   : {r2:.6f}")

    print("\nBaseline")
    print(f"RMSE : {baseline_rmse:.10f}")
    print(f"MAE  : {baseline_mae:.10f}")
    print(f"R²   : {baseline_r2:.6f}")

    print("\nImprovement")
    print(f"RMSE : {rmse_improvement:.2f}%")
    print(f"MAE  : {mae_improvement:.2f}%")

    # --------------------------------------------
    # STORE
    # --------------------------------------------

    results.append({
        "test_quadrant": test_quadrant,
        "train_quadrants": "+".join(train_quadrants),
        "train_samples": len(train_split),
        "test_samples": len(test_split),
        "train_grids": len(train_grids),
        "test_grids": len(test_grids),
        "RMSE": rmse,
        "MAE": mae,
        "R2": r2,
        "baseline_RMSE": baseline_rmse,
        "baseline_MAE": baseline_mae,
        "baseline_R2": baseline_r2,
        "RMSE_improvement_%": rmse_improvement,
        "MAE_improvement_%": mae_improvement
    })


# ============================================================
# FINAL LEADERBOARD
# ============================================================

results_df = pd.DataFrame(results)

print("\n\n" + "=" * 80)
print("4-WAY SPATIAL VALIDATION — FINAL LEADERBOARD")
print("=" * 80)

display(
    results_df[
        [
            "test_quadrant",
            "train_quadrants",
            "test_samples",
            "test_grids",
            "RMSE",
            "MAE",
            "R2",
            "RMSE_improvement_%",
            "MAE_improvement_%"
        ]
    ].sort_values(
        "R2",
        ascending=False
    )
)


# ============================================================
# OVERALL SPATIAL GENERALIZATION
# ============================================================

print("\n" + "=" * 80)
print("OVERALL SPATIAL GENERALIZATION")
print("=" * 80)

print(
    f"Mean R² : {results_df['R2'].mean():.6f}"
)

print(
    f"Std R²  : {results_df['R2'].std():.6f}"
)

print(
    f"Min R²  : {results_df['R2'].min():.6f}"
)

print(
    f"Max R²  : {results_df['R2'].max():.6f}"
)

print(
    f"Mean RMSE improvement : "
    f"{results_df['RMSE_improvement_%'].mean():.2f}%"
)

print(
    f"Mean MAE improvement  : "
    f"{results_df['MAE_improvement_%'].mean():.2f}%"
)

# ------------------------------------------------------------
# LEAKAGE GUARANTEE
# ------------------------------------------------------------

assert all(
    results_df["test_grids"] > 0
)

print("\n✓ FOUR SPATIAL TESTS COMPLETED")
print("✓ EACH TEST QUADRANT WAS HELD OUT")
print("✓ NO GRID OVERLAP")
print("✓ FRESH MODEL FOR EACH EXPERIMENT")