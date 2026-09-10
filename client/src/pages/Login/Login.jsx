import { useState } from "react";
import "./Login.css";

function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const ADMIN_EMAIL = "info@bitwingsadmin.com";
        const ADMIN_PASSWORD = "Bitwings@2025";

        if (
            formData.email === ADMIN_EMAIL &&
            formData.password === ADMIN_PASSWORD
        ) {
            console.log("Login Successful");

          

            localStorage.setItem(
                "bitwingsAdminLoggedIn",
                "true"
            );

            window.location.href = "/";
        } else {
            alert("Invalid Email or Password");
        }
    };
    return (
        <div className="login-page">

            {/* =================================
          ANIMATED BACKGROUND
      ================================= */}

            <div className="background-shape shape-one"></div>
            <div className="background-shape shape-two"></div>
            <div className="background-shape shape-three"></div>

            <div className="background-grid"></div>


            {/* =================================
          LEFT BRANDING
      ================================= */}

            <section className="login-left">

                <div className="brand-content">

                    {/* TEXT LOGO */}

                    <div className="text-logo">

                        <div className="logo-main">

                            <span className="logo-b">
                                B
                            </span>

                            <span>
                                IT
                            </span>

                            <span className="logo-blue">
                                WINGS
                            </span>

                        </div>

                        <div className="logo-subtitle">
                            IT ACADEMY
                        </div>

                    </div>


                    {/* BADGE */}

                    <div className="management-badge">
                        <span className="badge-dot"></span>

                        BITWINGS MANAGEMENT SYSTEM
                    </div>


                    {/* HEADING */}

                    <h1>
                        Manage your
                        <br />

                        <span>
                            academy smarter.
                        </span>
                    </h1>


                    {/* DESCRIPTION */}

                    <p className="brand-description">
                        One powerful platform to manage students,
                        admissions, fees, reports, follow-ups and
                        marketing — all in one place.
                    </p>


                    {/* FEATURES */}

                    <div className="brand-features">

                        <div className="feature-item">
                            <span>✓</span>
                            Student Management
                        </div>

                        <div className="feature-item">
                            <span>✓</span>
                            Fees & Reports
                        </div>

                        <div className="feature-item">
                            <span>✓</span>
                            Marketing Analytics
                        </div>

                    </div>

                </div>

            </section>


            {/* =================================
          RIGHT LOGIN
      ================================= */}

            <section className="login-right">

                <div className="login-card">


                    {/* MOBILE LOGO */}

                    <div className="mobile-logo">

                        <div className="mobile-logo-name">
                            BIT<span>WINGS</span>
                        </div>

                        <small>
                            IT ACADEMY
                        </small>

                    </div>


                    {/* HEADER */}

                    <div className="login-header">

                        <div className="welcome-text">
                            WELCOME BACK
                        </div>

                        <h2>
                            Admin Login
                        </h2>

                        <p>
                            Sign in to continue to your dashboard.
                        </p>

                    </div>


                    {/* FORM */}

                    <form onSubmit={handleSubmit}>


                        {/* EMAIL */}

                        <div className="form-group">

                            <label>
                                Email Address
                            </label>

                            <div className="input-container">

                                <div className="input-icon">
                                    @
                                </div>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="admin@bitwings.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                />

                            </div>

                        </div>


                        {/* PASSWORD */}

                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <div className="input-container">

                                <div className="input-icon">
                                    •••
                                </div>

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    className="show-password"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword
                                        ? "HIDE"
                                        : "SHOW"}
                                </button>

                            </div>

                        </div>


                        {/* OPTIONS */}

                        <div className="login-options">

                            <label className="remember">

                                <input
                                    type="checkbox"
                                />

                                <span>
                                    Remember me
                                </span>

                            </label>


                            <button
                                type="button"
                                className="forgot"
                            >
                                Forgot password?
                            </button>

                        </div>


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className="login-button"
                        >

                            <span>
                                Sign In
                            </span>

                            <span className="button-arrow">
                                →
                            </span>

                        </button>

                    </form>


                    {/* FOOTER */}

                    <div className="login-footer">

                        <span>
                            © 2026 Bitwings IT Academy
                        </span>

                        <span className="secure-text">
                            ● Secure Access
                        </span>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Login;