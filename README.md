# Beef Ration Tutor v3

A GitHub Pages-ready teaching app for a guided beef ration calculation.

## Teaching order

The app does **not** start by showing a completed ration.

The student first answers:

> What is your first step in the calculation?

The intended sequence is:

1. **Protein** — calculate the silage and supplement proportions needed to reach 11% CP.
2. **ME allocation** — divide the total 87 MJ/day requirement between silage and supplement using the Step 1 proportions.
3. **Dry matter eaten** — convert each feed's allocated MJ requirement to kg DM using its own ME value.
4. **Fresh/as-fed quantity** — convert each feed's DM amount to kg fresh feed using its DM percentage.
5. **NDF check** — calculate NDF from the actual DM amounts eaten.
6. **Cost verification** — calculate cost only after the nutritional checks.

## Step 2 method used

For Step 1 proportions:

```text
Silage ME required
= silage proportion × total ME requirement

Supplement ME required
= supplement proportion × total ME requirement
```

Then:

```text
Silage DM eaten
= silage ME required / silage ME per kg DM

Supplement DM eaten
= supplement ME required / supplement ME per kg DM
```

Only after this is the fresh amount offered calculated:

```text
Fresh feed kg
= feed DM kg / feed DM fraction
```

## Live calculation / feedback

There are no "check answer" buttons in the calculation stages.

As soon as the student enters a number:

- the field is checked;
- correct values are marked;
- incorrect values get immediate feedback;
- the next part unlocks automatically once the current calculation is correct;
- totals such as DMI update immediately.

## Feed data

| Feed | DM % | CP % | ME MJ/kg DM | NDF % | €/t fresh |
|---|---:|---:|---:|---:|---:|
| Poor-quality silage | 20 | 8 | 9.0 | 55 | already available |
| Rolled barley | 86 | 12 | 13.0 | 14 | 270 |
| GAIN Weanling Crunch | 87 | 18 | 13.0 | 20 | 530 |
| Groundnut meal/cake | 90 | 53 | 13.2 | 22 | 313 |

Animal/target values:

- 400 kg medium castrate
- 1 kg/day target LWG
- 11% dietary CP
- 87 MJ ME/day
- 30% minimum NDF
- 12 kg DM/day maximum intake

## GitHub Pages

Upload these files to the root of a GitHub repository:

- `index.html`
- `styles.css`
- `app.js`
- `README.md`

Then enable:

**Settings → Pages → Deploy from a branch → main → /(root)**

No framework, package manager, server, or build step is required.
