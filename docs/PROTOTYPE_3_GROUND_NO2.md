# Prototype 3 Ground NO₂ Integration


## Motivation

Satellite data provides spatial coverage but may contain bias.

Ground stations provide accurate measurements but are sparse.


## Dataset

Stations:

14 Hyderabad CPCB/TSPCB stations


Resolution:

Daily


Period:

Jan-Aug 2025


## Processing


15-minute measurements

↓

Daily average


Quality control:

Minimum valid observations required per day


↓

Station coordinates added


↓

Mapped to Hyderabad 1km grid


Output:

ground_no2_daily_grid.csv


## Limitation

Ground measurements exist only at monitoring locations.

This is expected because monitoring stations are point measurements.