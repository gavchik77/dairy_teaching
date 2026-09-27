# Beef Ration Tutor — Guided Student App

This version is deliberately **not** a one-click ration calculator.

It teaches the calculation in sequence. The student must answer each stage correctly before the next stage unlocks.

## Teaching sequence

### Before calculation
The app first asks:

> **What is your first step?**

The correct answer is:

> **Balance the diet to the 11% CP target on a dry-matter basis.**

Students are told why starting with cost, ME or NDF is not the correct first calculation for this exercise.

### Step 1 — Protein
The student chooses one supplement:

- Groundnut meal/cake
- Rolled barley
- 18% weanling crunch

The student then solves the two-feed protein equation:

```text
8(1 − x) + supplement_CP(x) = 11
```

They enter:

- % supplement in diet DM
- % silage in diet DM

The next step remains locked until the answer is correct.

### Step 2 — ME
Students calculate:

```text
silage fraction × silage ME
supplement fraction × supplement ME
```

Then:

```text
diet ME = both contributions added together
DMI needed = 87 / diet ME
```

They must also check that DMI is not above the 12 kg DM/day maximum.

### Step 3 — NDF
Students calculate NDF from both feeds:

```text
diet NDF % =
(silage fraction × 55%)
+ (supplement fraction × supplement NDF%)
```

NDF values used in the exercise:

- Poor silage: 55%
- Rolled barley: 14%
- GAIN Weanling Crunch: 20%
- Groundnut meal/cake: 22%

Students decide whether the result meets the 30% minimum.

### Step 4 — Cost
Only after the nutrient checks does the app unlock cost.

Students calculate:

```text
silage DM = total DMI × silage fraction
supplement DM = total DMI × supplement fraction

fresh feed = DM / DM fraction

supplement cost/day = fresh supplement kg × €/kg fresh
```

The worked result only appears after the student completes the calculation correctly.

## Why the three options are useful

The same calculation can be repeated with different supplements.

This demonstrates an important teaching point:

- A ration can meet **protein and energy mathematically**
- but still fail the **NDF/fibre constraint**
- therefore **cost must be compared only after the biological constraints have been checked**

## Default assignment data

- 400 kg medium castrate
- 1 kg/day target LWG
- 11% CP diet
- 87 MJ ME/day
- 12 kg DM/day maximum intake
- 30% minimum NDF for the teaching exercise
- Poor silage: 20% DM, 8% CP, 9 MJ ME/kg DM, 55% NDF
- Rolled barley: 86% DM, 12% CP, 13 MJ ME/kg DM, 14% NDF, €270/t
- 18% crunch: 87% DM, 18% CP, 13 MJ ME/kg DM, 20% NDF, €530/t
- Groundnut meal: 90% DM, 53% CP, 13.2 MJ ME/kg DM, 22% NDF, €313/t

## Run locally

Open `index.html`.

Or:

```bash
python -m http.server 8000
```

and visit:

```text
http://localhost:8000
```

## GitHub Pages

Upload these files to a repository:

- `index.html`
- `styles.css`
- `app.js`
- `README.md`

Then:

1. Open repository **Settings**
2. Choose **Pages**
3. Select **Deploy from a branch**
4. Select `main` and `/ (root)`
5. Save

No backend or build process is required.
