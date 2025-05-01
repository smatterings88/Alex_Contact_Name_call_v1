import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { sendSMS } from '../services/twilio.js';
import { createUltravoxCall } from '../services/ultravox.js';
import { initiateCall } from '../services/twilio.js';
import { formatPhoneNumber } from '../utils/phone.js';
import { getServerBaseUrl } from '../utils/url.js';

export function setupRoutes(app) {
    const router = Router();

    // Health check
    router.get('/health', (req, res) => {
        res.json({ status: 'ok' });
    });

    // SMS webhook
    router.post('/api/sms-webhook', [
        body(['phoneNumber', 'message']).optional(),
        query(['recipient', 'message']).optional()
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const phoneNumber = req.body.phoneNumber || req.body.recipient || req.query.recipient;
            const message = req.body.message || req.query.message;

            if (!phoneNumber || !message) {
                return res.status(400).json({
                    error: 'Missing phoneNumber/recipient or message'
                });
            }

            const messageSid = await sendSMS(phoneNumber, message);
            res.json({ success: true, messageSid });
        } catch (error) {
            console.error('Error in SMS webhook:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Direct SMS endpoint
    router.post('/send-sms', [
        body(['phoneNumber', 'message']).notEmpty()
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { phoneNumber, message } = req.body;
            const messageSid = await sendSMS(phoneNumber, message);
            res.json({ success: true, messageSid });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Call initiation
    router.route('/initiate-call')
        .get(handleCall)
        .post(handleCall);

    app.use('/', router);
}

async function handleCall(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const clientName = req.query.clientName || req.body.clientName;
        const phoneNumber = req.query.phoneNumber || req.body.phoneNumber;
        const userType = req.query.userType || req.body.userType || 'non-VIP';

        if (!clientName || !phoneNumber) {
            return res.status(400).json({
                error: 'Missing required parameters: clientName and phoneNumber'
            });
        }

        const formattedNumber = formatPhoneNumber(phoneNumber);
        if (!formattedNumber) {
            return res.status(400).json({
                error: 'Invalid phone number format'
            });
        }

        const ultravoxCall = await createUltravoxCall(clientName, formattedNumber, userType);
        const callSid = await initiateCall(clientName, formattedNumber, userType, ultravoxCall.joinUrl);

        res.json({
            success: true,
            message: 'Call initiated successfully',
            callSid
        });
    } catch (error) {
        console.error('Error in handleCall:', error);
        res.status(500).json({
            error: 'Failed to initiate call',
            message: error.message
        });
    }
}