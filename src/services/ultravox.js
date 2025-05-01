import { config } from '../config/env.js';
import { getServerBaseUrl } from '../utils/url.js';

export async function createUltravoxCall(clientName, phoneNumber, userType) {
    const baseUrl = getServerBaseUrl();
    
    const systemPrompt = `
## Agent Role
  - Name: Claire
  - Context: Voice-based conversation
  - Current time: ${new Date().toISOString()}
  - User's name: ${clientName}
  - User Type: ${userType}
  - User's phone number: ${phoneNumber}

[Rest of the system prompt...]`;

    const selectedTools = [
        {
            temporaryTool: {
                modelToolName: 'sendSMS',
                description: 'Send an SMS message to the user',
                dynamicParameters: [
                    {
                        name: 'recipient',
                        location: 'PARAMETER_LOCATION_BODY',
                        schema: { type: 'string', description: 'Phone number in E.164 format' },
                        required: true
                    },
                    {
                        name: 'message',
                        location: 'PARAMETER_LOCATION_BODY',
                        schema: { type: 'string', description: 'Message text' },
                        required: true
                    }
                ],
                client: {
                    implementation: async (parameters) => {
                        try {
                            const response = await fetch(`${baseUrl}/api/sms-webhook`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(parameters)
                            });

                            if (!response.ok) {
                                throw new Error('Failed to send SMS');
                            }

                            const result = await response.json();
                            return `SMS sent successfully (${result.messageSid})`;
                        } catch (error) {
                            console.error('Error in sendSMS tool:', error);
                            return 'Failed to send SMS';
                        }
                    }
                }
            }
        },
        {
            temporaryTool: {
                modelToolName: 'addContact',
                description: 'Add a contact via external CRM API',
                dynamicParameters: [
                    { name: 'clientName', location: 'PARAMETER_LOCATION_QUERY', schema: { type: 'string' }, required: true },
                    { name: 'phoneNumber', location: 'PARAMETER_LOCATION_QUERY', schema: { type: 'string' }, required: true },
                    { name: 'tag', location: 'PARAMETER_LOCATION_QUERY', schema: { type: 'string' }, required: false }
                ],
                http: {
                    baseUrlPattern: 'https://tag-ghl-danella.onrender.com/api/contacts',
                    httpMethod: 'GET'
                }
            }
        }
    ];

    const callConfig = {
        systemPrompt,
        model: 'fixie-ai/ultravox-70B',
        voice: 'b0e6b5c1-3100-44d5-8578-9015aa3023ae',
        temperature: 0.4,
        firstSpeaker: "FIRST_SPEAKER_USER",
        medium: { "twilio": {} },
        selectedTools
    };

    try {
        const response = await fetch('https://api.ultravox.ai/api/calls', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': config.ultravox.apiKey
            },
            body: JSON.stringify(callConfig)
        });

        if (!response.ok) {
            throw new Error(`Ultravox API error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error creating Ultravox call:', error);
        throw error;
    }
}