import xgboost as xgb

def get_model():
    return xgb.XGBRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=4,
        subsample=0.8,
        colsample_bytree=1.0,
        random_state=42,
        objective="reg:squarederror"
    )
