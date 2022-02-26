const express = require("express");
const Stats = require("../models/stats");
const Users = require("../models/users");
const InfoList = require("../models/infoList");
const router = express.Router();

router.get("/:userid", async (req, res) => {
  try {
    const uid = req.params.userid;

    const userDetails = await Users.findOne({ uid: uid });

    const statsDetails = await Stats.findOne({ uid: uid });

    return res.json({ userDetails, statsDetails });
  } catch (e) {
    console.log(e);
    res.status(400).send("Server Error");
  }
});

router.post("/postImage", async (req, res) => {
  try {
    const { userid, url } = req.body;

    await Users.findOneAndUpdate(
      { uid: userid },
      {
        $set: { picture: url },
      }
    );
  } catch (e) {
    console.log(e);
    res.status(400).send("Server Error");
  }
});

module.exports = router;
