from sklearn.ensemble import ExtraTreesRegressor

def get_model():
    return ExtraTreesRegressor(
        n_estimators=200,
        random_state=42,
        max_features=1.0,
        min_samples_leaf=1
    )
