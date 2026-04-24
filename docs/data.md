# CropMate Data Map

This document explains where CropMate data comes from in the current implementation.

It answers two questions for each feature:

- what is the source of the data
- whether the data is real, user-provided, computed, seeded demo data, or fallback dummy data

## 1. Data Status Legend

- `Real external API`: fetched from a live third-party API
- `User input`: entered by the farmer in the UI
- `Database`: stored in MongoDB after user actions or startup seed
- `Computed`: generated inside the app from rules or scoring logic
- `Seeded demo data`: hardcoded startup/demo data in the repo
- `Fallback seed`: hardcoded backup data used when a live API fails

## 2. Farmer And Farm Data

### Farmer profile

Data fields:

- name
- mobile
- preferredLanguage
- village
- district
- state

Source:

- `Seeded demo data` on startup from [server/src/seed/demoData.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/seed/demoData.js)
- `Database` in [server/src/models/Farmer.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/models/Farmer.js)

Dummy or not:

- currently `dummy/seeded` for the demo farmers
- if a new farmer is created later, that would become normal stored data

### Farm profile

Data fields:

- farm name
- location
- farm size
- soil type
- irrigation source
- water availability
- previous crop
- current season
- budget
- farming type

Source:

- existing farms are `Seeded demo data` from [server/src/seed/demoData.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/seed/demoData.js)
- new farms come from `User input` in the farm screen and are stored through `POST /api/farms`
- persisted in [server/src/models/Farm.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/models/Farm.js)

Dummy or not:

- seeded farms are `dummy/seeded`
- newly created farms are `not dummy`

## 3. Soil Data

### Manual soil input

Data fields:

- nitrogen
- phosphorus
- potassium
- ph
- moisture
- organicCarbon

Source:

- `User input` from the soil form
- stored in MongoDB in [server/src/models/SoilReport.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/models/SoilReport.js)

Dummy or not:

- if entered by the user, `not dummy`

### Soil preset cards

Source:

- hardcoded presets in [client/src/data/content.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/client/src/data/content.js)

Dummy or not:

- `dummy/demo values`

### Seeded soil reports

Source:

- startup seed in [server/src/seed/demoData.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/seed/demoData.js)

Dummy or not:

- `dummy/seeded`

## 4. Weather Data

### Primary weather source

Data fields:

- current temperature
- current humidity
- current precipitation
- wind speed
- 7-day rainfall total
- forecast max/min temperature

Source:

- `Real external API` from Open-Meteo in [server/src/services/weatherService.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/services/weatherService.js)

Dummy or not:

- `not dummy` when `source = open-meteo` and `fallbackUsed = false`

### Weather fallback

Source:

- district-level fallback values from [server/src/seed/demoData.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/seed/demoData.js)
- selected inside [server/src/services/weatherService.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/services/weatherService.js)

Dummy or not:

- `dummy/fallback seed`

Important note:

- weather can be real or dummy depending on API availability
- the response explicitly includes `source` and `fallbackUsed`

## 5. Crop Recommendation Data

### Recommendation inputs

Source mix:

- `User input`: soil values, selected season, optional budget
- `Database`: farm profile
- `Real external API` or `Fallback seed`: weather
- `Computed`: internal scoring logic

### Recommendation logic

Source:

- generated locally by rule-based scoring in [server/src/services/recommendationService.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/services/recommendationService.js)
- crop rules come from [server/src/seed/cropProfiles.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/seed/cropProfiles.js)

Dummy or not:

- recommendation output is `computed`, not fetched from any external crop API
- crop profiles are `curated internal data`
- this is not dummy in the sense of a fake response, but it is also not a live external source

### Recommendation records saved in DB

Source:

- persisted in [server/src/models/CropRecommendation.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/models/CropRecommendation.js)

Dummy or not:

- newly generated recommendations are `not dummy`, but they are `computed from internal rules`
- one startup recommendation is `seeded demo data` from [server/src/services/seedService.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/services/seedService.js)

## 6. Disease Detection Data

### Uploaded leaf image

Source:

- `User input` from the disease upload screen
- stored locally in `server/uploads/`

Dummy or not:

- `not dummy`

### Disease classification

Data fields:

- disease name
- probability/confidence
- provider response signals

Source:

- `Real external API` from Plant.id in [server/src/services/diseaseService.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/services/diseaseService.js)

Dummy or not:

- `not dummy` when Plant.id is called successfully
- there is currently no fake disease classifier fallback in runtime
- if Plant.id is unavailable, the API returns an error instead of dummy output

### Treatment, prevention, and severity text

Source:

- local curated knowledge in [server/src/seed/diseaseKnowledge.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/seed/diseaseKnowledge.js)
- merged with Plant.id output in [server/src/services/diseaseService.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/services/diseaseService.js)

Dummy or not:

- `curated internal data`
- not live API data
- not random dummy data either

### Seeded disease reports

Source:

- inserted during startup in [server/src/services/seedService.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/services/seedService.js)

Dummy or not:

- `dummy/seeded`

## 7. AI Assistant Data

### Assistant answer

Source:

- `Real external API` from Groq when `GROQ_API_KEY` is configured and the request succeeds
- otherwise `Computed fallback text` from [server/src/services/assistantService.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/services/assistantService.js)

Inputs used for the prompt:

- farmer profile from MongoDB
- farm profile from MongoDB
- latest soil report from MongoDB
- latest recommendation from MongoDB
- latest disease report from MongoDB
- current weather from weather service
- user question from the UI

Dummy or not:

- `not dummy` when Groq is used successfully
- `fallback/generated` when the local fallback answer is used

Important note:

- the fallback assistant answer is not an external AI result
- it is a template-based internal response

### Chat history

Source:

- stored in MongoDB in [server/src/models/ChatSession.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/models/ChatSession.js)

Dummy or not:

- seeded chat history: none by default
- new chat history after usage: `not dummy`

## 8. Village Risk Radar Data

### Radar inputs

Source mix:

- `Database`: farm location
- `Database`: latest crop recommendation or farm previous crop
- `Real external API` or `Fallback seed`: weather
- `Database`: recent disease reports from nearby farms
- `Curated internal data`: radar actions from disease knowledge

Main logic location:

- [server/src/services/radarService.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/services/radarService.js)

Dummy or not:

- runtime radar output is `computed`
- it can depend on real weather plus real stored reports
- it can also depend partly on seeded disease reports and fallback weather

### Seeded radar alert

Source:

- inserted at startup in [server/src/services/seedService.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/services/seedService.js)

Dummy or not:

- `dummy/seeded`

## 9. Advisory History Data

History endpoint:

- `GET /api/history/:farmerId`

Source:

- recommendations from MongoDB
- disease reports from MongoDB
- chat sessions from MongoDB
- radar alerts from MongoDB

Code:

- [server/src/controllers/historyController.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/controllers/historyController.js)

Dummy or not:

- if records were created by user actions, `not dummy`
- if records came from startup seed, `dummy/seeded`

Important note:

- current history implementation returns radar alerts globally, not filtered by farmer

## 10. Admin Dashboard Data

Source:

- counts from MongoDB for farmers, farms, recommendations, disease reports, and chat sessions
- recent recommendation logs from MongoDB

Code:

- [server/src/controllers/adminController.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/server/src/controllers/adminController.js)

Dummy or not:

- if data was seeded on startup, it is partly `dummy/seeded`
- if data was created through actual app usage, it is `not dummy`

## 11. Translation And UI Text Data

Source:

- local translation strings in [client/src/data/content.js](/home/pratik/d/projects/svit-hackverse-problem-statement/cropmate/client/src/data/content.js)

Dummy or not:

- `static internal UI content`
- not API data
- not dummy in the demo-data sense

## 12. Clear Final Classification

### Always Dummy Or Seeded

- demo farmers
- demo farms
- demo soil reports
- seeded recommendation record
- seeded disease reports
- seeded radar alert
- soil preset cards
- fallback weather values

### Always Real User/App Data After Usage

- uploaded leaf images
- manually entered soil values
- newly created farms
- newly generated recommendation records
- saved assistant chats
- new disease reports from successful Plant.id requests

### Real External APIs

- Open-Meteo weather
- Groq assistant responses
- Plant.id disease classification

### Internal Computed Or Curated Data

- crop recommendation scoring
- crop rule profiles
- disease treatment/prevention knowledge
- radar scoring and alert generation
- assistant fallback text

## 13. Short Answer

CropMate currently uses a mix of:

- real APIs: Open-Meteo, Groq, Plant.id
- user-entered data: soil values, farm details, uploaded images, questions
- MongoDB stored data: farmers, farms, recommendations, disease reports, chats, radar alerts
- seeded demo data: startup farmers/farms/reports/alerts
- internal computed data: recommendation scores and radar logic

So the app is **not fully dummy** and **not fully real-time**. It is a hybrid demo MVP.
