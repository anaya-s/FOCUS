import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
//Default export
import HomePage from "./home/HomePage";
import LoginPage from "./login/LoginPage";
import ResetPass from "./login/ResetPass";
import Register from "./login/Register";
import NavBar from "./navbar/NavBar";
import Footer from "./home/Footer";
import NotFound from "./utils/NotFound";
import NotAuthorized from "./utils/NotAuthorized";
import AboutUs from "./navbar/products/AboutUs";
import TextReaderPage from "./text_reader/TextReader"
import CalibrationPage from "./calibration/Calibration";
import ProtectedRoute from "./utils/ProtectedRoute";
// Named export
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <div>
        <AuthProvider>
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPass />} />
            <Route path="error/404" element={<NotFound />} />
            <Route path="error/403" element={<NotAuthorized />} />
            <Route path="/about" element={<AboutUs />} />
            {/* CHANGE BELOW FOR DASHBOARD */}
            <Route
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <TextReaderPage />  
                </ProtectedRoute>
              }
            />
            <Route
              path="/calibrate"
              element={
                <ProtectedRoute>
                  <CalibrationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reading"
              element={
                <ProtectedRoute>
                  <TextReaderPage />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Footer />
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
