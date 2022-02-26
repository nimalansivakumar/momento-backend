const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const PORT = process.env.PORT;
const connectDB = require("./config/mongodb");

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

connectDB();

app.use("/authenticate", require("./routes/user"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/projects", require("./routes/projects"));
app.use("/projects/info", require("./routes/infoList"));
app.use("/leaderboard", require("./routes/leaderboard"));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(PORT || 5000, () => {
  console.log("Server Listening on PORT " + PORT);
});
