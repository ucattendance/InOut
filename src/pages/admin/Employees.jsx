import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Box,
  Chip,
  CircularProgress,
  Paper,
  InputAdornment,
  Divider,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person,
  Schedule,
  AttachMoney,
  Save,
  Search,
  AccessTime,
  BeachAccess
} from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../../utils/api';
import Loader from '../../components/admin-dashboard/common/Loader';
import { toast } from 'react-toastify';



const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EmployeeSchedule = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(API_ENDPOINTS.getSchedules, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Normalize any datetime strings to HH:MM so the time inputs are controlled correctly
        const normalize = (emp) => {
          if (!emp) return emp;
          const ws = emp.weeklySchedule ? { ...emp.weeklySchedule } : {};
          Object.keys(ws).forEach(day => {
            const ds = ws[day] ? { ...ws[day] } : {};
            ['start', 'end'].forEach(k => {
              const v = ds[k];
              if (typeof v === 'string' && v.includes('T')) {
                // try to extract HH:MM from ISO or full datetime
                const date = new Date(v);
                if (!isNaN(date.getTime())) {
                  const hh = String(date.getHours()).padStart(2, '0');
                  const mm = String(date.getMinutes()).padStart(2, '0');
                  ds[k] = `${hh}:${mm}`;
                }
              }
            });
            ws[day] = ds;
          });
          return { ...emp, weeklySchedule: ws };
        };

        setEmployees((res.data || []).map(normalize));
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Update schedule for an employee by id (works even when the list is filtered)
  const handleChange = (empId, day, field, value) => {
    setEmployees(prevEmployees => prevEmployees.map(emp => {
      if (emp._id !== empId) return emp;
      const weeklySchedule = emp.weeklySchedule ? { ...emp.weeklySchedule } : {};
      const daySchedule = weeklySchedule[day] ? { ...weeklySchedule[day] } : {};
      daySchedule[field] = value;
      weeklySchedule[day] = daySchedule;
      return { ...emp, weeklySchedule };
    }));
  };

  const handleSalaryChange = (empId, value) => {
    setEmployees(prev => prev.map(emp => emp._id === empId ? { ...emp, salary: parseFloat(value) || 0 } : emp));
  };

  const saveChanges = async (employee) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(API_ENDPOINTS.putUserSchedule(employee._id), {
        salary: employee.salary,
        weeklySchedule: employee.weeklySchedule,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Saved: Changes saved successfully');
    } catch (err) {
      console.error(err);
      toast.error('Error: Failed to save changes');
    }
  };

  const getDayColor = (day) => {
    const colors = {
      // Monday: '#616161',
      // Tuesday: '#388e3c',
      // Wednesday: '#f57c00',
      // Thursday: '#7b1fa2',
      // Friday: '#c2185b',
      // Saturday: '#d32f2f',
      // Sunday: '#303f9f'
    };
    return colors[day] || 'rgba(0,0,0, 0.6)';
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, fontFamily: ` Montserrat` }}>
      <Box sx={{ mb: 4 }}>
        <h1 className="text-2xl font-bold text-gray-600">Employee Schedule Management</h1>
        <h4 className="text-lg text-gray-600 ">Manage employee schedules and salaries</h4>

      </Box>
      <TextField
        label="Search Employee"
        variant="outlined"
        size="medium"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 4,
          fontFamily: `Montserrat`
        }}
      />


      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {employees
          .filter(emp => emp.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((emp, index) => (
            <Fade in timeout={300 + index * 100} key={emp._id}>
              <Card
                
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    elevation: 8,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
             

                <CardContent sx={{ p: 3 }}>
                  {/* <Box sx={{ mb: 3 }}>
                    <TextField
                      label="Basic pay"
                      type="number"
                      value={emp.salary || ''}
                      onChange={(e) => handleSalaryChange(emp._id, e.target.value)}
                      variant="outlined"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiInputBase-input': {
                          fontFamily: 'Montserrat',
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: 'Montserrat',
                        },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box> */}

                  <Divider sx={{ my: 3 }}>
<Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: 'Montserrat', color: '#616161' }}>
                        <Schedule/> Schedule of {emp.user?.name || 'Unnamed Employee'}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ opacity: 0.9, color: '#616161' }}>
                        Employee ID: {emp._id?.slice(-6) || 'N/A'} | Role: {emp.user?.position} | {emp.user?.company}
                      </Typography>
                    </Box>
                    
                  </Divider>

                  <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                    {/* Header row */}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
                        gap: 2,
                        alignItems: 'center',
                        mb: 1,
                        px: 1
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontFamily: 'Montserrat', color: 'text.secondary' }}>Day</Typography>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'Montserrat', color: 'text.secondary' }}>Start</Typography>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'Montserrat', color: 'text.secondary' }}>End</Typography>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'Montserrat', color: 'text.secondary' }}>Leave</Typography>
                    </Box>

                    {/* Rows: one per day */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {days.map((day) => {
                        const daySchedule = emp.weeklySchedule?.[day] || {};
                        const color = getDayColor(day);
                        return (
                          <Box
                            key={day}
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr 1fr 1fr',
                              gap: 2,
                              alignItems: 'center',
                              py: 1,
                              px: 1,
                              borderTop: '1px solid rgba(0,0,0,0.04)'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                              <Typography sx={{ fontFamily: 'Montserrat', color }}>{day}</Typography>
                            </Box>

                            <TextField
                              label="Start"
                              type="time"
                              value={daySchedule.start || ''}
                              onChange={(e) => handleChange(emp._id, day, 'start', e.target.value)}
                              variant="outlined"
                              size="small"
                              fullWidth
                              sx={{
                                '& .MuiInputBase-input': { fontFamily: 'Montserrat' },
                                '& .MuiInputLabel-root': { fontFamily: 'Montserrat' }
                              }}
                            />

                            <TextField
                              label="End"
                              type="time"
                              value={daySchedule.end || ''}
                              onChange={(e) => handleChange(emp._id, day, 'end', e.target.value)}
                              variant="outlined"
                              size="small"
                              fullWidth
                              sx={{
                                '& .MuiInputBase-input': { fontFamily: 'Montserrat' },
                                '& .MuiInputLabel-root': { fontFamily: 'Montserrat' }
                              }}
                            />

                            <FormControlLabel
                              control={
                                <Switch
                                  checked={daySchedule.isLeave || false}
                                  onChange={(e) => handleChange(emp._id, day, 'isLeave', e.target.checked)}
                                  color="primary"
                                />
                              }
                              label=""
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </Paper>
                </CardContent>

                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    onClick={() => saveChanges(emp)}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      background: 'linear-gradient(45deg, #616161, #797b7dff)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #616161, #85888aff)',
                      },
                      boxShadow: '0 4px 15px rgba(42, 32, 152, 0.3)',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >
                    Save Changes
                  </Button>
                </CardActions>
              </Card>
            </Fade>
          ))}
      </Box>

      {employees.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Typography variant="h5" color="text.secondary" sx={{ fontFamily: 'Montserrat' }} gutterBottom>
            No employees found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontFamily: 'Montserrat' }}>
            Add employees to start managing their schedules
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default EmployeeSchedule;