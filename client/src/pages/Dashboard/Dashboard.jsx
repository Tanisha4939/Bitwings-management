import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/api";
import Students from "../Students/Students";
import "./Dashboard.css";
import Admissions from "../Admissions/Admissions";
import FeesCalendar from "../Attendance/FeesCalendar";
import Fees from "../Fees/Fees";
import Marketing from "../Marketing/Marketing";
import Report from "../Report/Report";
import FeeReminder from "../FeeReminder/FeeReminder";
import Followup from "../Followup/Followup";

function Dashboard() {

    // =====================================================
    // STATES
    // =====================================================

    const [activePage, setActivePage] = useState("Dashboard");

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("bitwingsTheme") === "dark";
    });

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);

    const [dashboardError, setDashboardError] = useState("");

    const [selectedYear, setSelectedYear] = useState(
        new Date().getFullYear()
    );

    const [monthlyTarget, setMonthlyTarget] = useState(20);


    // =====================================================
    // API
    // =====================================================

    const API_URL = `${API_BASE_URL}/students`;


    // =====================================================
    // THEME
    // =====================================================

    useEffect(() => {

        if (darkMode) {

            document.body.classList.add("dark-theme");

            localStorage.setItem(
                "bitwingsTheme",
                "dark"
            );

        } else {

            document.body.classList.remove(
                "dark-theme"
            );

            localStorage.setItem(
                "bitwingsTheme",
                "light"
            );

        }

    }, [darkMode]);


    // =====================================================
    // MENU
    // =====================================================

    const menuItems = [

        {
            name: "Dashboard",
            icon: "⌂",
        },

        {
            name: "Students",
            icon: "♙",
        },

        {
            name: "Admissions",
            icon: "▣",
        },

        {
            name: "Fees",
            icon: "₹",
        },

        {
            name: "Attendance",
            icon: "◷",
        },

        {
            name: "Reports",
            icon: "▤",
        },

        {
            name: "Marketing",
            icon: "✦",
        },

        {
            name: "Reminders",
            icon: "◉",
        },

        {
            name: "Followup",
            icon: "↗",
        },

    ];


    // =====================================================
    // FETCH STUDENTS
    // =====================================================

    const fetchStudents = async () => {

        try {

            setLoading(true);

            setDashboardError("");

            const response = await axios.get(
                API_URL
            );

            if (response.data?.success) {

                setStudents(
                    response.data.students || []
                );

            } else {

                setStudents([]);

            }

        } catch (error) {

            console.error(
                "Dashboard Student Fetch Error:",
                error
            );

            setDashboardError(
                "Unable to load live student data."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchStudents();

    }, []);


    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = () => {

        localStorage.removeItem(
            "bitwingsAdminLoggedIn"
        );

        window.location.href = "/";

    };


    // =====================================================
    // PAGE CHANGE
    // =====================================================

    const handlePageChange = (page) => {

        setActivePage(page);

    };


    // =====================================================
    // DATE HELPER
    // =====================================================

    const getStudentDate = (student) => {

        const possibleDate =
            student.admissionDate ||
            student.createdAt;

        if (!possibleDate) {
            return null;
        }

        const date = new Date(
            possibleDate
        );

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date;

    };


    // =====================================================
    // BASIC LIVE STATS
    // =====================================================

    const totalStudents =
        students.length;


    const activeStudents =
        students.filter(
            (student) =>
                String(student.status || "")
                    .toLowerCase() === "active"
        ).length;


    const inactiveStudents =
        students.filter(
            (student) =>
                String(student.status || "")
                    .toLowerCase() === "inactive"
        ).length;


    // =====================================================
    // CURRENT MONTH
    // =====================================================

    const currentDate =
        new Date();

    const currentMonth =
        currentDate.getMonth();

    const currentYear =
        currentDate.getFullYear();


    const newThisMonth =
        students.filter((student) => {

            const date =
                getStudentDate(student);

            if (!date) {
                return false;
            }

            return (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            );

        }).length;


    // =====================================================
    // FEES
    // =====================================================

    const totalFees =
        students.reduce(
            (sum, student) =>
                sum +
                Number(student.totalFees || 0),
            0
        );


    const totalPaidFees =
        students.reduce(
            (sum, student) =>
                sum +
                Number(student.paidFees || 0),
            0
        );


    const totalPendingFees =
        Math.max(
            totalFees - totalPaidFees,
            0
        );


    // =====================================================
    // FORMAT CURRENCY
    // =====================================================

    const formatCurrency = (amount) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(amount || 0);

    };


    // =====================================================
    // FORMAT SHORT CURRENCY
    // =====================================================

    const formatShortCurrency = (amount) => {

        const value =
            Number(amount || 0);

        if (value >= 10000000) {

            return (
                "₹" +
                (value / 10000000)
                    .toFixed(1) +
                "Cr"
            );

        }

        if (value >= 100000) {

            return (
                "₹" +
                (value / 100000)
                    .toFixed(1) +
                "L"
            );

        }

        if (value >= 1000) {

            return (
                "₹" +
                (value / 1000)
                    .toFixed(1) +
                "K"
            );

        }

        return "₹" + value;

    };


    // =====================================================
    // AVAILABLE YEARS
    // =====================================================

    const availableYears =
        useMemo(() => {

            const years = new Set();

            students.forEach((student) => {

                const date =
                    getStudentDate(student);

                if (date) {

                    years.add(
                        date.getFullYear()
                    );

                }

            });

            years.add(
                currentYear
            );

            return Array.from(years)
                .sort((a, b) => b - a);

        }, [students]);


    // =====================================================
    // MONTHLY DATA
    // =====================================================

    const monthlyData =
        useMemo(() => {

            const months = [
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

            return months.map(
                (month, index) => {

                    const count =
                        students.filter(
                            (student) => {

                                const date =
                                    getStudentDate(
                                        student
                                    );

                                if (!date) {
                                    return false;
                                }

                                return (
                                    date.getFullYear() ===
                                    selectedYear &&
                                    date.getMonth() ===
                                    index
                                );

                            }
                        ).length;

                    return {
                        month,
                        count,
                        target: monthlyTarget,
                    };

                }
            );

        }, [
            students,
            selectedYear,
            monthlyTarget,
        ]);


    // =====================================================
    // ANNUAL TOTAL
    // =====================================================

    const annualAdmissions =
        monthlyData.reduce(
            (sum, item) =>
                sum + item.count,
            0
        );


    // =====================================================
    // BEST MONTH
    // =====================================================

    const bestMonth =
        monthlyData.reduce(
            (best, current) => {

                if (
                    current.count >
                    best.count
                ) {
                    return current;
                }

                return best;

            },
            {
                month: "-",
                count: 0,
            }
        );


    // =====================================================
    // TARGET ACHIEVEMENT
    // =====================================================

    const annualTarget =
        monthlyTarget * 12;


    const targetPercentage =
        annualTarget > 0
            ? Math.min(
                Math.round(
                    (annualAdmissions /
                        annualTarget) *
                    100
                ),
                100
            )
            : 0;


    // =====================================================
    // RECENT STUDENTS
    // =====================================================

    const recentStudents =
        [...students]
            .sort((a, b) => {

                const dateA =
                    getStudentDate(a);

                const dateB =
                    getStudentDate(b);

                return (
                    (dateB?.getTime() || 0) -
                    (dateA?.getTime() || 0)
                );

            })
            .slice(0, 5);


    // =====================================================
    // COURSE DATA
    // =====================================================

    const courseData =
        useMemo(() => {

            const courseMap = {};

            students.forEach(
                (student) => {

                    const course =
                        student.course?.trim() ||
                        "Other";

                    courseMap[course] =
                        (courseMap[course] || 0) +
                        1;

                }
            );

            return Object.entries(
                courseMap
            )
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )
                .slice(0, 5);

        }, [students]);


    // =====================================================
    // INITIALS
    // =====================================================

    const getInitials = (name) => {

        if (!name) {
            return "ST";
        }

        return name
            .trim()
            .split(" ")
            .slice(0, 2)
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .toUpperCase();

    };


    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (student) => {

        const date =
            getStudentDate(student);

        if (!date) {
            return "No date";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    // =====================================================
    // CHART HEIGHT
    // =====================================================

    const chartMax =
        Math.max(
            monthlyTarget,
            ...monthlyData.map(
                (item) => item.count
            ),
            5
        );


    // =====================================================
    // DASHBOARD HOME
    // =====================================================

    const DashboardHome = () => {

        return (

            <div className="page-content">

                {/* =================================================
            PAGE HEADER
        ================================================= */}

                <div className="page-heading">

                    <div>

                        <span className="small-label">
                            LIVE OVERVIEW
                        </span>

                        <h1>
                            Good Morning, Admin 👋
                        </h1>

                        <p>
                            Here's everything happening
                            across your academy today.
                        </p>

                    </div>


                    <div className="date-box">

                        <span>
                            TODAY
                        </span>

                        <strong>

                            {new Date().toLocaleDateString(
                                "en-IN",
                                {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                }
                            )}

                        </strong>

                    </div>

                </div>


                {/* =================================================
            ERROR
        ================================================= */}

                {dashboardError && (

                    <div className="dashboard-error">

                        ⚠️ {dashboardError}

                        <button
                            onClick={fetchStudents}
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* =================================================
            LIVE STAT CARDS
        ================================================= */}

                <div className="stats-grid">


                    {/* TOTAL STUDENTS */}

                    <div className="stat-card blue-card">

                        <div className="stat-top">

                            <div className="stat-icon">
                                ♙
                            </div>

                            <span className="live-badge">
                                LIVE
                            </span>

                        </div>

                        <h3>

                            {loading
                                ? "..."
                                : totalStudents}

                        </h3>

                        <p>
                            Total Students
                        </p>

                        <div className="stat-line">
                        </div>

                    </div>


                    {/* NEW ADMISSIONS */}

                    <div className="stat-card purple-card">

                        <div className="stat-top">

                            <div className="stat-icon">
                                ✦
                            </div>

                            <span className="live-badge">
                                THIS MONTH
                            </span>

                        </div>

                        <h3>

                            {loading
                                ? "..."
                                : newThisMonth}

                        </h3>

                        <p>
                            New Admissions
                        </p>

                        <div className="stat-line">
                        </div>

                    </div>


                    {/* TOTAL FEES */}

                    <div className="stat-card green-card">

                        <div className="stat-top">

                            <div className="stat-icon">
                                ₹
                            </div>

                            <span className="live-badge">
                                TOTAL
                            </span>

                        </div>

                        <h3>

                            {loading
                                ? "..."
                                : formatShortCurrency(
                                    totalFees
                                )}

                        </h3>

                        <p>
                            Total Fees
                        </p>

                        <div className="stat-line">
                        </div>

                    </div>


                    {/* PENDING FEES */}

                    <div className="stat-card orange-card">

                        <div className="stat-top">

                            <div className="stat-icon">
                                ◷
                            </div>

                            <span className="live-badge">
                                PENDING
                            </span>

                        </div>

                        <h3>

                            {loading
                                ? "..."
                                : formatShortCurrency(
                                    totalPendingFees
                                )}

                        </h3>

                        <p>
                            Pending Fees
                        </p>

                        <div className="stat-line">
                        </div>

                    </div>

                </div>


                {/* =================================================
            QUICK SUMMARY
        ================================================= */}

                <div className="quick-summary-grid">

                    <div className="mini-summary-card">

                        <span className="mini-icon">
                            ●
                        </span>

                        <div>

                            <strong>
                                {activeStudents}
                            </strong>

                            <span>
                                Active Students
                            </span>

                        </div>

                    </div>


                    <div className="mini-summary-card">

                        <span className="mini-icon">
                            ○
                        </span>

                        <div>

                            <strong>
                                {inactiveStudents}
                            </strong>

                            <span>
                                Inactive Students
                            </span>

                        </div>

                    </div>


                    <div className="mini-summary-card">

                        <span className="mini-icon">
                            ✓
                        </span>

                        <div>

                            <strong>
                                {formatShortCurrency(
                                    totalPaidFees
                                )}
                            </strong>

                            <span>
                                Fees Collected
                            </span>

                        </div>

                    </div>


                    <div className="mini-summary-card">

                        <span className="mini-icon">
                            !
                        </span>

                        <div>

                            <strong>
                                {formatShortCurrency(
                                    totalPendingFees
                                )}
                            </strong>

                            <span>
                                Fees Pending
                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================================
            ANNUAL ANALYTICS
        ================================================= */}

                <section className="analytics-card">

                    <div className="analytics-header">

                        <div>

                            <span className="card-label">
                                ACADEMY ANALYTICS
                            </span>

                            <h2>
                                Annual Admissions
                            </h2>

                            <p>
                                Monthly student admissions
                                compared with your target.
                            </p>

                        </div>


                        <div className="analytics-controls">

                            <div className="control-box">

                                <label>
                                    YEAR
                                </label>

                                <select
                                    value={selectedYear}
                                    onChange={(e) =>
                                        setSelectedYear(
                                            Number(e.target.value)
                                        )
                                    }
                                >

                                    {availableYears.map(
                                        (year) => (

                                            <option
                                                key={year}
                                                value={year}
                                            >
                                                {year}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <div className="control-box">

                                <label>
                                    MONTHLY TARGET
                                </label>

                                <select
                                    value={monthlyTarget}
                                    onChange={(e) =>
                                        setMonthlyTarget(
                                            Number(e.target.value)
                                        )
                                    }
                                >

                                    <option value="10">
                                        10 Students
                                    </option>

                                    <option value="20">
                                        20 Students
                                    </option>

                                    <option value="30">
                                        30 Students
                                    </option>

                                    <option value="40">
                                        40 Students
                                    </option>

                                    <option value="50">
                                        50 Students
                                    </option>

                                    <option value="100">
                                        100 Students
                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
              ANALYTICS NUMBERS
          ================================================= */}

                    <div className="analytics-summary">

                        <div>

                            <span>
                                YEAR TOTAL
                            </span>

                            <strong>
                                {annualAdmissions}
                            </strong>

                        </div>


                        <div>

                            <span>
                                ANNUAL TARGET
                            </span>

                            <strong>
                                {annualTarget}
                            </strong>

                        </div>


                        <div>

                            <span>
                                BEST MONTH
                            </span>

                            <strong>
                                {bestMonth.count > 0
                                    ? `${bestMonth.month} · ${bestMonth.count}`
                                    : "—"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                TARGET ACHIEVEMENT
                            </span>

                            <strong>
                                {targetPercentage}%
                            </strong>

                        </div>

                    </div>


                    {/* =================================================
              BAR CHART
          ================================================= */}

                    <div className="annual-chart">

                        <div className="chart-y-axis">

                            <span>
                                {chartMax}
                            </span>

                            <span>
                                {Math.round(
                                    chartMax * 0.75
                                )}
                            </span>

                            <span>
                                {Math.round(
                                    chartMax * 0.5
                                )}
                            </span>

                            <span>
                                {Math.round(
                                    chartMax * 0.25
                                )}
                            </span>

                            <span>
                                0
                            </span>

                        </div>


                        <div className="chart-area">

                            <div className="chart-grid-lines">

                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>

                            </div>


                            {/* TARGET LINE */}

                            <div
                                className="target-line"
                                style={{
                                    bottom: `${(monthlyTarget /
                                        chartMax) *
                                        100
                                        }%`,
                                }}
                            >

                                <span>
                                    Target {monthlyTarget}
                                </span>

                            </div>


                            <div className="bars-container">

                                {monthlyData.map(
                                    (item) => {

                                        const height =
                                            item.count > 0
                                                ? Math.max(
                                                    (item.count /
                                                        chartMax) *
                                                    100,
                                                    4
                                                )
                                                : 2;

                                        return (

                                            <div
                                                className="chart-column"
                                                key={item.month}
                                            >

                                                <div className="bar-value">

                                                    {item.count}

                                                </div>


                                                <div className="bar-wrapper">

                                                    <div
                                                        className={
                                                            item.count >=
                                                                monthlyTarget
                                                                ? "chart-bar achieved"
                                                                : "chart-bar"
                                                        }
                                                        style={{
                                                            height:
                                                                `${height}%`,
                                                        }}
                                                        title={`${item.month}: ${item.count} students`}
                                                    >

                                                        <span className="bar-shine">
                                                        </span>

                                                    </div>

                                                </div>


                                                <span className="month-label">
                                                    {item.month}
                                                </span>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        </div>

                    </div>


                    <div className="chart-legend">

                        <span>

                            <i className="legend-dot">
                            </i>

                            Monthly Admissions

                        </span>


                        <span>

                            <i className="legend-line">
                            </i>

                            Monthly Target

                        </span>

                    </div>

                </section>


                {/* =================================================
            MAIN GRID
        ================================================= */}

                <div className="dashboard-grid">


                    {/* =================================================
              RECENT STUDENTS
          ================================================= */}

                    <div className="dashboard-card recent-card">

                        <div className="card-header">

                            <div>

                                <span className="card-label">
                                    STUDENTS
                                </span>

                                <h2>
                                    Recent Students
                                </h2>

                            </div>


                            <button
                                className="view-btn"
                                onClick={() =>
                                    setActivePage(
                                        "Students"
                                    )
                                }
                            >
                                View All →
                            </button>

                        </div>


                        <div className="student-list">

                            {loading ? (

                                <div className="dashboard-loading">
                                    Loading students...
                                </div>

                            ) : recentStudents.length === 0 ? (

                                <div className="dashboard-empty">
                                    <div>
                                        ♙
                                    </div>

                                    <strong>
                                        No students yet
                                    </strong>

                                    <span>
                                        Add students to see
                                        them here.
                                    </span>
                                </div>

                            ) : (

                                recentStudents.map(
                                    (student) => (

                                        <div
                                            className="student-row"
                                            key={
                                                student._id ||
                                                student.id ||
                                                student.mobile
                                            }
                                        >

                                            <div className="avatar">

                                                {getInitials(
                                                    student.name
                                                )}

                                            </div>


                                            <div className="student-info">

                                                <strong>
                                                    {student.name ||
                                                        "Unnamed Student"}
                                                </strong>

                                                <span>
                                                    {student.course ||
                                                        "Course not specified"}
                                                </span>

                                            </div>


                                            <span
                                                className={
                                                    String(
                                                        student.status ||
                                                        ""
                                                    ).toLowerCase() ===
                                                        "active"
                                                        ? "status active"
                                                        : "status inactive"
                                                }
                                            >

                                                {student.status ||
                                                    "Unknown"}

                                            </span>

                                        </div>

                                    )
                                )

                            )}

                        </div>

                    </div>


                    {/* =================================================
              COURSE OVERVIEW
          ================================================= */}

                    <div className="dashboard-card">

                        <div className="card-header">

                            <div>

                                <span className="card-label">
                                    COURSES
                                </span>

                                <h2>
                                    Course Overview
                                </h2>

                            </div>

                        </div>


                        <div className="course-list">

                            {courseData.length === 0 ? (

                                <div className="dashboard-empty">

                                    <div>
                                        ◫
                                    </div>

                                    <strong>
                                        No course data
                                    </strong>

                                    <span>
                                        Add students with
                                        courses.
                                    </span>

                                </div>

                            ) : (

                                courseData.map(
                                    ([course, count], index) => {

                                        const percentage =
                                            totalStudents > 0
                                                ? Math.round(
                                                    (count /
                                                        totalStudents) *
                                                    100
                                                )
                                                : 0;

                                        return (

                                            <div
                                                className="course-item"
                                                key={course}
                                            >

                                                <div className="course-item-top">

                                                    <div>

                                                        <span className="course-number">
                                                            0{index + 1}
                                                        </span>

                                                        <strong>
                                                            {course}
                                                        </strong>

                                                    </div>


                                                    <span>
                                                        {count} Students
                                                    </span>

                                                </div>


                                                <div className="course-progress">

                                                    <span
                                                        style={{
                                                            width:
                                                                `${percentage}%`,
                                                        }}
                                                    >
                                                    </span>

                                                </div>


                                                <small>
                                                    {percentage}% of
                                                    students
                                                </small>

                                            </div>

                                        );

                                    }
                                )

                            )}

                        </div>

                    </div>

                </div>


                {/* =================================================
            BOTTOM ACTIONS
        ================================================= */}

                <div className="dashboard-actions">

                    <button
                        className="action-card"
                        onClick={() =>
                            setActivePage(
                                "Students"
                            )
                        }
                    >

                        <div className="action-icon">
                            ♙
                        </div>

                        <div>

                            <strong>
                                Manage Students
                            </strong>

                            <span>
                                View and manage
                                all students
                            </span>

                        </div>

                        <b>
                            →
                        </b>

                    </button>


                    <button
                        className="action-card"
                        onClick={() =>
                            setActivePage(
                                "Marketing"
                            )
                        }
                    >

                        <div className="action-icon">
                            ✦
                        </div>

                        <div>

                            <strong>
                                WhatsApp Marketing
                            </strong>

                            <span>
                                Connect with your
                                students
                            </span>

                        </div>

                        <b>
                            →
                        </b>

                    </button>


                    <button
                        className="action-card"
                        onClick={() =>
                            setActivePage(
                                "Reports"
                            )
                        }
                    >

                        <div className="action-icon">
                            ▤
                        </div>

                        <div>

                            <strong>
                                Academy Reports
                            </strong>

                            <span>
                                View academy
                                analytics
                            </span>

                        </div>

                        <b>
                            →
                        </b>

                    </button>

                </div>

            </div>

        );

    };


    // =====================================================
    // RENDER PAGE
    // =====================================================

    const renderPage = () => {

        switch (activePage) {

            case "Dashboard":

                return (
                    <DashboardHome />
                );


            case "Students":

                return (
                    <Students />
                );


            case "Admissions":

                return (
                    <Admissions />
                );


            case "Fees":

                return (
                    <Fees />
                );


            case "Attendance":

                return (
                    <FeesCalendar
                        payments={students
                            .filter((student) => {
                                return (
                                    student.admissionDate &&
                                    Number(student.paidFees || 0) > 0
                                );
                            })
                            .map((student) => ({
                                _id: student._id,

                                studentId: student._id,

                                studentName: student.name,

                                course: student.course,

                                amount: Number(student.paidFees || 0),

                                paymentDate: student.admissionDate,
                            }))}
                    />
                );
            case "Reports":

                return (
                    <Report />
                );


            case "Marketing":

                return (
                    <Marketing />
                );

            case "Reminders":

                return (
                    <FeeReminder />
                );
            
             case "Followup":

                return (
                    <Followup />
                );
            
            default:

                return (
                    <DashboardHome />
                );

        }

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <div
            className={
                sidebarCollapsed
                    ? "dashboard-layout sidebar-is-collapsed"
                    : "dashboard-layout"
            }
        >


            {/* =================================================
          SIDEBAR
      ================================================= */}

            <aside className="sidebar">


                {/* LOGO */}

                <div className="sidebar-logo">

                    <div className="logo-mark">
                        B
                    </div>

                    {!sidebarCollapsed && (

                        <div className="logo-text">

                            <strong>
                                BITWINGS
                            </strong>

                            <span>
                                MANAGEMENT
                            </span>

                        </div>

                    )}

                </div>


                {/* NAVIGATION */}

                <nav className="sidebar-nav">

                    {!sidebarCollapsed && (

                        <span className="nav-label">
                            MAIN MENU
                        </span>

                    )}


                    {menuItems.map(
                        (item) => (

                            <button
                                key={item.name}
                                className={
                                    activePage ===
                                        item.name
                                        ? "nav-item active"
                                        : "nav-item"
                                }
                                onClick={() =>
                                    handlePageChange(
                                        item.name
                                    )
                                }
                                title={
                                    sidebarCollapsed
                                        ? item.name
                                        : ""
                                }
                            >

                                <span className="nav-icon">
                                    {item.icon}
                                </span>

                                {!sidebarCollapsed && (

                                    <span>
                                        {item.name}
                                    </span>

                                )}

                                {activePage ===
                                    item.name &&
                                    !sidebarCollapsed && (

                                        <span className="nav-active-dot">
                                        </span>

                                    )}

                            </button>

                        )
                    )}

                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="sidebar-bottom">


                    {!sidebarCollapsed && (

                        <div className="academy-status">

                            <span className="online-dot">
                            </span>

                            <div>

                                <strong>
                                    System Online
                                </strong>

                                <small>
                                    Bitwings Academy
                                </small>

                            </div>

                        </div>

                    )}


                    <button
                        className="logout-btn"
                        onClick={logout}
                        title={
                            sidebarCollapsed
                                ? "Logout"
                                : ""
                        }
                    >

                        <span>
                            ⇥
                        </span>

                        {!sidebarCollapsed && (
                            <span>
                                Logout
                            </span>
                        )}

                    </button>

                </div>

            </aside>


            {/* =================================================
          MAIN
      ================================================= */}

            <main className="dashboard-main">


                {/* =================================================
            HEADER
        ================================================= */}

                <header className="top-header">


                    {/* LEFT */}

                    <div className="header-left">

                        <button
                            className="sidebar-toggle"
                            onClick={() =>
                                setSidebarCollapsed(
                                    !sidebarCollapsed
                                )
                            }
                            title="Toggle Sidebar"
                        >

                            ☰

                        </button>


                        <div className="breadcrumb">

                            <span>
                                Bitwings
                            </span>

                            <b>
                                /
                            </b>

                            <strong>
                                {activePage}
                            </strong>

                        </div>

                    </div>


                    {/* RIGHT */}

                    <div className="header-right">


                        {/* REFRESH */}

                        <button
                            className="header-refresh"
                            onClick={fetchStudents}
                            title="Refresh live data"
                        >

                            ↻

                        </button>


                        {/* THEME */}

                        <button
                            className="theme-toggle"
                            onClick={() =>
                                setDarkMode(
                                    !darkMode
                                )
                            }
                            title={
                                darkMode
                                    ? "Switch to Light Mode"
                                    : "Switch to Dark Mode"
                            }
                        >

                            {darkMode
                                ? "☀️"
                                : "🌙"}

                        </button>


                        {/* NOTIFICATION */}

                        <button
                            className="notification-btn"
                            title="Notifications"
                        >

                            ◉

                            <span className="notification-dot">
                            </span>

                        </button>


                        {/* PROFILE */}

                        <div className="admin-profile">

                            <div className="profile-avatar">
                                A
                            </div>

                            <div className="profile-info">

                                <strong>
                                    Admin
                                </strong>

                                <span>
                                    Administrator
                                </span>

                            </div>

                            <span className="profile-arrow">
                                ⌄
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
            CONTENT
        ================================================= */}

                <section className="content-area">

                    {renderPage()}

                </section>

            </main>

        </div>

    );

}


export default Dashboard;