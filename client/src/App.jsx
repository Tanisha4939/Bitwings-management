import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Students from "./pages/Students/Students";
import Admissions from "./pages/Admissions/Admissions";
import FeeReminder from "./pages/FeeReminder/FeeReminder";
import Followup from "./pages/Followup/Followup";

function App() {

  const isLoggedIn =
    localStorage.getItem("bitwingsAdminLoggedIn") === "true";

  const path = window.location.pathname;


  // =====================================================
  // NOT LOGGED IN → LOGIN
  // =====================================================

  if (!isLoggedIn) {
    return <Login />;
  }


  // =====================================================
  // DASHBOARD
  // =====================================================

  if (path === "/dashboard" || path === "/") {
    return <Dashboard />;
  }


  // =====================================================
  // STUDENTS
  // =====================================================

  if (path === "/students") {
    return <Students />;
  }


  // =====================================================
  // ADMISSIONS
  // =====================================================

  if (path === "/admissions") {
    return <Admissions />;
  }


  // =====================================================
  // FEE REMINDER
  // =====================================================

  if (path === "/reminders") {
    return <FeeReminder />;
  }

  if (path === "/followup") {
    return <Followup />;
  }


  // =====================================================
  // UNKNOWN PAGE → DASHBOARD
  // =====================================================

  return <Dashboard />;
}

export default App;