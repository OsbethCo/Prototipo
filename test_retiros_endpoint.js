const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Test with authentication
async function testEndpoint() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log('No token found. Please login first.');
        return;
    }

    try {
        console.log('Testing GET /api/retiros...');
        const response = await axios.get(`${API_URL}/retiros`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Success! Response:', response.data);
    } catch (error) {
        console.log('Error:', error.response?.status, error.response?.data || error.message);
    }
}

testEndpoint();
