import sys
import json
import hashlib
import random
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

# Fake name pools for surrogate method
FAKE_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Sam", "Jamie"]
FAKE_LOCATIONS = ["City_A", "City_B", "City_C", "Town_X", "Town_Y"]

def method_1_tags(text):
    """Method 1: Replace with typed tags like <PERSON_1>"""
    analyzer = AnalyzerEngine()
    anonymizer = AnonymizerEngine()
    
    results = analyzer.analyze(text=text, language='en')
    
    # Use default replacement (adds tags automatically)
    anonymized = anonymizer.anonymize(text=text, analyzer_results=results)
    
    return anonymized.text

def method_2_hash(text):
    """Method 2: Replace with consistent hash tokens"""
    analyzer = AnalyzerEngine()
    results = analyzer.analyze(text=text, language='en')
    
    # Sort by position (reverse) so we don't mess up indices
    results_sorted = sorted(results, key=lambda x: x.start, reverse=True)
    
    anonymized_text = text
    entity_map = {}
    
    for result in results_sorted:
        original = text[result.start:result.end]
        
        # Create consistent hash for same entity
        if original not in entity_map:
            hash_val = hashlib.md5(original.encode()).hexdigest()[:8]
            entity_map[original] = f"{result.entity_type}_{hash_val}"
        
        replacement = entity_map[original]
        anonymized_text = anonymized_text[:result.start] + replacement + anonymized_text[result.end:]
    
    return anonymized_text

def method_3_surrogate(text):
    """Method 3: Replace with realistic fake names"""
    analyzer = AnalyzerEngine()
    results = analyzer.analyze(text=text, language='en')
    
    # DEBUG: Print what entities are detected
    import sys
    for r in results:
        print(f"DEBUG: Entity={text[r.start:r.end]}, Type={r.entity_type}", file=sys.stderr)
    
    results_sorted = sorted(results, key=lambda x: x.start, reverse=True)
    
    anonymized_text = text
    entity_map = {}
    name_counter = 0
    location_counter = 0
    
    for result in results_sorted:
        original = text[result.start:result.end]
        
        if original not in entity_map:
            print(f"DEBUG: Processing {original} as {result.entity_type}", file=sys.stderr)
            
            # Handle all person-related types
            if "PERSON" in result.entity_type or result.entity_type in ["PER", "PERSON"]:
                entity_map[original] = FAKE_NAMES[name_counter % len(FAKE_NAMES)]
                name_counter += 1
                print(f"DEBUG: Replaced with {entity_map[original]}", file=sys.stderr)
            # Handle all location-related types
            elif "LOCATION" in result.entity_type or result.entity_type in ["LOC", "GPE", "LOCATION"]:
                entity_map[original] = FAKE_LOCATIONS[location_counter % len(FAKE_LOCATIONS)]
                location_counter += 1
                print(f"DEBUG: Replaced with {entity_map[original]}", file=sys.stderr)
            else:
                entity_map[original] = f"<{result.entity_type}>"
        
        replacement = entity_map[original]
        anonymized_text = anonymized_text[:result.start] + replacement + anonymized_text[result.end:]
    
    return anonymized_text


if __name__ == "__main__":
    text = sys.argv[1]
    method = sys.argv[2] if len(sys.argv) > 2 else "tags"
    
    print(f"DEBUG: Received method: {method}", file=sys.stderr)
    
    # Map "pseudonyms" to "surrogate"
    if method == "pseudonyms":
        method = "surrogate"
        print(f"DEBUG: Mapped to: {method}", file=sys.stderr)
    
    print(f"DEBUG: Using method: {method}", file=sys.stderr)
    
    if method == "tags":
        print("DEBUG: Calling method_1_tags", file=sys.stderr)
        result = method_1_tags(text)
    elif method == "hash":
        print("DEBUG: Calling method_2_hash", file=sys.stderr)
        result = method_2_hash(text)
    elif method == "surrogate":
        print("DEBUG: Calling method_3_surrogate", file=sys.stderr)
        result = method_3_surrogate(text)
    else:
        print(f"DEBUG: Unknown method, using original text", file=sys.stderr)
        result = text
    
    print(json.dumps({"anonymized_text": result}))
