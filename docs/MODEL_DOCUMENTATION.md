# Model Documentation


## Prototype 2 Models


Models tested:

- Random Forest
- Extra Trees
- XGBoost


## Final Approach

Tree-based ensemble models were evaluated using spatial validation.


## Validation

Random splitting was avoided because nearby locations can create data leakage.


Four-way spatial validation:

Mean R² ≈ 0.67


---

# Prototype 3

Recommended approach:

Ground calibration of satellite-based predictions.


Workflow:

Features

↓

Prototype 2 model

↓

Satellite NO₂ estimate

+

Ground observations

↓

Calibrated NO₂ prediction