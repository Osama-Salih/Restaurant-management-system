const fs = require('fs');
const dotenv = require('dotenv');
const Restaurant = require('../../models/restaurantModel');

dotenv.config({ path: '../../config.env' });

const dbConnection = require('../../config/database');

dbConnection();

const restaurants = JSON.parse(fs.readFileSync(`./seeder.json`));

const inserData = async () => {
  try {
    await Restaurant.create(restaurants);
    console.log('Data inserted successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit(1);
};

const deleteData = async () => {
  try {
    await Restaurant.deleteMany();
    console.log('Data deleted successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit(1);
};

if (process.argv[2] === '-d') {
  deleteData();
} else if (process.argv[2] === '-i') {
  inserData();
}
