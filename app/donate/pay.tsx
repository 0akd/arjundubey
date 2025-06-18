"use client"

import Script from 'next/script'
import { useState } from 'react'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayPaymentProps {
  amount: number // Amount in INR
  onSuccess: (paymentId: string) => void
  onError: (error: any) => void
}

export default function RazorpayPayment({ 
  amount,
  onSuccess,
  onError 
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    
    try {
      // Call your API route to create order
      const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      })

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      // Check if response has content
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response')
      }

      const orderData = await response.json()

      // Check if order creation was successful
      if (orderData.error) {
        throw new Error(orderData.message || orderData.error)
      }

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded')
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Arjun Dubey',
        order_id: orderData.id,
        handler: function(response: any) {
          onSuccess(response.razorpay_payment_id)
        },
        prefill: {
          name: 'Donating to Mr. Arjun',
          email: 'arjunexisted@gmail.com',
          contact: '+91 8076008591'
        },
        theme: {
          color: '#a159ff'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function(response: any) {
        onError(response.error)
      })
      rzp.open()
    } catch (err) {
      console.error('Payment initialization error:', err)
      onError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="lazyOnload"
      />

      <button
        onClick={handlePayment}
        disabled={loading}
        className={`bg-blue-600 text-white px-6 py-3 rounded-lg font-medium
          hover:bg-blue-700 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </button>
    </>
  )
}