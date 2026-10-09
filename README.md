# Meddibuddy

> An educational AI companion that translates complex medical lab reports into plain, calm language so you can have better conversations with your doctor.

---

## Medical Disclaimer

Meddibuddy is a **strictly educational tool**. It does **not** diagnose diseases, prescribe medications, or replace professional medical advice. Every output is generated solely to help you understand your own lab report and prepare informed questions for your healthcare provider.

---

## Features

| Feature | Description |
|---|---|
| **Smart Upload** | Upload PDF / JPG / PNG reports (10 MB max). Camera capture supported on mobile. |
| **AI OCR** | Google Document AI extracts text, tables, and values from your report. |
| **Gemini Analysis** | Gemini 1.5 Pro explains every parameter in plain language with educational context. |
| **Range Indicator** | Visual LOW - NORMAL - HIGH bar with an ARIA-labelled marker per test. |
| **Ask My Report** | Multilingual chat grounded strictly in your uploaded data - never hallucinates. |
| **Multilingual** | Full UI and report explanations in English, Hindi, Kannada, Tamil, and Telugu. |
| **Health Glossary** | Searchable definitions for 13 common biomarkers with "ask your doctor" notes. |
| **My Reports** | View, revisit, and permanently delete past reports (Firestore + Storage). |
| **Demo Mode** | "Try Demo Report" runs the full pipeline on a synthetic CBC + thyroid dataset - no personal data needed. |
| **Safety Guardrails** | Every Gemini output is filtered: blocks diagnoses, prescription advice, and hallucinated values before they reach the user. |

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** for utility-first styling
- **@react-three/fiber** + **Three.js** - 3D animated landing scanner
- **React Router v7** - SPA routing
- **Firebase JS SDK v11** - Auth, Firestore, Storage, Callable Functions

### Backend (Firebase Cloud Functions - TypeScript)
- **Google Document AI** - OCR + form parsing
- **Gemini 1.5 Pro** via `@google/generative-ai` - structured JSON analysis + multilingual chat
- **Clinical Safety Module** (`safety.ts`) - regex + semantic guardrails on every AI output
- **Exponential backoff retry** (`retry.ts`) - resilient API calls

### Infrastructure
- **Firebase Authentication** (Email/Password)
- **Cloud Firestore** - report documents, chat history, translation cache
- **Cloud Storage** - encrypted report files at `users/{uid}/reports/{reportId}/original.*`
- **Secret Manager** - Gemini API key, Document AI credentials (never in client)

---

## Project Structure

```
meddi/
├── functions/               # Firebase Cloud Functions (TypeScript)
│   └── src/
│       ├── index.ts         # Function entrypoints (processReport, askReport, translateReport)
│       ├── ocr.ts           # Google Document AI integration
│       ├── gemini.ts        # Gemini analysis, chat, translation
│       ├── safety.ts        # Clinical safety guardrail
│       ├── retry.ts         # Exponential backoff helper
│       └── types.ts         # Shared TypeScript types
│
└── src/                     # React frontend
    ├── components/
    │   ├── app/             # Dashboard components (TestResultCard, RangeIndicator, etc.)
    │   ├── landing/         # Landing page sections + 3D canvas
    │   └── ui/              # Shared UI primitives
    ├── contexts/            # AuthContext, LanguageContext
    ├── data/                # healthGlossaryData, syntheticDemoReport
    ├── i18n/                # Locale strings (en, hi, kn, ta, te)
    ├── pages/               # Route-level page components
    ├── services/            # firebase.ts, gemini.ts, ocr.ts, translation.ts
    └── types/               # Global TypeScript interfaces
```

---

## Getting Started

### Prerequisites
- Node.js >= 20
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project with **Firestore**, **Storage**, **Authentication**, and **Cloud Functions** enabled

### 1. Clone and Install

```bash
git clone https://github.com/hemmant-yadav/meddi.git
cd meddi
npm install
cd functions && npm install && cd ..
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Firebase project credentials:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> **Never** add your Gemini API key to `.env`. Store it in **Firebase Secret Manager** and access it via `defineSecret()` in Cloud Functions.

### 3. Run Locally

```bash
# Start the Vite dev server
npm run dev

# In a separate terminal - start Firebase emulators
firebase emulators:start
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Deploy

```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Firestore + Storage rules
firebase deploy --only firestore,storage

# Build and deploy hosting (optional)
npm run build
firebase deploy --only hosting
```

---

## Security

- All report files are stored at `users/{uid}/reports/...` - no public URLs, accessible only by the authenticated owner.
- Firestore security rules enforce per-user data isolation.
- The Gemini API key lives exclusively in Secret Manager and is never exposed to the client.
- The safety guardrail (`functions/src/safety.ts`) blocks or rewrites any output containing diagnoses, prescription instructions, dose changes, or values not grounded in the source OCR text.

---

## Running Tests

```bash
# Safety guardrail unit tests (15+ cases)
cd functions
npm test
```

---

## Firestore Schema

```
users/{uid}/
  reports/{reportId}
    status: uploading | reading | extracting | understanding | preparing | complete | failed
    fileName, storagePath, createdAt, reportType, parameterCount
    analysisResult: { ...MedicalAnalysisResult }
    messages/{messageId}       <- Ask My Report chat history
    translations/{language}    <- Cached translated analysis
```

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

Please ensure all AI-touching code runs through the safety guardrail and no real patient data is used in tests.

---

## License

MIT (c) hemmant-yadav

---

Built with care to make healthcare more understandable for everyone.
