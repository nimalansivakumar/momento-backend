const mongoose = require("mongoose");

const projectDetails = new mongoose.Schema({
  uid: String,
  projectList: [
    {
      name: String,
      totalTasks: Number,
      completedTasks: Number,
      progress: Number,
      date: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
});

module.exports = mongoose.model("projects", projectDetails);
