const express = require("express");

const {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const router = express.Router();


// =====================================================
// GET ALL STUDENTS
// POST NEW STUDENT
// =====================================================

router
  .route("/")
  .get(getStudents)
  .post(addStudent);


// =====================================================
// GET / UPDATE / DELETE SINGLE STUDENT
// =====================================================

router
  .route("/:id")
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;