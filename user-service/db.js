const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

function connectDb() {
  try {
    mongoose.connect(process.env.MONGODB_CONNECTION_URL);
  } catch (err) {}
}

module.exports = { connectDb };
