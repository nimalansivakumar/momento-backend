const mongoose = require("mongoose");
const express = require("express");
const InfoList = require("../models/infoList");
const Projects = require("../models/projects");
const Stats = require("../models/stats");
const router = express.Router();
const findProgress = require("./findProgress");

//fetch all the information of the project
router.get("/:userid/:projectName", async (req, res) => {
  try {
    const { userid, projectName } = req.params;

    var list;

    //fetch info
    await InfoList.findOne({
      uid: userid,
      projectName: projectName,
    }).then((res) => {
      list = res;
    });

    return res.json(list);
  } catch (e) {
    console.log(e);
    res.status(400).send("Server Error");
  }
});

//add tasks on implementation list
router.post("/impList", async (req, res) => {
  try {
    const { userid, projectName, task } = req.body;

    //update total tasks for project after adding a task
    const updateProjectStatus = async () => {
      //fetch doc
      const docs = await Projects.findOne({
        uid: userid,
        "projectName.name": projectName,
      });

      //find current total tasks
      var currentTotal = docs.projectList.find((val) => {
        return val.name === projectName;
      });

      //update it
      await Projects.findOneAndUpdate(
        {
          uid: userid,
          "projectList.name": projectName,
        },
        {
          $set: {
            "projectList.$.totalTasks": currentTotal.totalTasks + 1,
          },
        }
      );
    };

    //add task
    await InfoList.findOneAndUpdate(
      {
        uid: userid,
        projectName: projectName,
      },
      {
        $addToSet: {
          implementationList: {
            task: task,
            status: false,
          },
        },
      }
    ).then(() => {
      updateProjectStatus();
      findProgress(userid, projectName);
    });

    res.status(200).send("Data Recieved");
  } catch (e) {
    console.log(e);
    res.status(400).send("Server Error");
  }
});

//fetch resources
router.post("/resList", async (req, res) => {
  try {
    const { userid, projectName, resource } = req.body;

    await InfoList.findOneAndUpdate(
      {
        uid: userid,
        projectName: projectName,
      },
      {
        $addToSet: {
          resourceList: {
            resource: resource,
          },
        },
      }
    );

    res.status(200).send("Data Recieved");
  } catch (e) {
    console.log(e);
    res.status(400).send("Server Error");
  }
});

//add working durations
router.post("/timer", async (req, res) => {
  try {
    const { userid, projectName, hours, minutes, seconds, date } = req.body;

    const sumDurations = async () => {
      // find the last saved durations
      let currentDurations = await Stats.findOne({ uid: userid }).then(
        (doc) => {
          //returns only numeric characters
          parseNum = (str) => +str.replace(/[^.\d]/g, "");
          let total_time_spent = doc.total_time_spent;
          let timeArr = total_time_spent.split(":").map((val) => {
            return parseNum(val);
          });

          return timeArr;
        }
      );

      let h = currentDurations[0] + hours,
        m = currentDurations[1] + minutes,
        s = currentDurations[2] + seconds,
        remain = 0;

      while (s > 60) {
        s = s - 60;
        remain++;
      }

      m = m + remain;
      remain = 0;

      while (m > 60) {
        m = m - 60;
        remain++;
      }

      h = h + remain;

      await Stats.findOneAndUpdate(
        { uid: userid },
        {
          $set: {
            total_time_spent: `${h}h:${m}m:${s}s`,
          },
        }
      );
    };

    //add the durations and sum the duration to all the previous durations
    await InfoList.findOneAndUpdate(
      { uid: userid, projectName: projectName },
      {
        $addToSet: {
          timer: {
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            work_day: date,
          },
        },
      }
    ).then(() => {
      sumDurations();
    });

    res.status(200).send("Data Recieved");
  } catch (e) {
    console.log(e);
    res.status(400).send("Server Error");
  }
});

//changes status of the task
router.post("/changeStatus", async (req, res) => {
  try {
    const { userid, projectName, taskid, status } = req.body;

    await InfoList.findOneAndUpdate(
      {
        uid: userid,
        projectName: projectName,
        "implementationList._id": taskid,
      },
      {
        $set: {
          "implementationList.$.status": status,
        },
      }
    ).then(() => {
      findProgress(userid, projectName);
    });

    res.status(200).send("Data Recieved");
  } catch (e) {
    console.log(e);
    res.status(400).send("Server Error");
  }
});

//delete a task
router.post("/deleteTask", async (req, res) => {
  try {
    const { userid, projectName, taskid } = req.body;

    var status;

    const doc = await InfoList.findOne({
      uid: userid,
      projectName: projectName,
    });

    doc.implementationList.map((val) => {
      if (val._id.toString() === taskid) {
        status = val.status;
      }
    });

    //update total tasks for project after deleting a task
    const updateProjectStatus = async () => {
      //fetch doc
      const docs = await Projects.findOne({
        uid: userid,
        "projectName.name": projectName,
      });

      //find current total tasks
      var currentTotals = docs.projectList.find((val) => {
        return val.name === projectName;
      });

      //update it by subtracting one
      if (!status) {
        await Projects.findOneAndUpdate(
          {
            uid: userid,
            "projectList.name": projectName,
          },
          {
            $set: {
              "projectList.$.totalTasks": currentTotals.totalTasks - 1,
            },
          }
        );
      } else {
        await Projects.findOneAndUpdate(
          {
            uid: userid,
            "projectList.name": projectName,
          },
          {
            $set: {
              "projectList.$.completedTasks": currentTotals.completedTasks - 1,
              "projectList.$.totalTasks": currentTotals.totalTasks - 1,
            },
          }
        );
      }
    };

    const deleteTask = async () => {
      await InfoList.findOneAndUpdate(
        { uid: userid, projectName: projectName },
        {
          $pull: {
            implementationList: {
              _id: taskid,
            },
          },
        }
      ).then(() => {
        updateProjectStatus();
        findProgress(userid, projectName);
      });
    };

    deleteTask();

    res.status(200).send("Data Recieved");
  } catch (e) {
    console.log(e);
    res.status(400).send("Server Error");
  }
});

router.post("/deleteResource", async (req, res) => {
  try {
    const { userid, projectName, res_id } = req.body;

    await InfoList.findOneAndUpdate(
      { uid: userid, projectName: projectName },
      {
        $pull: {
          resourceList: { _id: res_id },
        },
      }
    );

    res.status(200).send("Data Recieved");
  } catch (e) {
    console.log(e);
    res.status(400).send("Server Error");
  }
});

module.exports = router;
