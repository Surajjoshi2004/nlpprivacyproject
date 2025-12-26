import subprocess
import json

# Test text
test_text = "Rohan called Priya from Mumbai at 9876543210. He loves the new project!"

print("=" * 60)
print("ORIGINAL TEXT:")
print(test_text)
print("=" * 60)

# Test detection
result = subprocess.run(['python', 'detect_entities.py', test_text], 
                       capture_output=True, text=True)
entities = json.loads(result.stdout)
print("\nDETECTED ENTITIES:")
print(json.dumps(entities, indent=2))

# Test all 3 methods
methods = ['tags', 'hash', 'surrogate']
for method in methods:
    result = subprocess.run(['python', 'pseudonymize.py', test_text, method], 
                           capture_output=True, text=True)
    anonymized = json.loads(result.stdout)
    print(f"\nMETHOD: {method.upper()}")
    print(anonymized['anonymized_text'])
    
    # Get sentiment for anonymized text
    sentiment_result = subprocess.run(['python', 'sentiment_analysis.py', 
                                      anonymized['anonymized_text']], 
                                     capture_output=True, text=True)
    sentiment = json.loads(sentiment_result.stdout)
    print(f"Sentiment: {sentiment['score']} ({sentiment['label']})")

# Original sentiment
original_sentiment = subprocess.run(['python', 'sentiment_analysis.py', test_text], 
                                   capture_output=True, text=True)
orig_sent = json.loads(original_sentiment.stdout)
print(f"\nORIGINAL SENTIMENT: {orig_sent['score']} ({orig_sent['label']})")
