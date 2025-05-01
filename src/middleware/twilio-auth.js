import twilio from 'twilio';
import { config } from '../config/env.js';

export function validateTwilioRequest(req, res, next) {
    const twilioSignature = req.headers['x-twilio-signature'];
    
    if (!twilioSignature) {
        return res.status(401).json({ error: 'No Twilio signature found' });
    }

    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const params = req.method === 'POST' ? req.body : req.query;

    const isValid = twilio.validateRequest(
        config.twilio.authToken,
        twilioSignature,
        url,
        params
    );

    if (!isValid) {
        return res.status(401).json({ error: 'Invalid Twilio signature' });
    }

    next();
}