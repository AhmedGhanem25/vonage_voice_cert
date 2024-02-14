
const express = require('express');
const Vonage = require('@vonage/server-sdk');
require('dotenv').config('.env');
var logger = require('morgan');

// env var decleration ..
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const APPLICATION_ID = process.env.APPLICATION_ID;

const vonage = new Vonage({
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    applicationId: APPLICATION_ID,
    privateKey: './private.key'
}, { debug: true });

const app = express();
app.use(express.json());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));


app.get('/webhooks/inbound-call', (req, res) => {
    console.log('incoming call.', req.body);
    const ncco = [
        {
            "action": "talk",
            "text": "<speak> \
                        <p>This is Sreekanth’s number.</p>\
                        <p>. Please leave a message and press pound to end the message. </p>\
                    </speak>"
        },
        {
            "action": 'record',
            "endOnKey": '#',
            "beepStart": 'true',
            "endOnSilence": "4",
            "eventUrl": [
                `${req.protocol}://${req.get('host')}/webhooks/recordings`
            ]
        }
    ];
    res.json(ncco);
});

app.post('/webhooks/recordings', (req, res) => {
    const recording_url = req.body.recording_url
    console.log(req.body);
    console.log(`Recording URL = ${recording_url}`)

    vonage.files.save(recording_url, 'recording_output.mp3', (err, res) => {
        if (err) { console.error(err); }
        else {
            console.log(res);
        }
    });

    res.status(204).send()
});

app.get('/download-myrecord', (req, res) => {
    const file = `${__dirname}/recording_output.mp3`;
    res.download(file);
});

app.get('/', (req, res) => {
    res.status(200).send("Your service working....")
});

app.listen(3000);
