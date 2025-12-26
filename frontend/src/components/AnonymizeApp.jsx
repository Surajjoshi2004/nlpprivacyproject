import { useState } from 'react';
import axios from 'axios';

function AnonymizeApp() {
  const [text, setText] = useState('');
  const [method, setMethod] = useState('tags');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/anonymize', {
        text,
        method
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing text');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/history');
      setHistory(response.data);
      setShowHistory(true);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8 drop-shadow-lg">
          🔒 Text Anonymization Tool
        </h1>
        
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to anonymize (e.g., 'John called Mary from New York')"
                rows="4"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
              />
            </div>
            
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="tags"
                  checked={method === 'tags'}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-5 h-5 text-purple-600 cursor-pointer"
                />
                <span className="text-gray-700 font-medium">Replace with Tags</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="pseudonyms"
                  checked={method === 'pseudonyms'}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-5 h-5 text-purple-600 cursor-pointer"
                />
                <span className="text-gray-700 font-medium">Replace with Pseudonyms</span>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Processing...' : 'Anonymize Text'}
            </button>
          </form>
        </div>

        {result && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-purple-700 mb-4">📝 Original Text</h3>
              <p className="text-gray-800 mb-4 leading-relaxed">{result.original.text}</p>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Sentiment:</span>
                <span className={`font-bold ${
                  result.original.sentiment.label === 'Positive' ? 'text-green-600' :
                  result.original.sentiment.label === 'Negative' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {result.original.sentiment.label} ({result.original.sentiment.score})
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-purple-700 mb-4">✅ Anonymized Text</h3>
              <p className="text-gray-800 mb-4 leading-relaxed">{result.anonymized.text}</p>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Sentiment:</span>
                <span className={`font-bold ${
                  result.anonymized.sentiment.label === 'Positive' ? 'text-green-600' :
                  result.anonymized.sentiment.label === 'Negative' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {result.anonymized.sentiment.label} ({result.anonymized.sentiment.score})
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-purple-700 mb-4">🔍 Detected Entities</h3>
              <div className="space-y-3">
                {result.entities.map((entity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <span className="font-bold text-purple-700">{entity.type}</span>
                      <span className="text-gray-700 ml-2">: {entity.text}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      Confidence: {(entity.score * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={loadHistory}
            className="w-full bg-white text-purple-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-lg"
          >
            📜 Load History
          </button>
          
          {showHistory && history.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-purple-700 mb-4">Previous Anonymizations</h3>
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item._id} className="border-l-4 border-purple-500 pl-4 py-2">
                    <div className="mb-1">
                      <span className="font-semibold text-gray-700">Original:</span>
                      <span className="text-gray-600 ml-2">{item.originalText}</span>
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold text-gray-700">Anonymized:</span>
                      <span className="text-gray-600 ml-2">{item.anonymizedText}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Method: {item.method} | {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnonymizeApp;
