const mongoose = require("mongoose");

const InfoList = new mongoose.Schema({
  uid: String,
  projectName: String,
  implementationList: [
    {
      task: String,
      status: Boolean,
    },
  ],
  resourceList: [
    {
      resource: String,
    },
  ],
  timer: [
    {
      hours: Number,
      minutes: Number,
      seconds: Number,
      work_day: String,
    },
  ],
});

module.exports = mongoose.model("infoList", InfoList);
