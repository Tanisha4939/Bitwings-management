
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./Fees.css";
import API_URL from "../../config/api";

const PENDING_STUDENTS_PER_PAGE = 10;
const PAYMENT_HISTORY_PER_PAGE = 10;

function Fees() {
  // =====================================================
  // STATES
  // =====================================================

  const [students, setStudents] =
    useState([]);

  const [payments, setPayments] =
    useState([]);

  const [loadingStudents, setLoadingStudents] =
    useState(true);

  const [loadingPayments, setLoadingPayments] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [selectedStudentId, setSelectedStudentId] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filterMethod, setFilterMethod] =
    useState("All");

  const [pendingPage, setPendingPage] =
    useState(1);

  const [historyPage, setHistoryPage] =
  useState(1);

  const [message, setMessage] =
    useState({
      type: "",
      text: "",
    });

  const [form, setForm] =
    useState({
      amount: "",
      paymentDate:
        new Date()
          .toISOString()
          .split("T")[0],
      paymentMethod: "Cash",
      transactionId: "",
      note: "",
    });

  // =====================================================
  // MESSAGE
  // =====================================================

  const showMessage = (
    type,
    text
  ) => {
    setMessage({
      type,
      text,
    });

    setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 3500);
  };

  // =====================================================
  // FETCH STUDENTS
  // =====================================================

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);

      const response =
        await fetch(
          `${API_URL}/students`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to load students"
        );
      }

      if (data.success) {
        setStudents(
          data.students || []
        );
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error(
        "FETCH STUDENTS ERROR:",
        error
      );

      showMessage(
        "error",
        error.message ||
        "Unable to load students."
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  // =====================================================
  // FETCH PAYMENTS
  // =====================================================

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);

      const response =
        await fetch(
          `${API_URL}/fees`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to load payments"
        );
      }

      if (data.success) {
        setPayments(
          data.payments || []
        );
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error(
        "FETCH PAYMENTS ERROR:",
        error
      );

      showMessage(
        "error",
        error.message ||
        "Unable to load fee collections."
      );
    } finally {
      setLoadingPayments(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchStudents();
    fetchPayments();
  }, []);

  // =====================================================
  // PENDING STUDENTS
  // ONLY STUDENTS HAVING PENDING FEES
  // =====================================================

  const pendingStudents =
    useMemo(() => {
      return students.filter(
        (student) =>
          Number(
            student.pendingFees || 0
          ) > 0
      );
    }, [students]);

  // =====================================================
  // PENDING PAGINATION
  // 10 STUDENTS PER PAGE
  // =====================================================

  const totalPendingStudents =
    pendingStudents.length;

  const totalPendingPages =
    Math.ceil(
      totalPendingStudents /
        PENDING_STUDENTS_PER_PAGE
    );

  const currentPendingStudents =
    pendingStudents.slice(
      (pendingPage - 1) *
        PENDING_STUDENTS_PER_PAGE,
      pendingPage *
        PENDING_STUDENTS_PER_PAGE
    );

  // Reset page when student data changes
  useEffect(() => {
    if (
      pendingPage >
      Math.max(totalPendingPages, 1)
    ) {
      setPendingPage(
        Math.max(totalPendingPages, 1)
      );
    }
  }, [
    pendingPage,
    totalPendingPages,
  ]);

  const handlePreviousPendingPage =
    () => {
      setPendingPage((prev) =>
        Math.max(prev - 1, 1)
      );
    };

  const handleNextPendingPage =
    () => {
      setPendingPage((prev) =>
        Math.min(
          prev + 1,
          totalPendingPages
        )
      );
    };

  // =====================================================
  // SELECTED STUDENT
  // =====================================================

  const selectedStudent =
    useMemo(() => {
      return students.find(
        (student) =>
          String(student._id) ===
          String(selectedStudentId)
      );
    }, [
      students,
      selectedStudentId,
    ]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

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

  // =====================================================
  // STUDENT CHANGE
  // =====================================================

  const handleStudentChange = (
    e
  ) => {
    const studentId =
      e.target.value;

    setSelectedStudentId(
      studentId
    );

    setForm((prev) => ({
      ...prev,
      amount: "",
      transactionId: "",
      note: "",
    }));
  };

  // =====================================================
  // RESET
  // =====================================================

  const resetForm = () => {
    setSelectedStudentId("");

    setForm({
      amount: "",
      paymentDate:
        new Date()
          .toISOString()
          .split("T")[0],
      paymentMethod: "Cash",
      transactionId: "",
      note: "",
    });
  };

  // =====================================================
  // MONEY
  // =====================================================

  const formatMoney = (
    amount
  ) => {
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

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    const value =
      new Date(date);

    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return date;
    }

    return value.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // TOTAL FEES
  // =====================================================

  const totalFees =
    useMemo(() => {
      return students.reduce(
        (total, student) =>
          total +
          Number(
            student.totalFees || 0
          ),
        0
      );
    }, [students]);

  // =====================================================
  // COLLECTED
  // =====================================================

  const collectedFees =
    useMemo(() => {
      return students.reduce(
        (total, student) =>
          total +
          Number(
            student.paidFees || 0
          ),
        0
      );
    }, [students]);

  // =====================================================
  // PENDING
  // =====================================================

  const pendingFees =
    useMemo(() => {
      return students.reduce(
        (total, student) =>
          total +
          Number(
            student.pendingFees || 0
          ),
        0
      );
    }, [students]);

  // =====================================================
  // TODAY COLLECTION
  // =====================================================

  const todayCollection =
    useMemo(() => {
      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      return payments
        .filter(
          (payment) =>
            String(
              payment.paymentDate
            ).split("T")[0] ===
            today
        )
        .reduce(
          (total, payment) =>
            total +
            Number(
              payment.amount || 0
            ),
          0
        );
    }, [payments]);

  // =====================================================
  // FILTER PAYMENTS
  // =====================================================

  const filteredPayments =
    useMemo(() => {
      const searchValue =
        search
          .toLowerCase()
          .trim();

      return payments.filter(
        (payment) => {
          const matchesSearch =
            !searchValue ||
            String(
              payment.studentName ||
              ""
            )
              .toLowerCase()
              .includes(searchValue) ||
            String(
              payment.course ||
              ""
            )
              .toLowerCase()
              .includes(searchValue) ||
            String(
              payment.transactionId ||
              ""
            )
              .toLowerCase()
              .includes(searchValue);

          const matchesMethod =
            filterMethod === "All" ||
            payment.paymentMethod ===
              filterMethod;

          return (
            matchesSearch &&
            matchesMethod
          );
        }
      );
    }, [
      payments,
      search,
      filterMethod,
    ]);


    // =====================================================
// PAYMENT HISTORY PAGINATION
// 10 PAYMENTS PER PAGE
// =====================================================

  const totalHistoryPages =
    Math.ceil(
      filteredPayments.length /
        PAYMENT_HISTORY_PER_PAGE
    );

  const currentHistoryPayments =
    filteredPayments.slice(
      (historyPage - 1) *
        PAYMENT_HISTORY_PER_PAGE,
      historyPage *
        PAYMENT_HISTORY_PER_PAGE
    );

  // Reset history page when search/filter changes
  useEffect(() => {
    setHistoryPage(1);
  }, [search, filterMethod]);

  // Keep page valid when payments are deleted/changed
  useEffect(() => {
    if (
      historyPage >
      Math.max(totalHistoryPages, 1)
    ) {
      setHistoryPage(
        Math.max(totalHistoryPages, 1)
      );
    }
  }, [
    historyPage,
    totalHistoryPages,
  ]);

  const handlePreviousHistoryPage = () => {
    setHistoryPage((prev) =>
      Math.max(prev - 1, 1)
    );
  };

  const handleNextHistoryPage = () => {
    setHistoryPage((prev) =>
      Math.min(
        prev + 1,
        totalHistoryPages
      )
    );
  };



  // =====================================================
  // ADD PAYMENT
  // =====================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!selectedStudentId) {
      showMessage(
        "error",
        "Please select a student."
      );

      return;
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      showMessage(
        "error",
        "Please enter a valid payment amount."
      );

      return;
    }

    if (
      selectedStudent &&
      Number(form.amount) >
        Number(
          selectedStudent.pendingFees ||
          0
        )
    ) {
      showMessage(
        "error",
        "Payment cannot be greater than pending fees."
      );

      return;
    }

    try {
      setSubmitting(true);

      const response =
        await fetch(
          `${API_URL}/fees/student/${selectedStudentId}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                amount:
                  Number(
                    form.amount
                  ),

                paymentDate:
                  form.paymentDate,

                paymentMethod:
                  form.paymentMethod,

                transactionId:
                  form.transactionId,

                note:
                  form.note,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        showMessage(
          "error",
          data.message ||
          "Unable to add payment."
        );

        return;
      }

      showMessage(
        "success",
        "Fee payment added successfully!"
      );

      resetForm();

      await Promise.all([
        fetchStudents(),
        fetchPayments(),
      ]);
    } catch (error) {
      console.error(
        "ADD PAYMENT ERROR:",
        error
      );

      showMessage(
        "error",
        "Something went wrong while adding payment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DELETE PAYMENT
  // =====================================================

  const handleDelete = async (
    paymentId
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this payment?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/fees/${paymentId}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        showMessage(
          "error",
          data.message ||
          "Unable to delete payment."
        );

        return;
      }

      showMessage(
        "success",
        "Payment deleted successfully!"
      );

      await Promise.all([
        fetchStudents(),
        fetchPayments(),
      ]);
    } catch (error) {
      console.error(
        "DELETE PAYMENT ERROR:",
        error
      );

      showMessage(
        "error",
        "Unable to delete payment."
      );
    }
  };

  // =====================================================
  // INITIAL
  // =====================================================

  const getInitial =
    (name) =>
      name
        ?.charAt(0)
        .toUpperCase() || "S";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="fees-page">

      {/* HEADER */}

      <div className="fees-page-header">

        <div>

          <span className="fees-page-label">
            FINANCE • FEE MANAGEMENT
          </span>

          <h1>
            Fees Collection
          </h1>

          <p>
            Manage student payments,
            collections and pending
            fees from one place.
          </p>

        </div>

        <div className="fees-header-date">

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


      {/* MESSAGE */}

      {message.text && (
        <div
          className={`fees-message ${message.type}`}
        >

          <span>
            {message.type ===
            "success"
              ? "✓"
              : "!"}
          </span>

          {message.text}

        </div>
      )}


      {/* SUMMARY */}

      <div className="fees-summary-grid">

        <div className="fees-summary-card total">

          <div className="summary-icon">
            ₹
          </div>

          <div>

            <span>
              TOTAL FEES
            </span>

            <strong>
              {formatMoney(
                totalFees
              )}
            </strong>

            <small>
              Across all students
            </small>

          </div>

        </div>


        <div className="fees-summary-card collected">

          <div className="summary-icon">
            ✓
          </div>

          <div>

            <span>
              COLLECTED
            </span>

            <strong>
              {formatMoney(
                collectedFees
              )}
            </strong>

            <small>
              Successfully received
            </small>

          </div>

        </div>


        <div className="fees-summary-card pending">

          <div className="summary-icon">
            !
          </div>

          <div>

            <span>
              PENDING
            </span>

            <strong>
              {formatMoney(
                pendingFees
              )}
            </strong>

            <small>
              Yet to be collected
            </small>

          </div>

        </div>


        <div className="fees-summary-card today">

          <div className="summary-icon">
            ↑
          </div>

          <div>

            <span>
              TODAY
            </span>

            <strong>
              {formatMoney(
                todayCollection
              )}
            </strong>

            <small>
              Today's collection
            </small>

          </div>

        </div>

      </div>


      {/* MAIN */}

      <div className="fees-main-grid">


        {/* COLLECTION */}

        <div className="fee-collection-card">

          <div className="fees-card-header">

            <div>

              <span>
                NEW COLLECTION
              </span>

              <h2>
                Collect Student Fee
              </h2>

            </div>

            <div className="fees-card-icon">
              ₹
            </div>

          </div>


          <form
            onSubmit={handleSubmit}
            className="fee-payment-form"
          >


            {/* STUDENT */}

            <div className="fee-form-group">

              <label>
                Select Student
                <b>*</b>
              </label>

              <select
                value={
                  selectedStudentId
                }
                onChange={
                  handleStudentChange
                }
                disabled={
                  loadingStudents ||
                  submitting
                }
              >

                <option value="">

                  {loadingStudents
                    ? "Loading students..."
                    : pendingStudents.length === 0
                    ? "No pending fee students"
                    : "Select student"}

                </option>

                {pendingStudents.map(
                  (student) => (

                    <option
                      key={
                        student._id
                      }
                      value={
                        student._id
                      }
                    >

                      {student.name}
                      {" — "}
                      {student.course ||
                        "Course"}
                      {" — Pending "}
                      {formatMoney(
                        student.pendingFees
                      )}

                    </option>

                  )
                )}

              </select>

            </div>


            {/* SELECTED STUDENT */}

            {selectedStudent && (
              <div className="selected-student-box">

                <div className="selected-student-avatar">

                  {getInitial(
                    selectedStudent.name
                  )}

                </div>

                <div className="selected-student-info">

                  <strong>
                    {selectedStudent.name}
                  </strong>

                  <span>
                    {selectedStudent.mobile ||
                      "No mobile number"}
                  </span>

                  <small>
                    {selectedStudent.course ||
                      "Course not specified"}
                  </small>

                </div>

                <div className="selected-student-status">

                  <span>
                    STATUS
                  </span>

                  <strong>
                    {selectedStudent.status ||
                      "Active"}
                  </strong>

                </div>

              </div>
            )}


            {/* FEE STATUS */}

            {selectedStudent && (
              <div className="student-fee-status">

                <div>

                  <span>
                    TOTAL
                  </span>

                  <strong>
                    {formatMoney(
                      selectedStudent.totalFees
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    PAID
                  </span>

                  <strong className="paid">
                    {formatMoney(
                      selectedStudent.paidFees
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    PENDING
                  </span>

                  <strong className="pending">
                    {formatMoney(
                      selectedStudent.pendingFees
                    )}
                  </strong>

                </div>

              </div>
            )}


            {/* AMOUNT */}

            <div className="fee-form-group">

              <label>
                Payment Amount
                <b>*</b>
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
                  placeholder="Enter payment amount"
                  min="1"
                  max={
                    selectedStudent
                      ? selectedStudent.pendingFees
                      : undefined
                  }
                  disabled={
                    submitting
                  }
                />

              </div>

              {selectedStudent && (
                <small className="amount-hint">

                  Maximum payable:{" "}

                  {formatMoney(
                    selectedStudent.pendingFees
                  )}

                </small>
              )}

            </div>


            {/* DATE METHOD */}

            <div className="fee-form-row">

              <div className="fee-form-group">

                <label>
                  Payment Date
                  <b>*</b>
                </label>

                <input
                  type="date"
                  name="paymentDate"
                  value={
                    form.paymentDate
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    submitting
                  }
                />

              </div>


              <div className="fee-form-group">

                <label>
                  Payment Method
                </label>

                <select
                  name="paymentMethod"
                  value={
                    form.paymentMethod
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    submitting
                  }
                >

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>

                  <option value="Card">
                    Card
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

            </div>


            {/* TRANSACTION */}

            {form.paymentMethod !==
              "Cash" && (

              <div className="fee-form-group">

                <label>
                  Transaction ID
                </label>

                <input
                  type="text"
                  name="transactionId"
                  value={
                    form.transactionId
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter transaction ID"
                  disabled={
                    submitting
                  }
                />

              </div>

            )}


            {/* NOTE */}

            <div className="fee-form-group">

              <label>
                Payment Note
              </label>

              <textarea
                name="note"
                value={
                  form.note
                }
                onChange={
                  handleChange
                }
                placeholder="Add payment note..."
                rows="3"
                disabled={
                  submitting
                }
              />

            </div>


            {/* BUTTONS */}

            <div className="fee-form-actions">

              <button
                type="button"
                className="fee-reset-btn"
                onClick={
                  resetForm
                }
                disabled={
                  submitting
                }
              >
                Reset
              </button>

              <button
                type="submit"
                className="fee-submit-btn"
                disabled={
                  submitting ||
                  !selectedStudentId
                }
              >

                {submitting
                  ? "Adding Payment..."
                  : "Collect Fee →"}

              </button>

            </div>

          </form>

        </div>


        {/* PENDING STUDENTS */}

        <div className="fee-status-card">

          <div className="fees-card-header">

            <div>

              <span>
                STUDENT FEES
              </span>

              <h2>
                Pending Students
              </h2>

            </div>

            <div className="pending-count">

              {totalPendingStudents}

            </div>

          </div>


          <div className="pending-student-list">

            {loadingStudents ? (

              <div className="fees-empty">

                Loading students...

              </div>

            ) : currentPendingStudents.length > 0 ? (

              currentPendingStudents.map(
                (student) => (

                  <div
                    className="pending-student-item"
                    key={
                      student._id
                    }
                  >

                    <div className="pending-avatar">

                      {getInitial(
                        student.name
                      )}

                    </div>

                    <div className="pending-student-info">

                      <strong>
                        {student.name}
                      </strong>

                      <span>
                        {student.course ||
                          "Course"}
                      </span>

                    </div>

                    <strong className="pending-amount">

                      {formatMoney(
                        student.pendingFees
                      )}

                    </strong>

                  </div>

                )
              )

            ) : (

              <div className="fees-empty">

                <div>
                  ✓
                </div>

                <strong>
                  All Fees Clear
                </strong>

                <span>
                  No pending student fees.
                </span>

              </div>

            )}

          </div>


          {/* =================================================
              PENDING STUDENT PAGINATION
          ================================================= */}

          {!loadingStudents &&
            totalPendingPages > 1 && (

              <div className="pending-pagination">

                <button
                  type="button"
                  className="pending-page-btn"
                  onClick={
                    handlePreviousPendingPage
                  }
                  disabled={
                    pendingPage === 1
                  }
                >
                  ‹
                </button>


                <div className="pending-page-info">

                  <span>
                    Page
                  </span>

                  <strong>
                    {pendingPage}
                  </strong>

                  <span>
                    of
                  </span>

                  <strong>
                    {totalPendingPages}
                  </strong>

                </div>


                <button
                  type="button"
                  className="pending-page-btn"
                  onClick={
                    handleNextPendingPage
                  }
                  disabled={
                    pendingPage ===
                    totalPendingPages
                  }
                >
                  ›
                </button>

              </div>

            )}

        </div>

      </div>


      {/* HISTORY */}

      <div className="fee-history-card">

        <div className="fee-history-header">

          <div>

            <span>
              PAYMENT HISTORY
            </span>

            <h2>
              Fee Collection History
            </h2>

            <p>
              Track all collected
              student payments.
            </p>

          </div>

          <div className="fee-history-count">

            {filteredPayments.length}

            <span>
              Payments
            </span>

          </div>

        </div>


        {/* FILTER */}

        <div className="fee-history-filters">

          <div className="fee-search-box">

            <span>
              ⌕
            </span>

            <input
              type="text"
              value={
                search
              }
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search student, course or transaction..."
            />

          </div>


          <select
            value={
              filterMethod
            }
            onChange={(e) =>
              setFilterMethod(
                e.target.value
              )
            }
          >

            <option value="All">
              All Methods
            </option>

            <option value="Cash">
              Cash
            </option>

            <option value="UPI">
              UPI
            </option>

            <option value="Bank Transfer">
              Bank Transfer
            </option>

            <option value="Card">
              Card
            </option>

            <option value="Other">
              Other
            </option>

          </select>

        </div>


        {/* TABLE */}

        <div className="fee-table-wrapper">

          <table className="fee-table">

            <thead>

              <tr>

                <th>
                  STUDENT
                </th>

                <th>
                  COURSE
                </th>

                <th>
                  DATE
                </th>

                <th>
                  METHOD
                </th>

                <th>
                  TRANSACTION
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

              {loadingPayments ? (

                <tr>

                  <td
                    colSpan="7"
                    className="table-message"
                  >

                    <div className="loading-spinner">
                    </div>

                    Loading payments...

                  </td>

                </tr>

              ) : filteredPayments.length ===
                0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="table-message"
                  >

                    <div className="table-empty">

                      <div>
                        ₹
                      </div>

                      <strong>
                        No Payments Found
                      </strong>

                      <span>
                        Collected payments
                        will appear here.
                      </span>

                    </div>

                  </td>

                </tr>

              // ) : (

              //   filteredPayments.map(
              //     (payment) => (

                ) : (
                currentHistoryPayments.map(
                  (payment) => (

                    <tr
                      key={
                        payment._id
                      }
                    >

                      <td>

                        <div className="table-student">

                          <div className="table-avatar">

                            {getInitial(
                              payment.studentName
                            )}

                          </div>

                          <div>

                            <strong>
                              {payment.studentName}
                            </strong>

                            {payment.note && (

                              <span>
                                {payment.note}
                              </span>

                            )}

                          </div>

                        </div>

                      </td>


                      <td>

                        <span className="course-badge">

                          {payment.course ||
                            "Course"}

                        </span>

                      </td>


                      <td>

                        {formatDate(
                          payment.paymentDate
                        )}

                      </td>


                      <td>

                        <span
                          className={`method-badge ${String(
                            payment.paymentMethod ||
                            "Cash"
                          )
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              "-"
                            )}`}
                        >

                          {payment.paymentMethod ||
                            "Cash"}

                        </span>

                      </td>


                      <td>

                        <span className="transaction-text">

                          {payment.transactionId ||
                            "—"}

                        </span>

                      </td>


                      <td>

                        <strong className="table-amount">

                          {formatMoney(
                            payment.amount
                          )}

                        </strong>

                      </td>


                      <td>

                        <button
                          className="delete-payment-btn"
                          onClick={() =>
                            handleDelete(
                              payment._id
                            )
                          }
                          title="Delete payment"
                        >
                          ×
                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

          {/* PAYMENT HISTORY PAGINATION */}

        {!loadingPayments && totalHistoryPages > 0 && (
          <div className="history-pagination">

        {/* Showing text */}
        <div className="history-showing-text">
          Showing{" "}
          <strong>
            {(historyPage - 1) * PAYMENT_HISTORY_PER_PAGE + 1}
          </strong>{" "}
          to{" "}
          <strong>
            {Math.min(
              historyPage * PAYMENT_HISTORY_PER_PAGE,
              filteredPayments.length
            )}
          </strong>{" "}
          of{" "}
          <strong>{filteredPayments.length}</strong>{" "}
          payments
        </div>

        {/* Pagination buttons */}
        <div className="history-page-buttons">

          {/* Previous */}
          <button
            type="button"
            className="history-page-btn"
            onClick={handlePreviousHistoryPage}
            disabled={historyPage === 1}
          >
            ‹
          </button>

          {/* Page numbers */}
          {Array.from(
            { length: totalHistoryPages },
            (_, index) => index + 1
          ).map((page) => (
            <button
              key={page}
              type="button"
              className={`history-page-number ${
                historyPage === page ? "active" : ""
              }`}
              onClick={() => setHistoryPage(page)}
            >
              {page}
            </button>
          ))}

          {/* Next */}
          <button
            type="button"
            className="history-page-btn"
            onClick={handleNextHistoryPage}
            disabled={historyPage === totalHistoryPages}
          >
            ›
          </button>

    </div>

  </div>
)}

        </div>

      </div>

    </div>
  );
}

export default Fees;
