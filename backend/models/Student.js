const mongoose = require("mongoose");


// =====================================================
// STUDENT SCHEMA
// =====================================================

const studentSchema = new mongoose.Schema(
  {

    // -------------------------------------------------
    // PERSONAL INFORMATION
    // -------------------------------------------------

    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    dob: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["", "Male", "Female", "Other"],
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },


    // -------------------------------------------------
    // COURSE INFORMATION
    // -------------------------------------------------

    course: {
      type: String,
      required: true,
      trim: true,
    },

    batch: {
      type: String,
      trim: true,
      default: "",
    },

    admissionDate: {
      type: String,
      default: "",
    },


    // -------------------------------------------------
    // FEES INFORMATION
    // -------------------------------------------------

    totalFees: {
      type: Number,
      default: 0,
      min: 0,
    },

    paidFees: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingFees: {
      type: Number,
      default: 0,
      min: 0,
    },


    // -------------------------------------------------
    // STATUS
    // -------------------------------------------------

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },


    // -------------------------------------------------
    // NOTES
    // -------------------------------------------------

    notes: {
      type: String,
      trim: true,
      default: "",
    },

  },

  {
    timestamps: true,
  }
);


// =====================================================
// CALCULATE PENDING FEES
// =====================================================

studentSchema.pre("save", function () {

  this.pendingFees =
    Math.max(
      0,
      Number(this.totalFees || 0) -
      Number(this.paidFees || 0)
    );

});


// =====================================================
// EXPORT MODEL
// =====================================================

module.exports =
  mongoose.model(
    "Student",
    studentSchema
  );