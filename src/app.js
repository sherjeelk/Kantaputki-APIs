const express = require('express');
const path = require('path');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const Order = require('./models/order.model')
const moment = require('moment');

const app = express();
global.__basedir = __dirname;

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// v1 api routes
app.use('/v1', routes);

app.use('/static', express.static(path.join(__dirname, 'static')));



// // send back a 404 error for any unknown api request
// app.use((req, res, next) => {
//   next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
// });





// convert error to ApiError, if needed
app.use(errorConverter);

const CronJob = require('cron').CronJob;
const job = new CronJob('*/59 * * * *', async function() {
  console.log('RUNNING CRON FOR ORDER EXPIRING');
  const date = moment().subtract(24, 'hours');
  // await Order.updateMany({ status: 'PAYMENT_CONFIRMED', created: {$lt: date}}, {"$set":{'status': 'EXPIRED'}});
}, null, true);
job.start();

// handle error
app.use(errorHandler);

module.exports = app;
