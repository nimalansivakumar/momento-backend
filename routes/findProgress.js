const express = require("express");
const Projects = require("../models/projects");
const InfoList = require("../models/infoList");

module.exports = async function (userid, projectName) {
  //find the project document
  let list = await InfoList.findOne({
    uid: userid,
    projectName: projectName,
  });

  let totalTasks = 0;
  let completedTasks = 0;
  var bar;

  // find the progress of  the project
  if (list.implementationList.length > 0) {
    list.implementationList.map((val) => {
      totalTasks++;
      if (val.status) {
        completedTasks++;
      }
    });

    bar = Math.floor((completedTasks / totalTasks) * 100);
  } else {
    bar = 0;
  }

  await Projects.findOneAndUpdate(
    {
      uid: userid,
      "projectList.name": projectName,
    },
    {
      $set: {
        "projectList.$.totalTasks": totalTasks,
        "projectList.$.completedTasks": completedTasks,
        "projectList.$.progress": bar,
      },
    }
  );
};
