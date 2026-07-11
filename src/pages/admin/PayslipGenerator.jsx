import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import PayslipPreview from "../../components/admin-dashboard/payslip/PayslipPreview";
import { Add, Delete } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import dayjs from "dayjs";
import axios from "axios";
import uclogo from "../../assets/logo.png";
import jzlogo from "../../assets/jzlogo.png";
import { API_ENDPOINTS } from "../../utils/api";
  import { createTheme, ThemeProvider } from '@mui/material/styles';
import Loader from "../../components/admin-dashboard/common/Loader";
const PayslipGenerator = () => {
  const [companyLogo, setCompanyLogo] = useState(uclogo);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [logs, setLogs] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  

  const [employeeDetails, setEmployeeDetails] = useState({
    name: "",
    userId: "",
    employeeId: "",
    designation: "",
    department: "",
    company: "",
    bankAccountName: "",
    bankAccountNumber: "",
    dateOfJoining: "",
    // paymentDate: "",
    month: dayjs().format("MMMM YYYY"),
    workingDays: 0,
    leaveDays: 0,
    lateDays: 0,
    halfDays: 0,
    absentDays: 0,
    totalDays: 0,
    presentDays: 0,
    empGrade: "",
    pan: "",
    uan: "",
    esiNumber: "",
    ifsc: "",
    ctc: "",
    workingLocation: "Chennai",
    mobile: "",
    remittedOn: "",
  });

  const [incomes, setIncomes] = useState([
    { label: "Basic Pay", amount: 40000 },
    { label: "HRA", amount: 10000 },
  ]);

  const [deductions, setDeductions] = useState([
    { label: "PF", amount: 2000 },
    { label: "TDS", amount: 1500 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [logsRes, schedulesRes] = await Promise.all([
          axios.get(API_ENDPOINTS.getRecentAttendanceLogs, { headers }),
          axios.get(API_ENDPOINTS.getSchedules, { headers }),
        ]);
        setLogs(logsRes.data);
        setSchedules(schedulesRes.data);
        const names = [...new Set(logsRes.data.map((log) => log.employeeName || "Unknown"))];
        setEmployees(names);
       

      } catch (err) {
        console.error("Error loading payslip data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedEmployee) return;

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const allDates = Array.from(
      { length: new Date(year, month + 1, 0).getDate() },
      (_, i) => new Date(year, month, i + 1)
    );

    const filteredLogs = logs.filter((log) => {
      const date = new Date(log.timestamp);
      return (
        log.employeeName === selectedEmployee &&
        date.getFullYear() === year &&
        date.getMonth() === month
      );
    });

    const grouped = {};
    filteredLogs.forEach((log) => {
      const dateKey = new Date(log.timestamp).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = { checkIn: null, checkOut: null };
      if (log.type === "check-in") grouped[dateKey].checkIn = log;
      if (log.type === "check-out") grouped[dateKey].checkOut = log;
    });

    const userSchedule = schedules.find((sch) => sch.user?.name === selectedEmployee);
    const weeklySchedule = userSchedule?.weeklySchedule || {};

    let workingDays = 0;
    let leaveDays = 0;
    let lateDays = 0;
    let presentDays = 0;
    let halfDays = 0;

    const today = new Date();
    allDates.forEach((date) => {
      if (date > today) return;

      const dateKey = date.toDateString();
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const scheduled = weeklySchedule[dayName];

      if (!scheduled || scheduled.isLeave || date.getDay() === 0) {
        if (scheduled?.isLeave) leaveDays++;
        return;
      }

      workingDays++;

      const attendance = grouped[dateKey];
      if (attendance?.checkIn) {
        presentDays++;

        if (scheduled?.start) {
          const [h, m] = scheduled.start.split(":").map(Number);
          const expected = new Date(date);
          expected.setHours(h, m+10, 0);
          const actual = new Date(attendance.checkIn.timestamp);

          const diffMinutes = (actual - expected) / 60000;
          
          if (diffMinutes >= 60) halfDays++; // mark half day if 1 hour late
          else if (diffMinutes > 0) lateDays++;
        }
      }
    });

    const absentDays = workingDays - presentDays;
    const sampleLog = logs.find((l) => l.employeeName === selectedEmployee);
     console.log("sampleLog doj", sampleLog?.dateOfJoining);
console.log("formatted  doj", sampleLog?.dateOfJoining ? dayjs(sampleLog.dateOfJoining).format("YYYY-MM-DD") : "");
    
    setEmployeeDetails((prev) => ({
      ...prev,
      name: selectedEmployee,
      userId:sampleLog?.userId,
      employeeId:  sampleLog?._id || "uc_202501",
      designation: sampleLog?.position || "Software Engineer",
      department: sampleLog?.department || "Development",
      company: sampleLog?.company || "",
      month: dayjs(selectedMonth).format("MMMM YYYY"),
      totalDays: allDates.length,
      bankAccountName: sampleLog?.bankDetails?.bankingName,
      bankAccountNumber: sampleLog?.bankDetails?.accountNumber,
      ifsc: sampleLog?.bankDetails?.ifscCode || prev.ifsc,
      mobile: sampleLog?.phone || prev.mobile,
      dateOfJoining: sampleLog?.dateOfJoining
    ? dayjs(sampleLog.dateOfJoining).format("YYYY-MM-DD")
    : "",
      workingDays,
      leaveDays,
      lateDays,
      halfDays,
      absentDays,
      presentDays,
    }));
    console.log("Employee Details:", employeeDetails);
  }, [selectedEmployee, selectedMonth, logs, schedules]);


const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat, sans-serif',
  },
});
  useEffect(() => {
    if (!selectedEmployee) return;

    const sampleLog = logs.find((l) => l.employeeName === selectedEmployee);
    const company = sampleLog?.company?.toLowerCase() || "";

   

    // Update employee details
    setEmployeeDetails(prev => ({
      ...prev,
      name: selectedEmployee,
      userId:sampleLog?.userId,
      employeeId: sampleLog?._id || "uc_202501",
      designation: sampleLog?.position || "Software Engineer",
      department: sampleLog?.department || "Development",
      company: sampleLog?.company || "",
      dateOfJoining: sampleLog?.dateOfJoining
    ? dayjs(sampleLog.dateOfJoining).format("YYYY-MM-DD")
    : "",
    }));
  }, [selectedEmployee, logs]);

  const handleChange = (section, index, field, value) => {
    const updater = section === "income" ? [...incomes] : [...deductions];
      // Convert amount to number safely
  if (field === "amount") {
    updater[index][field] = Number(value) || 0;
  } else {
    updater[index][field] = value;
  }
    
    section === "income" ? setIncomes(updater) : setDeductions(updater);
  };

  const addRow = (section) => {
    const row = { label: "", amount: 0 };
    section === "income" ? setIncomes([...incomes, row]) : setDeductions([...deductions, row]);
  };

  const removeRow = (section, index) => {
    const updater = section === "income" ? [...incomes] : [...deductions];
    updater.splice(index, 1);
    section === "income" ? setIncomes(updater) : setDeductions(updater);
  };

  const totalIncome = incomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalDeductions = deductions.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const netPay = totalIncome - totalDeductions;

  if (loading) {
    return (
      // <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      //   <CircularProgress />
      // </Box>
      <Loader/>
    );
  }

  if (previewMode) {
    return (
      <PayslipPreview
        payslipData={{
          employeeDetails,
          incomes,
          deductions,
          totalIncome,
          totalDeductions,
          netPay,
          companyLogo,
          
        }}
        onBack={() => setPreviewMode(false)}
      />
    );
  }

  return (
    <ThemeProvider theme={theme}>
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
          
          <Typography variant="h5" fontWeight="bold" >
            <span className="text-gray-600">
            Pay Slip Generator</span>
          </Typography>
        </Box>

      <Paper elevation={3} sx={{ p: 4,border:'1px solid #ddd', borderRadius: 3, mt: 3 }}>
        {/* Header with logo */}
        
    
       

        {/* Employee & Month Selector */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6}>
            <TextField
  select
  sx={{
    minWidth: 300,
    '& .MuiInputLabel-root': { color: '#159C8E' },
    '& .MuiFilledInput-root': {
      backgroundColor: '#f9fafb',
      '&:hover': { backgroundColor: '#f1f5f9' },
      '&.Mui-focused': { backgroundColor: '#fff' }
    },
    '& .MuiFilledInput-underline:after': {
      borderBottomColor: '#159C8E'
    }
  }}
  fullWidth
  label="Select Employee"
  variant="filled"
  value={selectedEmployee}
  onChange={(e) => setSelectedEmployee(e.target.value)}
>
  <MenuItem value="" disabled>
    Select Employee
  </MenuItem>
  {employees.map((employee) => (
    <MenuItem
      key={employee._id || employee}
      value={employee.name || employee}
    >
      {employee.name || employee}
    </MenuItem>
  ))}
</TextField>

          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                views={["year", "month"]}
                openTo="month"
                label="Select Month"
                value={selectedMonth}
                onChange={(newValue) => {
                  if (newValue) setSelectedMonth(newValue);
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
 <Divider sx={{ my: 2 }} />
        {/* Employee Info */}
        <Grid container spacing={2}>
          {["name", "designation", "department","employeeId"].map((field) => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                fullWidth
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                value={employeeDetails[field]}
                onChange={(e) =>
                  setEmployeeDetails({ ...employeeDetails, [field]: e.target.value })
                }
              />
            </Grid>
          ))}
        </Grid>
        
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bank Account Name"
              value={employeeDetails.bankAccountName}
              onChange={(e) =>
                setEmployeeDetails({ ...employeeDetails, bankAccountName: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bank Account Number"
              value={employeeDetails.bankAccountNumber}
              onChange={(e) =>
                setEmployeeDetails({ ...employeeDetails, bankAccountNumber: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Date of Joining"
              InputLabelProps={{ shrink: true }}
              value={employeeDetails.dateOfJoining}
              onChange={(e) =>
                setEmployeeDetails({ ...employeeDetails, dateOfJoining: e.target.value })
              }
            />
          </Grid>
        </Grid>
 <Divider sx={{ my: 2 }} />
        {/* Statutory & Other Details */}
        <Box mt={1} mb={2}>
          <Typography variant="h6" gutterBottom>
            Statutory & Other Details
          </Typography>
          <Grid container spacing={2}>
            {[
              { key: "empGrade", label: "Emp Grade" },
              { key: "pan", label: "PAN" },
              { key: "uan", label: "PF-UAN" },
              { key: "esiNumber", label: "ESI Number" },
              { key: "ifsc", label: "IFSC" },
              { key: "ctc", label: "CTC" },
              { key: "workingLocation", label: "Working Location" },
              { key: "mobile", label: "Mobile" },
            ].map(({ key, label }) => (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <TextField
                  fullWidth
                  label={label}
                  value={employeeDetails[key]}
                  onChange={(e) =>
                    setEmployeeDetails({ ...employeeDetails, [key]: e.target.value })
                  }
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Remitted On"
                InputLabelProps={{ shrink: true }}
                value={employeeDetails.remittedOn}
                onChange={(e) =>
                  setEmployeeDetails({ ...employeeDetails, remittedOn: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </Box>
 <Divider sx={{ my: 2 }} />
        {/* Attendance Summary */}
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Attendance Summary
          </Typography>
          <Grid container spacing={2}>
            {["totalDays", "workingDays", "presentDays", "leaveDays", "lateDays", "halfDays", "absentDays"].map((key) => (
              <Grid item xs={6} sm={3} key={key}>
                <TextField
                  fullWidth
                  label={key.replace(/([A-Z])/g, " $1")}
                  value={employeeDetails[key]}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
 <Divider sx={{ my: 2 }} />
        {/* Incomes */}
        <Box mt={4}>
          <Typography variant="h6">Income</Typography>
          {incomes.map((item, index) => (
            <Grid container spacing={2} key={index} alignItems="center" mt={1}>
              <Grid item xs={6}>
                <TextField
                  label="Label"
                  fullWidth
                  value={item.label}
                  onChange={(e) => handleChange("income", index, "label", e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Amount"
                  fullWidth
                  type="number"
                  value={item.amount}
                  onChange={(e) => handleChange("income", index, "amount", e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={() => removeRow("income", index)}>
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<Add />} onClick={() => addRow("income")} sx={{ mt: 2 }}>
            Add Income
          </Button>
        </Box>

        {/* Deductions */}
        <Box mt={4}>
          <Typography variant="h6">Deductions</Typography>
          {deductions.map((item, index) => (
            <Grid container spacing={2} key={index} alignItems="center" mt={1}>
              <Grid item xs={6}>
                <TextField
                  label="Label"
                  fullWidth
                  value={item.label}
                  onChange={(e) => handleChange("deduction", index, "label", e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Amount"
                  fullWidth
                  type="number"
                  value={item.amount}
                  onChange={(e) => handleChange("deduction", index, "amount", e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={() => removeRow("deduction", index)}>
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<Add />} onClick={() => addRow("deduction")} sx={{ mt: 2 }}>
            Add Deduction
          </Button>
        </Box>

        {/* Summary */}
        <Divider sx={{ my: 4 }} />
        <Box>
          <Typography variant="h6">Summary</Typography>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={4}>
              <TextField label="Total Income" fullWidth value={totalIncome} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={4}>
              <TextField label="Total Deductions" fullWidth value={totalDeductions} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={4}>
              <TextField label="Net Pay" fullWidth value={netPay} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Box mt={4} display="flex" justifyContent="flex-end">
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setPreviewMode(true)}
          disabled={!selectedEmployee}
        >
          Preview Payslip
        </Button>
      </Box>
    </Container>
    </ThemeProvider>
  );
};

export default PayslipGenerator;