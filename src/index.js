import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from './config/env.js';
import { validateTwilioRequest } from './middleware/twilio-auth.js';
import { setupRoutes } from './routes/index.js';

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Validate Twilio requests
app.use('/api/twilio', validateTwilioRequest);

// Setup routes
setupRoutes(app);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

try {
    app.listen(config.server.port, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${config.server.port}`);
    });
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}