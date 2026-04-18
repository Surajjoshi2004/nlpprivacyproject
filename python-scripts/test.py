import json
import subprocess
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent


def run_script(script_name: str, *args: str) -> dict:
    """Run a sibling Python script and parse its JSON output."""
    result = subprocess.run(
        ["python", str(SCRIPT_DIR / script_name), *args],
        capture_output=True,
        text=True,
        cwd=SCRIPT_DIR,
    )
    if result.returncode != 0:
        raise RuntimeError(f"{script_name} failed: {result.stderr.strip()}")
    return json.loads(result.stdout)

# Test text
test_text = "Rohan called Priya from Mumbai at 9876543210. He loves the new project!"

print("=" * 60)
print("ORIGINAL TEXT:")
print(test_text)
print("=" * 60)

# Test detection
entities = run_script("detect_entities.py", test_text)
print("\nDETECTED ENTITIES:")
print(json.dumps(entities, indent=2))

# Test all 3 methods
methods = ["tags", "pseudonyms", "surrogate"]
for method in methods:
    anonymized = run_script("pseudonymize.py", test_text, method)
    print(f"\nMETHOD: {method.upper()}")
    print(anonymized["anonymized_text"])

    # Get sentiment for anonymized text
    sentiment = run_script("sentiment_analysis.py", anonymized["anonymized_text"])
    print(f"Sentiment: {sentiment['score']} ({sentiment['label']})")

# Original sentiment
orig_sent = run_script("sentiment_analysis.py", test_text)
print(f"\nORIGINAL SENTIMENT: {orig_sent['score']} ({orig_sent['label']})")
