const mongoose = require("mongoose");

const Stats = new mongoose.Schema({
  uid: String,
  no_of_projects: String,
  total_time_spent: String,
  rank: Number,
  most_time_spent: String,
});

module.exports = mongoose.model("stats", Stats);
