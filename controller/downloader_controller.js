const youtubedl = require("youtube-dl-exec");
const express = require("express");
const fs = require("fs");
const { log } = require("util");
const { info } = require("console");

var currentDownloadTasks = new Set();
/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
exports.downloadVideo = (req, res, next) => {
  const { videoId, format, quality } = req.query;

  if (!videoId) {
    return res
      .status(400)
      .send({ success: false, message: "videoId param is not provided" });
  }

  downloadeVideoFile(videoId, format, quality)
    .then((audioFormats) => {
      res.status(200).send({
        success: true,
        audios: audioFormats,
      });
    })
    .catch((err) => {
      console.error("Error while downloading video:", err.message);
      res.status(500).send({
        success: false,
        message: "Failed to download video or get audio formats.",
        error: err.message,
      });
    });
};

const downloadeVideoFile = async (videoId, format, quality) => {
  const COOKIE_SOURCE = "/etc/secrets/youtube_cookies.txt";
  const COOKIE_DIR = "/tmp";
  const COOKIE_COPY = `${COOKIE_DIR}/youtube_cookies_tmp.txt`;

  if (!fs.existsSync(COOKIE_DIR)) {
    fs.mkdirSync(COOKIE_DIR, { recursive: true }); // create the tmp directory
  }

  if (fs.existsSync(COOKIE_SOURCE)) {
    fs.copyFileSync(COOKIE_SOURCE, COOKIE_COPY);
  }
  try {
    const myCookie = process.env.COOKIE;

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    if (!format) {
      format = "mp4a";
    }

    if (!quality) {
      quality = "medium";
    }

    return youtubedl(videoUrl, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ["referer:youtube.com", "user-agent:googlebot"],
      cookies: COOKIE_COPY,
    }).then((info) => {
      fs.unlinkSync(COOKIE_COPY);

      const audioFormats = info.formats.filter((format) => {
        return (
          format.acodec && format.acodec !== "none" && format.vcodec === "none"
        );
      });
      return audioFormats;
    });
  } catch (err) {
    // Rethrow so the caller can handle it
    throw new Error(`Could not retrieve video info: ${err.message}`);
  }
};

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */

exports.videoInfo = (req, res, next) => {
  const { videoId } = req.query;

  if (!videoId) {
    return res
      .status(400)
      .send({ success: false, message: "videoId param is not provided" });
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    youtubedl(videoUrl, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ["referer:youtube.com", "user-agent:googlebot"],
    }).then((info) => {
      console.log(info);

      return res.status(200).send({
        success: true,
        data: {
          videoId: info.id,
          title: info.title,
          channel: info.channel,
          thumbnail: info.channel,
        },
      });
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to get video information",
      error: error.message,
    });
  }
};
