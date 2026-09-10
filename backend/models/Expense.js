const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        amount: {
            type: Number,
            required: true,
            min: 0.01,
        },

        category: {
            type: String,
            required: true,

            enum: [
                "Office",
                "Marketing",
                "Salary",
                "Travel",
                "Electricity",
                "Internet",
                "Equipment",
                "Education",
                "Other",
            ],
        },

        date: {
            type: String,
            required: true,

            match:
                /^\d{4}-\d{2}-\d{2}$/,
        },

        note: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
    },

    {
        timestamps: true,
    }
);

// =====================================================
// INDEX
// =====================================================

expenseSchema.index({
    adminId: 1,
    date: -1,
});

// =====================================================
// MODEL
// =====================================================

module.exports =
    mongoose.model(
        "Expense",
        expenseSchema
    );