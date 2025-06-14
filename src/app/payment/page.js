'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/firebase/config'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'react-hot-toast'

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentUser } = useAuth()
  
  const bookingId = searchParams.get('bookingId')
  
  const [bookingDetails, setBookingDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [utrNumber, setUtrNumber] = useState('')
  
  const paymentInfo = {
    upiId: 'callmibro@ybl',
    amount: '1,200.00',
    qrCodeUrl: '/images/upi-qr-code.png',
    merchantName: 'CallMiBro Services',
  }

  useEffect(() => {
    if (!bookingId) {
      router.push('/services')
      return
    }

    async function fetchBookingDetails() {
      try {
        setLoading(true)
        const bookingRef = doc(db, 'bookings', bookingId)
        const bookingSnap = await getDoc(bookingRef)
        
        if (!bookingSnap.exists()) {
          setError('Booking not found')
          setLoading(false)
          return
        }
        
        const bookingData = { id: bookingSnap.id, ...bookingSnap.data() }
        setBookingDetails(bookingData)
      } catch (err) {
        console.error('Error fetching booking:', err)
        setError('Failed to load booking details')
      } finally {
        setLoading(false)
      }
    }
    
    fetchBookingDetails()
  }, [bookingId, router])
  
  const handleVerifyPayment = async (e) => {
    e.preventDefault()
    
    if (!utrNumber.trim()) {
      toast.error('Please enter the UTR number')
      return
    }
    
    try {
      setVerifying(true)
      setError(null)
      
      const bookingRef = doc(db, 'bookings', bookingId)
      await updateDoc(bookingRef, {
        payment: {
          status: 'paid',
          method: 'UPI',
          utrNumber: utrNumber,
          amount: paymentInfo.amount.replace(',', ''),
          timestamp: serverTimestamp()
        },
        status: 'confirmed',
        updatedAt: serverTimestamp()
      })
      
      setSuccess(true)
      toast.success('Payment verified successfully!')
      
      setTimeout(() => {
        router.push(`/services/booking-confirmation?bookingId=${bookingId}&payment=success`)
      }, 2000)
    } catch (err) {
      console.error('Error verifying payment:', err)
      setError('Failed to verify payment. Please try again.')
    } finally {
      setVerifying(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header activePage="services" />
        <main className="py-10 px-4 max-w-6xl mx-auto text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#e60012] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl">Loading payment details...</p>
        </main>
        <Footer />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header activePage="services" />
        <main className="py-10 px-4 max-w-6xl mx-auto text-center">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 md:p-12 max-w-3xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-red-900 mx-auto flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Payment Error</h1>
            <p className="text-gray-400 mb-8">{error}</p>
            
            <button 
              onClick={() => router.push('/services')}
              className="bg-[#e60012] hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Services
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Header activePage="services" />
      
      <main className="py-10 px-4 max-w-6xl mx-auto">
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">Complete Your Payment</h1>
          <p className="text-gray-400 text-center mb-6">Pay using UPI to confirm your booking</p>
          
          {success ? (
            <div className="bg-green-900/30 border border-green-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-900 mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
              <p className="text-gray-300 mb-4">Your booking has been confirmed.</p>
              <p className="text-gray-400 text-sm mb-2">Redirecting you to the confirmation page...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#222] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
                
                <div className="bg-white p-4 rounded-lg mb-4">
                  <div className="aspect-square relative">
                    <Image
                      src={paymentInfo.qrCodeUrl}
                      alt="UPI QR Code"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">UPI ID</p>
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        value={paymentInfo.upiId} 
                        readOnly
                        className="bg-[#333] border-none rounded py-2 px-3 text-white flex-grow"
                      />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(paymentInfo.upiId)
                          toast.success('UPI ID copied!')
                        }}
                        className="ml-2 bg-[#444] hover:bg-[#555] p-2 rounded"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Amount to Pay</p>
                    <p className="text-2xl font-bold">₹{paymentInfo.amount}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#222] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Verify Payment</h2>
                
                <form onSubmit={handleVerifyPayment} className="space-y-6">
                  <div>
                    <label htmlFor="utrNumber" className="block text-sm text-gray-400 mb-1">
                      Enter UTR Number
                    </label>
                    <input
                      type="text"
                      id="utrNumber"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="Enter 12-digit UTR number"
                      className="w-full bg-[#333] border-none rounded py-2 px-3 text-white"
                      disabled={verifying}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={verifying}
                    className={`w-full bg-[#e60012] hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors ${
                      verifying ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {verifying ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Verifying...
                      </span>
                    ) : (
                      'Verify Payment'
                    )}
                  </button>
                </form>
                
                <div className="mt-6 text-sm text-gray-400">
                  <p className="mb-2">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Scan the QR code or copy UPI ID</li>
                    <li>Pay the exact amount shown</li>
                    <li>Copy the UTR number from your payment app</li>
                    <li>Paste the UTR number above and verify</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 