const express = require("express");
const Leaderboard = require("../models/leaderboard");
const Users = require("../models/users");
const router = express.Router();
const Stats = require("../models/stats");

router.get("/:userid", async (req, res) => {
  try {
    const uid = req.params.userid;

    let list = await Leaderboard.findOne({ tag: "leaderboard" }).then((doc) => {
      return doc.ranks;
    });

    let users = await Users.find();

    //sort the array for projectsDone in descending order
    var temp = {};

    for (let i = 0; i < list.length - 1; i++) {
      for (let j = 0; j < list.length - i - 1; j++) {
        if (list[j].projectsDone < list[j + 1].projectsDone) {
          temp = list[j];
          list[j] = list[j + 1];
          list[j + 1] = temp;
        }
      }
    }

    //update the rank in the stats
    const updateStatsRank = async (userRank, user) => {
      // console.log(userRank);
      await Stats.findOneAndUpdate(
        { uid: uid },
        {
          $set: { rank: userRank },
        }
      );
    };

    //rank each object
    list.forEach((val, key) => {
      val.rank = key + 1;
      if (val.uid === uid) {
        updateStatsRank(val.rank);
      }
    });

    //match the leaderboard array with users array for name and picture
    list.forEach((val, key) => {
      users.forEach((user) => {
        var obj = list[key];
        if (val.uid === user.uid) {
          obj.name = user.name;
          obj.picture = user.picture;
        }
      });
    });

    //update the leaderboard array
    await Leaderboard.findOneAndUpdate(
      { tag: "leaderboard" },
      {
        $set: {
          ranks: list,
        },
      }
    );

    res.json(list);
  } catch (e) {
    console.log(e);
    res.status(400).send("Server Error");
  }
});

module.exports = router;
