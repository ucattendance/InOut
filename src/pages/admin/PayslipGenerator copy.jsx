import React, { useEffect, useState } from 'react';
import {
  Card,
  Tabs,
  Tab,
  Box,
  Typography,
  Container,
  useTheme,
  useMediaQuery,
  Button,
  Divider,
  MenuItem,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  FiEdit as EditIcon,
  FiEye as PreviewIcon,
  FiPrinter as PrintIcon,
  FiDownload as DownloadIcon
} from 'react-icons/fi';
import { PayslipForm } from '../../components/admin-dashboard/payslip/PayslipForm';
import { PayslipPreview } from '../../components/admin-dashboard/payslip/PayslipPreview';
import axios from 'axios';
import { API_ENDPOINTS } from '../../utils/api';

const getWorkingDaysInMonth = (year, month, schedule) => {
  const date = new Date(year, month, 1);
  let count = 0;
  while (date.getMonth() === month) {
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (schedule[day] && !schedule[day].isLeave) count++;
    date.setDate(date.getDate() + 1);
  }
  return count;
};

const PayslipGenerator = () => {
  const [payslipData, setPayslipData] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [logsRes, schedulesRes] = await Promise.all([
          axios.get(API_ENDPOINTS.getRecentAttendanceLogs, { headers }),
          axios.get(API_ENDPOINTS.getSchedules, { headers })
        ]);

        const logs = logsRes.data;
        const uniqueEmployees = [...new Set(logs.map(log => log.employeeName))];
        setEmployees(uniqueEmployees);

        // Auto-select first employee
        if (uniqueEmployees.length > 0) {
          setSelectedEmployee(uniqueEmployees[0]);
          generatePayslipData(uniqueEmployees[0], logs, schedulesRes.data);
        }
      } catch (err) {
        console.error("Payslip data load failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const generatePayslipData = (employeeName, logs, schedules) => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const filteredLogs = logs.filter(log => {
      const date = new Date(log.timestamp);
      return (
        log.employeeName === employeeName &&
        date.getMonth() === month &&
        date.getFullYear() === year
      );
    });

    const userSchedule = schedules.find(s => s.user?.name === employeeName)?.weeklySchedule || {};

    const uniqueDates = new Set();
    filteredLogs.forEach(log => {
      const dateStr = new Date(log.timestamp).toDateString();
      uniqueDates.add(dateStr);
    });

    const workingDays = getWorkingDaysInMonth(year, month, userSchedule);
    const attendedDays = uniqueDates.size;

    const firstLog = filteredLogs[0] || {};

    setPayslipData({
      company: {
        name: 'Urbancode Edutech Solutions Pvt Ltd',
        address: 'No. 9/29, 5th Street, Kamakoti Nagar, Pallikaranai, Chennai- 600100',
        logo: '/',
      },
      employee: {
        name: employeeName,
        employeeCode: 'UCES/??', // if available dynamically, replace
        designation: firstLog.position || 'N/A',
        location: firstLog.officeName || 'N/A',
        bankName: 'Union Bank of India',
        accountNumber: 'XXXXXXXXXXXX',
        dateOfJoining: firstLog.dateOfJoining, // if available dynamically, replace
        totalWorkingDays: workingDays,
        workingDays: workingDays,
        attended: attendedDays,
        leaves: { personal: 1, sick: 1 },
        leavesTaken: workingDays - attendedDays,
        balanceLeaves: 0
      },
      payPeriod: {
        month: now.toLocaleString('default', { month: 'short' }) + '-' + String(now.getFullYear()).slice(-2),
        year: year
      },
      income: [
        { id: '1', name: 'Basic', amount: 10000 },
        { id: '2', name: 'HRA', amount: 7500 },
        { id: '3', name: 'Other Allowances', amount: 7500 }
      ],
      deductions: [
        { id: '1', name: 'TDS', amount: 0 }
      ]
    });
  };

  const handleEmployeeChange = async (event) => {
    const selected = event.target.value;
    setSelectedEmployee(selected);
    setLoading(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [logsRes, schedulesRes] = await Promise.all([
        axios.get(API_ENDPOINTS.getRecentAttendanceLogs, { headers }),
        axios.get(API_ENDPOINTS.getSchedules, { headers })
      ]);
      generatePayslipData(selected, logsRes.data, schedulesRes.data);
    } catch (err) {
      console.error("Payslip generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    console.log("Download triggered");
    // Implement PDF/Excel download if needed
  };

  if (loading || !payslipData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography mt={2}>Loading Payslip...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography 
          variant="h4" 
          fontWeight="bold"
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Payslip Generator
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create, customize and download professional payslips for your employees
        </Typography>
      </Box>

      <Box mb={4}>
        <TextField
          select
          fullWidth
          label="Select Employee"
          value={selectedEmployee}
          onChange={handleEmployeeChange}
        >
          {employees.map((emp, idx) => (
            <MenuItem key={idx} value={emp}>
              {emp}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Card sx={{
        p: { xs: 2, md: 4 },
        boxShadow: theme.shadows[4],
        borderRadius: 2,
        background: theme.palette.background.paper
      }}>
        <Tabs
          value={tabIndex}
          onChange={(e, newIndex) => setTabIndex(newIndex)}
          variant="fullWidth"
          sx={{
            mb: 3,
            '& .MuiTabs-indicator': { height: 4, borderRadius: 2 }
          }}
        >
          <Tab
            label={isMobile ? '' : "Edit Details"}
            icon={isMobile ? <EditIcon /> : null}
            iconPosition="start"
            sx={{ fontWeight: 600, textTransform: 'none', fontSize: isMobile ? '0.75rem' : '0.875rem' }}
          />
          <Tab
            label={isMobile ? '' : "Preview & Print"}
            icon={isMobile ? <PreviewIcon /> : null}
            iconPosition="start"
            sx={{ fontWeight: 600, textTransform: 'none', fontSize: isMobile ? '0.75rem' : '0.875rem' }}
          />
        </Tabs>

        <Divider sx={{ mb: 3 }} />

        <Box mt={2}>
          {tabIndex === 0 && (
            <PayslipForm
              data={payslipData}
              onChange={setPayslipData}
              onPreview={() => setTabIndex(1)}
            />
          )}
          {tabIndex === 1 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setTabIndex(0)}>
                  Edit Details
                </Button>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload}>
                  Download
                </Button>
                <Button variant="contained" color="secondary" startIcon={<PrintIcon />} onClick={handlePrint}>
                  Print
                </Button>
              </Box>
              <PayslipPreview data={payslipData} />
            </>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default PayslipGenerator;
