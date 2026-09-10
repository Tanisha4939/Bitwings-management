import { useMemo, useState } from "react";
import "./FeesCalendar.css";

function FeesCalendar({ students = [], payments = [] }) {

  // =====================================================
  // TODAY
  // =====================================================

  const today = new Date();

  // =====================================================
  // CURRENT MONTH
  // =====================================================

  const [currentDate, setCurrentDate] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    )
  );

  const [selectedDate, setSelectedDate] = useState(null);


  // =====================================================
  // MONTH DETAILS
  // =====================================================

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );


  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();


  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();


  // Monday = 0
  const startingDay =
    firstDay === 0
      ? 6
      : firstDay - 1;


  // =====================================================
  // DATE KEY
  // =====================================================

  const getDateKey = (dateValue) => {

    if (!dateValue) {
      return null;
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return (
      `${date.getFullYear()}-` +
      `${String(date.getMonth() + 1).padStart(2, "0")}-` +
      `${String(date.getDate()).padStart(2, "0")}`
    );

  };


  // =====================================================
  // CREATE PAYMENT DATA FROM STUDENTS
  // =====================================================

  const studentPayments = useMemo(() => {

    return students
      .filter((student) => {

        const paid =
          Number(student.paidFees || 0);

        return paid > 0;

      })
      .map((student) => {

        /*
          IMPORTANT:

          If backend has paymentDate,
          it will be used first.

          Otherwise:
          admissionDate
          otherwise createdAt
        */

        const paymentDate =
          student.paymentDate ||
          student.feePaymentDate ||
          student.admissionDate ||
          student.createdAt;


        return {

          _id: student._id,

          studentId: student._id,

          studentName:
            student.name || "Student",

          course:
            student.course || "Course not added",

          amount:
            Number(student.paidFees || 0),

          paymentDate,

          mobile:
            student.mobile || "",

          email:
            student.email || "",

          totalFees:
            Number(student.totalFees || 0),

          pendingFees:
            Math.max(
              Number(student.totalFees || 0) -
              Number(student.paidFees || 0),
              0
            ),

          status:
            student.status || "Active",

        };

      });

  }, [students]);


  // =====================================================
  // FINAL PAYMENT LIST
  // =====================================================

  const finalPayments = useMemo(() => {

    /*
      If real payments are passed from backend,
      use them.

      Otherwise use student payment data.
    */

    if (
      Array.isArray(payments) &&
      payments.length > 0
    ) {
      return payments;
    }

    return studentPayments;

  }, [
    payments,
    studentPayments,
  ]);


  // =====================================================
  // GROUP PAYMENTS BY DATE
  // =====================================================

  const paymentsByDate = useMemo(() => {

    const grouped = {};

    finalPayments.forEach((payment) => {

      if (!payment.paymentDate) {
        return;
      }

      const key =
        getDateKey(
          payment.paymentDate
        );

      if (!key) {
        return;
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(payment);

    });

    return grouped;

  }, [finalPayments]);


  // =====================================================
  // MONTH PAYMENTS
  // =====================================================

  const monthPayments = useMemo(() => {

    return finalPayments.filter(
      (payment) => {

        if (!payment.paymentDate) {
          return false;
        }

        const date =
          new Date(
            payment.paymentDate
          );

        return (
          date.getFullYear() === year &&
          date.getMonth() === month
        );

      }
    );

  }, [
    finalPayments,
    year,
    month,
  ]);


  // =====================================================
  // MONTH TOTAL
  // =====================================================

  const monthTotal =
    monthPayments.reduce(
      (total, payment) => {

        return (
          total +
          Number(
            payment.amount || 0
          )
        );

      },
      0
    );


  // =====================================================
  // UNIQUE STUDENTS
  // =====================================================

  const uniqueStudents =
    new Set(
      monthPayments.map(
        (payment) =>
          payment.studentId ||
          payment.studentName
      )
    ).size;


  // =====================================================
  // PREVIOUS MONTH
  // =====================================================

  const previousMonth = () => {

    setCurrentDate(
      new Date(
        year,
        month - 1,
        1
      )
    );

    setSelectedDate(null);

  };


  // =====================================================
  // NEXT MONTH
  // =====================================================

  const nextMonth = () => {

    setCurrentDate(
      new Date(
        year,
        month + 1,
        1
      )
    );

    setSelectedDate(null);

  };


  // =====================================================
  // TODAY
  // =====================================================

  const goToday = () => {

    setCurrentDate(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

    setSelectedDate(null);

  };


  // =====================================================
  // MONEY
  // =====================================================

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


  // =====================================================
  // CALENDAR CELLS
  // =====================================================

  const calendarDays = [];


  for (
    let i = 0;
    i < startingDay;
    i++
  ) {

    calendarDays.push(null);

  }


  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    calendarDays.push(day);

  }


  // =====================================================
  // CHECK TODAY
  // =====================================================

  const isToday = (day) => {

    if (!day) {
      return false;
    }

    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );

  };


  // =====================================================
  // DATE CLICK
  // =====================================================

  const handleDateClick = (day) => {

    if (!day) {
      return;
    }

    const key =
      `${year}-${String(
        month + 1
      ).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;


    const dayPayments =
      paymentsByDate[key] || [];


    if (
      dayPayments.length === 0
    ) {
      return;
    }


    setSelectedDate({

      day,

      key,

      payments:
        dayPayments,

    });

  };


  // =====================================================
  // SELECTED DATE TOTAL
  // =====================================================

  const selectedTotal =
    selectedDate?.payments?.reduce(
      (total, payment) => {

        return (
          total +
          Number(
            payment.amount || 0
          )
        );

      },
      0
    ) || 0;


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="fees-calendar-section">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="fees-calendar-header">

        <div>

          <span className="fees-calendar-label">
            FEE MANAGEMENT
          </span>

          <h2>
            Fees Collection Calendar
          </h2>

          <p>
            Track daily student fee payments
            in one place.
          </p>

        </div>


        <div className="calendar-summary">


          {/* MONTH COLLECTION */}

          <div className="calendar-summary-box">

            <span>
              THIS MONTH
            </span>

            <strong>
              {formatMoney(
                monthTotal
              )}
            </strong>

          </div>


          {/* STUDENTS */}

          <div className="calendar-summary-box">

            <span>
              STUDENTS
            </span>

            <strong>
              {uniqueStudents}
            </strong>

          </div>


        </div>

      </div>


      {/* =================================================
          CALENDAR CARD
      ================================================= */}

      <div className="fees-calendar-card">


        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="fees-calendar-toolbar">


          <div className="calendar-month-title">

            <h3>
              {monthName}
            </h3>

            <button
              onClick={goToday}
              className="calendar-today-btn"
            >
              Today
            </button>

          </div>


          <div className="calendar-navigation">

            <button
              onClick={previousMonth}
              className="calendar-nav-btn"
              aria-label="Previous month"
            >
              ‹
            </button>


            <button
              onClick={nextMonth}
              className="calendar-nav-btn"
              aria-label="Next month"
            >
              ›
            </button>

          </div>

        </div>


        {/* =================================================
            WEEK DAYS
        ================================================= */}

        <div className="calendar-weekdays">

          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => (

            <div key={day}>
              {day}
            </div>

          ))}

        </div>


        {/* =================================================
            CALENDAR DAYS
        ================================================= */}

        <div className="calendar-grid">


          {calendarDays.map(
            (day, index) => {


              {/* EMPTY CELL */}

              if (!day) {

                return (

                  <div
                    key={`empty-${index}`}
                    className="calendar-day empty"
                  />

                );

              }


              {/* DATE KEY */}

              const key =
                `${year}-${String(
                  month + 1
                ).padStart(2, "0")}-${String(
                  day
                ).padStart(2, "0")}`;


              {/* DAY PAYMENTS */}

              const dayPayments =
                paymentsByDate[key] || [];


              {/* TOTAL */}

              const totalDayAmount =
                dayPayments.reduce(
                  (
                    total,
                    payment
                  ) =>
                    total +
                    Number(
                      payment.amount || 0
                    ),
                  0
                );


              return (

                <div
                  key={day}
                  className={`
                    calendar-day
                    ${isToday(day)
                      ? "today"
                      : ""}
                    ${
                      dayPayments.length > 0
                        ? "has-payment"
                        : ""
                    }
                  `}
                  onClick={() =>
                    handleDateClick(day)
                  }
                >


                  {/* DATE NUMBER */}

                  <div className="calendar-date-number">

                    {day}

                    {isToday(day) && (

                      <span className="today-dot" />

                    )}

                  </div>


                  {/* PAYMENT */}

                  {dayPayments.length > 0 && (

                    <div className="calendar-payment-preview">


                      {/* ONE STUDENT */}

                      {dayPayments.length === 1 ? (

                        <>

                          <strong>

                            {dayPayments[0]
                              .studentName ||
                              "Student"}

                          </strong>

                          <span>

                            {formatMoney(
                              dayPayments[0]
                                .amount
                            )}

                          </span>

                        </>

                      ) : (

                        /* MULTIPLE STUDENTS */

                        <>

                          <strong>

                            {dayPayments.length}{" "}
                            Payments

                          </strong>

                          <span>

                            {formatMoney(
                              totalDayAmount
                            )}

                          </span>

                        </>

                      )}

                    </div>

                  )}

                </div>

              );

            }
          )}

        </div>


        {/* =================================================
            LEGEND
        ================================================= */}

        {/* <div className="calendar-legend">

          <div>

            <span className="legend-today" />

            Today

          </div>


          <div>

            <span className="legend-payment" />

            Fee Received

          </div>


          <div>

            <span>
              Click
            </span>

            to view details

          </div>

        </div> */}

      </div>


      {/* =================================================
          PAYMENT POPUP
      ================================================= */}

      {selectedDate && (

        <div
          className="fee-payment-overlay"
          onClick={() =>
            setSelectedDate(null)
          }
        >


          <div
            className="fee-payment-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="fee-modal-header">

              <div>

                <span>
                  PAYMENT DETAILS
                </span>

                <h3>

                  {selectedDate.day}{" "}

                  {currentDate.toLocaleDateString(
                    "en-IN",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}

                </h3>

              </div>


              <button
                onClick={() =>
                  setSelectedDate(null)
                }
                aria-label="Close"
              >
                ×
              </button>

            </div>


            {/* =================================================
                PAYMENT LIST
            ================================================= */}

            <div className="fee-payment-list">

              {selectedDate.payments.map(
                (
                  payment,
                  index
                ) => (

                  <div
                    className="fee-payment-item"
                    key={
                      payment._id ||
                      payment.id ||
                      index
                    }
                  >


                    {/* AVATAR */}

                    <div className="fee-student-avatar">

                      {(
                        payment.studentName ||
                        "ST"
                      )
                        .charAt(0)
                        .toUpperCase()}

                    </div>


                    {/* STUDENT INFO */}

                    <div className="fee-student-info">

                      <strong>
                        {payment.studentName ||
                          "Student"}
                      </strong>

                      <span>
                        {payment.course ||
                          "Course not added"}
                      </span>

                      {payment.mobile && (

                        <small>
                          {payment.mobile}
                        </small>

                      )}

                    </div>


                    {/* AMOUNT */}

                    <strong className="fee-payment-amount">

                      {formatMoney(
                        payment.amount
                      )}

                    </strong>

                  </div>

                )
              )}

            </div>


            {/* =================================================
                TOTAL
            ================================================= */}

            <div className="fee-modal-total">

              <span>
                Total Collection
              </span>

              <strong>
                {formatMoney(
                  selectedTotal
                )}
              </strong>

            </div>


          </div>

        </div>

      )}

    </div>

  );

}

export default FeesCalendar;