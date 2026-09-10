const Student = require("../models/Student");


// =====================================================
// ADD STUDENT
// =====================================================

const addStudent = async (req, res) => {

  try {

    const {
      name,
      mobile,
      email,
      dob,
      gender,
      address,
      course,
      batch,
      admissionDate,
      totalFees,
      paidFees,
      status,
      notes,
    } = req.body;


    // -------------------------------------------------
    // REQUIRED VALIDATION
    // -------------------------------------------------

    if (!name || !mobile || !course) {

      return res.status(400).json({
        success: false,
        message: "Name, mobile and course are required.",
      });

    }


    // -------------------------------------------------
    // CREATE STUDENT
    // -------------------------------------------------

    const student = await Student.create({

      name,
      mobile,
      email,
      dob,
      gender,
      address,
      course,
      batch,
      admissionDate,
      totalFees: Number(totalFees) || 0,
      paidFees: Number(paidFees) || 0,
      status: status || "Active",
      notes,

    });


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.status(201).json({

      success: true,

      message: "Student added successfully.",

      student,

    });

  }

  catch (error) {

    console.error(
      "Add Student Error:",
      error.message
    );

    res.status(500).json({

      success: false,

      message: "Failed to add student.",

      error: error.message,

    });

  }

};


// =====================================================
// GET ALL STUDENTS
// =====================================================

const getStudents = async (req, res) => {

  try {

    const students = await Student.find()
      .sort({
        createdAt: -1,
      });


    res.status(200).json({

      success: true,

      count: students.length,

      students,

    });

  }

  catch (error) {

    console.error(
      "Get Students Error:",
      error.message
    );

    res.status(500).json({

      success: false,

      message: "Failed to fetch students.",

      error: error.message,

    });

  }

};


// =====================================================
// GET SINGLE STUDENT
// =====================================================

const getStudentById = async (req, res) => {

  try {

    const student =
      await Student.findById(
        req.params.id
      );


    if (!student) {

      return res.status(404).json({

        success: false,

        message: "Student not found.",

      });

    }


    res.status(200).json({

      success: true,

      student,

    });

  }

  catch (error) {

    console.error(
      "Get Student Error:",
      error.message
    );

    res.status(500).json({

      success: false,

      message: "Failed to fetch student.",

      error: error.message,

    });

  }

};


// =====================================================
// UPDATE STUDENT
// =====================================================

const updateStudent = async (req, res) => {

  try {

    const {
      name,
      mobile,
      email,
      dob,
      gender,
      address,
      course,
      batch,
      admissionDate,
      totalFees,
      paidFees,
      status,
      notes,
    } = req.body;


    const student =
      await Student.findById(
        req.params.id
      );


    if (!student) {

      return res.status(404).json({

        success: false,

        message: "Student not found.",

      });

    }


    // -------------------------------------------------
    // UPDATE FIELDS
    // -------------------------------------------------

    student.name =
      name ?? student.name;

    student.mobile =
      mobile ?? student.mobile;

    student.email =
      email ?? student.email;

    student.dob =
      dob ?? student.dob;

    student.gender =
      gender ?? student.gender;

    student.address =
      address ?? student.address;

    student.course =
      course ?? student.course;

    student.batch =
      batch ?? student.batch;

    student.admissionDate =
      admissionDate ??
      student.admissionDate;

    student.totalFees =
      Number(totalFees) ||
      0;

    student.paidFees =
      Number(paidFees) ||
      0;

    student.status =
      status ??
      student.status;

    student.notes =
      notes ??
      student.notes;


    // -------------------------------------------------
    // SAVE
    // -------------------------------------------------

    const updatedStudent =
      await student.save();


    res.status(200).json({

      success: true,

      message:
        "Student updated successfully.",

      student:
        updatedStudent,

    });

  }

  catch (error) {

    console.error(
      "Update Student Error:",
      error.message
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to update student.",

      error: error.message,

    });

  }

};


// =====================================================
// DELETE STUDENT
// =====================================================

const deleteStudent = async (req, res) => {

  try {

    const student =
      await Student.findByIdAndDelete(
        req.params.id
      );


    if (!student) {

      return res.status(404).json({

        success: false,

        message: "Student not found.",

      });

    }


    res.status(200).json({

      success: true,

      message:
        "Student deleted successfully.",

    });

  }

  catch (error) {

    console.error(
      "Delete Student Error:",
      error.message
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to delete student.",

      error: error.message,

    });

  }

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  addStudent,

  getStudents,

  getStudentById,

  updateStudent,

  deleteStudent,

};