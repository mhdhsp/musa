import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Attendance from "./pages/Attendance";
import AttendanceResult from "./pages/AttandanceResult";
import History from "./pages/History";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/attendance/:section"
          element={<Attendance />}
        />

        <Route
          path="/attendance/result/:section"
          element={<AttendanceResult />}
        />

        <Route
          path="/history"
          element={<History />}
        />
      </Routes>
    </BrowserRouter>
  );
}