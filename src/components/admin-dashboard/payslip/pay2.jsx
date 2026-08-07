import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export const PayslipForm = ({ data, onChange }) => {
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
    onChange({
      ...data,
      income: [...data.income, newItem]
    });
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
    onChange({
      ...data,
      deductions: [...data.deductions, newItem]
    });
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
    <div className="space-y-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={data.company.name}
              onChange={(e) => updateCompany('name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="company-address">Address</Label>
            <Input
              id="company-address"
              value={data.company.address}
              onChange={(e) => updateCompany('address', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Employee Information */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="employee-name">Employee Name</Label>
            <Input
              id="employee-name"
              value={data.employee.name}
              onChange={(e) => updateEmployee('name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="employee-code">Employee Code</Label>
            <Input
              id="employee-code"
              value={data.employee.employeeCode}
              onChange={(e) => updateEmployee('employeeCode', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              value={data.employee.designation}
              onChange={(e) => updateEmployee('designation', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={data.employee.location}
              onChange={(e) => updateEmployee('location', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="bank-name">Bank Name</Label>
            <Input
              id="bank-name"
              value={data.employee.bankName}
              onChange={(e) => updateEmployee('bankName', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="account-number">Account Number</Label>
            <Input
              id="account-number"
              value={data.employee.accountNumber}
              onChange={(e) => updateEmployee('accountNumber', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="date-of-joining">Date of Joining</Label>
            <Input
              id="date-of-joining"
              value={data.employee.dateOfJoining}
              onChange={(e) => updateEmployee('dateOfJoining', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="total-working-days">Total Working Days</Label>
            <Input
              id="total-working-days"
              type="number"
              value={data.employee.totalWorkingDays}
              onChange={(e) =>
                updateEmployee('totalWorkingDays', parseInt(e.target.value) || 0)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Pay Period */}
      <Card>
        <CardHeader>
          <CardTitle>Pay Period</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              value={data.payPeriod.month}
              onChange={(e) => updatePayPeriod('month', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={data.payPeriod.year}
              onChange={(e) =>
                updatePayPeriod('year', parseInt(e.target.value) || 2025)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Income Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Income</CardTitle>
          <Button onClick={addIncomeItem} size="sm" variant="outline">
            <FiPlus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.income.map((item) => (
            <div key={item.id} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Particulars</Label>
                <Input
                  value={item.name}
                  onChange={(e) => updateIncomeItem(item.id, 'name', e.target.value)}
                />
              </div>
              <div className="w-32">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={item.amount}
                  onChange={(e) =>
                    updateIncomeItem(item.id, 'amount', parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <Button
                onClick={() => removeIncomeItem(item.id)}
                size="sm"
                variant="destructive"
              >
                <FiTrash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Deduction Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Deductions</CardTitle>
          <Button onClick={addDeductionItem} size="sm" variant="outline">
            <FiPlus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.deductions.map((item) => (
            <div key={item.id} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Particulars</Label>
                <Input
                  value={item.name}
                  onChange={(e) =>
                    updateDeductionItem(item.id, 'name', e.target.value)
                  }
                />
              </div>
              <div className="w-32">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={item.amount}
                  onChange={(e) =>
                    updateDeductionItem(item.id, 'amount', parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <Button
                onClick={() => removeDeductionItem(item.id)}
                size="sm"
                variant="destructive"
              >
                <FiTrash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};