import matplotlib.pyplot as plt

def plot_predictions(y_true, y_pred):
    plt.scatter(y_true, y_pred)
    plt.xlabel("Actual")
    plt.ylabel("Predicted")
    plt.show()
