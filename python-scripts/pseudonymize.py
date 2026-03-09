import sys
import json
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

FAKE_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Sam", "Jamie"]
FAKE_LOCATIONS = ["City_A", "City_B", "City_C", "Town_X", "Town_Y"]

PERSON_TYPES = {"PERSON", "PER"}
LOCATION_TYPES = {"LOCATION", "LOC", "GPE"}


def method_tags(text: str) -> str:
    """Replace entities with typed tags like <PERSON_1>."""
    analyzer = AnalyzerEngine()
    anonymizer = AnonymizerEngine()
    results = analyzer.analyze(text=text, language="en")
    return anonymizer.anonymize(text=text, analyzer_results=results).text


def method_surrogate(text: str) -> str:
    """Replace entities with realistic fake names and locations."""
    analyzer = AnalyzerEngine()
    results = analyzer.analyze(text=text, language="en")

    results_sorted = sorted(results, key=lambda x: x.start, reverse=True)

    anonymized_text = text
    entity_map: dict[str, str] = {}
    name_counter = 0
    location_counter = 0

    for result in results_sorted:
        original = text[result.start:result.end]
        if original not in entity_map:
            entity_type = result.entity_type
            if entity_type in PERSON_TYPES or "PERSON" in entity_type:
                entity_map[original] = FAKE_NAMES[name_counter % len(FAKE_NAMES)]
                name_counter += 1
            elif entity_type in LOCATION_TYPES or "LOCATION" in entity_type:
                entity_map[original] = FAKE_LOCATIONS[location_counter % len(FAKE_LOCATIONS)]
                location_counter += 1
            else:
                entity_map[original] = f"<{entity_type}>"

        replacement = entity_map[original]
        anonymized_text = anonymized_text[:result.start] + replacement + anonymized_text[result.end:]

    return anonymized_text


METHOD_MAP = {
    "tags": method_tags,
    "surrogate": method_surrogate,
    "pseudonyms": method_surrogate,  # alias
}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: anonymizer.py <text> [method]"}))
        sys.exit(1)

    text = sys.argv[1]
    method = sys.argv[2] if len(sys.argv) > 2 else "tags"

    handler = METHOD_MAP.get(method)
    if handler is None:
        print(json.dumps({"error": f"Unknown method: '{method}'. Choose from: {list(METHOD_MAP)}"}))
        sys.exit(1)

    result = handler(text)
    print(json.dumps({"anonymized_text": result}))