import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { buildPayslipViewModel } from "../../utils/payslipViewModel";
import { downloadPayslipPdf } from "../../utils/payslipPdf";
import {
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  MenuItem,
  Grid,
  Box,
  Typography,
  Chip,
  IconButton,
  CircularProgress
} from "@mui/material";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiCalendar
} from "react-icons/fi";
import { API_ENDPOINTS } from "../../utils/api";
import Loader from "../../components/admin-dashboard/common/Loader";

const PayslipList = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(API_ENDPOINTS.getPayslips, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayslips(data);
    } catch (err) {
      console.error("Error fetching payslips:", err);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique months and years for filters
  const { months, years } = useMemo(() => {
    const monthSet = new Set();
    const yearSet = new Set();
    
    payslips.forEach(payslip => {
      if (payslip.month) {
        // Extract year from month string (assuming format like "January 2023")
        const year = payslip.month.split(" ")[1];
        if (year) yearSet.add(year);
        monthSet.add(payslip.month);
      }
    });
    
    return {
      months: Array.from(monthSet).sort((a, b) => {
        // Sort by date, most recent first
        return new Date(b) - new Date(a);
      }),
      years: Array.from(yearSet).sort((a, b) => b - a) // Sort years descending
    };
  }, [payslips]);

  // Filter and search payslips
  const filteredPayslips = useMemo(() => {
    return payslips.filter(payslip => {
      // Search filter
      const matchesSearch = 
        payslip.employeeDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payslip.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Month filter
      const matchesMonth = monthFilter === "all" || payslip.month === monthFilter;
      
      // Year filter (extract year from month string)
      const payslipYear = payslip.month?.split(" ")[1];
      const matchesYear = yearFilter === "all" || payslipYear === yearFilter;
      
      return matchesSearch && matchesMonth && matchesYear;
    });
  }, [payslips, searchTerm, monthFilter, yearFilter]);

  // Group payslips by month
  const payslipsByMonth = useMemo(() => {
    const grouped = {};
    
    filteredPayslips.forEach(payslip => {
      if (!payslip.month) return;
      
      if (!grouped[payslip.month]) {
        grouped[payslip.month] = [];
      }
      
      grouped[payslip.month].push(payslip);
    });
    
    return grouped;
  }, [filteredPayslips]);

  const generatePDF = async (payslip) => {
    const {
      employeeDetails,
      incomes,
      deductions,
      totalIncome,
      totalDeductions,
      netPay,
      month,
    } = payslip;

    const viewModel = buildPayslipViewModel(
      { ...employeeDetails, employeeId: payslip.employeeId, month },
      incomes,
      deductions,
      totalIncome,
      totalDeductions,
      netPay
    );

    const fileName = `Payslip_${(employeeDetails?.name || "Employee").replace(/\s+/g, "_")}_${(month || "").replace(/\s+/g, "_")}.pdf`;
    await downloadPayslipPdf(viewModel, fileName);
  };

  if (loading) {
    return (
      <Loader/>
      // <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      //   <CircularProgress />
      // </Box>
    );
  }

  return (
    <div className="p-4">
      {/* Header with title and filters */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h4" fontWeight="bold" color="#16192aff">
          <span className="text-gray-600">Employee Payslips</span>
        </Typography>
      </Box>

      {/* Filter and Search Section */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              variant="outlined"
              label="Filter by Month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiCalendar />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="all">All Months</MenuItem>
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              variant="outlined"
              label="Filter by Year"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiFilter />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="all">All Years</MenuItem>
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Chip 
              label={`${filteredPayslips.length} payslips`} 
              color="primary" 
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Card>

      {/* Payslips List */}
      {Object.keys(payslipsByMonth).length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No payslips found
          </Typography>
        </Box>
      ) : (
        Object.entries(payslipsByMonth).map(([month, monthPayslips]) => (
          <Box key={month} mb={4}>
            {/* Month Heading */}
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: 2, 
                p: 1, 
                backgroundColor: '#616161', 
                color: 'white', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FiCalendar style={{ marginRight: 8 }} />
              {month}
            </Typography>
            
            <Grid container spacing={3}>
              {monthPayslips.map((payslip) => (
                <Grid item xs={12} md={6} key={payslip._id}>
                  <Card className="shadow-lg rounded-xl p-4 h-full">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Box>
                          <Typography variant="h6" component="h3" color="textSecondary" fontWeight="bold">
                            {payslip.employeeDetails?.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            ID: {payslip.employeeId}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Dept: {payslip.employeeDetails?.department}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`₹${payslip.netPay?.toFixed(2)}`} 
                          color="success" 
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      
                      <Box mt={2}>
                        <Button
                          variant="contained"
                          color=""
                          startIcon={<FiDownload />}
                          onClick={() => generatePDF(payslip)}
                          fullWidth
                          sx={{ borderRadius: 2 }}
                        >
                          Download Payslip
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}
    </div>
  );
};

export default PayslipList;