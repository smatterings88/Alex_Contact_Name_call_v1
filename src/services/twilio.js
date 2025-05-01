import twilio from 'twilio';
import { config } from '../config/env.js';
import { formatPhoneNumber } from '../utils/phone.js';

const clientOptions = {
    timeout: 30000,
    keepAlive: false
};

const client = twilio(config.twilio.accountSid, config.twilio.authToken, clientOptions);

export async function sendSMS(phoneNumber, message) {
    console.log('\n=== SMS Send Attempt ===');
    
    try {
        const formattedNumber = formatPhoneNumber(phoneNumber);
        if (!formattedNumber) {
            throw new Error('Invalid phone number format');
        }

        const result = await client.messages.create({
            body: message,
            from: config.twilio.phoneNumber,
            to: formattedNumber,
            attempt: 1,
            maxPrice: 0.15
        });

        console.log('SMS sent successfully:', {
            sid: result.sid,
            status: result.status
        });

        return result.sid;
    } catch (error) {
        console.error('SMS send error:', error);
        throw error;
    }
}

export async function initiateCall(clientName, phoneNumber, userType, joinUrl) {
    try {
        const call = await client.calls.create({
            twiml: `<Response><Connect><Stream url="${joinUrl}"/></Connect></Response>`,
            to: phoneNumber,
            from: config.twilio.phoneNumber
        });

        return call.sid;
    } catch (error) {
        console.error('Error initiating call:', error);
        throw error;
    }
}