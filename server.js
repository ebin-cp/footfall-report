const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// For Node <18, dynamic import of node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.use(cors());
app.use(express.json());

app.post('/fetch-footfalls', async (req, res) => {
    const { deviceId, imei, date, sessionValue } = req.body;

    if (!deviceId || !imei || !date || !sessionValue) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sessionCookie = `app_session=${sessionValue}`;
    const url = `https://live.api.robad.in/v3/devices/${deviceId}/monitor/footfalls?imei=${imei}&logicalId=null&date=${encodeURIComponent(date)}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Cookie': sessionCookie,
                'Content-Type': 'application/json'
            }
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }

        res.status(response.status).json({ status: response.status, data });
    } catch (err) {
        console.error('Error fetching API:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
