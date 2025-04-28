const path = require("path");

const controller = require("./controller/controller");
const downloaderController = require("./controller/downloader_controller");

const express = require("express");
const fs = require("fs");

const app = express();

const outputDir = path.join(__dirname, "public");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
app.use(
  "/public",
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, filePath) => {
      if (path.extname(filePath).toLowerCase() === ".mp3") {
        res.setHeader("Content-Type", "audio/mpeg");
      }
    },
  })
);
app.use(express.json());

app.get("/downloadVideo", downloaderController.downloadVideo);
app.get("/videoInfo",downloaderController.videoInfo);

app.get("/", controller.homePage);


app.listen(process.env.PORT || 3000);
