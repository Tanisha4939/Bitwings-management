import { useEffect, useMemo, useState } from "react";
import "./Admissions.css";
import API_URL from "../../config/api";

function Admissions() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 12;

  /* =====================================================
     FETCH STUDENTS
  ===================================================== */

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/students`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();

      const studentData = Array.isArray(data)
        ? data
        : data.students || data.data || [];

      setStudents(studentData);

      // Data refresh thay tyare page reset
      setCurrentPage(1);
    } catch (err) {
      console.error("Admissions Error:", err);

      setError("Unable to load admission students.");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     TOTAL PAGES
  ===================================================== */

  const totalPages = Math.ceil(
    students.length / ITEMS_PER_PAGE
  );

  /* =====================================================
     CURRENT PAGE STUDENTS
  ===================================================== */

  const currentStudents = useMemo(() => {
    const startIndex =
      (currentPage - 1) * ITEMS_PER_PAGE;

    const endIndex =
      startIndex + ITEMS_PER_PAGE;

    return students.slice(startIndex, endIndex);
  }, [students, currentPage]);

  /* =====================================================
     PAGE CHANGE
  ===================================================== */

  const changePage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "—";
    }

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =====================================================
     GET INITIALS
  ===================================================== */

  const getInitials = (name) => {
    if (!name) {
      return "ST";
    }

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  };

  /* =====================================================
     COURSE NAME
  ===================================================== */

  const getCourse = (student) => {
    return (
      student.course ||
      student.courseName ||
      student.courseTitle ||
      "Course Not Added"
    );
  };

  /* =====================================================
     JOIN DATE
  ===================================================== */

  const getJoinDate = (student) => {
    return (
      student.joinDate ||
      student.admissionDate ||
      student.createdAt
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="admissions-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admissions-header">
        <div>
          <span className="admissions-label">
            BITWINGS MANAGEMENT
          </span>

          <h1>
            Admissions
          </h1>

          <p>
            All enrolled students in one place.
          </p>
        </div>

        <div className="admission-total">
          <span>
            TOTAL ADMISSIONS
          </span>

          <strong>
            {students.length}
          </strong>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="admissions-error">
          <span>!</span>

          <p>{error}</p>

          <button onClick={fetchStudents}>
            Retry
          </button>
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <div className="admissions-loading">
          <div className="admission-spinner"></div>

          <p>
            Loading admissions...
          </p>
        </div>
      ) : students.length === 0 ? (

        /* =================================================
           EMPTY
        ================================================= */

        <div className="admissions-empty">
          <div className="empty-admission-icon">
            ♙
          </div>

          <h2>
            No Admissions Yet
          </h2>

          <p>
            Students added to the system
            will appear here automatically.
          </p>
        </div>

      ) : (

        <>

          {/* =================================================
              STUDENT GRID
          ================================================= */}

          <div className="admission-grid">

            {currentStudents.map(
              (student, index) => (

                <div
                  className="admission-card"
                  key={
                    student._id ||
                    student.id ||
                    index
                  }
                >

                  {/* =================================================
                      AVATAR
                  ================================================= */}

                  <div className="admission-avatar">
                    {getInitials(student.name)}
                  </div>

                  {/* =================================================
                      STUDENT DETAILS
                  ================================================= */}

                  <div className="admission-details">

                    {/* STUDENT NAME */}

                    <div className="admission-student-info">
                      <h2>
                        {student.name ||
                          "Unnamed Student"}
                      </h2>
                    </div>

                    {/* COURSE */}

                    <div className="admission-course">

                      <span className="course-icon">
                        ◈
                      </span>

                      <div>
                        <small>
                          COURSE
                        </small>

                        <strong>
                          {getCourse(student)}
                        </strong>
                      </div>

                    </div>

                    {/* JOINING DATE */}

                    <div className="admission-date">

                      <span className="date-icon">
                        ◷
                      </span>

                      <div>
                        <small>
                          JOINING DATE
                        </small>

                        <strong>
                          {formatDate(
                            getJoinDate(student)
                          )}
                        </strong>
                      </div>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {totalPages > 1 && (
            <div className="admission-pagination">

              <button
                className="pagination-arrow"
                disabled={currentPage === 1}
                onClick={() =>
                  changePage(
                    currentPage - 1
                  )
                }
              >
                ‹
              </button>

              <div className="pagination-pages">

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) => {

                    const page =
                      index + 1;

                    return (
                      <button
                        key={page}
                        className={
                          currentPage === page
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          changePage(page)
                        }
                      >
                        {page}
                      </button>
                    );
                  }
                )}

              </div>

              <button
                className="pagination-arrow"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  changePage(
                    currentPage + 1
                  )
                }
              >
                ›
              </button>

            </div>
          )}

        </>
      )}

    </div>
  );
}

export default Admissions;