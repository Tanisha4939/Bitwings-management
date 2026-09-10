const express = require("express");

const {
    addExpense,
    getExpenses,
    getExpenseStats,
    deleteExpense,
    deleteAllExpenses,
} = require("../controllers/expenseController");

const router = express.Router();

// GET STATS
router.get(
    "/stats",
    getExpenseStats
);

// GET ALL
router.get(
    "/",
    getExpenses
);

// ADD
router.post(
    "/",
    addExpense
);

// DELETE SINGLE
router.delete(
    "/:id",
    deleteExpense
);

// DELETE ALL
router.delete(
    "/",
    deleteAllExpenses
);

module.exports = router;