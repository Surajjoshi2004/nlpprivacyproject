const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const Chat = require('../models/Chat');

// Path to your Python scripts folder
const pythonScriptsPath = path.join(__dirname, '../../python-scripts');

// Helper function to run Python scripts using spawn
const runPythonScript = (scriptName, args) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(pythonScriptsPath, scriptName);
    
    console.log('Running Python:', scriptName);
    console.log('With args:', args);
    
    // Use spawn instead of exec to properly pass arguments
    const pythonProcess = spawn('python', [scriptPath, ...args]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}: ${stderr}`));
        return;
      }
      
      if (stderr) {
        console.log('Python stderr:', stderr);
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (e) {
        reject(new Error('Failed to parse Python output: ' + stdout));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
};

// POST /api/anonymize - Main endpoint
router.post('/anonymize', async (req, res) => {
  try {
    const { text, method } = req.body;
    
    console.log('===== REQUEST RECEIVED =====');
    console.log('Method received:', method);
    console.log('Text length:', text?.length);
    console.log('===========================');
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Default method is 'tags'
    const anonymizationMethod = method || 'tags';
    
    console.log('Using method:', anonymizationMethod);

    // Step 1: Detect entities
    const entities = await runPythonScript('detect_entities.py', [text]);

    // Step 2: Anonymize text
    console.log('Calling Python with method:', anonymizationMethod);
    const anonymized = await runPythonScript('pseudonymize.py', [text, anonymizationMethod]);
    
    console.log('Python returned:', anonymized.anonymized_text.substring(0, 100) + '...');

    // Step 3: Get sentiment for original text
    const originalSentiment = await runPythonScript('sentiment_analysis.py', [text]);

    // Step 4: Get sentiment for anonymized text
    const anonymizedSentiment = await runPythonScript('sentiment_analysis.py', [anonymized.anonymized_text]);

    // Step 5: Save to MongoDB
    const chatRecord = new Chat({
      originalText: text,
      anonymizedText: anonymized.anonymized_text,
      method: anonymizationMethod,
      entities: entities.entities,
      originalSentiment: originalSentiment,
      anonymizedSentiment: anonymizedSentiment
    });

    await chatRecord.save();

    // Send response
    res.json({
      id: chatRecord._id,
      original: {
        text: text,
        sentiment: originalSentiment
      },
      anonymized: {
        text: anonymized.anonymized_text,
        sentiment: anonymizedSentiment
      },
      entities: entities.entities,
      method: anonymizationMethod,
      createdAt: chatRecord.createdAt
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// GET /api/history - Get all saved chats
router.get('/history', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 }).limit(50);
    res.json(chats);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

module.exports = router;
