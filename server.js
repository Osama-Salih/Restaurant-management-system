const path = require('node:path');

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const helmet = require('helmet');

const mountRoutes = require('./routes');
const dbConnection = require('./config/database');
const ApiError = require('./utils/ApiError');
const globalErrorHandler = require('./middlewares/errorMiddleware');
const { checkout } = require('./services/orderService');

dotenv.config({ path: './config.env' });

const app = express();

// Handle uncaughtException
process.on('uncaughtException', (err) => {
  console.error(`UncaughtException ERROR: ${err.name} | ${err.message}`);
  process.exit(1);
});

app.use(cors());
app.options('*', cors());
app.use(compression());

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  checkout,
);
app.use(express.json({ limit: '10kb' }));
// Serev a static files form uploads
app.use(express.static(path.join(__dirname, 'uploads')));

// DB connection
dbConnection();

// Morgan loggs
if (process.env.NODE_ENV === 'development') {
  morgan('dev');
  console.log(process.env.NODE_ENV);
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
});
app.use(mongoSanitize());

// Apply the rate limiting middleware to all requests.
app.use('/api', limiter);
app.use(xss());
app.use(helmet());
app.use(
  hpp({
    whitelist: [
      'price',
      'ratingsAverage',
      'ratingsQuantity',
      'quantity',
      'calories',
    ],
  }),
);

// Mount Routes
mountRoutes(app);

// Send error to error Middleware for unhandled routes
app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find this route ${req.originalUrl}`, 400));
});

// Global error handler middleware
app.use(globalErrorHandler);

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`App listening on port: ${port}`),
);

process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection ERROR: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`shutting down...`);
    process.exit(1);
  });
});
