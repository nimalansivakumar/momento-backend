const express = require("express");
const Stats = require("../models/stats");
const router = express.Router();
const User = require("../models/users");

router.post("/", async (req, res) => {
  try {
    const { uid, email, displayName } = req.body;

    //find if there's an existing user
    var isUser = await User.findOne({ uid: uid });

    //add new doc if not an existing user
    if (!isUser) {
      const newUser = new User({
        uid: uid,
        email: email,
        name: displayName,
        picture: "",
      });
      await newUser.save();

      const newStats = new Stats({
        uid: uid,
        no_of_projects: "0",
        total_time_spent: "0h:0m:0s",
        rank: -1,
        most_time_spent: "null",
      });

      await newStats.save();
    }

    res.status(200).send("Data Recieved");
  } catch (e) {
    console.log(e);
    res.status(400).send("Server Error");
  }
});

module.exports = router;
