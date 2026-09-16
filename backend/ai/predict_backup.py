import sys
import json
import numpy as np

from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


# ============================================================
# RESPIRA AI / ML RISK PREDICTION MODEL
# Prototype model for academic demonstration
#
# IMPORTANT:
# This is a demonstration model using synthetic training data.
# It is NOT clinically validated.
# ============================================================


np.random.seed(42)

X_train = []
y_train = []


# ============================================================
# Create balanced synthetic training data
# ============================================================

# LOW-RISK examples
for _ in range(1000):

    attacks = np.random.uniform(0, 2)

    severity = np.random.uniform(0, 2.2)

    adherence = np.random.uniform(75, 100)

    aqi = np.random.uniform(20, 80)

    X_train.append([
        attacks,
        severity,
        adherence,
        aqi
    ])

    y_train.append(0)


# MODERATE-RISK examples
for _ in range(1000):

    attacks = np.random.uniform(1, 5)

    severity = np.random.uniform(1.5, 4)

    adherence = np.random.uniform(45, 85)

    aqi = np.random.uniform(50, 140)

    X_train.append([
        attacks,
        severity,
        adherence,
        aqi
    ])

    y_train.append(1)


# HIGH-RISK examples
for _ in range(1000):

    attacks = np.random.uniform(3, 7)

    severity = np.random.uniform(3, 5)

    adherence = np.random.uniform(20, 65)

    aqi = np.random.uniform(100, 250)

    X_train.append([
        attacks,
        severity,
        adherence,
        aqi
    ])

    y_train.append(2)


X_train = np.array(X_train)
y_train = np.array(y_train)


# ============================================================
# ML MODEL
# ============================================================

model = Pipeline([

    (
        "scaler",
        StandardScaler()
    ),

    (
        "classifier",
        LogisticRegression(
            max_iter=2000,
            C=0.15
        )
    )

])


# Train the model

model.fit(
    X_train,
    y_train
)


# ============================================================
# Prediction function
# ============================================================

def predict_risk(data):

    recent_attacks = float(
        data.get("recent_attacks", 0)
    )

    average_severity = float(
        data.get("average_severity", 0)
    )

    medication_adherence = float(
        data.get("medication_adherence", 100)
    )

    aqi = float(
        data.get("aqi", 50)
    )


    # --------------------------------------------------------
    # Limit values
    # --------------------------------------------------------

    recent_attacks = max(
        0,
        min(recent_attacks, 7)
    )

    average_severity = max(
        0,
        min(average_severity, 5)
    )

    medication_adherence = max(
        0,
        min(medication_adherence, 100)
    )

    aqi = max(
        0,
        min(aqi, 300)
    )


    # --------------------------------------------------------
    # Prepare input
    # --------------------------------------------------------

    input_data = np.array([[
        recent_attacks,
        average_severity,
        medication_adherence,
        aqi
    ]])


    # --------------------------------------------------------
    # Get class probabilities
    # --------------------------------------------------------

    probabilities = model.predict_proba(
        input_data
    )[0]


    predicted_class = int(
        np.argmax(probabilities)
    )


    # --------------------------------------------------------
    # Class → Risk level
    # --------------------------------------------------------

    risk_levels = {
        0: "Low",
        1: "Moderate",
        2: "High"
    }


    risk_level = risk_levels[
        predicted_class
    ]


    # --------------------------------------------------------
    # Confidence score
    # --------------------------------------------------------

    confidence = (
        probabilities[predicted_class] * 100
    )


    confidence = round(
        confidence,
        2
    )


    # --------------------------------------------------------
    # Recommendation
    # --------------------------------------------------------

    if risk_level == "Low":

        recommendation = (
            "Your recorded indicators currently suggest "
            "a lower risk level. Continue following your "
            "prescribed medication schedule and monitoring "
            "your symptoms."
        )

    elif risk_level == "Moderate":

        recommendation = (
            "Your recorded indicators suggest a moderate "
            "risk level. Monitor your symptoms closely, "
            "follow your medication schedule, and consider "
            "medical advice if symptoms persist or worsen."
        )

    else:

        recommendation = (
            "Your recorded indicators suggest higher risk. "
            "Monitor your symptoms closely and seek medical "
            "advice if symptoms worsen."
        )


    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return {

        "success": True,

        "risk_score": confidence,

        "risk_level": risk_level,

        "recommendation": recommendation

    }


# ============================================================
# MAIN
# ============================================================

try:

    input_data = sys.stdin.read()


    if not input_data.strip():

        raise ValueError(
            "No input data received."
        )


    data = json.loads(
        input_data
    )


    result = predict_risk(
        data
    )


    print(
        json.dumps(result)
    )


except Exception as error:

    print(
        json.dumps({
            "success": False,
            "error": str(error)
        })
    )

    sys.exit(1)