import React from "react";
import { Button } from "@mui/material";
import axios from 'axios';
import { API_ENDPOINTS } from "../../../utils/api";
import { buildPayslipViewModel } from "../../../utils/payslipViewModel";
import { downloadPayslipPdf } from "../../../utils/payslipPdf";

const PayslipDownloader = ({ employeeDetails, incomes, deductions, totalIncome, totalDeductions, netPay }) => {

  const handleDownload = async () => {
     try {
   const payload = {
 userId: employeeDetails?.userId, // MongoDB _id of user
        employeeId: employeeDetails?.employeeId || "", // Employee code

        employeeDetails: {
          name: employeeDetails?.name || "",
          designation: employeeDetails?.designation || "",
          department: employeeDetails?.department || "",
          company: employeeDetails?.company || "",
          bankAccountName: employeeDetails?.bankAccountName || "",
          bankAccountNumber: employeeDetails?.bankAccountNumber || "",
          dateOfJoining: employeeDetails?.dateOfJoining || null,
        },

        attendanceSummary: {
          totalDays: employeeDetails?.totalDays || 0,
          workingDays: employeeDetails?.workingDays || 0,
          presentDays: employeeDetails?.presentDays || 0,
          absentDays: employeeDetails?.absentDays || 0,
          leaveDays: employeeDetails?.leaveDays || 0,
          lateDays: employeeDetails?.lateDays || 0,
          halfDays: employeeDetails?.halfDays || 0,
          lopDays: employeeDetails?.lopDays || 0,
        },

        incomes:
          incomes?.reduce(
            (acc, i) => ({ ...acc, [i.label]: i.amount }),
            {}
          ) || {},

        deductions:
          deductions?.reduce(
            (acc, d) => ({ ...acc, [d.label]: d.amount }),
            {}
          ) || {},

        totalIncome: totalIncome || 0,
        totalDeductions: totalDeductions || 0,
        netPay: netPay || 0,

        month: employeeDetails?.month || "",
        year: new Date().getFullYear(),
      };

      console.log("Final Payload:", payload);

      const token = localStorage.getItem("token");
      const { data } = await axios.post(API_ENDPOINTS.createPayslip, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Payslip saved:", data);

      const viewModel = buildPayslipViewModel(
        employeeDetails,
        incomes,
        deductions,
        totalIncome,
        totalDeductions,
        netPay
      );

      const fileName = `Payslip_${(employeeDetails.name || "Employee").replace(/\s+/g, "_")}_${(employeeDetails.month || "").replace(/\s+/g, "_")}.pdf`;
      await downloadPayslipPdf(viewModel, fileName);
    } catch (err) {
      console.error("Error saving or downloading payslip:", err);
    }
  };

  return (
    <Button variant="contained" color="primary" onClick={handleDownload}>
      Generate Payslip
    </Button>
  );
};

export default PayslipDownloader;
