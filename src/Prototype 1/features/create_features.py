def select_features(df, features):
    X = df[features]
    y = df["no2_mol_m2"]
    return X, y
