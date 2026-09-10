const express = require("express");

const router = express.Router();

const {
  addNumber,
  getNumbers,
  deleteNumber,
} = require("../controllers/marketingController");


// GET ALL NUMBERS
router.get("/", getNumbers);


// ADD NUMBER
router.post("/", addNumber);


// DELETE NUMBER
router.delete("/:id", deleteNumber);


module.exports = router;