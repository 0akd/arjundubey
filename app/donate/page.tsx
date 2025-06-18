"use client"; // Required for hooks and interactivity

import React, { useState } from "react";
import RazorpayPayment from "./pay"; // Adjust import path as needed

export default function DonationPage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
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

  const getFinalAmount = () => {
    if (customAmount && !isNaN(parseFloat(customAmount))) {
      return parseFloat(customAmount);
    }
    return selectedAmount;
  };

  return (
    <div className=" flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full  rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold  mb-2">
    DONATE
          </h1>
          <p className="text-gray-600">
       {"don't think much just donate please :)"}
          </p>
        </div>

        {/* Custom Amount Input */}
        <div className="space-y-2">
          <label htmlFor="customAmount" className="block text-sm font-medium ">
            Custom Amount (₹)
          </label>
<input
  id="customAmount"
  type="number"
  min="1"
  step="0.01"
  placeholder="..... Enter custom amount ....."
  value={customAmount}
  onChange={handleCustomAmountChange}
  className="w-full px-4 py-3 border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
  style={{ border: '1px solid #5bdb00' }}
/>
        </div>

        {/* Preset Amount Buttons */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Or Qucickly select from following donation amounts</h3>
          <div className="grid grid-cols-4 gap-3">
            {donationAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountSelect(amount)}
                className={`px-4 py-3 border-2 border-yellow-600 rounded-lg font-medium transition-all duration-200 ${
                  selectedAmount === amount && !customAmount
                    ? " shadow-md transform scale-105"
                    : " "
                }`}
              >
                ₹{amount}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Amount Display */}
        <div className=" border-1 border-blue-600 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Donation Amount:</span>
            <span className="text-2xl font-bold ">
              ₹{getFinalAmount().toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Button */}
        <div className="flex justify-center pt-2">
          <RazorpayPayment
            amount={getFinalAmount()}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        {/* Success/Error Messages */}
        {paymentId && (
          <div className="p-4 bg-green-100 border border-green-200 text-green-800 rounded-lg text-center">
            <div className="font-medium">Donation Successful! 🎉</div>
            <div className="text-sm mt-1">Payment ID: {paymentId}</div>
            <div className="text-sm">Thank you for your generous contribution!</div>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-100 border border-red-200 text-red-800 rounded-lg text-center">
            <div className="font-medium">Payment Failed</div>
            <div className="text-sm mt-1">Error: {error.message || "Unknown error"}</div>
            <div className="text-sm">Please try again or contact support.</div>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          Your donation is secure and processed through Razorpay
        </div>
      </div>
    </div>
  );
}