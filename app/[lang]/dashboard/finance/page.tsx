"use client";

import { useState } from "react";
import { Calculator, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FinanceCalculatorPage() {
  const [salePrice, setSalePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [apr, setApr] = useState("6.99");
  const [term, setTerm] = useState("60");
  const [tradeInValue, setTradeInValue] = useState("");

  const calculateFinance = () => {
    const price = parseFloat(salePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const trade = parseFloat(tradeInValue) || 0;
    const rate = parseFloat(apr) / 100 / 12;
    const months = parseInt(term);

    const loanAmount = price - down - trade;

    if (loanAmount <= 0) {
      return {
        monthlyPayment: 0,
        totalInterest: 0,
        totalCost: price,
        loanAmount: 0,
      };
    }

    const monthlyPayment =
      (loanAmount * rate * Math.pow(1 + rate, months)) /
      (Math.pow(1 + rate, months) - 1);

    const totalPaid = monthlyPayment * months + down + trade;
    const totalInterest = totalPaid - price;

    return {
      monthlyPayment: monthlyPayment || 0,
      totalInterest: totalInterest || 0,
      totalCost: totalPaid || 0,
      loanAmount: loanAmount || 0,
    };
  };

  const results = calculateFinance();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-[#f5a623]" />
        <div>
          <h1 className="text-3xl font-bold text-white">Finance Calculator</h1>
          <p className="text-gray-400">Calculate monthly payments and total costs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Loan Details</CardTitle>
            <CardDescription className="text-gray-400">
              Enter trailer and financing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sale Price */}
            <div className="space-y-2">
              <Label htmlFor="salePrice" className="text-gray-300">
                Sale Price *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="salePrice"
                  type="number"
                  placeholder="25000"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="pl-10 bg-[#0f1117] border-gray-700 text-white"
                />
              </div>
            </div>

            {/* Down Payment */}
            <div className="space-y-2">
              <Label htmlFor="downPayment" className="text-gray-300">
                Down Payment
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="downPayment"
                  type="number"
                  placeholder="5000"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  className="pl-10 bg-[#0f1117] border-gray-700 text-white"
                />
              </div>
              <p className="text-xs text-gray-500">
                {salePrice &&
                  downPayment &&
                  `${((parseFloat(downPayment) / parseFloat(salePrice)) * 100).toFixed(
                    1
                  )}% down`}
              </p>
            </div>

            {/* Trade-In Value */}
            <div className="space-y-2">
              <Label htmlFor="tradeIn" className="text-gray-300">
                Trade-In Value
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="tradeIn"
                  type="number"
                  placeholder="0"
                  value={tradeInValue}
                  onChange={(e) => setTradeInValue(e.target.value)}
                  className="pl-10 bg-[#0f1117] border-gray-700 text-white"
                />
              </div>
            </div>

            {/* APR */}
            <div className="space-y-2">
              <Label htmlFor="apr" className="text-gray-300">
                APR (%)
              </Label>
              <Input
                id="apr"
                type="number"
                step="0.01"
                placeholder="6.99"
                value={apr}
                onChange={(e) => setApr(e.target.value)}
                className="bg-[#0f1117] border-gray-700 text-white"
              />
            </div>

            {/* Loan Term */}
            <div className="space-y-2">
              <Label htmlFor="term" className="text-gray-300">
                Loan Term (Months)
              </Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger className="bg-[#0f1117] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                  <SelectItem value="36">36 months</SelectItem>
                  <SelectItem value="48">48 months</SelectItem>
                  <SelectItem value="60">60 months</SelectItem>
                  <SelectItem value="72">72 months</SelectItem>
                  <SelectItem value="84">84 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => {}}
              className="w-full bg-[#f5a623] hover:bg-[#e09612] text-white"
            >
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Payment
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Monthly Payment */}
          <Card className="bg-gradient-to-br from-[#f5a623] to-[#e09612] border-0">
            <CardHeader>
              <CardDescription className="text-white/80">
                Monthly Payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-white">
                ${results.monthlyPayment.toFixed(2)}
              </div>
              <p className="text-sm text-white/80 mt-2">
                for {term} months at {apr}% APR
              </p>
            </CardContent>
          </Card>

          {/* Loan Amount */}
          <Card className="bg-[#1a1d29] border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#f5a623]" />
                <CardTitle className="text-white text-lg">Loan Amount</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ${results.loanAmount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Sale price minus down payment and trade-in
              </p>
            </CardContent>
          </Card>

          {/* Total Interest */}
          <Card className="bg-[#1a1d29] border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white text-lg">Total Interest</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ${results.totalInterest.toLocaleString()}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Over the life of the loan
              </p>
            </CardContent>
          </Card>

          {/* Total Cost */}
          <Card className="bg-[#1a1d29] border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-400" />
                <CardTitle className="text-white text-lg">Total Cost</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ${results.totalCost.toLocaleString()}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Including all payments and down payment
              </p>
            </CardContent>
          </Card>

          {/* Payment Breakdown */}
          <Card className="bg-[#1a1d29] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Principal:</span>
                <span className="text-white font-semibold">
                  ${results.loanAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Interest:</span>
                <span className="text-white font-semibold">
                  ${results.totalInterest.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Down Payment:</span>
                <span className="text-white font-semibold">
                  ${parseFloat(downPayment || "0").toLocaleString()}
                </span>
              </div>
              {tradeInValue && parseFloat(tradeInValue) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Trade-In:</span>
                  <span className="text-white font-semibold">
                    ${parseFloat(tradeInValue).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-300">Total:</span>
                  <span className="text-[#f5a623] text-lg">
                    ${results.totalCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
