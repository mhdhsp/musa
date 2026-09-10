import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Attendance from "./pages/Attendance";
import History from "./pages/History";
import HifzPage from "./pages/HifzPage";
import StudentsPage from "./pages/StudentsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hifz" element={<HifzPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/attendance/:section" element={<Attendance />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}