import { useEffect, useState } from "react";
import "./AddStudentModal.css";

function AddStudentModal({ onClose, onSave, student }) {

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    whatsapp: "",
    email: "",
    qualification: "",
    course: "",
    batch: "",
    admissionDate: new Date().toISOString().split("T")[0],
    totalFees: "",
    paidFees: "",
    pendingFees: 0,
    status: "Active",
    notes: "",
  });

  // EDIT STUDENT DATA
  useEffect(() => {
    if (student) {
      setFormData({
        ...formData,
        ...student,
      });
    }
  }, [student]);


  // HANDLE INPUT
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => {

      const updated = {
        ...prev,
        [name]: value,
      };

      // AUTO CALCULATE PENDING FEES
      if (name === "totalFees" || name === "paidFees") {

        const total = Number(
          name === "totalFees"
            ? value
            : prev.totalFees
        );

        const paid = Number(
          name === "paidFees"
            ? value
            : prev.paidFees
        );

        updated.pendingFees =
          Math.max(total - paid, 0);
      }

      return updated;
    });
  };


  // SUBMIT
  const handleSubmit = (e) => {

    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter student name");
      return;
    }

    if (!formData.mobile.trim()) {
      alert("Please enter mobile number");
      return;
    }

    if (!formData.course) {
      alert("Please select course");
      return;
    }

    onSave(formData);
  };


  return (
    <div
      className="student-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >

      <div className="student-modal">


        {/* HEADER */}

        <div className="student-modal-header">

          <div className="modal-title">

            <div className="modal-title-icon">
              {student ? "✎" : "+"}
            </div>

            <div>
              <span>
                BITWINGS STUDENT MANAGEMENT
              </span>

              <h2>
                {student
                  ? "Edit Student"
                  : "Add New Student"}
              </h2>

              <p>
                {student
                  ? "Update student information"
                  : "Create a new student profile"}
              </p>
            </div>

          </div>


          <button
            className="modal-close"
            type="button"
            onClick={onClose}
          >
            ×
          </button>

        </div>


        {/* FORM */}

        <form
          className="student-form"
          onSubmit={handleSubmit}
        >


          {/* PERSONAL INFORMATION */}

          <div className="form-section">

            <div className="section-heading">

              <div className="section-number">
                01
              </div>

              <div>
                <h3>
                  Personal Information
                </h3>

                <p>
                  Basic details of the student
                </p>
              </div>

            </div>


            <div className="form-grid">


              {/* NAME */}

              <div className="input-group full">

                <label>
                  Full Name
                  <span>*</span>
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ♙
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter student's full name"
                  />

                </div>

              </div>


              {/* MOBILE */}

              <div className="input-group">

                <label>
                  Mobile Number
                  <span>*</span>
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ☎
                  </span>

                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="98765 43210"
                  />

                </div>

              </div>


              {/* WHATSAPP */}

              <div className="input-group">

                <label>
                  WhatsApp Number
                </label>

                <div className="input-wrapper">

                  <span className="input-icon whatsapp-icon">
                    W
                  </span>

                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="WhatsApp number"
                  />

                </div>

              </div>


              {/* EMAIL */}

              <div className="input-group">

                <label>
                  Email Address
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    @
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@email.com"
                  />

                </div>

              </div>


              {/* QUALIFICATION */}

              <div className="input-group">

                <label>
                  Qualification
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ◫
                  </span>

                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select qualification
                    </option>

                    <option value="10th">
                      10th Pass
                    </option>

                    <option value="12th">
                      12th Pass
                    </option>

                    <option value="BCA">
                      BCA
                    </option>

                    <option value="BSc IT">
                      BSc IT
                    </option>

                    <option value="B.Tech">
                      B.Tech
                    </option>

                    <option value="MCA">
                      MCA
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

              </div>

            </div>

          </div>


          {/* COURSE INFORMATION */}

          <div className="form-section">

            <div className="section-heading">

              <div className="section-number">
                02
              </div>

              <div>
                <h3>
                  Course & Batch
                </h3>

                <p>
                  Training program details
                </p>
              </div>

            </div>


            <div className="form-grid">


              {/* COURSE */}

              <div className="input-group">

                <label>
                  Course
                  <span>*</span>
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ◈
                  </span>

                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select course
                    </option>

                    <option value="MERN Stack">
                      MERN Stack Development
                    </option>

                    <option value="Python">
                      Python Development
                    </option>

                    <option value="Web Development">
                      Web Development
                    </option>

                    <option value="Java">
                      Java Development
                    </option>

                    <option value="UI/UX Design">
                      UI/UX Design
                    </option>

                    <option value="Digital Marketing">
                      Digital Marketing
                    </option>

                    <option value="AI">
                      AI & Machine Learning
                    </option>

                  </select>

                </div>

              </div>


              {/* BATCH */}

              <div className="input-group">

                <label>
                  Batch
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ▦
                  </span>

                  <select
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select batch
                    </option>

                    <option value="Morning">
                      Morning
                    </option>

                    <option value="Afternoon">
                      Afternoon
                    </option>

                    <option value="Evening">
                      Evening
                    </option>

                    <option value="Weekend">
                      Weekend
                    </option>

                  </select>

                </div>

              </div>


              {/* ADMISSION DATE */}

              <div className="input-group">

                <label>
                  Admission Date
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ◷
                  </span>

                  <input
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleChange}
                  />

                </div>

              </div>


              {/* STATUS */}

              <div className="input-group">

                <label>
                  Student Status
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ●
                  </span>

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

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Dropped">
                      Dropped
                    </option>

                  </select>

                </div>

              </div>

            </div>

          </div>


          {/* FEES */}

          <div className="form-section">

            <div className="section-heading">

              <div className="section-number">
                03
              </div>

              <div>
                <h3>
                  Fee Details
                </h3>

                <p>
                  Track student's payment information
                </p>
              </div>

            </div>


            <div className="fees-grid">


              <div className="fee-box">

                <label>
                  Total Course Fees
                </label>

                <div className="fee-input">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    name="totalFees"
                    value={formData.totalFees}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />

                </div>

              </div>


              <div className="fee-box">

                <label>
                  Paid Amount
                </label>

                <div className="fee-input">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    name="paidFees"
                    value={formData.paidFees}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />

                </div>

              </div>


              <div className="fee-box pending-fee">

                <label>
                  Pending Amount
                </label>

                <div className="pending-value">

                  <span>
                    ₹
                  </span>

                  <strong>
                    {Number(formData.pendingFees || 0).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              </div>

            </div>

          </div>


          {/* NOTES */}

          <div className="form-section notes-section">

            <div className="input-group full">

              <label>
                Notes
              </label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional information about this student..."
                rows="3"
              />

            </div>

          </div>


          {/* FOOTER */}

          <div className="modal-footer">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="save-student-btn"
            >

              <span>
                {student ? "✓" : "+"}
              </span>

              {student
                ? "Update Student"
                : "Add Student"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddStudentModal;