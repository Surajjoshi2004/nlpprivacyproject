import sys
import json
from textblob import TextBlob

POSITIVE_THRESHOLD = 0.1
NEGATIVE_THRESHOLD = -0.1


def analyze_sentiment(text: str) -> dict:
    """Return polarity score and label for the given text.

    Score ranges from -1.0 (most negative) to +1.0 (most positive).
    Subjectivity is also surfaced so callers can gauge reliability.
    """
    sentiment = TextBlob(text).sentiment
    polarity = sentiment.polarity

    if polarity > POSITIVE_THRESHOLD:
        label = "Positive"
    elif polarity < NEGATIVE_THRESHOLD:
        label = "Negative"
    else:
        label = "Neutral"

    return {
        "score": round(polarity, 3),
        "subjectivity": round(sentiment.subjectivity, 3),
        "label": label,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: sentiment.py <text>"}))
        sys.exit(1)

    print(json.dumps(analyze_sentiment(sys.argv[1])))