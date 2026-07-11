import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./AttendancePage.css";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiBarChart2,
  FiFileText,
  FiUser,
  FiCalendar,
  FiLogOut,
  FiX,
  FiSun,
  FiMoon,
} from "react-icons/fi";

import { API_ENDPOINTS, logoutUser } from "../../utils/api";
import { useTheme } from "../../utils/useTheme";
import ProfileHeader from "../../components/attendance/ProfileHeader";
import DateStrip from "../../components/attendance/DateStrip";
import AttendanceCards from "../../components/attendance/AttendanceCards";
import ActivityLog from "../../components/attendance/ActivityLog";
import CameraView from "../../components/attendance/CameraView";
import { compressImage } from "../../components/attendance/utils";
import { appendAttendanceImage } from "../../utils/attendanceImage";
import { resolveOfficeFromLocation } from "../../utils/officeLocations";

function AttendancePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const isSelf = !userId;
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState({ name: "", position: "", company: "" });
  const [type, setType] = useState(null);
  const [image, setImage] = useState(null);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [capturedTime, setCapturedTime] = useState(null);
  const [location, setLocation] = useState("");
  const [detectedOffice, setDetectedOffice] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [holidays, setHolidays] = useState([]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    fetchUser();
    fetchAttendance();
    fetchHolidays();
  }, [userId]);

  const fetchHolidays = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(API_ENDPOINTS.getHolidays, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHolidays(res.data || []);
    } catch (err) {
      setHolidays([]);
    }
  };

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        isSelf
          ? API_ENDPOINTS.getCurrentUser
          : API_ENDPOINTS.getUserById(userId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
    } catch (err) {
      // Swal.fire({ icon: 'error', title: 'Error', text: 'Unable to load user info' });
    }
  };

  const fetchAttendance = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        isSelf
          ? API_ENDPOINTS.getMyAttendance
          : API_ENDPOINTS.getAttendanceByUser(userId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendanceHistory(res.data);

      const today = new Date().toDateString();
      const todayEntries = res.data.filter(
        (entry) => new Date(entry.timestamp).toDateString() === today
      );

      if (isSelf) {
        if (todayEntries.length === 0) {
          setType("check-in");
        } else if (
          todayEntries.length === 1 &&
          todayEntries[0].type === "check-in"
        ) {
          setType("check-out");
        } else {
          setType(null);
        }
      }
    } catch (err) {
      toast.error("Error: Unable to load attendance data");
    }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
        setLocation(coords);
        setDetectedOffice(resolveOfficeFromLocation(coords));
      },
      () =>
        toast.error("Location Error: Please enable GPS to proceed.")
    );
  };

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      toast.error("Camera Access Denied: Please enable your camera and refresh the page.");
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const captureImage = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas
      .getContext("2d")
      .drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const file = new File([blob], "attendance.jpg", { type: "image/jpeg" });
        const compressed = await compressImage(file);
        if (compressed) {
          setImage(URL.createObjectURL(compressed));
          setCompressedBlob(compressed);
          setCapturedTime(new Date());
          getLocation();
        } else {
          toast.error("Compression Failed");
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const submitAttendance = async () => {
    if (isSubmitting) return;
    if (!compressedBlob || !location) {
      toast.warning("Missing Data: Ensure image and location are available before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("type", type);
    formData.append("location", location);
    formData.append("comment", comment);
    appendAttendanceImage(formData, compressedBlob);

    try {
      setIsSubmitting(true);
      await axios.post(API_ENDPOINTS.postAttendance, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success(`Success: ${type === "check-in" ? "Checked In" : "Checked Out"} successfully`);
      setImage(null);
      setCompressedBlob(null);
      setLocation("");
      setDetectedOffice(null);
  setComment('');
      stopCamera();
      fetchAttendance();
    } catch (err) {
      toast.error("Failed: Could not submit attendance");
    } finally {
      setIsSubmitting(false); // stop loading
    }
  };

  const onLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  // Update your attendanceMap calculation:
  const attendanceMap = {};

  attendanceHistory.forEach((entry) => {
    try {
      const entryDate = new Date(entry.timestamp);
      const dateKey = entryDate.toDateString(); // Format: "Mon Mar 10 2025"

      if (!attendanceMap[dateKey]) {
        attendanceMap[dateKey] = {
          checkin: false,
          checkout: false,
          inTime: null,
          outTime: null
        };
      }

      if (entry.type === "check-in") {
        attendanceMap[dateKey].checkin = true;
        attendanceMap[dateKey].inTime = entry.timestamp;
      }
      if (entry.type === "check-out") {
        attendanceMap[dateKey].checkout = true;
        attendanceMap[dateKey].outTime = entry.timestamp;
      }
    } catch (err) {
      console.error("Error parsing date:", entry.timestamp, err);
    }
  });

  // Today's filtered logs (unchanged)
  const filteredLogs = attendanceHistory.filter(
    (entry) =>
      new Date(entry.timestamp).toDateString() === selectedDate.toDateString()
  );

// Get current month and year
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();

// Filter attendance for current month only
const currentMonthAttendance = {};

attendanceHistory.forEach((entry) => {
  try {
    const entryDate = new Date(entry.timestamp);
    
    // Check if entry is from current month
    if (entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonth) {
      const dateKey = entryDate.toDateString();
      
      if (!currentMonthAttendance[dateKey]) {
        currentMonthAttendance[dateKey] = { 
          checkin: false, 
          checkout: false 
        };
      }
      
      if (entry.type === "check-in") currentMonthAttendance[dateKey].checkin = true;
      if (entry.type === "check-out") currentMonthAttendance[dateKey].checkout = true;
    }
  } catch (err) {
    console.error("Error parsing date:", entry.timestamp, err);
  }
});

// Count present days in current month
const presentDays = Object.keys(currentMonthAttendance).length;

// Total days passed in current month (1st → today)
const totalDaysInCurrentMonth = now.getDate();

// Calculate full attendance days (both check-in and check-out)
const fullAttendanceDays = Object.values(currentMonthAttendance).filter(
  day => day.checkin && day.checkout
).length;

// Calculate partial attendance days (only check-in)
const partialAttendanceDays = Object.values(currentMonthAttendance).filter(
  day => day.checkin && !day.checkout
).length;

// Absent days calculation (only count working days if you want)
const absentDays = Math.max(0, totalDaysInCurrentMonth - presentDays);

// Working days in current month = days in month minus Sundays minus admin holidays
const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

let sundaysInCurrentMonth = 0;
for (let d = 1; d <= daysInCurrentMonth; d++) {
  if (new Date(currentYear, currentMonth, d).getDay() === 0) sundaysInCurrentMonth++;
}

const holidayDaysInCurrentMonth = new Set();
holidays.forEach((h) => {
  const hDate = new Date(h.date);
  if (
    hDate.getFullYear() === currentYear &&
    hDate.getMonth() === currentMonth &&
    hDate.getDay() !== 0 // don't double count holidays that fall on Sunday
  ) {
    holidayDaysInCurrentMonth.add(hDate.getDate());
  }
});

const totalWorkingDays = Math.max(
  0,
  daysInCurrentMonth - sundaysInCurrentMonth - holidayDaysInCurrentMonth.size
);

// A day counts towards attendance as soon as the employee checks in
const remainingWorkingDays = Math.max(0, totalWorkingDays - presentDays);


  return (
    <div className="min-h-screen bg-gradient-to-tr from-lime-50 via-sky-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 py-6 md:py-10 max-w-4xl mx-auto font-sans">
      <div className="flex justify-end mb-2">
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex items-center justify-center p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-white dark:hover:bg-gray-700 transition leading-none"
        >
          {theme === "dark" ? <FiSun className="w-4 h-4 shrink-0" /> : <FiMoon className="w-4 h-4 shrink-0" />}
        </button>
      </div>
      <div >
        <ProfileHeader
          name={user.name}
          position={user.position}
          company={user.company}

        /></div>

      <div className="mt-4 mb-4 flex justify-around text-sm font-medium text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-1">
          <FiCheckCircle className="text-green-600 dark:text-green-400" /> Present: <span className="text-green-600 dark:text-green-400">{presentDays}</span>
        </div>
        <div className="flex items-center gap-1">
          <FiXCircle className="text-red-600 dark:text-red-400" /> Leaves: <span className="text-red-600 dark:text-red-400">{absentDays}</span>
        </div>
        <div className="flex items-center gap-1">
          <FiClock className="text-yellow-600 dark:text-yellow-400" /> Partial: <span className="text-yellow-600 dark:text-yellow-400">{partialAttendanceDays}</span>
        </div>
        <div className="flex items-center gap-1">
          <FiBarChart2 className="text-blue-600 dark:text-blue-400" /> Total: <span className="text-blue-600 dark:text-blue-400">{fullAttendanceDays}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between items-stretch md:items-center gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={() => navigate("/apply-leave")}
            className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <FiFileText /> Apply Leave
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <FiUser /> My Profile
          </button>
          {/* <button
            onClick={() => navigate("/task-manager")}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 w-full sm:w-auto"
          >
            🗂 Task Manager
          </button> */}
          <button
            onClick={() => setShowCalendarModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <FiCalendar /> Open Calendar View
          </button>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <FiLogOut /> Logout
        </button>
      </div>

      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-6 rounded-xl shadow-lg max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 text-2xl hover:text-black dark:hover:text-white"
              onClick={() => setShowCalendarModal(false)}
            >
              <FiX />
            </button>
            <h2 className="text-lg font-bold mb-4 text-center">
              Attendance -{" "}
              {calendarViewDate.toLocaleString("default", { month: "long" })}{" "}
              {calendarViewDate.getFullYear()}
            </h2>

            <Calendar
              className="m-auto p-4 rounded-lg"
              onChange={(date) => {
                setSelectedDate(date);
                
              }}
              value={selectedDate}
              onActiveStartDateChange={({ activeStartDate }) =>
                setCalendarViewDate(activeStartDate)
              }
              tileClassName={({ date, view }) => {
                if (view === "month") {
                  const now = new Date();
                  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                  // Don't show status for future dates
                  if (date > today) return "";

                  const key = date.toDateString();
                  const record = attendanceMap[key];

                  let className = "";
                  if (record?.checkin && record?.checkout) className = "present-day";
                  else if (record?.checkin && !record?.checkout) className = "partial-present";
                  else if (date < today) className = "absent-day";

                  // Add hover class if there's a record
                  if (record) className += " calendar-tile-hover";

                  return className;
                }
                return "";
              }}
              // tileContent={({ date, view }) => {
              //   if (view === "month") {
              //     const key = date.toDateString();
              //     const record = attendanceMap[key];

              //     if (record) {
              //       return (
              //         <div className="text-[9px] font-medium mt-1">
              //           {record.inTime && (
              //             <div className="text-green-600">✓ {new Date(record.inTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              //           )}
              //           {record.outTime && (
              //             <div className="text-blue-600">✗ {new Date(record.outTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              //           )}
              //         </div>
              //       );
              //     }
              //   }
              //   return null;
              // }}
              tileDisabled={({ date, view }) => {
                if (view === "month") {
                  const now = new Date();
                  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  // Disable future dates from being selected
                  return date > today;
                }
                return false;
              }}
            />
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Selected Date: {selectedDate.toDateString()}</h3>
              {(() => {
                const key = selectedDate.toDateString();
                const record = attendanceMap[key];

                if (record?.checkin || record?.checkout) {
                  return (
                    <div className="space-y-2">
                      {record.inTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-in Time:</span>
                          <span className="font-medium text-green-600">
                            {new Date(record.inTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                      {record.outTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-out Time:</span>
                          <span className="font-medium text-blue-600">
                            {new Date(record.outTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                      {record.checkin && !record.checkout && (
                        <div className="text-amber-600 text-sm italic">
                          Only checked in for this day
                        </div>
                      )}
                    </div>
                  );
                } else if (selectedDate > new Date()) {
                  return <div className="text-gray-500">Future date</div>;
                } else {
                  return <div className="text-red-500">No attendance record</div>;
                }
              })()}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-200 rounded"></span>
                <span>Present</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-yellow-200 rounded"></span>
                <span>Check-in Only</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-red-200 rounded"></span>
                <span>Absent</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Today Attendance
        </h3>
        <AttendanceCards
          attendanceData={attendanceHistory}
          totalWorkingDays={totalWorkingDays}
          remainingDays={remainingWorkingDays}
        />
        <br></br>
        <ActivityLog activities={filteredLogs} />
      </div>
      <div className="mt-8">
        <DateStrip
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </div>
      {isSelf && type && !isCapturing && (
        <div className="fixed bottom-6 left-6 right-6 flex justify-center z-30">
          <button
            onClick={() => {
              getLocation();
              startCamera();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition"
          >
            {type === "check-in" ? "Check In" : "Check Out"}
          </button>
        </div>
      )}

      {isCapturing && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 dark:text-gray-100 w-full max-w-sm p-6 rounded-2xl shadow-2xl space-y-4 text-center">
            {!image ? (
              <>
                <CameraView ref={videoRef} />
                <div className="flex justify-between mt-4">
                  <button
                    onClick={stopCamera}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={captureImage}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Capture
                  </button>
                </div>
              </>
            ) : (
              <>
                    <img
                  src={image}
                  alt="Captured"
                  className="rounded-lg w-full object-cover"
                />
                {/* Optional comment input shown after capture */}
                <div className="mt-3 text-left">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comment (optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Add a note about this attendance (e.g., reason for early leave, remote work, etc.)"
                    className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded p-2 text-sm"
                  />
                </div>
                {capturedTime && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 space-y-1">
                    <p>
                      <span className="font-medium">Captured at:</span>{" "}
                      {capturedTime.toLocaleTimeString()} on{" "}
                      {capturedTime.toLocaleDateString()}
                    </p>
                    {location && (
                      <p>
                        <span className="font-medium">Location:</span>{" "}
                        {location}
                      </p>
                    )}
                    {detectedOffice && (
                      <p>
                        <span className="font-medium">Office:</span>{" "}
                        <span className={detectedOffice.isInOffice ? "text-green-600 font-semibold" : "text-amber-600"}>
                          {detectedOffice.officeName}
                        </span>
                      </p>
                    )}
                  </div>
                )}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(image);
                      setImage(null);
                      setCompressedBlob(null);
                      setComment('');
                      startCamera();
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                  >
                    Retake
                  </button>
                  <button
                    onClick={submitAttendance}
                    className={`bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : `Submit ${type === "check-in" ? "Check In" : "Check Out"
                      }`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendancePage;
