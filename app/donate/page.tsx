"use client"; // Required for hooks and interactivity

import React, { useState } from "react";
import { Heart, Zap, Gift, IndianRupee, CreditCard, Sparkles, User, Mail, Phone } from "lucide-react";
import RazorpayPayment from "./pay"; // Adjust import path as needed

interface CustomerDetails {
  name: string;
  email: string;
  contact: string;
}

export default function DonationPage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    email: "",
    contact: ""
  });
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);

  // Predefined donation amounts
  const donationAmounts = [1, 10, 40, 100, 120, 180, 500];

  // Clear feedback after a delay
  const clearFeedback = () => setTimeout(() => {
    setPaymentId(null);
    setError(null);
  }, 5000);

  const handleSuccess = (paymentId: string) => {
    setPaymentId(paymentId);
    setError(null);
    clearFeedback();
    console.log('Payment Success:', paymentId);
  };

  const handleError = (error: any) => {
    setError(error);
    setPaymentId(null);
    clearFeedback();
    console.error('Payment Error:', error);
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(""); // Clear custom amount when preset is selected
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    
    // If custom amount is entered, use it as selected amount
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(numValue);
    }
  };

  const handleCustomerDetailsChange = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getFinalAmount = () => {
    if (customAmount && !isNaN(parseFloat(customAmount))) {
      return parseFloat(customAmount);
    }
    return selectedAmount;
  };

  const isFormValid = () => {
    return getFinalAmount() > 0;
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="relative border-4 border-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 rounded-2xl blur opacity-15 -z-10"></div>
        
        {/* Header with top corner decoration */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border-2 border-rose-300">
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold">DONATE</h1>
              <p className="text-xs opacity-70">Your help would mean a lot to me , thank you in advance! :)</p>
            </div>
          </div>
          <div className="inline-flex items-center px-2 py-1 rounded-full border-2 border-yellow-300 hover:border-yellow-200 transition-all duration-300 hover:scale-105">
            <Sparkles className="w-3 h-3 text-yellow-500 mr-1" />
            <span className="text-xs font-mono font-bold">SUPPORT</span>
          </div>
        </div>

       {/* Combined Input and Quick Select */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* Quick Select */}
          <div className="border-2 border-indigo-300 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-semibold">Direct Select</h3>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {donationAmounts.slice(0, 4).map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className={`px-2 py-1 border-2 rounded-md font-medium transition-all duration-300 hover:scale-105 text-xs ${
                    selectedAmount === amount && !customAmount
                      ? "border-orange-300 shadow-md transform scale-105"
                      : "border-gray-300 hover:border-orange-200"
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {donationAmounts.slice(4).map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className={`px-2 py-1 border-2 rounded-md font-medium transition-all duration-300 hover:scale-105 text-xs ${
                    selectedAmount === amount && !customAmount
                      ? "border-orange-300 shadow-md transform scale-105"
                      : "border-gray-300 hover:border-orange-200"
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>
          
          {/* OR Divider - Hidden on mobile, visible on md+ */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className=" px-2 py-1 border-1 border-blue-500 text-pink-500 rounded-full">
              <span className="text-xs font-bold">OR</span>
            </div>
          </div>
          
          {/* Mobile OR Divider - Visible only on mobile */}
          <div className="md:hidden flex justify-center my-1">
            <div className=" px-3 py-1 border-1 border-blue-500 text-pink-500 rounded-full">
              <span className="text-xs font-bold ">OR</span>
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="border-2 border-emerald-300 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee className="w-4 h-4 text-emerald-500" />
              <label htmlFor="customAmount" className="text-sm font-semibold">
                Custom Amount (₹)
              </label>
            </div>
            <input
              id="customAmount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter amount..."
              value={customAmount}
              onChange={handleCustomAmountChange}
              className="w-full px-3 py-2 border-2 border-emerald-200 rounded-lg focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 text-sm font-mono transition-all duration-300 bg-transparent placeholder-opacity-50"
            />
          </div>
        </div>

        {/* Customer Details Form - Optional */}
        <div className="border-2 border-blue-300 rounded-xl p-3 mb-4">
        <div className="mb-3">
  <div className="flex items-center gap-2">
    <User className="w-4 h-4 text-blue-500" />
    <h3 className="text-sm font-semibold">Totally Optional ( can skip )</h3>
  </div>
  <span className="text-xs text-gray-500  font-medium ml-6">{"Just wanted to know who's donating so if happy can fill your nickname or directly donate :)"}</span>
</div>

          
          <div className="space-y-3">
            {/* Name Input */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-3 h-3 " />
                <label htmlFor="customerName" className="text-xs font-medium ">
                 Name
                </label>
              </div>
              <input
                id="customerName"
                type="text"
                placeholder=". . . for acknowledging u 👽"
                value={customerDetails.name}
                onChange={(e) => handleCustomerDetailsChange('name', e.target.value)}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-sm transition-all duration-300 bg-transparent placeholder-opacity-50"
              />
            </div>

            {/* Email Input */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-3 h-3 " />
                <label htmlFor="customerEmail" className="text-xs font-medium ">
                  Email Address
                </label>
              </div>
              <input
                id="customerEmail"
                type="email"
                placeholder=". . . for my blogs in ur mails 😇"
                value={customerDetails.email}
                onChange={(e) => handleCustomerDetailsChange('email', e.target.value)}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-sm transition-all duration-300 bg-transparent placeholder-opacity-50"
              />
            </div>

            {/* Contact Input */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-3 h-3 " />
                <label htmlFor="customerContact" className="text-xs font-medium ">
                  Phone Number
                </label>
              </div>
              <input
                id="customerContact"
                type="tel"
                placeholder=". . . for updates 👋 or just skip "
                value={customerDetails.contact}
                onChange={(e) => handleCustomerDetailsChange('contact', e.target.value)}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-sm transition-all duration-300 bg-transparent placeholder-opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Amount Display and Payment in one row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* Selected Amount Display */}
          <div className="border-2 border-violet-300 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-semibold">Amount</span>
              </div>
              <div className="text-lg font-bold font-mono">
                ₹{getFinalAmount().toFixed(2)}
              </div>
            </div>
            <div className="h-1.5 border border-gray-300 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-300 to-purple-400 transition-all duration-1000"
                style={{ width: `${Math.min((getFinalAmount() / 500) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="border-2 border-purple-300 rounded-xl p-3">
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold">Secure Network Pipeline</span>
              </div>
            </div>
            <div className="flex justify-center">
              <RazorpayPayment
                amount={getFinalAmount()}
                customerDetails={customerDetails}
                onSuccess={handleSuccess}
                onError={handleError}
                disabled={!isFormValid()}
              />
            </div>
          </div>
        </div>

        {/* Amount validation message */}
        {getFinalAmount() <= 0 && (
          <div className="border-2 border-yellow-300 rounded-xl p-2 mb-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-medium text-yellow-600">
                  Please select or enter an amount to proceed with payment
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {paymentId && (
          <div className="border-2 border-green-300 rounded-xl p-3 mb-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-green-500" />
                <span className="font-bold text-green-600 text-sm">Donation Successful! 🎉</span>
              </div>
              <div className="text-xs font-mono mb-1">Payment ID: {paymentId}</div>
              <div className="text-xs opacity-70">Thank you for your generous contribution!</div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="border-2 border-red-300 rounded-xl p-3 mb-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-red-500" />
                <span className="font-bold text-red-600 text-sm">Payment Failed</span>
              </div>
              <div className="text-xs font-mono mb-1">Error: {error.message || "Unknown error"}</div>
              <div className="text-xs opacity-70">Please try again or contact support.</div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center border-2 border-cyan-300 rounded-xl p-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-cyan-500" />
            <span className="text-xs font-semibold">Powered by Razorpay - Secure & Instant</span>
          </div>
        </div>
      </div>
    </div>
  );
}