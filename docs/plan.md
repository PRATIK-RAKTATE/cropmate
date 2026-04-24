 ## Summary

  Build a greenfield monorepo MVP with:

  - client/: Vite + React + JSX + ES6 + Tailwind, mobile-first web app
  - server/: Node.js + Express + MongoDB via Mongoose
  - Demo-login auth, persistent records, seeded demo data
  - Live weather via Open-Meteo with seeded fallback
  - Advisory assistant via Groq LLM with structured farm context
  - Disease detection via hosted vision API, not local models
  - Full first pass includes: recommendation, disease scan, assistant,
    history, and Village Risk Radar
  - Voice and admin stay scaffolded but functional only if time remains after
    core farmer flows

  The implementation should optimize for a reliable hackathon demo, not
  production completeness.

  ## Key Implementation Changes

  ### App shape

  - Set up root workspace with separate client and server apps and a
    shared .env.example.
  - Use plain JavaScript throughout; no TypeScript.
  - Use a single REST backend consumed by the React client.
  - Seed one primary demo farmer plus 2-3 nearby farms so Radar and admin have
    meaningful data.

  ### Client

  - Build a responsive single-page app with these routes/screens:
      - language selection
      - demo login/profile select
      - home dashboard
      - farm profile
      - soil input
      - crop recommendations
      - crop detail/explanation
      - disease scan
      - AI assistant
      - advisory history
      - Village Risk Radar detail
  - Use Tailwind with a defined theme and reusable card/form/button
    components.
  - Persist session, selected farm, language, and recent history in local
    storage.
  - Keep voice UI as a thin abstraction using browser speech APIs; ship only
    if core flows are stable.
  - Show explicit degraded-state UI when live weather or vision APIs fail.

  ### Server

  - Build Express modules for:
      - auth
      - farmers
      - farms
      - recommendations
      - disease
      - assistant
      - weather
      - radar
      - history
      - admin
  - Use Mongoose models for:
      - Farmer
      - Farm
      - SoilReport
      - CropRecommendation
      - DiseaseReport
      - ChatSession
      - RadarAlert
  - Use seed data plus a startup seed script for demo farmers, farms, crop
    rules, and nearby disease events.
  - Validate request bodies with a runtime validator such as zod.
  - Store uploaded images locally under a non-tracked uploads directory for
    MVP, with Multer handling multipart upload.
  - Add a service layer so controller code is thin and provider-specific logic
    is isolated.

  ### Recommendation engine

  - Implement a deterministic hybrid scorer, not a black-box model.
  - Inputs:
      - farm location
      - soil type
      - nitrogen/phosphorus/potassium/ph
      - season
      - water availability
      - previous crop
      - optional budget
      - current weather/forecast
  - Maintain a curated crop knowledge map for the initial crop set.
  - Rank top 3 crops with:
      - suitabilityScore
      - profitabilityScore
      - sustainabilityScore
      - riskLevel
      - durationDays
      - waterNeed
      - reason
      - nextSteps
  - Use the score formula from docs/mvp.md as the default ranking basis.
  - If weather API fails, compute from seeded regional weather and mark
    recommendation as fallback-based.

  ### Assistant

  - Use Groq chat completions with a fixed prompt contract.
  - Prompt context must include:
      - farmer profile
      - selected farm
      - latest soil report
      - latest recommendation
      - latest disease report if present
      - weather summary
      - preferred language
  - Force response structure:
      - direct answer
      - why it applies
      - next steps
      - warning or escalation
  - Persist chat exchanges in ChatSession.
  - Add a server-side fallback template response when Groq is unavailable.

  ### Disease detection

  - Use a hosted vision API; recommended provider: Plant.id Health Assessment
    API.
  - Server flow:
      - accept image upload
      - preprocess image with sharp for resize/compression and EXIF stripping
      - send image to Plant.id
      - map provider response into internal normalized fields
      - enrich with curated treatment/prevention copy
      - save DiseaseReport
  - Do not use OCR in the leaf-disease path; leaf diagnosis is visual
    classification, not text extraction.
  - If Plant.id fails, return a controlled “analysis unavailable” state rather
    than fabricated disease output.
  - Seed at least tomato, potato, chili, and soybean treatment content for
    reliable demo coverage.

  ### Village Risk Radar

  - Compute a local alert per farm using:
      - selected crop or latest recommended crop
      - Open-Meteo short forecast
      - recent DiseaseReport counts from nearby farms within a chosen radius
      - crop-specific weather risk thresholds
  - Output fields:
      - title
      - riskLevel
      - windowDays
      - reason
      - recommendedActions
      - supportingSignals
  - Store latest generated alert in RadarAlert and refresh on dashboard load
    or explicit request.
  - If nearby disease data is sparse, still produce weather-only alerts and
    label them accordingly.

  ### Admin and voice

  - Admin remains secondary: add a simple summary endpoint and one dashboard
    screen showing counts and recent logs.
  - Voice remains scaffolded: browser speech-to-text/text-to-speech only, no
    separate backend voice service in v1.
  - If time runs short, admin and voice may ship as basic shells without
    blocking farmer flows.

  ## Public Interfaces

  ### Frontend-visible routes

  - /
  - /login
  - /dashboard
  - /farm
  - /soil
  - /recommendations
  - /recommendations/:id
  - /disease
  - /assistant
  - /history
  - /radar
  - /admin

  ### REST API

  - POST /api/auth/demo-login
      - input: farmerId
      - output: session payload with farmer and default farm
  - GET /api/farmers
  - GET /api/farmers/:id
  - POST /api/farms
  - GET /api/farms/:id
  - POST /api/soil-reports
  - POST /api/weather/resolve
      - input: lat, lng
      - output: current + short forecast + fallback marker
  - POST /api/recommendations/crop
      - input: farmId, soil payload, season, optional budget
      - output: top 3 recommendations
  - POST /api/disease/detect
      - multipart: image, optional crop, required farmId
      - output: normalized disease result
  - POST /api/assistant/ask
      - input: farmerId, farmId, language, question
      - output: structured answer
  - GET /api/history/:farmerId
  - GET /api/radar/:farmId
  - GET /api/admin/summary

  ### Environment variables

  - MONGODB_URI
  - PORT
  - CLIENT_ORIGIN
  - GROQ_API_KEY
  - PLANT_ID_API_KEY
  - OPEN_METEO_BASE_URL optional
  - SEED_ON_START optional

  ## Test Plan

  - Server unit tests:
      - recommendation scoring returns stable top-3 output for seeded farms
      - fallback path activates when weather provider fails
      - radar logic changes risk level when nearby disease count increases
      - provider mapping normalizes Plant.id responses correctly
      - assistant prompt builder includes all required farm context
  - Server integration tests:
      - demo login returns seeded farmer and farm
      - crop recommendation persists history
      - disease upload creates DiseaseReport
      - assistant call persists ChatSession
      - radar endpoint returns actionable alert for seeded farm
  - Client tests:
      - login to dashboard flow
      - recommendation request and detail view
      - disease upload happy path and failure state
      - assistant chat rendering with structured sections
      - history page shows recommendations, disease scans, and chats
      - dashboard surfaces Radar card and fallback states
  - Manual acceptance scenarios:
      - Marathi or Hindi language selection affects UI labels and assistant
        language
      - Nashik demo farmer gets recommendation, disease result, and radar
        alert in one session
      - app remains usable when Groq, Plant.id, or Open-Meteo is unavailable
      - page layout works on mobile viewport first, then desktop

  ## Assumptions And Defaults

  - Use React Router on the client.
  - Use Mongoose with a normal local MongoDB or MongoDB Atlas connection.
  - Use seeded crop rules instead of training a custom ML model in v1.
  - Use Plant.id as the hosted disease-detection provider; if unavailable,
    keep the interface but return controlled failure states.
  - Use Open-Meteo for live weather and forecast with a seeded local fallback.
  - Use Groq for multilingual advisory generation with server-enforced
    structure.
  - Do not implement OTP, JWT refresh flows, file-cloud storage, or production
    auth hardening in v1.
  - Do not implement market-price prediction, satellite features, or IoT in
    this pass.
  - Voice and admin are not allowed to block completion of the core farmer
    MVP.

