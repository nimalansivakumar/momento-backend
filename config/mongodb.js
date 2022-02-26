const mongoose = require("mongoose");
require("dotenv");
mongoose.pluralize(null);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected Successfully!");
  } catch (e) {
    console.log("Connection Failed");
    process.exit(0);
  }
};

module.exports = connectDB;
