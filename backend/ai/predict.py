import sys
import json
import numpy as np

from sklearn.ensemble import RandomForestClassifier


# ============================================================
# RESPIRA AI / ML RISK PREDICTION MODEL
# ============================================================
#
# Prototype model for academic demonstration.
# Training data is synthetic and NOT medically validated.
#
# Features:
#   1. Recent attacks
#   2. Average severity
#   3. Medication adherence
#   4. AQI
#
# Classes:
#   0 = Low
#   1 = Moderate
#   2 = High
# ============================================================


np.random.seed(42)

X_train = []
y_train = []


# ============================================================
# CREATE SYNTHETIC TRAINING DATA
# ============================================================

for _ in range(3000):

    attacks = np.random.uniform(0, 7)

    severity = np.random.uniform(0, 5)

    adherence = np.random.uniform(20, 100)

    aqi = np.random.uniform(20, 250)


    # --------------------------------------------------------
    # Prototype risk score used to create training labels
    # --------------------------------------------------------

    attack_score = (
        attacks / 7
    ) * 30


    severity_score = (
        severity / 5
    ) * 25


    medication_score = (
        (100 - adherence) / 100
    ) * 25


    if aqi <= 50:

        aqi_score = 0

    else:

        aqi_score = (
            (aqi - 50) / 250
        ) * 20


    aqi_score = max(
        0,
        min(aqi_score, 20)
    )


    risk_score = (
        attack_score
        + severity_score
        + medication_score
        + aqi_score
    )


    # --------------------------------------------------------
    # Add small randomness to prevent a perfectly rigid
    # training boundary.
    # --------------------------------------------------------

    risk_score += np.random.normal(0, 3)


    # --------------------------------------------------------
    # Three classes
    # --------------------------------------------------------

    if risk_score < 35:

        label = 0

    elif risk_score < 70:

        label = 1

    else:

        label = 2


    X_train.append([
        attacks,
        severity,
        adherence,
        aqi
    ])

    y_train.append(label)


X_train = np.array(X_train)

y_train = np.array(y_train)


# ============================================================
# TRAIN MACHINE LEARNING MODEL
# ============================================================

model = RandomForestClassifier(
    n_estimators=150,
    max_depth=8,
    min_samples_leaf=8,
    random_state=42
)


model.fit(
    X_train,
    y_train
)


# ============================================================
# RISK SCORE FUNCTION
# ============================================================

def calculate_risk_score(
    attacks,
    severity,
    adherence,
    aqi
):

    attack_score = (
        attacks / 7
    ) * 30


    severity_score = (
        severity / 5
    ) * 25


    medication_score = (
        (100 - adherence) / 100
    ) * 25


    if aqi <= 50:

        aqi_score = 0

    else:

        aqi_score = (
            (aqi - 50) / 250
        ) * 20


    aqi_score = max(
        0,
        min(aqi_score, 20)
    )


    score = (
        attack_score
        + severity_score
        + medication_score
        + aqi_score
    )


    return round(
        max(0, min(score, 100)),
        2
    )


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_risk(data):

    attacks = float(
        data.get("recent_attacks", 0)
    )

    severity = float(
        data.get("average_severity", 0)
    )

    adherence = float(
        data.get("medication_adherence", 100)
    )

    aqi = float(
        data.get("aqi", 50)
    )


    # --------------------------------------------------------
    # Limit values
    # --------------------------------------------------------

    attacks = max(
        0,
        min(attacks, 7)
    )

    severity = max(
        0,
        min(severity, 5)
    )

    adherence = max(
        0,
        min(adherence, 100)
    )

    aqi = max(
        0,
        min(aqi, 300)
    )


    # --------------------------------------------------------
    # Prepare input
    # --------------------------------------------------------

    input_data = np.array([[
        attacks,
        severity,
        adherence,
        aqi
    ]])


    # --------------------------------------------------------
    # ML prediction
    # --------------------------------------------------------

    predicted_class = int(
        model.predict(input_data)[0]
    )


    # --------------------------------------------------------
    # ML probabilities
    # --------------------------------------------------------

    probabilities = model.predict_proba(
        input_data
    )[0]


    # --------------------------------------------------------
    # Risk level
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
    # Transparent Respira Risk Score
    # --------------------------------------------------------

    risk_score = calculate_risk_score(
        attacks,
        severity,
        adherence,
        aqi
    )


    # --------------------------------------------------------
    # ML confidence
    # --------------------------------------------------------

    ml_confidence = round(
        probabilities[predicted_class] * 100,
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
    # Return result
    # --------------------------------------------------------

    return {
        "success": True,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "ml_prediction": risk_level,
        "ml_confidence": ml_confidence
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