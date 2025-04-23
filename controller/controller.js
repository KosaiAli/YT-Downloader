const express = require("express");

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
exports.homePage = (req, res) => {
  return res.status(200).send("<H4>THIS APP WAS MADE BY KA</H4>");
};
