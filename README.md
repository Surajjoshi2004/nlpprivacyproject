# Chat NLP Privacy Project

Full-stack NLP app to:
- detect PII entities (person, location, phone, email),
- anonymize text (tag-based or pseudonym-based),
- compare sentiment before and after anonymization,
- store results in MongoDB and view recent history.

## Project Structure

- `frontend/`: React + Vite UI
- `backend/`: Express API + MongoDB integration
- `python-scripts/`: NLP scripts used by backend (`detect_entities.py`, `pseudonymize.py`, `sentiment_analysis.py`)

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- MongoDB connection string

## Setup

### 1) Python dependencies

From project root:

```powershell
cd python-scripts
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If Presidio fails on first run due to missing spaCy model, install one:

```powershell
python -m spacy download en_core_web_lg
```

### 2) Backend dependencies

```powershell
cd backend
npm install
```

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

### 3) Frontend dependencies

```powershell
cd frontend
npm install
```

## Run the App

Use 3 terminals:

1. Backend:

```powershell
cd backend
node server.js
```

2. Frontend:

```powershell
cd frontend
npm run dev
```

3. Python environment:

The backend calls `python` directly. Make sure your Python environment with installed packages is active or available on PATH.

## API Endpoints

Base URL: `http://localhost:5000/api`

### `POST /anonymize`

Request body:

```json
{
  "text": "John called Mary from New York at john@example.com",
  "method": "tags"
}
```

- `method` supported by current flow: `tags`, `pseudonyms` (also accepts `surrogate` in Python script).

Response includes:
- original text + sentiment,
- anonymized text + sentiment,
- detected entities,
- saved record ID and timestamp.

### `GET /history`

Returns up to 50 most recent anonymization records.

## Run Python Scripts Directly

From `python-scripts/`:

```powershell
python detect_entities.py "John from New York can be reached at john@example.com"
python pseudonymize.py "John called Mary from New York" tags
python pseudonymize.py "John called Mary from New York" pseudonyms
python sentiment_analysis.py "This app is very useful"
```

## Notes

- Frontend uses `http://localhost:5000/api`.
- Frontend has a local mock fallback when backend is unavailable.
- Stored schema also allows `hash` in DB model enum, but no hash mode is currently implemented in Python anonymization flow.
