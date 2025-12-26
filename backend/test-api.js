const axios = require('axios');

// First install axios
// npm install axios

async function testAPI() {
  try {
    const response = await axios.post('http://localhost:5000/api/anonymize', {
      text: 'Rohan called Priya from Mumbai',
      method: 'tags'
    });
    
    console.log('API Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
// mongodb+srv://joshisuraj102_db_user:<db_password>@suraj.mor5xri.mongodb.net/?appName=Suraj