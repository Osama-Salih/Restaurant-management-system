const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');

const dbConnection = require('./config/database');
const restaurantRoute = require('./routes/restaurantRoute');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const ApiError = require('./utils/ApiError');
const globalErrorHandler = require('./middlewares/errorMiddleware');

dotenv.config({ path: './config.env' });

const app = express();

app.use(cors());
app.options('*', cors());

app.use(compression());

app.use(express.json());

// DB
dbConnection();

if (process.env.NODE_ENV === 'development') {
  morgan('dev');
  console.log(process.env.NODE_ENV);
}

app.use('/api/v1/restaurants', restaurantRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/auth', authRoute);

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
