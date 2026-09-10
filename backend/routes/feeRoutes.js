const express = require("express");

const router = express.Router();

const {
  addPayment,
  getPayments,
  getStudentPayments,
  deletePayment,
} = require("../controllers/feeController");

// =====================================================
// GET ALL PAYMENTS
// =====================================================

router.get("/", getPayments);

// =====================================================
// GET STUDENT PAYMENT HISTORY
// =====================================================

router.get(
  "/student/:studentId",
  getStudentPayments
);

// =====================================================
// ADD PAYMENT
// =====================================================

router.post(
  "/student/:studentId",
  addPayment
);

// =====================================================
// DELETE PAYMENT
// =====================================================

router.delete(
  "/:id",
  deletePayment
);

module.exports = router;