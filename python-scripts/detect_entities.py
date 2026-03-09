import sys
import json
from presidio_analyzer import AnalyzerEngine

ENTITIES = ["PERSON", "LOCATION", "PHONE_NUMBER", "EMAIL_ADDRESS"]

_analyzer: AnalyzerEngine | None = None

def get_analyzer() -> AnalyzerEngine:
    """Return a module-level singleton to avoid re-initializing on every call."""
    global _analyzer
    if _analyzer is None:
        _analyzer = AnalyzerEngine()
    return _analyzer


def detect_pii(text: str) -> list[dict]:
    """Detect names, locations, phone numbers, and email addresses in text."""
    results = get_analyzer().analyze(text=text, language="en", entities=ENTITIES)
    return [
        {
            "type": r.entity_type,
            "text": text[r.start:r.end],
            "start": r.start,
            "end": r.end,
            "score": round(r.score, 4),
        }
        for r in results
    ]


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: detector.py <text>"}))
        sys.exit(1)

    entities = detect_pii(sys.argv[1])
    print(json.dumps({"entities": entities}))