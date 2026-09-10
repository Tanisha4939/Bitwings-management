const mongoose = require("mongoose");
const Expense = require("../models/Expense");

// =====================================================
// FIXED ADMIN ID
// =====================================================
// Auth middleware nathi, etle ek fixed valid ObjectId use kariye.
// Badha expenses aa same adminId sathe save thashe.

const DEFAULT_ADMIN_ID =
    "000000000000000000000001";

// =====================================================
// ALLOWED CATEGORIES
// =====================================================

const ALLOWED_CATEGORIES = [
    "Office",
    "Marketing",
    "Salary",
    "Travel",
    "Electricity",
    "Internet",
    "Equipment",
    "Education",
    "Other",
];

// =====================================================
// ADD EXPENSE
// =====================================================

const addExpense = async (req, res) => {
    try {

        const {
            title,
            amount,
            category,
            date,
            note,
        } = req.body;

        // ---------------------------------------------
        // TITLE VALIDATION
        // ---------------------------------------------

        if (
            !title ||
            typeof title !== "string" ||
            !title.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Expense title is required",
            });
        }

        // ---------------------------------------------
        // AMOUNT VALIDATION
        // ---------------------------------------------

        const numericAmount = Number(amount);

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0",
            });
        }

        // ---------------------------------------------
        // CATEGORY VALIDATION
        // ---------------------------------------------

        if (
            !ALLOWED_CATEGORIES.includes(category)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid expense category",
            });
        }

        // ---------------------------------------------
        // DATE VALIDATION
        // ---------------------------------------------

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                date || ""
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid date is required",
            });
        }

        // ---------------------------------------------
        // CREATE EXPENSE
        // ---------------------------------------------

        const expense = await Expense.create({
            adminId: DEFAULT_ADMIN_ID,

            title: title.trim(),

            amount: numericAmount,

            category,

            date,

            note:
                typeof note === "string"
                    ? note.trim()
                    : "",
        });

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(201).json({
            success: true,
            message: "Expense added successfully",
            expense,
        });

    } catch (error) {

        console.error(
            "ADD EXPENSE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to add expense",
            error: error.message,
        });
    }
};

// =====================================================
// GET ALL EXPENSES
// =====================================================

const getExpenses = async (req, res) => {
    try {

        const expenses =
            await Expense.find({
                adminId: DEFAULT_ADMIN_ID,
            }).sort({
                date: -1,
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            expenses,
        });

    } catch (error) {

        console.error(
            "GET EXPENSES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch expenses",
            error: error.message,
        });
    }
};

// =====================================================
// GET EXPENSE STATISTICS
// =====================================================

const getExpenseStats = async (req, res) => {
    try {

        const now = new Date();

        const currentYear =
            now.getFullYear();

        const currentMonth =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");

        const currentMonthPrefix =
            `${currentYear}-${currentMonth}`;

        // ---------------------------------------------
        // AGGREGATION
        // ---------------------------------------------

        const result =
            await Expense.aggregate([

                // -------------------------------------
                // MATCH FIXED ADMIN
                // -------------------------------------

                {
                    $match: {
                        adminId:
                            new mongoose.Types.ObjectId(
                                DEFAULT_ADMIN_ID
                            ),
                    },
                },

                // -------------------------------------
                // FACET
                // -------------------------------------

                {
                    $facet: {

                        // =============================
                        // TOTAL EXPENSE
                        // =============================

                        total: [
                            {
                                $group: {
                                    _id: null,

                                    totalExpense: {
                                        $sum: "$amount",
                                    },
                                },
                            },
                        ],

                        // =============================
                        // TOTAL RECORDS
                        // =============================

                        records: [
                            {
                                $count:
                                    "totalRecords",
                            },
                        ],

                        // =============================
                        // THIS MONTH
                        // =============================

                        thisMonth: [

                            {
                                $match: {
                                    date: {
                                        $regex:
                                            `^${currentMonthPrefix}`,
                                    },
                                },
                            },

                            {
                                $group: {
                                    _id: null,

                                    thisMonthExpense: {
                                        $sum: "$amount",
                                    },
                                },
                            },
                        ],

                        // =============================
                        // CATEGORY
                        // =============================

                        categories: [

                            {
                                $group: {

                                    _id: "$category",

                                    amount: {
                                        $sum: "$amount",
                                    },

                                    count: {
                                        $sum: 1,
                                    },
                                },
                            },

                            {
                                $sort: {
                                    amount: -1,
                                },
                            },
                        ],

                        // =============================
                        // AVERAGE
                        // =============================

                        average: [

                            {
                                $group: {

                                    _id: null,

                                    averageExpense: {
                                        $avg: "$amount",
                                    },
                                },
                            },
                        ],
                    },
                },
            ]);

        // ---------------------------------------------
        // RESULT
        // ---------------------------------------------

        const stats =
            result[0] || {};

        // ---------------------------------------------
        // TOTAL
        // ---------------------------------------------

        const totalExpense =
            stats.total &&
            stats.total.length > 0
                ? Number(
                    stats.total[0]
                        .totalExpense || 0
                )
                : 0;

        // ---------------------------------------------
        // RECORDS
        // ---------------------------------------------

        const totalRecords =
            stats.records &&
            stats.records.length > 0
                ? Number(
                    stats.records[0]
                        .totalRecords || 0
                )
                : 0;

        // ---------------------------------------------
        // THIS MONTH
        // ---------------------------------------------

        const thisMonthExpense =
            stats.thisMonth &&
            stats.thisMonth.length > 0
                ? Number(
                    stats.thisMonth[0]
                        .thisMonthExpense || 0
                )
                : 0;

        // ---------------------------------------------
        // AVERAGE
        // ---------------------------------------------

        const averageExpense =
            stats.average &&
            stats.average.length > 0
                ? Number(
                    stats.average[0]
                        .averageExpense || 0
                )
                : 0;

        // ---------------------------------------------
        // CATEGORY DATA
        // ---------------------------------------------

        const categoryData =
            stats.categories
                ? stats.categories.map(
                    (item) => ({
                        category: item._id,

                        amount:
                            Number(
                                item.amount || 0
                            ),

                        count:
                            Number(
                                item.count || 0
                            ),
                    })
                )
                : [];

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(200).json({

            success: true,

            totalExpense,

            totalRecords,

            thisMonthExpense,

            averageExpense,

            categoryData,
        });

    } catch (error) {

        console.error(
            "GET EXPENSE STATS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch expense statistics",
            error: error.message,
        });
    }
};

// =====================================================
// DELETE SINGLE EXPENSE
// =====================================================

const deleteExpense = async (req, res) => {
    try {

        const { id } = req.params;

        // ---------------------------------------------
        // ID VALIDATION
        // ---------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid expense ID",
            });
        }

        // ---------------------------------------------
        // DELETE
        // ---------------------------------------------

        const expense =
            await Expense.findOneAndDelete({
                _id: id,
                adminId: DEFAULT_ADMIN_ID,
            });

        // ---------------------------------------------
        // NOT FOUND
        // ---------------------------------------------

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found",
            });
        }

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(200).json({
            success: true,
            message:
                "Expense deleted successfully",
        });

    } catch (error) {

        console.error(
            "DELETE EXPENSE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete expense",
            error: error.message,
        });
    }
};

// =====================================================
// DELETE ALL EXPENSES
// =====================================================

const deleteAllExpenses = async (req, res) => {
    try {

        const result =
            await Expense.deleteMany({
                adminId: DEFAULT_ADMIN_ID,
            });

        return res.status(200).json({

            success: true,

            message:
                "All expenses deleted successfully",

            deletedCount:
                result.deletedCount,
        });

    } catch (error) {

        console.error(
            "DELETE ALL EXPENSES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete all expenses",
            error: error.message,
        });
    }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    addExpense,
    getExpenses,
    getExpenseStats,
    deleteExpense,
    deleteAllExpenses,
};