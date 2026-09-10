import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/api";
import {
  BellRing,
  Search,
  RefreshCw,
  MessageCircle,
  Users,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Phone,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import "./FeeReminder.css";

const API_URL = API_BASE_URL;

function FeeReminder() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // CHECK REMINDER PERIOD
  // Reminder active only from 1st to 5th
  // ==========================================

  const today = new Date();
  const currentDate = today.getDate();

  const isReminderPeriod = currentDate >= 1 && currentDate <= 5;

  // ==========================================
  // FETCH STUDENTS
  // ==========================================

  const fetchStudents = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await axios.get(`${API_URL}/students`);

      const data = response.data;

      if (data.success) {
        setStudents(data.students || []);
      } else {
        setStudents([]);
        setError(data.message || "Unable to load students.");
      }
    } catch (err) {
      console.error("Fee Reminder Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to connect with server. Please check backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ==========================================
  // PENDING STUDENTS
  // ==========================================

  const pendingStudents = useMemo(() => {
    return students.filter((student) => {
      const pending = Number(student.pendingFees || 0);

      return pending > 0;
    });
  }, [students]);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return pendingStudents;
    }

    return pendingStudents.filter((student) => {
      const name = String(student.name || "").toLowerCase();
      const mobile = String(student.mobile || "").toLowerCase();
      const course = String(student.course || "").toLowerCase();

      return (
        name.includes(keyword) ||
        mobile.includes(keyword) ||
        course.includes(keyword)
      );
    });
  }, [pendingStudents, search]);

  // ==========================================
  // TOTAL PENDING AMOUNT
  // ==========================================

  const totalPending = useMemo(() => {
    return pendingStudents.reduce((total, student) => {
      return total + Number(student.pendingFees || 0);
    }, 0);
  }, [pendingStudents]);

  // ==========================================
  // WHATSAPP REMINDER
  // ==========================================

  const sendWhatsAppReminder = (student) => {
    const name = student.name || "Student";

    const message = `Hello ${name},

This is a reminder from Bitwings IT Academy regarding your course fee installment.

Kindly pay your pending installment at your earliest convenience.

Thank you.
— Bitwings IT Academy`;

    let mobile = String(student.mobile || "").replace(/\D/g, "");

    if (!mobile) {
      alert("Student mobile number is not available.");
      return;
    }

    // Remove starting 0
    if (mobile.startsWith("0")) {
      mobile = mobile.substring(1);
    }

    // If already contains India country code
    if (!mobile.startsWith("91")) {
      mobile = `91${mobile}`;
    }

    const whatsappUrl =
      `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formattedDate = today.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="fee-reminder-page">
        <div className="fee-reminder-loading">
          <div className="fee-reminder-loader">
            <BellRing size={30} />
          </div>

          <h3>Loading Fee Reminders...</h3>

          <p>
            Please wait while we fetch students with pending installments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fee-reminder-page">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="fee-reminder-header">

        <div className="fee-reminder-header-left">

          <div className="fee-reminder-title-icon">
            <BellRing size={28} />
          </div>

          <div>
            <div className="fee-reminder-small-title">
              BITWINGS IT ACADEMY
            </div>

            <h1>Fee Reminder</h1>

            <p>
              Manage pending fee installment reminders for students.
            </p>
          </div>

        </div>

        <button
          className={`fee-reminder-refresh ${
            refreshing ? "refreshing" : ""
          }`}
          onClick={() => fetchStudents(true)}
          disabled={refreshing}
        >
          <RefreshCw size={18} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {/* ==========================================
          DATE STATUS
      ========================================== */}

      <div
        className={`reminder-status-card ${
          isReminderPeriod ? "active" : "inactive"
        }`}
      >

        <div className="reminder-status-icon">
          {isReminderPeriod ? (
            <CheckCircle2 size={24} />
          ) : (
            <Clock3 size={24} />
          )}
        </div>

        <div className="reminder-status-content">

          <strong>
            {isReminderPeriod
              ? "Fee Reminder is Active"
              : "Fee Reminder is Currently Closed"}
          </strong>

          <span>
            {isReminderPeriod
              ? `Today is ${formattedDate}. You can send pending fee reminders.`
              : `Reminders are available only from 1st to 5th of every month.`}
          </span>

        </div>

        <div className="reminder-date-badge">
          1st – 5th
        </div>

      </div>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="fee-reminder-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* ==========================================
          STAT CARDS
      ========================================== */}

      <div className="fee-reminder-stats">

        <div className="reminder-stat-card blue">

          <div className="reminder-stat-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Pending Students</span>
            <strong>{pendingStudents.length}</strong>
          </div>

        </div>

        <div className="reminder-stat-card orange">

          <div className="reminder-stat-icon">
            <IndianRupee size={22} />
          </div>

          <div>
            <span>Total Pending</span>
            <strong>{formatCurrency(totalPending)}</strong>
          </div>

        </div>

        <div className="reminder-stat-card green">

          <div className="reminder-stat-icon">
            <MessageCircle size={22} />
          </div>

          <div>
            <span>WhatsApp Reminder</span>
            <strong>Ready</strong>
          </div>

        </div>

        <div className="reminder-stat-card purple">

          <div className="reminder-stat-icon">
            <CalendarDays size={22} />
          </div>

          <div>
            <span>Reminder Window</span>
            <strong>1–5</strong>
          </div>

        </div>

      </div>

      {/* ==========================================
          MAIN CARD
      ========================================== */}

      <div className="fee-reminder-card">

        {/* CARD HEADER */}

        <div className="fee-reminder-card-header">

          <div>

            <div className="fee-reminder-section-title">
              <BellRing size={20} />
              Pending Fee Students
            </div>

            <p>
              Students who currently have pending course fees.
            </p>

          </div>

          <div className="pending-count">
            {filteredStudents.length} Students
          </div>

        </div>

        {/* SEARCH */}

        <div className="fee-reminder-toolbar">

          <div className="fee-reminder-search">

            <Search size={19} />

            <input
              type="text"
              placeholder="Search student, mobile or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}

          </div>

        </div>

        {/* ==========================================
            REMINDER CLOSED
        ========================================== */}

        {!isReminderPeriod ? (
          <div className="reminder-closed">

            <div className="reminder-closed-icon">
              <Clock3 size={36} />
            </div>

            <h2>Reminder Window Closed</h2>

            <p>
              Pending fee reminders can be sent only between the
              <strong> 1st and 5th </strong>
              of every month.
            </p>

            <div className="next-reminder-box">
              <CalendarDays size={18} />
              Next reminder window: <strong>1st – 5th</strong>
            </div>

          </div>
        ) : filteredStudents.length === 0 ? (

          /* ==========================================
              NO STUDENTS
          ========================================== */

          <div className="fee-reminder-empty">

            <div className="empty-icon">
              {search ? (
                <Search size={32} />
              ) : (
                <CheckCircle2 size={32} />
              )}
            </div>

            <h2>
              {search
                ? "No Matching Student"
                : "No Pending Fee Students"}
            </h2>

            <p>
              {search
                ? "Try another student name, mobile number or course."
                : "Great! There are currently no students with pending fees."}
            </p>

          </div>

        ) : (

          /* ==========================================
              STUDENT TABLE
          ========================================== */

          <div className="fee-reminder-table-wrapper">

            <table className="fee-reminder-table">

              <thead>
                <tr>

                  <th>#</th>

                  <th>Student</th>

                  <th>Mobile</th>

                  <th>Course</th>

                  <th>Pending Fees</th>

                  <th>Status</th>

                  <th>Reminder</th>

                </tr>
              </thead>

              <tbody>

                {filteredStudents.map((student, index) => {

                  const pendingAmount = Number(
                    student.pendingFees || 0
                  );

                  return (
                    <tr key={student._id || index}>

                      {/* NUMBER */}

                      <td>
                        <div className="student-number">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      </td>

                      {/* STUDENT */}

                      <td>

                        <div className="student-info">

                          <div className="student-avatar">
                            {String(student.name || "S")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="student-details">

                            <strong>
                              {student.name || "Unknown Student"}
                            </strong>

                            <span>
                              Student ID:{" "}
                              {student._id
                                ? String(student._id).slice(-6)
                                : "N/A"}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* MOBILE */}

                      <td>

                        <div className="mobile-info">
                          <Phone size={16} />
                          <span>
                            {student.mobile || "No mobile"}
                          </span>
                        </div>

                      </td>

                      {/* COURSE */}

                      <td>

                        <div className="course-info">

                          <BookOpen size={16} />

                          <span>
                            {student.course || "Course not available"}
                          </span>

                        </div>

                      </td>

                      {/* PENDING */}

                      <td>

                        <div className="pending-fee-amount">
                          {formatCurrency(pendingAmount)}
                        </div>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span className="pending-status">
                          <span className="status-dot"></span>
                          Pending
                        </span>

                      </td>

                      {/* WHATSAPP */}

                      <td>

                        <button
                          className="whatsapp-reminder-btn"
                          onClick={() =>
                            sendWhatsAppReminder(student)
                          }
                          disabled={!isReminderPeriod}
                          title="Send WhatsApp Reminder"
                        >
                          <MessageCircle size={17} />
                          Send Reminder
                        </button>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ==========================================
          FOOTER INFO
      ========================================== */}

      <div className="fee-reminder-footer">

        <div className="footer-info">

          <AlertCircle size={17} />

          <span>
            WhatsApp reminder message does not include the pending
            amount because students may pay their fees in multiple
            installments.
          </span>

        </div>

        <span className="footer-brand">
          Bitwings IT Academy
        </span>

      </div>

    </div>
  );
}

export default FeeReminder;