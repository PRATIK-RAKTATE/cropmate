# CropMate MVP

## 1. Purpose

This document converts [SPEC.md](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/SPEC.md) into a focused hackathon MVP for `CropMate`.

The goal of the MVP is not to build every idea in the spec. The goal is to prove one clear outcome:

**A farmer can enter farm details, get an explainable crop recommendation, detect a likely disease from an image, and receive a simple local-language action plan within minutes.**

## 2. MVP Product Statement

`CropMate` is a mobile-first AI farming assistant for small farmers. It helps them decide:

- what crop to grow this season
- what risk to watch for
- what immediate action to take

The MVP must feel useful on day one, even with partial or mocked data.

## 3. Core MVP Outcome

By the end of the demo, the user should be able to:

1. Create a farmer and farm profile
2. Enter soil and water details
3. Fetch weather or use fallback mock weather
4. Generate top 3 crop recommendations
5. Understand why the top crop was recommended
6. Upload a crop image for disease detection
7. Ask a follow-up question in chat or voice
8. View saved advisory history

## 4. MVP Scope

### In Scope

- Farmer onboarding with demo login or OTP mock
- Farm profile creation
- Soil input form with manual values or sample soil presets
- Weather integration with mock fallback
- Top 3 crop recommendations with scoring
- Explainable recommendation details
- Disease image upload and result screen
- AI chat assistant with farm-aware responses
- Voice input/output in English, Hindi, or Marathi
- Advisory history
- Basic admin dashboard with usage logs

### Out of Scope

- Real-time market price prediction
- Satellite monitoring
- IoT sensor integration
- Full expert consultation workflow
- Government scheme recommendation
- Insurance workflow
- Precision chemical dosage recommendation

## 5. Hackathon-Winning Feature

### Feature Name

**Village Risk Radar**

### What It Does

The app shows a simple early-warning card for the farmer's village or local area:

- likely disease risk in the next 7 days
- weather-linked crop stress warning
- preventive action before visible damage starts

Example:

```text
Village Risk Radar
Tomato blight risk is rising in Nashik in the next 5 days.
Reason: high humidity, rainfall pattern, and 3 recent tomato disease scans nearby.
Do now: improve drainage, avoid overhead irrigation, inspect lower leaves daily.
```

### Why This Wins

Most hackathon projects react after the farmer uploads data. This feature shifts the product from reactive advice to preventive protection.

It combines:

- weather awareness
- disease intelligence
- location context
- actionability
- explainability

This is a stronger story for judges because it shows community-scale impact, not only single-user prediction.

### Why It Is Realistic For MVP

The feature does not require a large production network.

For the hackathon build, `Village Risk Radar` can be generated from:

- farmer location
- crop selected in farm profile
- current weather or mock forecast
- recent disease scans stored in the demo database
- simple rule engine thresholds

This keeps the implementation feasible while still looking innovative and useful.

## 6. MVP User Flows

### Flow A: Crop Recommendation

1. Farmer selects language
2. Farmer logs in
3. Farmer creates or selects a farm
4. Farmer enters soil, season, water, and budget inputs
5. System fetches weather
6. System returns top 3 crops
7. Farmer opens the top crop card
8. System shows why, risk level, sustainability score, and next steps

### Flow B: Disease Detection

1. Farmer opens disease scan
2. Farmer uploads or captures a leaf image
3. System predicts likely disease and severity
4. System shows immediate treatment and prevention tips
5. Result is saved into advisory history

### Flow C: Ask AI

1. Farmer asks a question by text or voice
2. Assistant uses farm context, weather, and latest recommendations
3. Assistant returns four parts: direct answer, why it applies, next steps, and warning if needed

### Flow D: Village Risk Radar

1. Farmer opens home dashboard
2. Dashboard shows local crop risk card
3. Farmer taps the card
4. System explains the risk source
5. Farmer sees preventive actions before crop damage spreads

## 7. Prioritized Build Order

### P0: Must Build

- farmer auth mock
- farm profile
- soil input
- weather service with fallback
- recommendation engine
- explanation screen
- disease upload flow
- chat assistant
- advisory history

### P1: Should Build

- voice input/output
- basic admin dashboard
- Village Risk Radar card and detail screen

### P2: Nice To Have

- local notifications
- richer analytics in admin
- multi-farm comparison

## 8. Recommended MVP Architecture

### Client

- mobile-first React app
- simple dashboard cards
- offline cache for recent advisory history

### Server

- Node.js + Express API
- MongoDB for farmers, farms, recommendations, disease scans, chat logs, radar alerts

### AI Layer

- crop recommendation: rule-based + scoring hybrid
- disease detection: pretrained model or mock classifier
- advisory assistant: LLM with structured context
- Village Risk Radar: rules on weather + disease scan count + crop type

## 9. Scoring Model For Recommendations

Use a practical scoring strategy instead of a pure black-box model.

```text
Final Score =
40% soil suitability
25% weather suitability
15% water suitability
10% profitability
10% sustainability
```

Return these fields for each crop:

- crop name
- suitability score
- risk level
- duration
- water need
- profitability score
- sustainability score
- simple-language reason
- next steps

## 10. Minimal Data Needed

The MVP should work with the following minimum inputs:

- farmer name
- preferred language
- farm location
- soil type
- NPK and pH, or sample soil preset
- season
- water availability
- previous crop

If some values are missing, the system should still work but display a lower-confidence note.

## 11. Key Screens

- language selection
- login/register
- home dashboard
- farm profile form
- soil input form
- crop recommendation results
- crop explanation screen
- disease scan upload
- disease result
- AI chat
- advisory history
- admin dashboard
- Village Risk Radar details

## 12. Demo Narrative

### Demo Story

Ramesh Patil from Nashik has 3 acres, black soil, medium water availability, and wants a Kharif crop.

### Demo Sequence

1. Show language selection in Marathi
2. Open Ramesh's farm profile
3. Enter soil values or select sample soil card
4. Generate crop recommendation
5. Show Soybean as top recommendation with explanation
6. Ask a Marathi follow-up question in voice
7. Upload a tomato leaf image and show disease result
8. Open `Village Risk Radar`
9. Show local blight-risk alert with preventive action
10. End on advisory history and impact dashboard

This sequence demonstrates personalization, multimodal AI, prevention, and farmer-friendly UX in one flow.

## 13. Success Criteria

### Product Success

- recommendation returned in under 3 seconds
- chat answer returned in under 5 seconds
- disease result returned in under 10 seconds
- all major flows are usable with minimal typing

### Judge-Facing Success

- clear social impact
- explainable AI, not black-box output
- local-language interaction
- one standout innovation: `Village Risk Radar`
- visible path to scale after hackathon

### Farmer Success

- understands why a crop is suggested
- knows what action to take next
- receives at least one preventive alert before a problem spreads

## 14. Delivery Strategy For Hackathon

### Day 1

- UI skeleton
- auth mock
- farm and soil forms
- recommendation service contract

### Day 2

- crop scoring engine
- result screen
- AI assistant integration
- disease detection flow

### Day 3

- Village Risk Radar
- advisory history
- admin dashboard
- demo data and pitch polish

## 15. Risks And Controls

- Missing live APIs: use mocked weather and seeded disease data
- Weak model accuracy: use explainable rule-based fallback
- Network issues: cache recent advisory history locally
- Unsafe treatment advice: avoid precise chemical dosage and show expert-escalation note
- Over-scoped build: keep advanced features out of MVP

## 16. Final MVP Decision

If time is limited, do not cut explainability. Do not cut local-language support. Do not cut the new feature.

The simplest strong version of `CropMate` is:

- explainable crop recommendation
- disease scan with action steps
- multilingual AI assistant
- `Village Risk Radar` for preventive local alerts

That combination is differentiated, demoable, and credible for a hackathon-winning MVP.
