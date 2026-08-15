def clean_data(df):
    df = df.copy()
    df = df.drop_duplicates()
    return df
