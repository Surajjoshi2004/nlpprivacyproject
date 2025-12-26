import sys
import json
from presidio_analyzer import AnalyzerEngine

def detect_pii(text):
    """Find all names, locations, phones, emails in text"""
    analyzer = AnalyzerEngine()
    
    # Detect entities
    results = analyzer.analyze(
        text=text,
        language='en',
        entities=["PERSON", "LOCATION", "PHONE_NUMBER", "EMAIL_ADDRESS"]
    )
    
    # Convert to simple format
    entities = []
    for result in results:
        entities.append({
            "type": result.entity_type,
            "text": text[result.start:result.end],
            "start": result.start,
            "end": result.end,
            "score": result.score
        })
    
    return entities

if __name__ == "__main__":
    text = sys.argv[1]
    entities = detect_pii(text)
    print(json.dumps({"entities": entities}))

