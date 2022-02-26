const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: String,
  email: String,
  name: String,
  picture: String,
});

module.exports = mongoose.model("users", userSchema);
