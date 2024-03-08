const restaurantRoute = require('./restaurantRoute');
const userRoute = require('./userRoute');
const authRoute = require('./authRoute');
const reviewRoute = require('./reviewRoute');
const menuRoute = require('./menuRoute');
const categoryRoute = require('./categoryRoute');
const itemRoute = require('./itemsRoute');
const couponRoute = require('./couponRoute');
const cartRoute = require('./cartRoute');
const addressRoute = require('./addressRoute');
const orderRoute = require('./orderRoute');

const mountRoutes = (app) => {
  app.use('/api/v1/restaurants', restaurantRoute);
  app.use('/api/v1/users', userRoute);
  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/reviews', reviewRoute);
  app.use('/api/v1/menus', menuRoute);
  app.use('/api/v1/categories', categoryRoute);
  app.use('/api/v1/items', itemRoute);
  app.use('/api/v1/coupons', couponRoute);
  app.use('/api/v1/carts', cartRoute);
  app.use('/api/v1/addresses', addressRoute);
  app.use('/api/v1/orders', orderRoute);
};

module.exports = mountRoutes;
