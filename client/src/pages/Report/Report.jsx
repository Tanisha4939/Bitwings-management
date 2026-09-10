import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  RefreshCw,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  CalendarDays,
  CreditCard,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import "./Report.css";
import API_URL from "../../config/api";

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value = 0) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const formatNumber = (value = 0) => {
  return Number(value || 0).toLocaleString("en-IN");
};

const getPaymentAmount = (payment) => {
  return Number(payment?.amount || 0);
};

const getPaymentDate = (payment) => {
  return (
    payment?.paymentDate ||
    payment?.createdAt ||
    payment?.date ||
    null
  );
};

const getExpenseAmount = (expense) => {
  return Number(
    expense?.amount ??
      expense?.expenseAmount ??
      expense?.totalAmount ??
      expense?.price ??
      0
  );
};

const getExpenseDate = (expense) => {
  return (
    expense?.date ||
    expense?.expenseDate ||
    expense?.createdAt ||
    expense?.createdDate ||
    null
  );
};

const getExpenseCategory = (expense) => {
  return (
    expense?.category ||
    expense?.expenseCategory ||
    expense?.type ||
    "Other"
  );
};

const isSameMonth = (dateValue, year, month) => {
  if (!dateValue) return false;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === year &&
    date.getMonth() === month
  );
};

const isToday = (dateValue) => {
  if (!dateValue) return false;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/* =========================================================
   FINANCE GRAPH
========================================================= */

const FinanceGraph = ({ data }) => {
  const width = 1000;
  const height = 320;

  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartWidth =
    width - paddingLeft - paddingRight;

  const chartHeight =
    height - paddingTop - paddingBottom;

  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [
      item.income,
      item.expense,
    ])
  );

  const getX = (index) => {
    if (data.length <= 1) return width / 2;

    return (
      paddingLeft +
      (index * chartWidth) / (data.length - 1)
    );
  };

  const getY = (value) => {
    return (
      paddingTop +
      chartHeight -
      (value / maxValue) * chartHeight
    );
  };

  const incomePoints = data
    .map(
      (item, index) =>
        `${getX(index)},${getY(item.income)}`
    )
    .join(" ");

  const expensePoints = data
    .map(
      (item, index) =>
        `${getX(index)},${getY(item.expense)}`
    )
    .join(" ");

  const incomeArea = `
    ${paddingLeft},${height - paddingBottom}
    ${incomePoints}
    ${getX(data.length - 1)},${height - paddingBottom}
  `;

  const expenseArea = `
    ${paddingLeft},${height - paddingBottom}
    ${expensePoints}
    ${getX(data.length - 1)},${height - paddingBottom}
  `;

  const gridValues = [0.25, 0.5, 0.75, 1];

  return (
    <div className="finance-svg-wrapper">
      <svg
        className="finance-svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {/* GRID */}

        {gridValues.map((ratio, index) => {
          const y =
            paddingTop +
            chartHeight -
            ratio * chartHeight;

          return (
            <g key={index}>
              <line
                className="graph-grid-line"
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
              />

              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="10"
              >
                {formatCurrency(maxValue * ratio)}
              </text>
            </g>
          );
        })}

        {/* ZERO LINE */}

        <line
          className="graph-grid-line"
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
        />

        {/* INCOME AREA */}

        <polygon
          className="graph-area"
          points={incomeArea}
          fill="rgba(22,163,74,0.08)"
          stroke="none"
        />

        {/* EXPENSE AREA */}

        <polygon
          className="graph-area"
          points={expenseArea}
          fill="rgba(239,68,68,0.06)"
          stroke="none"
        />

        {/* INCOME LINE */}

        <polyline
          className="graph-line revenue-line"
          points={incomePoints}
          fill="none"
        />

        {/* EXPENSE LINE */}

        <polyline
          className="graph-line expense-line"
          points={expensePoints}
          fill="none"
        />

        {/* POINTS */}

        {data.map((item, index) => {
          const x = getX(index);

          const incomeY = getY(item.income);
          const expenseY = getY(item.expense);

          return (
            <g key={item.month}>
              {/* Income glow */}

              <circle
                className="graph-dot-glow revenue-glow"
                cx={x}
                cy={incomeY}
                r="9"
              />

              {/* Income dot */}

              <circle
                className="graph-dot revenue-graph-dot"
                cx={x}
                cy={incomeY}
                r="5"
              />

              {/* Expense dot */}

              <circle
                className="graph-dot expense-graph-dot"
                cx={x}
                cy={expenseY}
                r="5"
              />

              {/* Month */}

              <text
                className="graph-month-label"
                x={x}
                y={height - 15}
                textAnchor="middle"
              >
                {item.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* =========================================================
   STUDENT BAR CHART
========================================================= */

const StudentBarChart = ({ data }) => {
  const maxValue = Math.max(
    1,
    ...data.map((item) => item.students)
  );

  return (
    <div className="student-bars-chart">
      {data.map((item, index) => {
        const height =
          (item.students / maxValue) * 100;

        return (
          <div
            className="student-bar-column"
            key={item.month}
          >
            <div className="student-bar-value">
              {item.students}
            </div>

            <div className="student-bar-track">
              <div
                className="student-bar-fill"
                style={{
                  height: `${Math.max(
                    item.students > 0 ? height : 0,
                    0
                  )}%`,
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <span />
              </div>
            </div>

            <div className="student-bar-month">
              {item.month}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* =========================================================
   DONUT CHART
========================================================= */

const ExpenseDonut = ({ data, total }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  if (!data.length || total <= 0) {
    return (
      <div className="donut-empty">
        <Receipt size={28} />
        <span>No expense data available</span>
      </div>
    );
  }

  let accumulated = 0;

  const segments = data.map((item) => {
    const percentage =
      total > 0
        ? (item.amount / total) * 100
        : 0;

    const dash = (percentage / 100) * circumference;

    const offset = -accumulated;

    accumulated += dash;

    return {
      ...item,
      percentage,
      dash,
      offset,
    };
  });

  return (
    <div className="donut-layout">
      <div className="donut-chart">
        <svg
          className="donut-svg"
          viewBox="0 0 200 200"
        >
          <circle
            className="donut-background"
            cx="100"
            cy="100"
            r={radius}
          />

          {segments.map((item, index) => (
            <circle
              key={item.category}
              className="donut-segment"
              cx="100"
              cy="100"
              r={radius}
              stroke={item.color}
              strokeDasharray={`${item.dash} ${
                circumference - item.dash
              }`}
              strokeDashoffset={item.offset}
              style={{
                animationDelay: `${index * 0.08}s`,
              }}
            />
          ))}

          <text
            className="donut-total-label"
            x="100"
            y="94"
            textAnchor="middle"
          >
            Total Expense
          </text>

          <text
            className="donut-total-value"
            x="100"
            y="116"
            textAnchor="middle"
          >
            {formatCurrency(total)}
          </text>
        </svg>
      </div>

      <div className="donut-legend">
        {segments.map((item) => (
          <div
            className="donut-legend-item"
            key={item.category}
          >
            <div className="donut-legend-left">
              <span
                className="donut-color"
                style={{
                  background: item.color,
                }}
              />

              <span>{item.category}</span>
            </div>

            <div className="donut-legend-right">
              <strong>
                {formatCurrency(item.amount)}
              </strong>

              <small>
                {item.percentage.toFixed(1)}%
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   PROFIT CHART
========================================================= */

const ProfitChart = ({ data }) => {
  const maxProfit = Math.max(
    1,
    ...data.map((item) =>
      Math.abs(item.profit)
    )
  );

  return (
    <div className="profit-chart">
      {data.map((item) => {
        const percentage =
          (Math.abs(item.profit) / maxProfit) * 45;

        return (
          <div
            className="profit-chart-row"
            key={item.month}
          >
            <span className="profit-month">
              {item.month}
            </span>

            <div className="profit-bar-wrapper">
              <div className="profit-zero-line" />

              {item.profit >= 0 ? (
                <div
                  className="profit-bar profit-positive"
                  style={{
                    width: `${percentage}%`,
                    marginLeft: "50%",
                  }}
                />
              ) : (
                <div
                  className="profit-bar profit-negative"
                  style={{
                    width: `${percentage}%`,
                    marginLeft: `${50 - percentage}%`,
                  }}
                />
              )}
            </div>

            <span
              className={`profit-number ${
                item.profit >= 0
                  ? "positive"
                  : "negative"
              }`}
            >
              {item.profit >= 0 ? "+" : "-"}
              {formatCurrency(
                Math.abs(item.profit)
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* =========================================================
   MAIN REPORT
========================================================= */

const Report = () => {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     FETCH DATA
  ======================================================= */

  const fetchReportData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        studentsResponse,
        feesResponse,
        expensesResponse,
      ] = await Promise.all([
        axios.get(`${API_URL}/students`),
        axios.get(`${API_URL}/fees`),
        axios.get(`${API_URL}/expenses`),
      ]);

      const studentsData =
        studentsResponse?.data || {};

      const feesData =
        feesResponse?.data || {};

      const expensesData =
        expensesResponse?.data || {};

      setStudents(
        studentsData.students ||
          studentsData.data ||
          []
      );

      setPayments(
        feesData.payments ||
          feesData.data ||
          []
      );

      setExpenses(
        expensesData.expenses ||
          expensesData.data ||
          []
      );
    } catch (err) {
      console.error("Report API Error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load report data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  /* =======================================================
     BASIC FINANCE
  ======================================================= */

  const totalIncome = useMemo(() => {
    return payments.reduce(
      (sum, payment) =>
        sum + getPaymentAmount(payment),
      0
    );
  }, [payments]);

  const totalExpense = useMemo(() => {
    return expenses.reduce(
      (sum, expense) =>
        sum + getExpenseAmount(expense),
      0
    );
  }, [expenses]);

  const netProfit = totalIncome - totalExpense;

  const todayIncome = useMemo(() => {
    return payments
      .filter((payment) =>
        isToday(getPaymentDate(payment))
      )
      .reduce(
        (sum, payment) =>
          sum + getPaymentAmount(payment),
        0
      );
  }, [payments]);

  const todayExpense = useMemo(() => {
    return expenses
      .filter((expense) =>
        isToday(getExpenseDate(expense))
      )
      .reduce(
        (sum, expense) =>
          sum + getExpenseAmount(expense),
        0
      );
  }, [expenses]);

  /* =======================================================
     STUDENTS
  ======================================================= */

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) =>
      String(student?.status || "").toLowerCase() ===
        "active"
  ).length;

  const inactiveStudents =
    totalStudents - activeStudents;

  /* =======================================================
     CURRENT YEAR
  ======================================================= */

  const currentYear =
    new Date().getFullYear();

  const currentMonth =
    new Date().getMonth();

  /* =======================================================
     MONTHLY FINANCE
  ======================================================= */

  const monthlyFinance = useMemo(() => {
    return MONTHS.map((month, monthIndex) => {
      const income = payments
        .filter((payment) =>
          isSameMonth(
            getPaymentDate(payment),
            currentYear,
            monthIndex
          )
        )
        .reduce(
          (sum, payment) =>
            sum + getPaymentAmount(payment),
          0
        );

      const expense = expenses
        .filter((expense) =>
          isSameMonth(
            getExpenseDate(expense),
            currentYear,
            monthIndex
          )
        )
        .reduce(
          (sum, expense) =>
            sum + getExpenseAmount(expense),
          0
        );

      return {
        month,
        income,
        expense,
        profit: income - expense,
      };
    });
  }, [payments, expenses, currentYear]);

  /* =======================================================
     MONTHLY STUDENTS
  ======================================================= */

  const monthlyStudents = useMemo(() => {
    return MONTHS.map(
      (month, monthIndex) => {
        const count = students.filter(
          (student) => {
            const createdDate =
              student?.createdAt ||
              student?.joiningDate ||
              student?.date ||
              student?.admissionDate;

            return isSameMonth(
              createdDate,
              currentYear,
              monthIndex
            );
          }
        ).length;

        return {
          month,
          students: count,
        };
      }
    );
  }, [students, currentYear]);

  /* =======================================================
     STUDENT GROWTH
  ======================================================= */

  const studentGrowth = useMemo(() => {
    const previousMonth =
      currentMonth === 0
        ? 11
        : currentMonth - 1;

    const current =
      monthlyStudents[currentMonth]?.students || 0;

    const previous =
      monthlyStudents[previousMonth]?.students || 0;

    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return (
      ((current - previous) / previous) *
      100
    );
  }, [
    monthlyStudents,
    currentMonth,
  ]);

  /* =======================================================
     EXPENSE CATEGORIES
  ======================================================= */

  const expenseCategories = useMemo(() => {
    const map = {};

    expenses.forEach((expense) => {
      const category =
        getExpenseCategory(expense);

      const amount =
        getExpenseAmount(expense);

      if (!map[category]) {
        map[category] = 0;
      }

      map[category] += amount;
    });

    const categoryColors = [
      "#8b5cf6",
      "#6366f1",
      "#ec4899",
      "#f97316",
      "#14b8a6",
      "#0ea5e9",
      "#eab308",
      "#84cc16",
      "#ef4444",
    ];

    return Object.entries(map)
      .map(([category, amount], index) => ({
        category,
        amount,
        color:
          categoryColors[
            index % categoryColors.length
          ],
      }))
      .sort(
        (a, b) => b.amount - a.amount
      );
  }, [expenses]);

  const highestExpenseCategory =
    expenseCategories[0];

  /* =======================================================
     PAYMENT METHODS
  ======================================================= */

  const paymentMethods = useMemo(() => {
    const map = {};

    payments.forEach((payment) => {
      const method =
        payment?.paymentMethod || "Other";

      if (!map[method]) {
        map[method] = 0;
      }

      map[method] += getPaymentAmount(payment);
    });

    return Object.entries(map)
      .map(([method, amount]) => ({
        method,
        amount,
      }))
      .sort(
        (a, b) => b.amount - a.amount
      );
  }, [payments]);

  /* =======================================================
     INCOME PERCENTAGE
  ======================================================= */

  const incomePercentage =
    totalIncome > 0
      ? Math.round(
          (totalIncome /
            (totalIncome + totalExpense)) *
            100
        )
      : 0;

  const expensePercentage =
    totalIncome + totalExpense > 0
      ? Math.round(
          (totalExpense /
            (totalIncome + totalExpense)) *
            100
        )
      : 0;

  /* =======================================================
     PROFIT MARGIN
  ======================================================= */

  const profitMargin =
    totalIncome > 0
      ? (netProfit / totalIncome) * 100
      : 0;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="report-loading">
        <div className="report-loader">
          <div />
          <div />
          <div />
        </div>

        <h3>Preparing your report</h3>

        <p>
          Fetching students, income and
          expense data...
        </p>
      </div>
    );
  }

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="report-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="report-header">

        <div className="report-header-content">

          <div className="report-title-icon">
            <BarChart3 size={26} />
          </div>

          <div>
            <span className="report-small-title">
              BUSINESS ANALYTICS
            </span>

            <h1>Company Report</h1>

            <p>
              Complete overview of{" "}
              <strong>
                students, income, expenses
                & profit
              </strong>
            </p>
          </div>

        </div>

        <button
          className="report-refresh-btn"
          onClick={() => fetchReportData(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={15}
            className={
              refreshing ? "spin" : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh Report"}
        </button>

      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="report-error">
          <AlertCircle size={17} />

          <span>{error}</span>
        </div>
      )}

      {/* ===================================================
          STAT CARDS
      =================================================== */}

      <div className="report-stat-grid">

        {/* STUDENTS */}

        <div className="report-stat-card students-card">

          <div className="stat-card-glow" />

          <div className="report-stat-top">

            <div className="report-stat-icon students-icon">
              <Users size={20} />
            </div>

            <span>Total Students</span>

            <div className="stat-mini-icon">
              <Activity size={14} />
            </div>

          </div>

          <h2>
            {formatNumber(totalStudents)}
          </h2>

          <p className="stat-bottom-text">
            <span className="stat-green">
              {activeStudents} Active
            </span>

            <span>•</span>

            <span>
              {inactiveStudents} Inactive
            </span>
          </p>

        </div>

        {/* INCOME */}

        <div className="report-stat-card revenue-card">

          <div className="stat-card-glow" />

          <div className="report-stat-top">

            <div className="report-stat-icon revenue-icon">
              <Wallet size={20} />
            </div>

            <span>Total Income</span>

            <div className="stat-mini-icon">
              <ArrowUpRight size={14} />
            </div>

          </div>

          <h2>
            {formatCurrency(totalIncome)}
          </h2>

          <p className="stat-bottom-text">
            <span className="stat-green">
              {formatCurrency(todayIncome)}
            </span>

            <span>
              collected today
            </span>
          </p>

        </div>

        {/* EXPENSE */}

        <div className="report-stat-card expense-card">

          <div className="stat-card-glow" />

          <div className="report-stat-top">

            <div className="report-stat-icon expense-icon">
              <Receipt size={20} />
            </div>

            <span>Total Expense</span>

            <div className="stat-mini-icon">
              <ArrowDownRight size={14} />
            </div>

          </div>

          <h2>
            {formatCurrency(totalExpense)}
          </h2>

          <p className="stat-bottom-text">
            <span className="stat-red">
              {formatCurrency(todayExpense)}
            </span>

            <span>
              spent today
            </span>
          </p>

        </div>

        {/* PROFIT */}

        <div className="report-stat-card profit-card">

          <div className="stat-card-glow" />

          <div className="report-stat-top">

            <div className="report-stat-icon profit-icon">
              <TrendingUp size={20} />
            </div>

            <span>Net Profit</span>

            <div className="stat-mini-icon">
              {netProfit >= 0 ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
            </div>

          </div>

          <h2>
            {formatCurrency(
              Math.abs(netProfit)
            )}
          </h2>

          <p className="stat-bottom-text">
            <span
              className={
                netProfit >= 0
                  ? "stat-green"
                  : "stat-red"
              }
            >
              {netProfit >= 0
                ? "Profit"
                : "Loss"}
            </span>

            <span>
              • {profitMargin.toFixed(1)}%
              margin
            </span>
          </p>

        </div>

      </div>

      {/* ===================================================
          FINANCE GRAPH
      =================================================== */}

      <div className="report-chart-card finance-card">

        <div className="report-chart-header">

          <div>

            <div className="chart-title-row">

              <span className="chart-badge green-badge">
                <CircleDollarSign size={11} />
                FINANCE
              </span>

              <span className="chart-year">
                {currentYear}
              </span>

            </div>

            <h3>
              Income vs Expense
            </h3>

            <p>
              Monthly comparison of actual
              collections and business expenses.
            </p>

          </div>

          <div className="chart-legend">

            <span>
              <i className="legend-dot revenue-dot" />
              Income
            </span>

            <span>
              <i className="legend-dot expense-dot" />
              Expense
            </span>

          </div>

        </div>

        {/* SUMMARY */}

        <div className="finance-summary-row">

          <div className="finance-summary-box revenue-summary">
            <span>Total Income</span>

            <strong>
              {formatCurrency(totalIncome)}
            </strong>
          </div>

          <div className="finance-summary-box expense-summary">
            <span>Total Expense</span>

            <strong>
              {formatCurrency(totalExpense)}
            </strong>
          </div>

          <div className="finance-summary-box profit-summary">
            <span>Net Result</span>

            <strong>
              {formatCurrency(
                Math.abs(netProfit)
              )}
            </strong>
          </div>

        </div>

        <FinanceGraph data={monthlyFinance} />

      </div>

      {/* ===================================================
          MAIN GRID
      =================================================== */}

      <div className="report-main-grid">

        {/* =================================================
            STUDENT GROWTH
        ================================================= */}

        <div className="report-chart-card">

          <div className="report-chart-header">

            <div>

              <div className="chart-title-row">

                <span className="chart-badge blue-badge">
                  <Users size={11} />
                  STUDENTS
                </span>

                <span className="chart-year">
                  {currentYear}
                </span>

              </div>

              <h3>
                Student Growth
              </h3>

              <p>
                Month-wise student registrations.
              </p>

            </div>

            <div
              className={
                studentGrowth >= 0
                  ? "growth-positive"
                  : "growth-negative"
              }
            >
              {studentGrowth >= 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}

              {studentGrowth >= 0
                ? "+"
                : ""}
              {studentGrowth.toFixed(1)}%
            </div>

          </div>

          <div className="student-chart-meta">

            <div>
              <span>Total</span>
              <strong>
                {formatNumber(
                  totalStudents
                )}
              </strong>
            </div>

            <div>
              <span>Active</span>
              <strong>
                {formatNumber(
                  activeStudents
                )}
              </strong>
            </div>

            <div>
              <span>This Month</span>
              <strong>
                {formatNumber(
                  monthlyStudents[
                    currentMonth
                  ]?.students || 0
                )}
              </strong>
            </div>

          </div>

          <StudentBarChart
            data={monthlyStudents}
          />

        </div>

        {/* =================================================
            EXPENSE CATEGORY
        ================================================= */}

        <div className="report-chart-card">

          <div className="report-chart-header">

            <div>

              <div className="chart-title-row">

                <span className="chart-badge purple-badge">
                  <Receipt size={11} />
                  EXPENSES
                </span>

              </div>

              <h3>
                Expense Categories
              </h3>

              <p>
                Expense distribution by category.
              </p>

            </div>

          </div>

          <ExpenseDonut
            data={expenseCategories}
            total={totalExpense}
          />

        </div>

      </div>

      {/* ===================================================
          SECOND ROW
      =================================================== */}

      <div className="report-two-column">

        {/* =================================================
            MONTHLY PROFIT
        ================================================= */}

        <div className="report-chart-card">

          <div className="report-chart-header">

            <div>

              <div className="chart-title-row">

                <span className="chart-badge orange-badge">
                  <TrendingUp size={11} />
                  PROFIT PERFORMANCE
                </span>

                <span className="chart-year">
                  {currentYear}
                </span>

              </div>

              <h3>
                Monthly Profit / Loss
              </h3>

              <p>
                Difference between monthly income
                and expenses.
              </p>

            </div>

            <div className="chart-year">
              {netProfit >= 0
                ? "CURRENT YEAR"
                : "CURRENT YEAR"}
              <strong
                style={{
                  marginLeft: 4,
                  color:
                    netProfit >= 0
                      ? "#16a34a"
                      : "#dc2626",
                }}
              >
                {formatCurrency(
                  Math.abs(netProfit)
                )}
              </strong>
            </div>

          </div>

          <ProfitChart
            data={monthlyFinance}
          />

        </div>

        {/* =================================================
            EXPENSE DETAILS
        ================================================= */}

        <div className="report-chart-card">

          <div className="report-chart-header">

            <div>

              <div className="chart-title-row">

                <span className="chart-badge red-badge">
                  <Receipt size={11} />
                  BREAKDOWN
                </span>

              </div>

              <h3>
                Expense Details
              </h3>

              <p>
                Highest spending categories.
              </p>

            </div>

          </div>

          {expenseCategories.length > 0 ? (
            <div className="category-list">

              {expenseCategories.map(
                (item, index) => {

                  const percentage =
                    totalExpense > 0
                      ? (item.amount /
                          totalExpense) *
                        100
                      : 0;

                  return (
                    <div
                      className="category-item"
                      key={item.category}
                    >

                      <div className="category-info">

                        <div className="category-name">

                          <span className="category-rank">
                            #{index + 1}
                          </span>

                          <div>
                            <strong>
                              {item.category}
                            </strong>

                            <small>
                              {percentage.toFixed(
                                1
                              )}
                              % of expenses
                            </small>
                          </div>

                        </div>

                        <strong>
                          {formatCurrency(
                            item.amount
                          )}
                        </strong>

                      </div>

                      <div className="report-progress-track">

                        <div
                          className="report-progress-fill category-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          ) : (
            <div className="chart-empty">
              <Receipt size={28} />
              <span>
                No expense data available
              </span>
            </div>
          )}

        </div>

      </div>

      {/* ===================================================
          INSIGHTS TITLE
      =================================================== */}

      <div className="report-section-title">

        <div>
          <Sparkles size={14} />

          <span>
            BUSINESS INSIGHTS
          </span>
        </div>

        <p>
          Live insights calculated from
          your current data
        </p>

      </div>

      {/* ===================================================
          INSIGHTS
      =================================================== */}

      <div className="report-insights">

        {/* INCOME */}

        <div className="insight-card insight-revenue">

          <div className="insight-icon">
            <Wallet size={19} />
          </div>

          <span>
            INCOME SHARE
          </span>

          <strong>
            {incomePercentage}%
          </strong>

          <p>
            Income represents{" "}
            {incomePercentage}% of total
            money movement recorded in
            the report.
          </p>

        </div>

        {/* EXPENSE */}

        <div className="insight-card insight-expense">

          <div className="insight-icon">
            <Receipt size={19} />
          </div>

          <span>
            EXPENSE SHARE
          </span>

          <strong>
            {expensePercentage}%
          </strong>

          <p>
            Expenses currently account
            for {expensePercentage}% of
            total recorded financial
            activity.
          </p>

        </div>

        {/* GROWTH */}

        <div className="insight-card insight-growth">

          <div className="insight-icon">
            <Users size={19} />
          </div>

          <span>
            STUDENT GROWTH
          </span>

          <strong>
            {studentGrowth >= 0
              ? "+"
              : ""}
            {studentGrowth.toFixed(1)}%
          </strong>

          <p>
            Student registrations compared
            with the previous month.
          </p>

        </div>

        {/* TOP EXPENSE */}

        <div className="insight-card insight-top">

          <div className="insight-icon">
            <Target size={19} />
          </div>

          <span>
            TOP EXPENSE
          </span>

          <strong>
            {highestExpenseCategory
              ? highestExpenseCategory.category
              : "No Data"}
          </strong>

          <p>
            {highestExpenseCategory
              ? `${formatCurrency(
                  highestExpenseCategory.amount
                )} spent in this category.`
              : "No expense category available yet."}
          </p>

        </div>

      </div>

      {/* ===================================================
          PAYMENT METHOD
      =================================================== */}

      {paymentMethods.length > 0 && (
        <div
          className="report-chart-card"
          style={{ marginTop: "20px" }}
        >

          <div className="report-chart-header">

            <div>

              <div className="chart-title-row">

                <span className="chart-badge green-badge">
                  <CreditCard size={11} />
                  COLLECTION METHODS
                </span>

              </div>

              <h3>
                Income by Payment Method
              </h3>

              <p>
                Income collected through each
                payment method.
              </p>

            </div>

          </div>

          <div className="category-list">

            {paymentMethods.map(
              (item, index) => {

                const percentage =
                  totalIncome > 0
                    ? (item.amount /
                        totalIncome) *
                      100
                    : 0;

                return (
                  <div
                    className="category-item"
                    key={item.method}
                  >

                    <div className="category-info">

                      <div className="category-name">

                        <span className="category-rank">
                          #{index + 1}
                        </span>

                        <div>
                          <strong>
                            {item.method}
                          </strong>

                          <small>
                            {percentage.toFixed(
                              1
                            )}
                            % of total income
                          </small>
                        </div>

                      </div>

                      <strong>
                        {formatCurrency(
                          item.amount
                        )}
                      </strong>

                    </div>

                    <div className="report-progress-track">

                      <div
                        className="report-progress-fill revenue-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>
      )}

      {/* ===================================================
          FOOTER
      =================================================== */}

      <div className="report-footer">
        <CalendarDays size={12} />

        <span>
          Report generated from live
          students, fee collections and
          expense records
        </span>
      </div>

    </div>
  );
};

export default Report;