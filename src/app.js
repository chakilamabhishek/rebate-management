const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger/swagger.json');
const logger = require('./utils/logger'); // Assuming your logger is in middlewares
const errorHandler = require('./middlewares/errorHandler');
const { AppDataSource } = require('../ormconfig'); // PostgreSQL connection
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const https = require('https');
const config = require('./config');

const rebateProgramRoutes = require('./routes/rebateProgramRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const rebateClaimRoutes = require('./routes/rebateClaimRoutes');
const authRoutes = require('./routes/authRoutes'); // Updated import
const indexRoutes = require('./routes/index'); // Added new route

const app = express();

// Connect to the database and run migrations
AppDataSource.initialize()
    .then(() => {
        console.log('Database connected');
    })
    .catch((err) => {
        console.error('Error connecting to the database or running migrations:', err);
    });


// Middleware setup
app.use(morgan('combined', { stream: logger.stream }));
app.use(helmet());
app.use(cors({ credentials: true, origin: true }));
app.use(compression());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);



// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));


// API routes
app.use('/api/rebate-programs', rebateProgramRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/rebate-claims', rebateClaimRoutes);
app.use('/api/auth', authRoutes); // Added token routes
app.use('/', indexRoutes); // Added new route

// Audit logging middleware
app.use((req, res, next) => {
    logger.info('Audit Log', { method: req.method, url: req.url, body: req.body });
    next();
});

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception thrown:', err);
    process.exit(1);
});

// Start the server with HTTPS in production
if (config.nodeEnv === 'production') {
    const options = {
        key: fs.readFileSync('/path/to/your/privkey.pem'),
        cert: fs.readFileSync('/path/to/your/fullchain.pem')
    };
    https.createServer(options, app).listen(config.port, () => {
        console.log(`Server is running on port ${config.port} with HTTPS`);
    });
} else {
    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`);
    });
}

module.exports = app;