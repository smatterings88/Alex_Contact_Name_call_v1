# Ultravox Twilio Integration Service

A Node.js service that integrates Ultravox AI with Twilio to provide automated phone calls and SMS messaging capabilities. The service includes Go High Level (GHL) CRM integration for contact management.

## Features

- AI-powered outbound calls using Ultravox
- SMS messaging capabilities via Twilio
- Contact management with Go High Level CRM
- Secure webhook handling with Twilio signature validation
- Rate limiting and security headers
- Comprehensive error handling and logging
- Phone number formatting for multiple regions
- Contact caching for improved performance

## Prerequisites

- Node.js >= 18.0.0
- Twilio account with:
  - Account SID
  - Auth Token
  - Phone number
- Ultravox API key
- Go High Level API key and location ID

## Environment Variables

Create a `.env` file with the following variables:

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
ULTRAVOX_API_KEY=your_ultravox_api_key
GHL_API_KEY=your_ghl_api_key
GHL_LOCATION_ID=your_ghl_location_id
PORT=10000 # Optional, defaults to 10000
```

## Installation

```bash
npm install
```

## Running the Service

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Send SMS
```
POST /send-sms
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "message": "Hello from the service!"
}
```

### Initiate Call
```
POST /initiate-call
Content-Type: application/json

{
  "clientName": "John Doe",
  "phoneNumber": "+1234567890",
  "userType": "VIP" // Optional, defaults to "non-VIP"
}
```

### SMS Webhook
```
POST /api/sms-webhook
```
Handles incoming SMS webhook requests from Twilio.

### Call Status Webhook
```
POST /call-status
```
Handles call status updates from Twilio.

## Security Features

- Twilio request signature validation
- Rate limiting (100 requests per 15 minutes per IP)
- Security headers with Helmet
- Input validation and sanitization
- Error handling middleware

## Phone Number Support

Supports phone numbers for:
- United States (+1)
- Philippines (+63)
- Other international formats with country code

## Error Handling

The service includes comprehensive error handling for:
- Invalid phone numbers
- Failed API calls
- Invalid webhook signatures
- Missing required parameters
- Rate limit exceeded
- Server errors

## Deployment

The service is configured for deployment on Render with the following specifications:
- Type: Web Service
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

## Logging

Includes detailed logging for:
- API requests and responses
- SMS sending attempts
- Call status updates
- Error scenarios
- Server startup and configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License