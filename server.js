const path = require('node:path');

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');

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
app.use(express.json());
// Serev a static files form uploads
app.use(express.static(path.join(__dirname, 'uploads')));

// DB connection
dbConnection();

// Morgan loggs
if (process.env.NODE_ENV === 'development') {
  morgan('dev');
  console.log(process.env.NODE_ENV);
}

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
