const FeePayment = require("../models/FeePayment");
const Student = require("../models/Student");

// =====================================================
// ADD PAYMENT
// =====================================================

const addPayment = async (req, res) => {
  try {
    const { studentId } = req.params;

    const {
      amount,
      paymentDate,
      paymentMethod,
      transactionId,
      note,
    } = req.body;

    // -------------------------------------------------
    // VALIDATE AMOUNT
    // -------------------------------------------------

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid payment amount is required",
      });
    }

    // -------------------------------------------------
    // FIND STUDENT
    // -------------------------------------------------

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const paymentAmount = Number(amount);

    const currentPending = Math.max(
      0,
      Number(student.totalFees || 0) -
        Number(student.paidFees || 0)
    );

    // -------------------------------------------------
    // PREVENT OVER PAYMENT
    // -------------------------------------------------

    if (paymentAmount > currentPending) {
      return res.status(400).json({
        success: false,
        message: `Payment cannot be greater than pending fees of ₹${currentPending}`,
      });
    }

    // -------------------------------------------------
    // CREATE PAYMENT
    // -------------------------------------------------

    const payment = await FeePayment.create({
      studentId: student._id,

      studentName:
        student.name || "Unknown Student",

      course:
        student.course || "",

      amount: paymentAmount,

      paymentDate:
        paymentDate ||
        new Date()
          .toISOString()
          .split("T")[0],

      paymentMethod:
        paymentMethod || "Cash",

      transactionId:
        transactionId || "",

      note:
        note || "",
    });

    // -------------------------------------------------
    // UPDATE STUDENT FEES
    // -------------------------------------------------

    student.paidFees =
      Number(student.paidFees || 0) +
      paymentAmount;

    student.pendingFees =
      Math.max(
        0,
        Number(student.totalFees || 0) -
          Number(student.paidFees || 0)
      );

    await student.save();

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Payment added successfully",

      payment,

      student: {
        totalFees:
          student.totalFees,

        paidFees:
          student.paidFees,

        pendingFees:
          student.pendingFees,
      },
    });

  } catch (error) {

    console.error(
      "ADD PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add payment",
      error:
        error.message,
    });
  }
};


// =====================================================
// GET ALL PAYMENTS
// =====================================================

const getPayments = async (req, res) => {
  try {

    const payments =
      await FeePayment.find()
        .sort({
          paymentDate: -1,
          createdAt: -1,
        });

    return res.json({
      success: true,
      payments,
    });

  } catch (error) {

    console.error(
      "GET PAYMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch payments",
      error:
        error.message,
    });
  }
};


// =====================================================
// GET STUDENT PAYMENT HISTORY
// =====================================================

const getStudentPayments = async (
  req,
  res
) => {

  try {

    const { studentId } =
      req.params;

    const payments =
      await FeePayment.find({
        studentId,
      }).sort({
        paymentDate: -1,
        createdAt: -1,
      });

    return res.json({
      success: true,
      payments,
    });

  } catch (error) {

    console.error(
      "GET STUDENT PAYMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch student payments",
      error:
        error.message,
    });
  }
};


// =====================================================
// DELETE PAYMENT
// =====================================================

const deletePayment = async (
  req,
  res
) => {

  try {

    const { id } =
      req.params;

    // -------------------------------------------------
    // FIND PAYMENT
    // -------------------------------------------------

    const payment =
      await FeePayment.findById(id);

    if (!payment) {

      return res.status(404).json({
        success: false,
        message:
          "Payment not found",
      });
    }

    // -------------------------------------------------
    // FIND STUDENT
    // -------------------------------------------------

    const student =
      await Student.findById(
        payment.studentId
      );

    // -------------------------------------------------
    // ROLLBACK STUDENT FEES
    // -------------------------------------------------

    if (student) {

      student.paidFees =
        Math.max(
          0,
          Number(student.paidFees || 0) -
            Number(payment.amount || 0)
        );

      student.pendingFees =
        Math.max(
          0,
          Number(student.totalFees || 0) -
            Number(student.paidFees || 0)
        );

      await student.save();
    }

    // -------------------------------------------------
    // DELETE PAYMENT
    // -------------------------------------------------

    await FeePayment.findByIdAndDelete(
      id
    );

    return res.json({
      success: true,
      message:
        "Payment deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete payment",
      error:
        error.message,
    });
  }
};


module.exports = {
  addPayment,
  getPayments,
  getStudentPayments,
  deletePayment,
};