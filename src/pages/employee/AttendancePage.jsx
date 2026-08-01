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
  FiGrid,
  FiMoreHorizontal,
} from "react-icons/fi";

import { API_ENDPOINTS, logoutUser } from "../../utils/api";
import { useTheme } from "../../utils/useTheme";
import { useShake } from "../../utils/useShake";
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
  const isCapturingRef = useRef(false);
  const typeRef = useRef(null);
  const showCalendarModalRef = useRef(false);

  useEffect(() => {
    fetchUser();
    fetchAttendance();
    fetchHolidays();
  }, [userId]);

  useEffect(() => {
    isCapturingRef.current = isCapturing;
  }, [isCapturing]);

  useEffect(() => {
    typeRef.current = type;
  }, [type]);

  useEffect(() => {
    showCalendarModalRef.current = showCalendarModal;
  }, [showCalendarModal]);

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

  const openAttendanceCamera = () => {
    if (!isSelf) return;
    if (!typeRef.current) {
      toast.info("Already done for today — check-in & check-out complete.");
      return;
    }
    if (isCapturingRef.current || showCalendarModalRef.current) return;
    getLocation();
    startCamera();
  };

  const {
    needsPermission: needsShakePermission,
    requestPermission: requestShakePermission,
    permission: shakePermission,
    isDesktop,
  } = useShake({
    enabled: isSelf && !!type && !isCapturing && !showCalendarModal,
    onShake: () => {
      const desktop = !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
      toast.info(
        typeRef.current === "check-out"
          ? desktop
            ? "Opening Check Out camera — press S / Space"
            : "Shake detected — opening Check Out camera"
          : desktop
            ? "Opening Check In camera — press S / Space"
            : "Shake detected — opening Check In camera",
        { autoClose: 1500 }
      );
      openAttendanceCamera();
    },
  });

  const enableShake = async () => {
    const ok = await requestShakePermission();
    if (ok) {
      toast.success(
        isDesktop
          ? "Ready — press S or Space to open camera"
          : "Shake enabled — shake phone to open camera"
      );
    } else if (shakePermission === "unsupported") {
      toast.warning("Shake not supported — press S or Space on keyboard");
    } else {
      toast.error("Motion permission denied — use the Check In / Out button");
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
    <div className="att-page">
      <ProfileHeader theme={theme} toggleTheme={toggleTheme} />

      <div className="att-stats">
        <div className="att-stat-card">
          <span className="att-stat-icon att-stat-green"><FiCheckCircle /></span>
          <span className="att-stat-value att-stat-green">{presentDays}</span>
          <span className="att-stat-label">Present</span>
        </div>
        <div className="att-stat-card">
          <span className="att-stat-icon att-stat-red"><FiXCircle /></span>
          <span className="att-stat-value att-stat-red">{absentDays}</span>
          <span className="att-stat-label">Leaves</span>
        </div>
        <div className="att-stat-card">
          <span className="att-stat-icon att-stat-orange"><FiClock /></span>
          <span className="att-stat-value att-stat-orange">{partialAttendanceDays}</span>
          <span className="att-stat-label">Partial</span>
        </div>
        <div className="att-stat-card">
          <span className="att-stat-icon att-stat-blue"><FiBarChart2 /></span>
          <span className="att-stat-value att-stat-blue">{fullAttendanceDays}</span>
          <span className="att-stat-label">Total</span>
        </div>
      </div>

      <div className="att-quick">
        <button type="button" className="att-quick-btn" onClick={() => navigate("/apply-leave")}>
          <span className="att-quick-icon orange"><FiFileText /></span>
          <span className="att-quick-label">Apply Leave</span>
        </button>
        <button type="button" className="att-quick-btn" onClick={() => navigate("/profile")}>
          <span className="att-quick-icon green"><FiUser /></span>
          <span className="att-quick-label">My Profile</span>
        </button>
        <button type="button" className="att-quick-btn" onClick={() => setShowCalendarModal(true)}>
          <span className="att-quick-icon blue"><FiCalendar /></span>
          <span className="att-quick-label">Calendar View</span>
        </button>
        <button type="button" className="att-quick-btn" onClick={onLogout}>
          <span className="att-quick-icon red"><FiLogOut /></span>
          <span className="att-quick-label">Logout</span>
        </button>
      </div>

      {showCalendarModal && (
        <div className="att-modal-backdrop">
          <div className="att-modal">
            <button
              type="button"
              className="att-modal-close"
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
                  const nowLocal = new Date();
                  const today = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate());

                  if (date > today) return "";

                  const key = date.toDateString();
                  const record = attendanceMap[key];

                  let className = "";
                  if (record?.checkin && record?.checkout) className = "present-day";
                  else if (record?.checkin && !record?.checkout) className = "partial-present";
                  else if (date < today) className = "absent-day";

                  if (record) className += " calendar-tile-hover";

                  return className;
                }
                return "";
              }}
              tileDisabled={({ date, view }) => {
                if (view === "month") {
                  const nowLocal = new Date();
                  const today = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate());
                  return date > today;
                }
                return false;
              }}
            />
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Selected Date: {selectedDate.toDateString()}
              </h3>
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
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      )}
                      {record.outTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-out Time:</span>
                          <span className="font-medium text-blue-600">
                            {new Date(record.outTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
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

      <h3 className="att-section-title">Today Attendance</h3>
      <AttendanceCards
        attendanceData={attendanceHistory}
        totalWorkingDays={totalWorkingDays}
        remainingDays={remainingWorkingDays}
      />

      <ActivityLog activities={filteredLogs} />

      <DateStrip
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {isSelf && type && !isCapturing && (
        <>
          <button
            type="button"
            className="att-cta"
            onClick={openAttendanceCamera}
          >
            <FiCalendar />
            {type === "check-in" ? "Check In" : "Check Out"}
          </button>
          {needsShakePermission ? (
            <button type="button" className="att-shake-hint att-shake-enable" onClick={enableShake}>
              Enable shake to open camera
            </button>
          ) : (
            <p className="att-shake-hint">
              {isDesktop
                ? "Desktop: press S or Space to open camera"
                : "Shake phone to open camera"}
            </p>
          )}
        </>
      )}

      {isCapturing && (
        <div className="att-modal-backdrop">
          <div className="att-camera-modal space-y-4">
            {!image ? (
              <>
                <CameraView ref={videoRef} />
                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
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
                <div className="mt-3 text-left">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Comment (optional)
                  </label>
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
                        <span className="font-medium">Location:</span> {location}
                      </p>
                    )}
                    {detectedOffice && (
                      <p>
                        <span className="font-medium">Office:</span>{" "}
                        <span
                          className={
                            detectedOffice.isInOffice
                              ? "text-green-600 font-semibold"
                              : "text-amber-600"
                          }
                        >
                          {detectedOffice.officeName}
                        </span>
                      </p>
                    )}
                  </div>
                )}
                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(image);
                      setImage(null);
                      setCompressedBlob(null);
                      setComment("");
                      startCamera();
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={submitAttendance}
                    className={`bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : `Submit ${type === "check-in" ? "Check In" : "Check Out"}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <nav className="att-bottom-nav" aria-label="Employee navigation">
        <button type="button" className="att-nav-item is-active">
          <FiGrid />
          Dashboard
        </button>
        <button
          type="button"
          className="att-nav-item"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <FiClock />
          Attendance
        </button>
        <button
          type="button"
          className="att-nav-item"
          onClick={() => setShowCalendarModal(true)}
        >
          <FiBarChart2 />
          Reports
        </button>
        <button
          type="button"
          className="att-nav-item"
          onClick={() => navigate("/profile")}
        >
          <FiUser />
          Profile
        </button>
        <button
          type="button"
          className="att-nav-item"
          onClick={() => navigate("/task-manager")}
        >
          <FiMoreHorizontal />
          More
        </button>
      </nav>
    </div>
  );
}

export default AttendancePage;
