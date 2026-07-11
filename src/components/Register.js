import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../utils/api';
import { BRANCH_OPTIONS } from '../utils/branches';
import {
  FiUser, FiMail, FiLock, FiBriefcase, FiHome, FiCalendar, FiPhone, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

// Single-file multi-step registration component with small subcomponents
// Usage: import RegisterMultiStep from './RegisterMultiStep' and put <RegisterMultiStep /> in a route/page

export default function RegisterMultiStep() {
  const initialForm = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    position: '',
    company: '',
    salary: '',
    department: '',
    qualification: '',
    dateOfJoining: '',
    rolesAndResponsibility: '',
    skills: '',
    profilePic: '',
    bloodGroup: '',
    address: '',
    branch: '',
    dateOfBirth: '',

    // bank details
    bankDetails: {
      bankingName: '',
      bankAccountNumber: '',
      ifscCode: '',
      upiId: ''
    },
    // schedule: keep same shape as before
    schedule: {
      Monday: { start: '10:00', end: '18:00', isLeave: false },
      Tuesday: { start: '10:00', end: '18:00', isLeave: false },
      Wednesday: { start: '10:00', end: '18:00', isLeave: false },
      Thursday: { start: '10:00', end: '18:00', isLeave: false },
      Friday: { start: '10:00', end: '18:00', isLeave: false },
      Saturday: { start: '10:00', end: '18:00', isLeave: false },
      Sunday: { start: '', end: '', isLeave: true }
    }
  };

  const [formData, setFormData] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const stepsCount = 5; // Personal, Job, Schedule, Bank, Review

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, [name]: value } }));
  };

  const handleScheduleChange = (day, field, value) => {
    setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, [day]: { ...prev.schedule[day], [field]: value } } }));
  };

  const handleScheduleToggle = (day, checked) => {
    setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, [day]: { ...prev.schedule[day], isLeave: checked } } }));
  };

  const next = () => setStep(s => Math.min(s + 1, stepsCount));
  const back = () => setStep(s => Math.max(s - 1, 1));

  const validateStep = () => {
    // Basic validation per-step
    if (step === 1) {
      const { name, email, password, phone, branch } = formData;
      if (!name || !email || !password || !phone || !branch) return 'Please fill personal details (name, email, password, phone, branch)';
      if (formData.password !== formData.confirmPassword) {
  return 'Passwords do not match';
}
    }
    if (step === 2) {
      const { position, company } = formData;
      if (!position || !company) return 'Please provide position and company';
    }
    // other steps have optional fields
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      toast.warning(`Validation: ${err}`);
      return;
    }
    next();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep();
    if (err) {
      toast.warning(`Validation: ${err}`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare payload - convert comma lists into arrays
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        position: formData.position,
        company: formData.company,
        salary: formData.salary ? Number(formData.salary) : 0,
        department: formData.department || formData.branch || '',
        qualification: formData.qualification,
        dateOfJoining: formData.dateOfJoining || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        branch: formData.branch,
        rolesAndResponsibility: formData.rolesAndResponsibility ? formData.rolesAndResponsibility.split(',').map(s => s.trim()).filter(Boolean) : [],
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        profilePic: formData.profilePic,
        bankDetails: {
          ...formData.bankDetails,
          officeBranch: formData.branch,
        },
        schedule: formData.schedule
      };

      console.log('Payload:', payload);

      await axios.post(API_ENDPOINTS.register, payload);

      toast.success('Submitted: Registration submitted and is pending admin approval');
      setFormData(initialForm);
      setStep(1);

    } catch (error) {
      console.error(error);
      toast.error(`Error: ${error.response?.data?.error || 'Failed to submit registration'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4ff] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white/80 border border-[#e0ecff] shadow-lg rounded-2xl p-8">
        <Header step={step} stepsCount={stepsCount} />

        <form onSubmit={handleSubmit} className="mt-6">
          {step === 1 && (
            <PersonalDetails formData={formData} handleChange={handleChange} showPassword={showPassword} setShowPassword={setShowPassword} />
          )}

          {step === 2 && (
            <JobDetails formData={formData} handleChange={handleChange} />
          )}

          {step === 3 && (
            <ScheduleStep schedule={formData.schedule} onChange={handleScheduleChange} onToggle={handleScheduleToggle} />
          )}

          {step === 4 && (
            <BankDetails bankDetails={formData.bankDetails} handleBankChange={handleBankChange} handleChange={handleChange} formData={formData} />
          )}

          {step === 5 && (
            <Review formData={formData} />
          )}

          <div className="flex justify-between mt-6">
            <button type="button" onClick={back} disabled={step === 1} className={`inline-flex items-center px-4 py-2 rounded-md border ${step === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}>
              <FiChevronLeft className="mr-2" /> Back
            </button>

            <div className="flex gap-2">
              {step < stepsCount && (
                <button type="button" onClick={handleNext} className="inline-flex items-center px-4 py-2 bg-[#159C8E] text-white rounded-md hover:bg-[#0F7A6E]">
                  Next <FiChevronRight className="ml-2" />
                </button>
              )}

              {step === stepsCount && (
                <button type="submit" disabled={isSubmitting} className={`inline-flex items-center px-4 py-2 bg-[#159C8E] text-white rounded-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Header({ step, stepsCount }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#2c2e3e]">Multi-step Registration</h2>
      <p className="text-sm text-gray-600 mt-1">Step {step} of {stepsCount}</p>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-3">
        <div className="h-2 bg-[#159C8E]" style={{ width: `${(step / stepsCount) * 100}%` }} />
      </div>
    </div>
  );
}

function PersonalDetails({ formData, handleChange, showPassword, setShowPassword }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} icon={<FiUser />} />
      <Input label="Email" name="email" value={formData.email} onChange={handleChange} type="email" icon={<FiMail />} />

      <div>
        <label className="block text-sm font-medium text-[#2c2e3e] mb-1">Password</label>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required placeholder="••••••" className="block w-full rounded-md border border-gray-300 px-3 py-2" />
          <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-2 top-2 text-sm text-[#159C8E]">{showPassword ? 'Hide' : 'Show'}</button>
        </div>
      </div>

      <Input label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type={showPassword ? 'text' : 'password'} icon={<FiLock />} />
      <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} icon={<FiPhone />} />
      <Input
        label="Blood Group"
        name="bloodGroup"
        value={formData.bloodGroup}
        onChange={handleChange}
      />

      <div className="max-w-xs">
        <label className="block text-sm font-medium text-[#2c2e3e] mb-1 flex items-center">
          <FiHome className="mr-2 text-[#159C8E]" /> Branch *
        </label>
        <select
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          required
          className="block w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 bg-white"
        >
          <option value="">Select branch</option>
          {BRANCH_OPTIONS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange} />
      <div>
        <label className="block text-sm font-medium text-[#2c2e3e] mb-1">Date of Birth</label>
        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2" />
      </div>

    </div>
  );
}

function JobDetails({ formData, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Position" name="position" value={formData.position} onChange={handleChange} icon={<FiBriefcase />} />
      <div>
        <label className="block text-sm font-medium text-[#2c2e3e] mb-1 flex items-center">
          <FiHome className="mr-2 text-[#159C8E]" /> Company
        </label>
        <select name="company" value={formData.company} onChange={handleChange} required className="block w-full rounded-md border border-gray-300 px-3 py-2">
          <option value="">Select Company</option>
          <option value="Jobzenter">Jobzenter</option>
          <option value="Urbancode">Urbancode</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <Input label="Salary (optional)" name="salary" value={formData.salary} onChange={handleChange} type="number" />
      <Input label="Department" name="department" value={formData.department} onChange={handleChange} />
      <Input label="Qualification" name="qualification" value={formData.qualification} onChange={handleChange} />
      <Input label="Date of Joining" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} type="date" />
      <Input label="Roles & Responsibilities (comma separated)" name="rolesAndResponsibility" value={formData.rolesAndResponsibility} onChange={handleChange} />
      <Input label="Skills (comma separated)" name="skills" value={formData.skills} onChange={handleChange} />
    </div>
  );
}

function ScheduleStep({ schedule, onChange, onToggle }) {
  const days = Object.keys(schedule);
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Set weekly schedule. Toggle day off for leaves.</p>
      {days.map(day => (
        <div key={day} className={`p-3 rounded-md border ${schedule[day].isLeave ? 'bg-gray-100' : 'bg-green-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={schedule[day].isLeave} onChange={(e) => onToggle(day, e.target.checked)} />
              <span className="font-medium">{day}</span>
            </label>
            <span className="text-xs text-gray-600">{schedule[day].isLeave ? 'Day Off' : 'Working'}</span>
          </div>
          {!schedule[day].isLeave && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start</label>
                <input type="time" value={schedule[day].start} onChange={(e) => onChange(day, 'start', e.target.value)} className="w-full rounded-md border px-2 py-1" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End</label>
                <input type="time" value={schedule[day].end} onChange={(e) => onChange(day, 'end', e.target.value)} className="w-full rounded-md border px-2 py-1" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BankDetails({ bankDetails, handleBankChange, handleChange, formData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Banking Name" name="bankingName" value={bankDetails.bankingName} onChange={handleBankChange} />
      <Input label="Account Number" name="bankAccountNumber" value={bankDetails.bankAccountNumber} onChange={handleBankChange} />
      <Input label="IFSC Code" name="ifscCode" value={bankDetails.ifscCode} onChange={handleBankChange} />
      <Input label="UPI ID" name="upiId" value={bankDetails.upiId} onChange={handleBankChange} />
      {/* <Input label="Profile Pic URL" name="profilePic" value={formData.profilePic} onChange={handleChange} /> */}
    </div>
  );
}

function Review({ formData }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Review details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Stat label="Name" value={formData.name} />
        <Stat label="Email" value={formData.email} />
        <Stat label="Phone" value={formData.phone} />
        <Stat label="Branch" value={formData.branch || '-'} />
        <Stat label="Blood Group" value={formData.bloodGroup || '-'} />
        <Stat label="Address" value={formData.address || '-'} />

        <Stat label="Position" value={formData.position} />
        <Stat label="Company" value={formData.company} />
        <Stat label="Salary" value={formData.salary || '-'} />
        <Stat label="Department" value={formData.department || '-'} />
        <Stat label="Qualification" value={formData.qualification || '-'} />
        <Stat label="Date Of Joining" value={formData.dateOfJoining || '-'} />
        <Stat label="Roles" value={formData.rolesAndResponsibility || '-'} />
        <Stat label="Skills" value={formData.skills || '-'} />
        <div className="col-span-1 md:col-span-2 p-3 border rounded-md">
          <h4 className="font-medium">Bank Details</h4>
          <p className="text-sm">Bank: {formData.bankDetails.bankingName || '-'}</p>
          <p className="text-sm">Account: {formData.bankDetails.bankAccountNumber || '-'}</p>
          <p className="text-sm">IFSC: {formData.bankDetails.ifscCode || '-'}</p>
          <p className="text-sm">UPI: {formData.bankDetails.upiId || '-'}</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-2 border rounded-md">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium text-sm">{value}</div>
    </div>
  );
}

function Input({ label, name, value, onChange, type = 'text', icon }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2c2e3e] mb-1 flex items-center">
        {icon && <span className="mr-2 text-[#159C8E]">{icon}</span>}
        {label}
      </label>
      <input type={type} name={name} value={value} onChange={onChange} className="block w-full rounded-md border border-gray-300 px-3 py-2" />
    </div>
  );
}
