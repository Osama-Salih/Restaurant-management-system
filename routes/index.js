const restaurantRoute = require('./restaurantRoute');
const userRoute = require('./userRoute');
const authRoute = require('./authRoute');
const reviewRoute = require('./reviewRoute');
const menuRoute = require('./menuRoute');
const categoryRoute = require('./categoryRoute');
const itemRoute = require('./itemsRoute');

const mountRoutes = (app) => {
  app.use('/api/v1/restaurants', restaurantRoute);
  app.use('/api/v1/users', userRoute);
  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/reviews', reviewRoute);
  app.use('/api/v1/menus', menuRoute);
  app.use('/api/v1/categories', categoryRoute);
  app.use('/api/v1/items', itemRoute);
};

module.exports = mountRoutes;
