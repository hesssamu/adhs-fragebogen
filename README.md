# ADHS-Fragebogen (für Eltern / Angehörige)

Mobile, step-by-step questionnaire used to collect a parent/relative ADHD assessment
**about Samuel Hess**. Based on the Kooij & Buitelaar (1997) questionnaire — 2 parts
(adult/current + childhood), 23 items each, scored 0–3.

On submit it generates a **PDF replica** of the filled questionnaire and emails it to
**samhesselias@gmail.com** via [FormSubmit](https://formsubmit.co) (free, no backend).

## Live

- Picker (everyone): https://hesssamu.github.io/adhs-fragebogen/
- Per-person links (skip picker, personalized greeting):
  - Mama:      https://hesssamu.github.io/adhs-fragebogen/?r=mutter
  - Papa:      https://hesssamu.github.io/adhs-fragebogen/?r=vater
  - Schwester: https://hesssamu.github.io/adhs-fragebogen/?r=schwester
  - **Self-test (hidden):** https://hesssamu.github.io/adhs-fragebogen/?r=test

Each submission is stamped with who answered (PDF header "Ausgefüllt von: …",
email subject, and filename) so the three are easy to tell apart.

## Important: FormSubmit activation

The recipient address must be activated once. This was already done (an "Activate Form"
email was confirmed). If email ever stops arriving, submit once and re-click the activation
link FormSubmit sends to samhesselias@gmail.com.

## How it's built

- Single self-contained `index.html` (no build step). Vanilla JS wizard.
- PDF made with **jsPDF**, self-hosted at `vendor/jspdf.umd.min.js`
  (the cdnjs URL 404'd, which broke PDF generation — do **not** switch back to cdnjs).
  A unpkg fallback is wired in `<head>` just in case.
- Hosted on **GitHub Pages** (repo: `hesssamu/adhs-fragebogen`, branch `main`, root).

## Editing

- Person being assessed / birthdate: `PERSON_NAME` and `BIRTHDATE` constants near the top
  of the script in `index.html`.
- Add/rename respondents: the `RESPONDENTS` map (set `hidden:true` to keep one out of the picker).

## Tests (Node)

```
npm install jspdf jsdom
node test-pdf.mjs      # generates /tmp/test-fragebogen.pdf (visual layout check)
node test-flow.mjs     # wizard flow: picker + per-person link paths
node test-vendor.mjs   # loads the VENDORED jsPDF and runs full submit end-to-end
```

## Deploy

```
git add -A && git commit -m "..." && git push origin main
# GitHub Pages rebuilds automatically (~1 min)
```
