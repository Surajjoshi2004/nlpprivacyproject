import sys
import json
from textblob import TextBlob

def analyze_sentiment(text):
    """Calculate sentiment score (-1 to +1)"""
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity  # -1 (negative) to +1 (positive)
    
    # Classify
    if polarity > 0.1:
        label = "Positive"
    elif polarity < -0.1:
        label = "Negative"
    else:
        label = "Neutral"
    
    return {
        "score": round(polarity, 3),
        "label": label
    }

if __name__ == "__main__":
    text = sys.argv[1]
    sentiment = analyze_sentiment(text)
    print(json.dumps(sentiment))

