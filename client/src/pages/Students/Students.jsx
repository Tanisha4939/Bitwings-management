import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/api";
import "./Students.css";

function Students() {

  // =====================================================
  // API
  // =====================================================

  const API_URL = `${API_BASE_URL}/students`;


  // =====================================================
  // STATES
  // =====================================================

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [showAddStudent, setShowAddStudent] = useState(false);

  const [editStudent, setEditStudent] = useState(null);

  const [deleteStudent, setDeleteStudent] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const STUDENTS_PER_PAGE = 10;


  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({

    name: "",
    mobile: "",
    email: "",
    dob: "",
    gender: "",
    address: "",
    course: "",
    batch: "",
    admissionDate: "",
    totalFees: "",
    paidFees: "",
    status: "Active",
    notes: "",

  });


  // =====================================================
  // SUCCESS MESSAGE
  // =====================================================

  const showSuccess = (message) => {

    setSuccessMessage(message);

    setTimeout(() => {

      setSuccessMessage("");

    }, 2500);

  };


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  const showError = (message) => {

    setErrorMessage(message);

    setTimeout(() => {

      setErrorMessage("");

    }, 3500);

  };


  // =====================================================
  // FETCH STUDENTS
  // =====================================================

  const fetchStudents = async () => {

    try {

      setLoading(true);

      const response = await axios.get(API_URL);

      if (response.data.success) {

        setStudents(
          response.data.students || []
        );

      } else {

        setStudents([]);

      }

    } catch (error) {

      console.error(
        "Fetch Students Error:",
        error
      );

      showError(
        error.response?.data?.message ||
        "Unable to load students."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // FIRST LOAD
  // =====================================================

  useEffect(() => {

    fetchStudents();

  }, []);


  // =====================================================
  // HANDLE FORM CHANGE
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({

      ...previous,

      [name]: value,

    }));

  };


  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {

    setFormData({

      name: "",
      mobile: "",
      email: "",
      dob: "",
      gender: "",
      address: "",
      course: "",
      batch: "",
      admissionDate: "",
      totalFees: "",
      paidFees: "",
      status: "Active",
      notes: "",

    });

  };


  // =====================================================
  // OPEN ADD STUDENT
  // =====================================================

  const openAddStudent = () => {

    setEditStudent(null);

    resetForm();

    setShowAddStudent(true);

  };


  // =====================================================
  // CLOSE ADD STUDENT
  // =====================================================

  const closeAddStudent = () => {

    if (saving) return;

    setShowAddStudent(false);

    setEditStudent(null);

    resetForm();

  };


  // =====================================================
  // OPEN EDIT STUDENT
  // =====================================================

  const openEditStudent = (student) => {

    setEditStudent(student);

    setShowAddStudent(false);


    // Safely format date for input[type="date"]

    const formatInputDate = (date) => {

      if (!date) {
        return "";
      }

      try {

        const d = new Date(date);

        if (Number.isNaN(d.getTime())) {
          return "";
        }

        return d.toISOString().split("T")[0];

      } catch {

        return "";

      }

    };


    setFormData({

      name: student.name || "",

      mobile: student.mobile || "",

      email: student.email || "",

      dob: formatInputDate(
        student.dob
      ),

      gender: student.gender || "",

      address: student.address || "",

      course: student.course || "",

      batch: student.batch || "",

      admissionDate:
        formatInputDate(
          student.admissionDate
        ),

      totalFees:
        student.totalFees ?? "",

      paidFees:
        student.paidFees ?? "",

      status:
        student.status || "Active",

      notes:
        student.notes || "",

    });

  };


  // =====================================================
  // CLOSE EDIT STUDENT
  // =====================================================

  const closeEditStudent = () => {

    if (saving) return;

    setEditStudent(null);

    resetForm();

  };


  // =====================================================
  // ADD / UPDATE STUDENT
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    // ===================================================
    // VALIDATION
    // ===================================================

    if (!formData.name.trim()) {

      showError(
        "Student name is required."
      );

      return;

    }


    if (!formData.mobile.trim()) {

      showError(
        "Mobile number is required."
      );

      return;

    }


    if (!formData.course.trim()) {

      showError(
        "Course is required."
      );

      return;

    }


    try {

      setSaving(true);


      // =================================================
      // PREPARE DATA
      // =================================================

      const studentPayload = {

        ...formData,

        totalFees:
          Number(
            formData.totalFees || 0
          ),

        paidFees:
          Number(
            formData.paidFees || 0
          ),

      };


      // =================================================
      // UPDATE EXISTING STUDENT
      // =================================================

      if (editStudent) {

        const response = await axios.put(

          `${API_URL}/${editStudent._id}`,

          studentPayload

        );


        if (response.data.success) {

          const updatedStudent =
            response.data.student;


          setStudents((previous) =>

            previous.map((student) =>

              student._id === editStudent._id

                ? updatedStudent

                : student

            )

          );


          setEditStudent(null);

          resetForm();


          showSuccess(
            "Student updated successfully!"
          );


        } else {

          showError(

            response.data.message ||

            "Failed to update student."

          );

        }


        return;

      }


      // =================================================
      // ADD NEW STUDENT
      // =================================================

      const response = await axios.post(

        API_URL,

        studentPayload

      );


      if (response.data.success) {

        setStudents((previous) => [

          response.data.student,

          ...previous,

        ]);


        setShowAddStudent(false);

        resetForm();

        setCurrentPage(1);


        showSuccess(
          "Student registered successfully!"
        );


      } else {

        showError(

          response.data.message ||

          "Failed to add student."

        );

      }


    } catch (error) {

      console.error(
        "Add / Update Student Error:",
        error
      );


      showError(

        error.response?.data?.message ||

        "Failed to save student."

      );

    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // OPEN DELETE CONFIRMATION
  // =====================================================

  const openDeleteConfirmation = (student) => {

    setDeleteStudent(student);

  };


  // =====================================================
  // CLOSE DELETE CONFIRMATION
  // =====================================================

  const closeDeleteConfirmation = () => {

    if (deleting) return;

    setDeleteStudent(null);

  };


  // =====================================================
  // DELETE STUDENT
  // =====================================================

  const handleDelete = async () => {

    if (!deleteStudent?._id) {

      return;

    }


    try {

      setDeleting(true);


      const response =
        await axios.delete(

          `${API_URL}/${deleteStudent._id}`

        );


      if (response.data.success) {

        const updatedStudents =
          students.filter(

            (student) =>

              student._id !==
              deleteStudent._id

          );


        setStudents(
          updatedStudents
        );


        setDeleteStudent(null);


        showSuccess(
          "Student deleted successfully!"
        );


        const newTotalPages =
          Math.max(

            1,

            Math.ceil(

              updatedStudents.length /

              STUDENTS_PER_PAGE

            )

          );


        if (
          currentPage >
          newTotalPages
        ) {

          setCurrentPage(
            newTotalPages
          );

        }

      } else {

        showError(

          response.data.message ||

          "Failed to delete student."

        );

      }

    } catch (error) {

      console.error(
        "Delete Student Error:",
        error
      );


      showError(

        error.response?.data?.message ||

        "Failed to delete student."

      );

    } finally {

      setDeleting(false);

    }

  };


  // =====================================================
  // SEARCH FILTER
  // =====================================================

  const filteredStudents = useMemo(() => {

    const searchText =
      search
        .toLowerCase()
        .trim();


    if (!searchText) {

      return students;

    }


    return students.filter(
      (student) => {

        return (

          student.name
            ?.toLowerCase()
            .includes(searchText) ||

          student.mobile
            ?.toLowerCase()
            .includes(searchText) ||

          student.email
            ?.toLowerCase()
            .includes(searchText) ||

          student.course
            ?.toLowerCase()
            .includes(searchText) ||

          student.batch
            ?.toLowerCase()
            .includes(searchText)

        );

      }
    );

  }, [students, search]);


  // =====================================================
  // SEARCH CHANGE
  // =====================================================

  const handleSearch = (e) => {

    setSearch(e.target.value);

    setCurrentPage(1);

  };


  // =====================================================
  // STATISTICS
  // =====================================================

  const totalStudents =
    students.length;


  // =====================================================
  // ACTIVE STUDENTS
  // =====================================================

  const activeStudents =
    students.filter(

      (student) =>

        String(
          student.status || ""
        ).toLowerCase() === "active"

    ).length;


  // =====================================================
  // INACTIVE STUDENTS
  // =====================================================

  const inactiveStudents =
    students.filter(

      (student) =>

        String(
          student.status || ""
        ).toLowerCase() === "inactive"

    ).length;


  // =====================================================
  // NEW THIS MONTH
  // =====================================================

  const now = new Date();


  const newThisMonth =
    students.filter((student) => {

      if (!student.createdAt) {

        return false;

      }


      const created =
        new Date(
          student.createdAt
        );


      return (

        created.getMonth() ===
          now.getMonth() &&

        created.getFullYear() ===
          now.getFullYear()

      );

    }).length;


  // =====================================================
  // TOTAL FEES
  // =====================================================

  const totalFees =
    students.reduce(

      (total, student) => {

        return (

          total +

          Number(
            student.totalFees || 0
          )

        );

      },

      0

    );


  // =====================================================
  // FORMAT MONEY
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
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.max(

      1,

      Math.ceil(

        filteredStudents.length /

        STUDENTS_PER_PAGE

      )

    );


  const startIndex =
    (currentPage - 1) *
    STUDENTS_PER_PAGE;


  const endIndex =
    startIndex +
    STUDENTS_PER_PAGE;


  const currentStudents =
    filteredStudents.slice(

      startIndex,

      endIndex

    );


  // =====================================================
  // PAGE CHANGE
  // =====================================================

  const changePage = (page) => {

    if (
      page < 1 ||
      page > totalPages
    ) {

      return;

    }


    setCurrentPage(page);

  };


  // =====================================================
  // PAGE NUMBERS
  // =====================================================

  const pageNumbers =
    Array.from(

      {
        length: totalPages,
      },

      (_, index) =>
        index + 1

    );


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <>

      {/* =================================================
          SUCCESS TOAST
      ================================================= */}

      {successMessage && (

        <div className="student-success-toast">

          <div className="success-check">

            ✓

          </div>


          <div className="success-content">

            <strong>

              Success

            </strong>


            <span>

              {successMessage}

            </span>

          </div>


          <div className="success-progress" />

        </div>

      )}


      {/* =================================================
          ERROR TOAST
      ================================================= */}

      {errorMessage && (

        <div className="student-error-toast">

          <div className="error-check">

            !

          </div>


          <div className="error-content">

            <strong>

              Something went wrong

            </strong>


            <span>

              {errorMessage}

            </span>

          </div>

        </div>

      )}


      {/* =================================================
          MAIN PAGE
      ================================================= */}

      <div className="students-page">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="students-header">

          <div>

            <span className="students-label">

              BITWINGS MANAGEMENT

            </span>


            <h1>

              Students

            </h1>


            <p>

              Manage all your students from one place.

            </p>

          </div>


          <button
            className="add-student-btn"
            onClick={openAddStudent}
          >

            <span>

              ＋

            </span>


            Add Student

          </button>

        </div>


        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="student-stats">


          {/* TOTAL */}

          <div className="student-stat-card">

            <div className="student-stat-icon blue">

              ♙

            </div>


            <div>

              <span>

                Total Students

              </span>


              <strong>

                {totalStudents}

              </strong>

            </div>

          </div>


          {/* ACTIVE */}

          <div className="student-stat-card">

            <div className="student-stat-icon green">

              ●

            </div>


            <div>

              <span>

                Active Students

              </span>


              <strong>

                {activeStudents}

              </strong>

            </div>

          </div>


          {/* INACTIVE */}

          <div className="student-stat-card">

            <div className="student-stat-icon red">

              ●

            </div>


            <div>

              <span>

                Inactive Students

              </span>


              <strong>

                {inactiveStudents}

              </strong>

            </div>

          </div>


          {/* NEW THIS MONTH */}

          <div className="student-stat-card">

            <div className="student-stat-icon orange">

              ◷

            </div>


            <div>

              <span>

                New This Month

              </span>


              <strong>

                {newThisMonth}

              </strong>

            </div>

          </div>


          {/* TOTAL FEES */}

          <div className="student-stat-card">

            <div className="student-stat-icon purple">

              ₹

            </div>


            <div>

              <span>

                Total Fees

              </span>


              <strong>

                {formatMoney(totalFees)}

              </strong>

            </div>

          </div>


        </div>


        {/* =================================================
            TABLE CARD
        ================================================= */}

        <div className="students-table-card">


          {/* TABLE HEADER */}

          <div className="students-table-header">

            <div>

              <span>

                STUDENT DIRECTORY

              </span>


              <h2>

                All Students

              </h2>

            </div>


            <div className="student-tools">


              {/* SEARCH */}

              <div className="student-search">

                <span>

                  ⌕

                </span>


                <input
                  type="text"
                  placeholder="Search student..."
                  value={search}
                  onChange={handleSearch}
                />

              </div>


              {/* REFRESH */}

              <button
                className="filter-btn"
                onClick={fetchStudents}
                title="Refresh students"
              >

                Refresh


                <span>

                  ↻

                </span>

              </button>

            </div>

          </div>


          {/* =================================================
              TABLE
          ================================================= */}

          <div className="student-table">


            {/* TABLE HEAD */}

            <div className="student-table-head">

              <span>

                STUDENT

              </span>


              <span>

                COURSE

              </span>


              <span>

                BATCH

              </span>


              <span>

                TOTAL FEES

              </span>


              <span>

                STATUS

              </span>


              <span>

                ACTION

              </span>

            </div>


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

              <div className="students-empty">

                <div className="empty-icon loading-icon">

                  ◌

                </div>


                <h3>

                  Loading students...

                </h3>


                <p>

                  Please wait while we load your student data.

                </p>

              </div>

            )}


            {/* =================================================
                EMPTY
            ================================================= */}

            {!loading &&
              currentStudents.length === 0 && (

                <div className="students-empty">

                  <div className="empty-icon">

                    ♙

                  </div>


                  <h3>

                    {search
                      ? "No students found"
                      : "No students yet"}

                  </h3>


                  <p>

                    {search
                      ? "Try another search."
                      : "Add your first student to start managing your academy."}

                  </p>


                  {!search && (

                    <button
                      onClick={openAddStudent}
                    >

                      ＋ Add First Student

                    </button>

                  )}

                </div>

              )}


            {/* =================================================
                STUDENT ROWS
            ================================================= */}

            {!loading &&
              currentStudents.length > 0 &&

              currentStudents.map(
                (student) => (

                  <div
                    className="student-table-row"
                    key={student._id}
                  >


                    {/* STUDENT */}

                    <div className="student-name-cell">

                      <div className="student-avatar">

                        {student.name
                          ?.charAt(0)
                          .toUpperCase()}

                      </div>


                      <div>

                        <strong>

                          {student.name}

                        </strong>


                        <small>

                          {student.mobile}

                        </small>

                      </div>

                    </div>


                    {/* COURSE */}

                    <span>

                      {student.course || "-"}

                    </span>


                    {/* BATCH */}

                    <span>

                      {student.batch || "-"}

                    </span>


                    {/* TOTAL FEES */}

                    <span className="student-total-fees">

                      {formatMoney(
                        student.totalFees
                      )}

                    </span>


                    {/* STATUS */}

                    <span>

                      <span
                        className={
                          String(
                            student.status || ""
                          ).toLowerCase() === "active"

                            ? "student-status active"

                            : "student-status inactive"
                        }
                      >

                        {student.status || "Inactive"}

                      </span>

                    </span>


                    {/* ACTION */}

                    <div className="student-actions">


                      {/* EDIT */}

                      <button
                        className="edit-student-btn"
                        title="Edit Student"
                        onClick={() =>
                          openEditStudent(student)
                        }
                      >

                        ✏️

                      </button>


                      {/* DELETE */}

                      <button
                        className="delete-student-btn"
                        title="Delete Student"
                        onClick={() =>
                          openDeleteConfirmation(
                            student
                          )
                        }
                      >

                        🗑️

                      </button>


                    </div>

                  </div>

                )
              )}

          </div>


          {/* =================================================
              PAGINATION
          ================================================= */}

          {!loading &&
            filteredStudents.length > 0 && (

              <div className="students-pagination">


                <div className="pagination-info">

                  Showing{" "}

                  <strong>

                    {startIndex + 1}

                  </strong>


                  {" "}to{" "}


                  <strong>

                    {Math.min(
                      endIndex,
                      filteredStudents.length
                    )}

                  </strong>


                  {" "}of{" "}


                  <strong>

                    {filteredStudents.length}

                  </strong>


                  {" "}students

                </div>


                <div className="pagination-controls">


                  {/* PREVIOUS */}

                  <button
                    className="pagination-arrow"
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      changePage(
                        currentPage - 1
                      )
                    }
                  >

                    ‹

                  </button>


                  {/* PAGE NUMBERS */}

                  {pageNumbers.map(
                    (page) => (

                      <button
                        key={page}
                        className={
                          currentPage === page
                            ? "pagination-number active"
                            : "pagination-number"
                        }
                        onClick={() =>
                          changePage(page)
                        }
                      >

                        {page}

                      </button>

                    )
                  )}


                  {/* NEXT */}

                  <button
                    className="pagination-arrow"
                    disabled={
                      currentPage ===
                      totalPages
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

              </div>

            )}

        </div>

      </div>


      {/* =====================================================
          ADD / EDIT STUDENT MODAL
      ===================================================== */}

      {(showAddStudent || editStudent) && (

        <div
          className="student-modal-overlay"
          onClick={
            editStudent
              ? closeEditStudent
              : closeAddStudent
          }
        >

          <div
            className="student-modal-placeholder add-student-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* CLOSE */}

            <button
              className="close-placeholder"
              onClick={
                editStudent
                  ? closeEditStudent
                  : closeAddStudent
              }
              disabled={saving}
            >

              ×

            </button>


            {/* ICON */}

            <div className="placeholder-icon">

              {editStudent
                ? "✏️"
                : "＋"}

            </div>


            {/* TITLE */}

            <h2>

              {editStudent
                ? "Edit Student"
                : "Add New Student"}

            </h2>


            <p>

              {editStudent

                ? "Update student information and status."

                : "Enter student information below."}

            </p>


            {/* FORM */}

            <form
              className="student-form"
              onSubmit={handleSubmit}
            >


              {/* =================================================
                  PERSONAL INFORMATION
              ================================================= */}

              <div className="form-section-title">

                Personal Information

              </div>


              <div className="form-grid">


                {/* NAME */}

                <input
                  name="name"
                  placeholder="Student Name *"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />


                {/* MOBILE */}

                <input
                  name="mobile"
                  placeholder="Mobile Number *"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />


                {/* EMAIL */}

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                />


                {/* DOB */}

                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />


                {/* GENDER */}

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >

                  <option value="">

                    Select Gender

                  </option>


                  <option value="Male">

                    Male

                  </option>


                  <option value="Female">

                    Female

                  </option>


                  <option value="Other">

                    Other

                  </option>

                </select>


                {/* ADDRESS */}

                <input
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                />

              </div>


              {/* =================================================
                  COURSE INFORMATION
              ================================================= */}

              <div className="form-section-title">

                Course Information

              </div>


              <div className="form-grid">


                {/* COURSE */}

                <input
                  name="course"
                  placeholder="Course *"
                  value={formData.course}
                  onChange={handleChange}
                  required
                />


                {/* BATCH */}

                <input
                  name="batch"
                  placeholder="Batch"
                  value={formData.batch}
                  onChange={handleChange}
                />


                {/* ADMISSION DATE */}

                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                />


                {/* STATUS */}

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >

                  <option value="Active">

                    Active

                  </option>


                  <option value="Inactive">

                    Inactive

                  </option>

                </select>

              </div>


              {/* =================================================
                  FEES INFORMATION
              ================================================= */}

              <div className="form-section-title">

                Fees Information

              </div>


              <div className="form-grid">


                {/* TOTAL FEES */}

                <input
                  type="number"
                  name="totalFees"
                  placeholder="Total Fees"
                  value={formData.totalFees}
                  onChange={handleChange}
                  min="0"
                />


                {/* PAID FEES */}

                <input
                  type="number"
                  name="paidFees"
                  placeholder="Paid Fees"
                  value={formData.paidFees}
                  onChange={handleChange}
                  min="0"
                />

              </div>


              {/* =================================================
                  NOTES
              ================================================= */}

              <div className="form-section-title">

                Additional Notes

              </div>


              <textarea
                name="notes"
                placeholder="Write notes..."
                value={formData.notes}
                onChange={handleChange}
                rows="3"
              />


              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div className="form-buttons">


                {/* CANCEL */}

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    editStudent
                      ? closeEditStudent
                      : closeAddStudent
                  }
                  disabled={saving}
                >

                  Cancel

                </button>


                {/* SAVE / UPDATE */}

                <button
                  type="submit"
                  className="save-student-btn"
                  disabled={saving}
                >

                  {saving

                    ? "Saving..."

                    : editStudent

                      ? "Update Student"

                      : "Save Student"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      {deleteStudent && (

        <div
          className="delete-modal-overlay"
          onClick={closeDeleteConfirmation}
        >

          <div
            className="delete-confirm-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* WARNING ICON */}

            <div className="delete-warning-icon">

              🗑

            </div>


            <h2>

              Delete Student?

            </h2>


            <p>

              Are you sure you want to delete{" "}


              <strong>

                {deleteStudent.name}

              </strong>


              ?


              <br />


              This action cannot be undone.

            </p>


            <div className="delete-modal-actions">


              {/* CANCEL */}

              <button
                className="delete-cancel-btn"
                onClick={
                  closeDeleteConfirmation
                }
                disabled={deleting}
              >

                Cancel

              </button>


              {/* DELETE */}

              <button
                className="delete-confirm-btn"
                onClick={handleDelete}
                disabled={deleting}
              >

                {deleting

                  ? "Deleting..."

                  : "Delete Student"}

              </button>

            </div>

          </div>

        </div>

      )}

    </>

  );

}

export default Students;