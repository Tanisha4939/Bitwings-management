import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Marketing.css";
import API_URL from "../../config/api";

// =====================================================
// API
// =====================================================

// =====================================================
// CATEGORIES
// =====================================================

const CATEGORIES = [
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
// DEFAULT FORM
// =====================================================

const getDefaultForm = () => ({
    title: "",
    amount: "",
    category: "Office",
    date: new Date().toISOString().split("T")[0],
    note: "",
});
const EXPENSES_PER_PAGE = 10;

// =====================================================
// COMPONENT
// =====================================================

function Marketing({ darkMode = false }) {

    // =================================================
    // EXPENSE STATE
    // =================================================

    const [expenses, setExpenses] = useState([]);

    const [expensePage, setExpensePage] = useState(1);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    // =================================================
    // FILTER STATE
    // =================================================

    const [search, setSearch] = useState("");

    const [categoryFilter, setCategoryFilter] =
        useState("All");

    const [monthFilter, setMonthFilter] =
        useState("All");

    // =================================================
    // MODAL STATE
    // =================================================

    const [showModal, setShowModal] =
        useState(false);

    const [form, setForm] =
        useState(getDefaultForm());

    // =================================================
    // STATS
    // =================================================

    const [stats, setStats] = useState({
        totalExpense: 0,
        totalRecords: 0,
        thisMonthExpense: 0,
        averageExpense: 0,
        categoryData: [],
    });




    // =================================================
    // LOAD EXPENSES
    // =================================================

    const loadExpenses = async () => {

        try {

            setLoading(true);
            setError("");

            const expenseResponse =
                await axios.get(
                    `${API_URL}/expenses`
                );

            const statsResponse =
                await axios.get(
                    `${API_URL}/expenses/stats`
                );

            // -----------------------------------------
            // EXPENSES
            // -----------------------------------------

            const expenseList =
                expenseResponse.data?.expenses ||
                expenseResponse.data?.data ||
                [];

            setExpenses(
                Array.isArray(expenseList)
                    ? expenseList
                    : []
            );

            // -----------------------------------------
            // STATS
            // -----------------------------------------

            const statsData =
                statsResponse.data || {};

            setStats({
                totalExpense:
                    Number(
                        statsData.totalExpense || 0
                    ),

                totalRecords:
                    Number(
                        statsData.totalRecords || 0
                    ),

                thisMonthExpense:
                    Number(
                        statsData.thisMonthExpense || 0
                    ),

                averageExpense:
                    Number(
                        statsData.averageExpense || 0
                    ),

                categoryData:
                    Array.isArray(
                        statsData.categoryData
                    )
                        ? statsData.categoryData
                        : [],
            });

        } catch (err) {

            console.error(
                "LOAD EXPENSES ERROR:",
                err
            );

            console.error(
                "SERVER RESPONSE:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                "Unable to load expenses."
            );

        } finally {

            setLoading(false);

        }
    };

    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        loadExpenses();

    }, []);

    // =================================================
    // HANDLE FORM CHANGE
    // =================================================

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =================================================
    // OPEN ADD MODAL
    // =================================================

    const openAddModal = () => {

        setForm(
            getDefaultForm()
        );

        setError("");

        setShowModal(true);
    };

    // =================================================
    // CLOSE MODAL
    // =================================================

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        setForm(
            getDefaultForm()
        );
    };

    // =================================================
    // ADD EXPENSE
    // =================================================

    const handleAddExpense = async (e) => {

        e.preventDefault();

        // -----------------------------------------
        // VALIDATION
        // -----------------------------------------

        if (!form.title.trim()) {

            alert(
                "Please enter expense title."
            );

            return;
        }

        if (
            !form.amount ||
            Number(form.amount) <= 0
        ) {

            alert(
                "Please enter a valid amount."
            );

            return;
        }

        if (!form.date) {

            alert(
                "Please select expense date."
            );

            return;
        }

        try {

            setSaving(true);

            setError("");

            const payload = {
                title: form.title.trim(),

                amount: Number(form.amount),

                category: form.category,

                date: form.date,

                note: form.note.trim(),
            };

            const response =
                await axios.post(
                    `${API_URL}/expenses`,
                    payload
                );

            console.log(
                "ADD EXPENSE RESPONSE:",
                response.data
            );

            // -----------------------------------------
            // CLOSE MODAL
            // -----------------------------------------

            setShowModal(false);

            setForm(
                getDefaultForm()
            );

            // -----------------------------------------
            // REFRESH DATA
            // -----------------------------------------

            await loadExpenses();

        } catch (err) {

            console.error(
                "ADD EXPENSE ERROR:",
                err
            );

            console.error(
                "SERVER RESPONSE:",
                err.response?.data
            );

            alert(
                err.response?.data?.message ||
                "Unable to add expense."
            );

        } finally {

            setSaving(false);

        }
    };

    // =================================================
    // DELETE SINGLE EXPENSE
    // =================================================

    const handleDeleteExpense = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this expense?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await axios.delete(
                `${API_URL}/expenses/${id}`
            );

            await loadExpenses();

        } catch (err) {

            console.error(
                "DELETE EXPENSE ERROR:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Unable to delete expense."
            );
        }
    };

    // =================================================
    // DELETE ALL EXPENSES
    // =================================================

    const handleDeleteAll = async () => {

        if (expenses.length === 0) {

            alert(
                "There are no expenses to delete."
            );

            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete ALL expenses?"
            );

        if (!confirmed) {
            return;
        }

        const secondConfirm =
            window.confirm(
                "This action cannot be undone. Continue?"
            );

        if (!secondConfirm) {
            return;
        }

        try {

            await axios.delete(
                `${API_URL}/expenses`
            );

            setExpenses([]);

            await loadExpenses();

        } catch (err) {

            console.error(
                "DELETE ALL ERROR:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Unable to delete expenses."
            );
        }
    };

    // =================================================
    // MONTH OPTIONS
    // =================================================

    const monthOptions = useMemo(() => {

        const months = new Set();

        expenses.forEach((expense) => {

            if (expense.date) {

                months.add(
                    expense.date.slice(0, 7)
                );
            }
        });

        return Array.from(months)
            .sort()
            .reverse();

    }, [expenses]);

    // =================================================
    // FORMAT MONTH
    // =================================================

    const formatMonth = (value) => {

        if (!value) {
            return "";
        }

        const [
            year,
            month,
        ] = value.split("-");

        const date =
            new Date(
                Number(year),
                Number(month) - 1,
                1
            );

        return date.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric",
            }
        );
    };

    // =================================================
    // FILTERED EXPENSES
    // =================================================

    const filteredExpenses =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            return expenses.filter(
                (expense) => {

                    const matchesSearch =
                        !searchValue ||
                        expense.title
                            ?.toLowerCase()
                            .includes(searchValue) ||
                        expense.note
                            ?.toLowerCase()
                            .includes(searchValue) ||
                        expense.category
                            ?.toLowerCase()
                            .includes(searchValue);

                    const matchesCategory =
                        categoryFilter === "All" ||
                        expense.category ===
                        categoryFilter;

                    const matchesMonth =
                        monthFilter === "All" ||
                        expense.date?.startsWith(
                            monthFilter
                        );

                    return (
                        matchesSearch &&
                        matchesCategory &&
                        matchesMonth
                    );
                }
            );

        }, [
            expenses,
            search,
            categoryFilter,
            monthFilter,
        ]);


        const totalExpensePages = Math.ceil(
             filteredExpenses.length / EXPENSES_PER_PAGE
        );

        const currentExpenses = filteredExpenses.slice(
            (expensePage - 1) * EXPENSES_PER_PAGE,
            expensePage * EXPENSES_PER_PAGE
        );


        // Reset to page 1 when search/filter changes
        useEffect(() => {
            setExpensePage(1);
        }, [
            search,
            categoryFilter,
            monthFilter,
        ]);


        const handlePreviousExpensePage = () => {
            setExpensePage((prev) =>
                Math.max(prev - 1, 1)
            );
        };

        const handleNextExpensePage = () => {
            setExpensePage((prev) =>
                Math.min(
                    prev + 1,
                    totalExpensePages
                )
            );
        };

    // =================================================
    // FILTERED TOTAL
    // =================================================

    const filteredTotal =
        useMemo(() => {

            return filteredExpenses.reduce(
                (sum, expense) =>
                    sum +
                    Number(
                        expense.amount || 0
                    ),
                0
            );

        }, [filteredExpenses]);

    // =================================================
    // FORMAT MONEY
    // =================================================

    const formatMoney = (amount) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(
            Number(amount || 0)
        );
    };

    // =================================================
    // FORMAT DATE
    // =================================================

    const formatDate = (dateString) => {

        if (!dateString) {
            return "-";
        }

        const date =
            new Date(
                `${dateString}T00:00:00`
            );

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =================================================
    // CATEGORY ICON
    // =================================================

    const getCategoryIcon = (category) => {

        const icons = {

            Office: "🏢",

            Marketing: "📢",

            Salary: "👨‍💼",

            Travel: "🚗",

            Electricity: "⚡",

            Internet: "🌐",

            Equipment: "💻",

            Education: "📚",

            Other: "📦",

        };

        return (
            icons[category] ||
            "📦"
        );
    };

    // =================================================
    // RETRY
    // =================================================

    const handleRetry = () => {

        loadExpenses();

    };

    // =================================================
    // RENDER
    // =================================================

    return (

        <div
            className={`expense-page ${
                darkMode
                    ? "expense-dark"
                    : ""
            }`}
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="expense-header">

                <div className="expense-header-content">

                    <div>

                        <span className="expense-label">
                            EXPENSE MANAGEMENT
                        </span>

                        <h1>
                            Expense Tracker
                        </h1>

                        <p>
                            Track where your money is going
                            and keep your business expenses
                            under control.
                        </p>

                    </div>

                    <button
                        className="add-expense-btn"
                        onClick={openAddModal}
                    >

                        <span>
                            +
                        </span>

                        Add Expense

                    </button>

                </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="expense-error">

                    <span>
                        ⚠
                    </span>

                    <div>

                        <strong>
                            Something went wrong
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                    <button
                        onClick={handleRetry}
                    >
                        Retry
                    </button>

                </div>

            )}

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="expense-stats-grid">

                {/* TOTAL */}

                <div className="expense-stat-card">

                    <div className="expense-stat-icon total-icon">
                        ₹
                    </div>

                    <div>

                        <span>
                            TOTAL EXPENSE
                        </span>

                        <strong>
                            {formatMoney(
                                stats.totalExpense
                            )}
                        </strong>

                        <small>
                            All recorded expenses
                        </small>

                    </div>

                </div>

                {/* THIS MONTH */}

                <div className="expense-stat-card">

                    <div className="expense-stat-icon month-icon">
                        ◷
                    </div>

                    <div>

                        <span>
                            THIS MONTH
                        </span>

                        <strong>
                            {formatMoney(
                                stats.thisMonthExpense
                            )}
                        </strong>

                        <small>
                            Current month spending
                        </small>

                    </div>

                </div>

                {/* RECORDS */}

                <div className="expense-stat-card">

                    <div className="expense-stat-icon records-icon">
                        #
                    </div>

                    <div>

                        <span>
                            TOTAL RECORDS
                        </span>

                        <strong>
                            {stats.totalRecords}
                        </strong>

                        <small>
                            Expenses recorded
                        </small>

                    </div>

                </div>

                {/* AVERAGE */}

                <div className="expense-stat-card">

                    <div className="expense-stat-icon average-icon">
                        ≈
                    </div>

                    <div>

                        <span>
                            AVERAGE EXPENSE
                        </span>

                        <strong>
                            {formatMoney(
                                stats.averageExpense
                            )}
                        </strong>

                        <small>
                            Average per record
                        </small>

                    </div>

                </div>

            </div>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="expense-main-grid">

                {/* =================================================
                    EXPENSE LIST
                ================================================= */}

                <div className="expense-card expense-list-card">

                    <div className="expense-card-header">

                        <div>

                            <span>
                                TRANSACTIONS
                            </span>

                            <h2>
                                Expense Records
                            </h2>

                        </div>

                        <button
                            className="delete-all-btn"
                            onClick={
                                handleDeleteAll
                            }
                        >
                            Delete All
                        </button>

                    </div>

                    {/* =================================================
                        FILTERS
                    ================================================= */}

                    <div className="expense-filters">

                        <div className="expense-search">

                            <span>
                                ⌕
                            </span>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search expenses..."
                            />

                        </div>

                        <select
                            value={categoryFilter}
                            onChange={(e) =>
                                setCategoryFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="All">
                                All Categories
                            </option>

                            {CATEGORIES.map(
                                (category) => (

                                    <option
                                        key={category}
                                        value={category}
                                    >
                                        {category}
                                    </option>

                                )
                            )}

                        </select>

                        <select
                            value={monthFilter}
                            onChange={(e) =>
                                setMonthFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="All">
                                All Months
                            </option>

                            {monthOptions.map(
                                (month) => (

                                    <option
                                        key={month}
                                        value={month}
                                    >
                                        {formatMonth(month)}
                                    </option>

                                )
                            )}

                        </select>

                    </div>

                    {/* =================================================
                        TABLE
                    ================================================= */}

                    <div className="expense-table-wrapper">

                        {loading ? (

                            <div className="expense-empty">

                                <div className="loading-spinner">
                                    ◌
                                </div>

                                <strong>
                                    Loading expenses...
                                </strong>

                                <span>
                                    Please wait.
                                </span>

                            </div>

                        ) : filteredExpenses.length === 0 ? (

                            <div className="expense-empty">

                                <div className="empty-icon">
                                    ₹
                                </div>

                                <strong>
                                    No expenses found
                                </strong>

                                <span>
                                    Add your first expense
                                    to start tracking.
                                </span>

                                <button
                                    onClick={
                                        openAddModal
                                    }
                                >
                                    + Add Expense
                                </button>

                            </div>

                        ) : (

                            <table className="expense-table">

                                <thead>

                                    <tr>

                                        <th>
                                            EXPENSE
                                        </th>

                                        <th>
                                            CATEGORY
                                        </th>

                                        <th>
                                            DATE
                                        </th>

                                        <th>
                                            AMOUNT
                                        </th>

                                        <th>
                                            ACTION
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {currentExpenses.map(
                                        (expense) => (

                                            <tr
                                                key={
                                                    expense._id
                                                }
                                            >

                                                <td>

                                                    <div className="expense-title-cell">

                                                        <div className="expense-row-icon">

                                                            {getCategoryIcon(
                                                                expense.category
                                                            )}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    expense.title
                                                                }
                                                            </strong>

                                                            {expense.note && (

                                                                <span>
                                                                    {
                                                                        expense.note
                                                                    }
                                                                </span>

                                                            )}

                                                        </div>

                                                    </div>

                                                </td>

                                                <td>

                                                    <span className="expense-category-badge">

                                                        {
                                                            expense.category
                                                        }

                                                    </span>

                                                </td>

                                                <td>

                                                    <span className="expense-date">

                                                        {
                                                            formatDate(
                                                                expense.date
                                                            )
                                                        }

                                                    </span>

                                                </td>

                                                <td>

                                                    <strong className="expense-amount">

                                                        {formatMoney(
                                                            expense.amount
                                                        )}

                                                    </strong>

                                                </td>

                                                <td>

                                                    <button
                                                        className="expense-delete-btn"
                                                        onClick={() =>
                                                            handleDeleteExpense(
                                                                expense._id
                                                            )
                                                        }
                                                        title="Delete expense"
                                                    >
                                                        🗑
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        )}

                    </div>

                    {/* =================================================
                        TABLE FOOTER
                    ================================================= */}

                    {/* {!loading &&
                        filteredExpenses.length > 0 && (

                            <div className="expense-table-footer">

                                <span>

                                    Showing{" "}

                                    <strong>
                                        {
                                            filteredExpenses.length
                                        }
                                    </strong>

                                    {" "}of{" "}

                                    <strong>
                                        {expenses.length}
                                    </strong>

                                    {" "}records

                                </span>

                                <strong>

                                    Filtered Total:{" "}

                                    {formatMoney(
                                        filteredTotal
                                    )}

                                </strong>

                            </div>

                        )} */}

                        {/* EXPENSE PAGINATION */}

{!loading && filteredExpenses.length > 0 && (
    <div className="expense-table-footer">

        <span>
            Showing{" "}
            <strong>
                {(expensePage - 1) *
                    EXPENSES_PER_PAGE + 1}
            </strong>
            {" "}to{" "}
            <strong>
                {Math.min(
                    expensePage *
                        EXPENSES_PER_PAGE,
                    filteredExpenses.length
                )}
            </strong>
            {" "}of{" "}
            <strong>
                {filteredExpenses.length}
            </strong>
            {" "}records
        </span>

        {totalExpensePages > 1 && (
            <div className="expense-pagination">

                <button
                    type="button"
                    onClick={handlePreviousExpensePage}
                    disabled={expensePage === 1}
                >
                    ‹
                </button>

                {Array.from(
                    {
                        length: totalExpensePages,
                    },
                    (_, index) => index + 1
                ).map((page) => (
                    <button
                        key={page}
                        type="button"
                        className={
                            expensePage === page
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setExpensePage(page)
                        }
                    >
                        {page}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={handleNextExpensePage}
                    disabled={
                        expensePage === totalExpensePages
                    }
                >
                    ›
                </button>

            </div>
        )}

    </div>
)}

                </div>

                {/* =================================================
                    SIDEBAR
                ================================================= */}

                <div className="expense-sidebar">

                    {/* =================================================
                        CATEGORY ANALYTICS
                    ================================================= */}

                    <div className="expense-card category-card">

                        <div className="expense-card-header">

                            <div>

                                <span>
                                    BREAKDOWN
                                </span>

                                <h2>
                                    By Category
                                </h2>

                            </div>

                        </div>

                        {stats.categoryData.length === 0 ? (

                            <div className="category-empty">
                                No category data yet.
                            </div>

                        ) : (

                            <div className="category-list">

                                {stats.categoryData.map(
                                    (item) => {

                                        const percentage =
                                            stats.totalExpense > 0
                                                ? (
                                                    Number(
                                                        item.amount || 0
                                                    ) /
                                                    Number(
                                                        stats.totalExpense
                                                    )
                                                ) * 100
                                                : 0;

                                        return (

                                            <div
                                                className="category-item"
                                                key={
                                                    item.category
                                                }
                                            >

                                                <div className="category-item-top">

                                                    <div className="category-name">

                                                        <span className="category-icon">

                                                            {getCategoryIcon(
                                                                item.category
                                                            )}

                                                        </span>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    item.category
                                                                }
                                                            </strong>

                                                            <small>

                                                                {
                                                                    item.count || 0
                                                                }

                                                                {" "}

                                                                record
                                                                {
                                                                    item.count !== 1
                                                                        ? "s"
                                                                        : ""
                                                                }

                                                            </small>

                                                        </div>

                                                    </div>

                                                    <strong className="category-amount">

                                                        {formatMoney(
                                                            item.amount
                                                        )}

                                                    </strong>

                                                </div>

                                                <div className="category-progress">

                                                    <div
                                                        style={{
                                                            width: `${Math.min(
                                                                percentage,
                                                                100
                                                            )}%`,
                                                        }}
                                                    />

                                                </div>

                                                <span className="category-percentage">

                                                    {percentage.toFixed(
                                                        1
                                                    )}
                                                    %

                                                </span>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </div>

                    {/* =================================================
                        QUICK SUMMARY
                    ================================================= */}

                    <div className="expense-card summary-card">

                        <span>
                            QUICK SUMMARY
                        </span>

                        <h2>
                            Spending Overview
                        </h2>

                        <div className="summary-row">

                            <div>

                                <small>
                                    Total records
                                </small>

                                <strong>
                                    {
                                        stats.totalRecords
                                    }
                                </strong>

                            </div>

                            <div>

                                <small>
                                    This month
                                </small>

                                <strong>
                                    {formatMoney(
                                        stats.thisMonthExpense
                                    )}
                                </strong>

                            </div>

                        </div>

                        <div className="summary-total">

                            <span>
                                Total spending
                            </span>

                            <strong>
                                {formatMoney(
                                    stats.totalExpense
                                )}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>

            {/* =================================================
                ADD EXPENSE MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="expense-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="expense-modal">

                        <div className="expense-modal-header">

                            <div>

                                <span>
                                    NEW TRANSACTION
                                </span>

                                <h2>
                                    Add Expense
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={
                                    closeModal
                                }
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleAddExpense
                            }
                        >

                            <div className="expense-form-grid">

                                {/* TITLE */}

                                <div className="expense-form-group full">

                                    <label>
                                        Expense Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={
                                            form.title
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Office rent"
                                        maxLength={150}
                                        required
                                    />

                                </div>

                                {/* AMOUNT */}

                                <div className="expense-form-group">

                                    <label>
                                        Amount
                                    </label>

                                    <div className="amount-input">

                                        <span>
                                            ₹
                                        </span>

                                        <input
                                            type="number"
                                            name="amount"
                                            value={
                                                form.amount
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="0"
                                            min="0.01"
                                            step="0.01"
                                            required
                                        />

                                    </div>

                                </div>

                                {/* CATEGORY */}

                                <div className="expense-form-group">

                                    <label>
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={
                                            form.category
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        {CATEGORIES.map(
                                            (category) => (

                                                <option
                                                    key={
                                                        category
                                                    }
                                                    value={
                                                        category
                                                    }
                                                >
                                                    {
                                                        category
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                                {/* DATE */}

                                <div className="expense-form-group">

                                    <label>
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        name="date"
                                        value={
                                            form.date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>

                                {/* NOTE */}

                                <div className="expense-form-group">

                                    <label>
                                        Note
                                    </label>

                                    <input
                                        type="text"
                                        name="note"
                                        value={
                                            form.note
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Optional note"
                                        maxLength={500}
                                    />

                                </div>

                            </div>

                            {/* ACTIONS */}

                            <div className="expense-modal-actions">

                                <button
                                    type="button"
                                    className="cancel-expense-btn"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-expense-btn"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving..."
                                        : "Save Expense"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );
}

export default Marketing;