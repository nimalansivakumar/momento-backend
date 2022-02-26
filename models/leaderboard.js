const mongoose = require("mongoose");

const Leaderboard = new mongoose.Schema({
  tag: String,
  ranks: [
    {
      rank: Number,
      uid: String,
      name: String,
      picture: String,
      projectsDone: Number,
    },
  ],
});

module.exports = mongoose.model("leaderboard", Leaderboard);
