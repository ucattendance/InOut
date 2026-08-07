import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Box,
  Divider,
  useTheme,
  InputAdornment
} from '@mui/material';
import { FiPlus, FiTrash2, FiBriefcase, FiUser, FiCalendar, FiDollarSign, FiMinusCircle, FiXCircle } from 'react-icons/fi';

export const PayslipForm = ({ data, onChange, onPreview }) => {
  const theme = useTheme();

  const updateCompany = (field, value) => {
    onChange({
      ...data,
      company: { ...data.company, [field]: value }
    });
  };

  const updateEmployee = (field, value) => {
    onChange({
      ...data,
      employee: { ...data.employee, [field]: value }
    });
  };

  const updateEmployeeLeaves = (leaveType, value) => {
    onChange({
      ...data,
      employee: { 
        ...data.employee, 
        leaves: {
          ...data.employee.leaves,
          [leaveType]: parseInt(value) || 0
        }
      }
    });
  };

  const updatePayPeriod = (field, value) => {
    onChange({
      ...data,
      payPeriod: { ...data.payPeriod, [field]: value }
    });
  };

  const addIncomeItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: '',
      amount: 0
    };
    onChange({ ...data, income: [...data.income, newItem] });
  };

  const updateIncomeItem = (id, field, value) => {
    onChange({
      ...data,
      income: data.income.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const removeIncomeItem = (id) => {
    onChange({
      ...data,
      income: data.income.filter(item => item.id !== id)
    });
  };

  const addDeductionItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: '',
      amount: 0
    };
    onChange({ ...data, deductions: [...data.deductions, newItem] });
  };

  const updateDeductionItem = (id, field, value) => {
    onChange({
      ...data,
      deductions: data.deductions.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const removeDeductionItem = (id) => {
    onChange({
      ...data,
      deductions: data.deductions.filter(item => item.id !== id)
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      {/* Company Info */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardHeader 
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <FiBriefcase color="#1976d2" size={22} />
              <Typography variant="h6" color="primary">Company Information</Typography>
            </Box>
          } 
          sx={{ 
            backgroundColor: theme.palette.mode === 'light' ? 
              theme.palette.grey[100] : theme.palette.grey[800],
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        />
        <CardContent>
          <Grid >
            <Grid item xs={12} md={6} sx={{ mb: 2 }}>
              <TextField
                label="Company Name"
                fullWidth
                variant="outlined"
                
                value={data.company.name}
                onChange={(e) => updateCompany('name', e.target.value)}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Address"
                fullWidth
                variant="outlined"
                size="small"
                multiline
                rows={2}
                value={data.company.address}
                onChange={(e) => updateCompany('address', e.target.value)}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Employee Info */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardHeader 
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <FiUser color="#1976d2" size={22} />
              <Typography variant="h6" color="primary">Employee Information</Typography>
            </Box>
          }
          sx={{ 
            backgroundColor: theme.palette.mode === 'light' ? 
              theme.palette.grey[100] : theme.palette.grey[800],
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        />
        <CardContent>
          <Grid container spacing={3}>
            {[
              ['name', 'Employee Name'],
              ['employeeCode', 'Employee Code'],
              ['designation', 'Designation'],
              ['location', 'Location'],
              ['bankName', 'Bank Name'],
              ['accountNumber', 'Account Number'],
              ['dateOfJoining', 'Date of Joining'],
              ['totalWorkingDays', 'Total Working Days', 'number'],

              ['attended', 'Days Attended', 'number'],
              ['leavesTaken', 'Leaves Taken', 'number'],
              ['balanceLeaves', 'Balance Leaves', 'number']
            ].map(([field, label, type = 'text']) => (
              <Grid item xs={12} md={6} key={field}>
                <TextField
                  label={label}
                  fullWidth
                  variant="outlined"
                  size="small"
                  type={type}
                  value={data.employee[field] || ''}
                  onChange={(e) => updateEmployee(field, type === 'number' ? 
                    (parseInt(e.target.value) || 0) : e.target.value)}
                  InputProps={{
                    sx: { borderRadius: 1 },
                    ...(type === 'number' ? { inputProps: { min: 0 } } : {})
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Leaves Information */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardHeader 
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <FiXCircle color="#1976d2" size={22} />
              <Typography variant="h6" color="primary">Leaves Information</Typography>
            </Box>
          }
          sx={{ 
            backgroundColor: theme.palette.mode === 'light' ? 
              theme.palette.grey[100] : theme.palette.grey[800],
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Personal Leaves"
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                value={data.employee.leaves.personal || 0}
                onChange={(e) => updateEmployeeLeaves('personal', e.target.value)}
                InputProps={{
                  sx: { borderRadius: 1 },
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Sick Leaves"
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                value={data.employee.leaves.sick || 0}
                onChange={(e) => updateEmployeeLeaves('sick', e.target.value)}
                InputProps={{
                  sx: { borderRadius: 1 },
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Pay Period */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardHeader 
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <FiCalendar color="#1976d2" size={22} />
              <Typography variant="h6" color="primary">Pay Period</Typography>
            </Box>
          }
          sx={{ 
            backgroundColor: theme.palette.mode === 'light' ? 
              theme.palette.grey[100] : theme.palette.grey[800],
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Month"
                fullWidth
                variant="outlined"
                size="small"
                value={data.payPeriod.month}
                onChange={(e) => updatePayPeriod('month', e.target.value)}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Year"
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                value={data.payPeriod.year}
                onChange={(e) => updatePayPeriod('year', parseInt(e.target.value) || 2025)}
                InputProps={{
                  sx: { borderRadius: 1 },
                  inputProps: { min: 2000, max: 2100 }
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Income */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <FiDollarSign color="#1976d2" size={22} />
              <Typography variant="h6" color="primary">Income</Typography>
            </Box>
          }
          action={
            <Button 
              startIcon={<FiPlus />} 
              onClick={addIncomeItem} 
              variant="contained"
              size="small"
              sx={{ borderRadius: 1 }}
            >
              Add Income
            </Button>
          }
          sx={{ 
            backgroundColor: theme.palette.mode === 'light' ? 
              theme.palette.grey[100] : theme.palette.grey[800],
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        />
        <CardContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {data.income.map((item) => (
              <Box key={item.id} sx={{ 
                p: 2, 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: theme.palette.mode === 'light' ? 
                  theme.palette.grey[50] : theme.palette.grey[900]
              }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Particulars"
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={item.name}
                      onChange={(e) => updateIncomeItem(item.id, 'name', e.target.value)}
                      InputProps={{
                        sx: { borderRadius: 1 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Amount"
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="number"
                      value={item.amount}
                      onChange={(e) => updateIncomeItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                      InputProps={{
                        sx: { borderRadius: 1 },
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        inputProps: { min: 0, step: 100 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ textAlign: 'right' }}>
                    <IconButton 
                      color="error" 
                      onClick={() => removeIncomeItem(item.id)}
                      sx={{ 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <FiTrash2 size={18} />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Deductions */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <FiMinusCircle color="#1976d2" size={22} />
              <Typography variant="h6" color="primary">Deductions</Typography>
            </Box>
          }
          action={
            <Button 
              startIcon={<FiPlus />} 
              onClick={addDeductionItem} 
              variant="contained"
              size="small"
              sx={{ borderRadius: 1 }}
            >
              Add Deduction
            </Button>
          }
          sx={{ 
            backgroundColor: theme.palette.mode === 'light' ? 
              theme.palette.grey[100] : theme.palette.grey[800],
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        />
        <CardContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {data.deductions.map((item) => (
              <Box key={item.id} sx={{ 
                p: 2, 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: theme.palette.mode === 'light' ? 
                  theme.palette.grey[50] : theme.palette.grey[900]
              }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Particulars"
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={item.name}
                      onChange={(e) => updateDeductionItem(item.id, 'name', e.target.value)}
                      InputProps={{
                        sx: { borderRadius: 1 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Amount"
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="number"
                      value={item.amount}
                      onChange={(e) => updateDeductionItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                      InputProps={{
                        sx: { borderRadius: 1 },
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        inputProps: { min: 0, step: 100 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ textAlign: 'right' }}>
                    <IconButton 
                      color="error" 
                      onClick={() => removeDeductionItem(item.id)}
                      sx={{ 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <FiTrash2 size={18} />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
        <Button 
          variant="outlined" 
          sx={{ borderRadius: 1 }}
          onClick={() => {
            // Reset form logic if needed
          }}
        >
          Reset
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          sx={{ borderRadius: 1 }}
          onClick={onPreview}
        >
          Preview Payslip
        </Button>
      </Box>
    </Box>
  );
};