import dayjs from "dayjs";
import { rupeesInWords } from "./numberToWords";

const DEFAULT_COMPANY_NAME = "Urbancode Edutech Solutions Pvt Ltd";

const COMPANY_INFO = {
  "urbancode edutech solutions pvt ltd": {
    cin: "U46512TN2025PTC175901",
    gstin: "33AADCU7262Q1ZR",
    address: "9/29, 5th Street Kamakoti Nagar, Pallikaranai, Chennai - 600100",
    email: "admin@urbancode.in",
    website: "urbancode.in",
    phone: "98787 98797",
  },
};

function normalizeItems(items) {
  if (Array.isArray(items)) {
    return items
      .filter((i) => i && i.label)
      .map((i) => ({ label: i.label, amount: Number(i.amount || 0) }));
  }
  return Object.entries(items || {}).map(([label, amount]) => ({
    label,
    amount: Number(amount || 0),
  }));
}

function payPeriodLabel(monthLabel) {
  const start = dayjs(monthLabel, "MMMM YYYY");
  if (!start.isValid()) return "";
  const end = start.endOf("month");
  return `${start.format("DD-MMM-YYYY").toUpperCase()} to ${end.format("DD-MMM-YYYY").toUpperCase()}`;
}

export function buildPayslipViewModel(employeeDetails = {}, incomes = [], deductions = [], totalIncome = 0, totalDeductions = 0, netPay = 0) {
  const earnings = normalizeItems(incomes);
  const deds = normalizeItems(deductions);

  const companyName = employeeDetails.company?.toLowerCase() === "jobzenter"
    ? "Jobzenter Placement Solutions"
    : DEFAULT_COMPANY_NAME;

  const companyInfo = COMPANY_INFO[companyName.toLowerCase()] || {};

  const daysInMonth = Number(employeeDetails.totalDays || 0);
  const lopDays = Number(employeeDetails.absentDays || 0);
  const paidDays = Math.max(daysInMonth - lopDays, 0);
  const calculatedGrossPay = Number(totalIncome || 0);
  const calculatedPaidGrossPay = daysInMonth > 0 ? (calculatedGrossPay / daysInMonth) * paidDays : calculatedGrossPay;

  const grossPay = employeeDetails.grossPay !== "" && employeeDetails.grossPay !== undefined
    ? Number(employeeDetails.grossPay)
    : calculatedGrossPay;

  const paidGrossPay = employeeDetails.paidGrossPay !== "" && employeeDetails.paidGrossPay !== undefined
    ? Number(employeeDetails.paidGrossPay)
    : calculatedPaidGrossPay;

  const monthLabel = employeeDetails.month || "";
  const netPayNum = Number(netPay || 0);

  return {
    companyName,
    cin: companyInfo.cin || "",
    gstin: companyInfo.gstin || "",
    address: companyInfo.address || "",
    email: companyInfo.email || "",
    website: companyInfo.website || "",
    phone: companyInfo.phone || "",

    tan: employeeDetails.tan || "",
    pfNumber: employeeDetails.pfNumber || "",
    esiRegNumber: employeeDetails.esiRegNumber || "",
    mobile: employeeDetails.mobile || "",

    payPeriodLabel: payPeriodLabel(monthLabel),
    monthLabel,

    payslipReference:
      employeeDetails.payslipReference ||
      (employeeDetails.employeeId
        ? `PS-${employeeDetails.employeeId}-${monthLabel.replace(/\s+/g, "")}`
        : ""),
    generatedOn: employeeDetails.generatedDate
      ? dayjs(employeeDetails.generatedDate).format("DD-MMM-YYYY")
      : dayjs().format("DD-MMM-YYYY"),

    name: employeeDetails.name || "",
    empId: employeeDetails.employeeId || "",
    empGrade: employeeDetails.empGrade || "",

    pan: employeeDetails.pan || "",
    uan: employeeDetails.uan || "",
    esi: employeeDetails.esiNumber || "",

    bankName: employeeDetails.bankAccountName || "",
    bankAccNo: employeeDetails.bankAccountNumber || "",
    ifsc: employeeDetails.ifsc || "",

    daysInMonth,
    lopDays,
    paidDays,

    ctc: employeeDetails.ctc || "",
    grossPay: grossPay.toFixed(2),
    paidGrossPay: paidGrossPay.toFixed(2),

    department: employeeDetails.department || "",
    designation: employeeDetails.designation || "",

    joiningDate: employeeDetails.dateOfJoining
      ? dayjs(employeeDetails.dateOfJoining).format("DD-MMM-YYYY")
      : "",
    workingLocation: employeeDetails.workingLocation || "",

    earnings,
    deductions: deds,
    totalEarnings: Number(totalIncome || 0),
    totalDeductions: Number(totalDeductions || 0),
    netPay: netPayNum,
    netPayWords: rupeesInWords(netPayNum),
    remittedOn: employeeDetails.remittedOn || "",
  };
}
