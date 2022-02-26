const express = require("express");
const router = express.Router();
const Projects = require("../models/projects");
const InfoList = require("../models/infoList");
const Stats = require("../models/stats");
const Leaderboard = require("../models/leaderboard");
const findRank = require("../routes/leaderboard");

//fetch all the projects
router.get("/fetchProjects/:userid", async (req, res) => {
  try {
    const uid = req.params.userid;

    var list = [];

    const fetchProjectList = async () => {
      return Projects.findOne({ uid: uid }).then((res) => {
        return res.projectList;
      });
    };

    //check for Document else create One
    if (await Projects.exists({ uid: uid })) {
      list = await fetchProjectList();
    } else {
      //create doc
      const createDoc = new Projects({
        uid: req.params.userid,
        no_of_projects: 0,
        no_of_projects_completed: 0,
      });

      await createDoc.save();

      if (!(await Leaderboard.exists({ tag: "leaderboard" }))) {
        const createLeaderboard = new Leaderboard({
          tag: "leaderboard",
          ranks: [],
        });

        await createLeaderboard.save();
      }

      await Leaderboard.findOneAndUpdate(
        { tag: "leaderboard" },
        {
          $addToSet: {
            ranks: {
              rank: 0,
              uid: req.params.userid,
              name: "",
              picture: "",
              projectsDone: 0,
            },
          },
        }
      );

      //create doc and fetch
      list = await fetchProjectList();
    }

    //update projectsDone on leaderboard
    const updateLeaderboard = async (projectsDone) => {
      await Leaderboard.findOneAndUpdate(
        {
          tag: "leaderboard",
          "ranks.uid": uid,
        },
        {
          $set: {
            "ranks.$.projectsDone": projectsDone,
          },
        }
      );
    };

    //update Stats
    var total = 0;
    var completed = 0;
    list.map((val) => {
      total++;
      if (val.totalTasks > 0) {
        if (val.totalTasks === val.completedTasks) {
          completed++;
        }
      }
    });
    updateLeaderboard(completed);

    await Stats.findOneAndUpdate(
      { uid: uid },
      {
        $set: {
          no_of_projects: `${completed}/${total}`,
        },
      }
    );

    return res.json(list);
  } catch (e) {
    console.log(e);
    res.status(400).send("Server Error");
  }
});

//create new Project
router.post("/createProject", async (req, res) => {
  try {
    const { id, projectName } = req.body;

    const no_of_projects = await Projects.findOne({ uid: id }).then((doc) => {
      return doc.no_of_projects;
    });

    await Projects.findOneAndUpdate(
      { uid: id },
      {
        $set: {
          no_of_projects: no_of_projects + 1,
        },
        $addToSet: {
          projectList: {
            name: projectName,
            totalTasks: 0,
            completedTasks: 0,
            progress: 0,
          },
        },
      }
    );

    //create InfoList on creation of Project
    const createProjectDoc = new InfoList({
      uid: id,
      projectName: projectName,
    });

    await createProjectDoc.save();

    res.status(200).send("Data Recieved");
  } catch (e) {
    console.log(e);
    res.status(400).send("Error");
  }
});

router.post("/deleteProject", async (req, res) => {
  try {
    const { uid, projectName } = req.body;

    await Projects.findOneAndUpdate(
      { uid: uid },
      {
        $pull: {
          projectList: {
            name: projectName,
          },
        },
      }
    );

    await InfoList.findOneAndRemove({ uid: uid, projectName: projectName });

    res.status(200).send("Data Recieved");
  } catch (e) {
    console.log(e);
    res.status(400).send("Server Error!");
  }
});

module.exports = router;
