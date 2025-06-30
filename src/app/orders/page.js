'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { db } from '@/firebase/config';
import { collection, query, where, orderBy, getDocs, serverTimestamp, addDoc, doc, getDoc } from 'firebase/firestore';

// Fallback mock data in case Firebase fails
const mockOrders = [
  {
    id: 'ORD-2024-001',
    date: '2024-03-15',
    items: ['iPhone 13 Screen Repair', 'Battery Replacement'],
    total: 299.99,
    status: 'Completed',
    address: '123 Main St, Mumbai, 400001',
    technician: 'Rahul Sharma',
    payment: 'Credit Card (xxxx-xxxx-xxxx-1234)'
  },
  {
    id: 'ORD-2024-002',
    date: '2024-03-10',
    items: ['Samsung TV Diagnostics'],
    total: 149.99,
    status: 'In Progress',
    address: '456 Park Ave, Delhi, 110001',
    technician: 'Priya Patel',
    payment: 'UPI (user@ybl)'
  },
  {
    id: 'ORD-2024-003',
    date: '2024-03-05',
    items: ['AC Gas Refill', 'Filter Replacement'],
    total: 199.99,
    status: 'Scheduled',
    address: '789 Garden Rd, Bangalore, 560001',
    technician: 'Amit Kumar',
    payment: 'Cash on Delivery'
  },
  {
    id: 'ORD-2024-004',
    date: '2024-02-28',
    items: ['Speaker Repair - JBL Flip 5'],
    total: 129.99,
    status: 'Completed',
    address: '101 Lake View, Chennai, 600001',
    technician: 'Deepa Iyer',
    payment: 'Credit Card (xxxx-xxxx-xxxx-5678)'
  },
  {
    id: 'ORD-2024-005',
    date: '2024-02-20',
    items: ['Washing Machine Drain Pump Replacement'],
    total: 249.99,
    status: 'Completed',
    address: '202 River Road, Pune, 411001',
    technician: 'Vijay Reddy',
    payment: 'UPI (pay@okaxis)'
  }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { currentUser } = useAuth();
  const ordersPerPage = 5;
  const { isDarkMode } = useTheme();

  // Create sample orders for testing if needed
  const createSampleOrders = async () => {
    if (!currentUser) return;
    
    try {
      // Check if user already has orders
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        console.log('User already has orders');
        return;
      }
      
      // Create sample orders
      for (const order of mockOrders) {
        await addDoc(collection(db, 'orders'), {
          ...order,
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      console.log('Sample orders created successfully');
    } catch (error) {
      console.error('Error creating sample orders:', error);
    }
  };
  
  // Fetch orders from Firebase for the current user
  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);
        
        if (!currentUser) {
          setLoading(false);
          setError('Please log in to view your orders');
          return;
        }

        // Create a query to get orders for the current user
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        let allOrders = [];
        
        // Process regular orders
        if (!querySnapshot.empty) {
          const ordersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            orderType: 'product', // Mark as a product order
            // Ensure date is properly formatted string if it's a timestamp
            date: formatFirebaseDate(doc.data().date)
          }));
          allOrders = [...ordersData];
        }
        
        // Also fetch service bookings with payment info (these are also orders)
        const bookingsRef = collection(db, 'bookings');
        const bookingsQuery = query(
          bookingsRef,
          where('userId', '==', currentUser.uid),
          where('payment.status', '==', 'paid') // Only get paid bookings
        );
        
        const bookingsSnapshot = await getDocs(bookingsQuery);
        
        if (!bookingsSnapshot.empty) {
          const bookingsData = bookingsSnapshot.docs.map(doc => {
            const data = doc.data();
            // Convert booking to order format
            return {
              id: doc.id,
              orderType: 'service', // Mark as a service order
              date: formatFirebaseDate(data.createdAt),
              items: [{ name: data.serviceName, price: data.payment?.amount || 0 }],
              total: data.payment?.amount || 0,
              status: mapBookingStatusToOrderStatus(data.status),
              address: data.address || 'Not specified',
              technician: data.technician || 'To be assigned',
              payment: `${data.payment?.method || 'Online'} (${data.payment?.utrNumber || 'Paid'})`
            };
          });
          
          allOrders = [...allOrders, ...bookingsData];
        }
        
        // Sort all orders by date (newest first)
        allOrders.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });
        
        setOrders(allOrders);
        
        // If no orders found, create sample orders for demo
        if (allOrders.length === 0) {
          await createSampleOrders();
          // Fetch again after creating sample orders
          const newQuerySnapshot = await getDocs(q);
          if (!newQuerySnapshot.empty) {
            const ordersData = newQuerySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              orderType: 'product',
              date: formatFirebaseDate(doc.data().date)
            }));
            setOrders(ordersData);
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [currentUser]);

  // Helper function to format Firebase date
  const formatFirebaseDate = (date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    
    try {
      // If date is a timestamp
      if (date && typeof date.toDate === 'function') {
        return date.toDate().toISOString().split('T')[0];
      }
      
      // If date is already a Date object
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      
      // If date is a string
      if (typeof date === 'string') {
        return date;
      }
      
      return new Date().toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  // Helper function to map booking status to order status
  const mapBookingStatusToOrderStatus = (bookingStatus) => {
    switch (bookingStatus?.toLowerCase()) {
      case 'confirmed':
        return 'Processing';
      case 'scheduled':
        return 'Scheduled';
      case 'in progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Processing';
    }
  };

  const handleOrderClick = async (order) => {
    // If it's a service booking, get additional details
    if (order.orderType === 'service') {
      try {
        const bookingRef = doc(db, 'bookings', order.id);
        const bookingSnap = await getDoc(bookingRef);
        
        if (bookingSnap.exists()) {
          const bookingData = bookingSnap.data();
          // Enhance the order with more booking details
          order = {
            ...order,
            schedule: bookingData.schedule,
            serviceType: bookingData.serviceType,
            bookingDetails: bookingData
          };
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      }
    }
    
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  // Filter orders based on search term and status filter
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        searchTerm === '' || 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.items && order.items.some(item => 
          typeof item === 'string' ? 
            item.toLowerCase().includes(searchTerm.toLowerCase()) : 
            (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )) ||
        (order.technician && order.technician.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = 
        statusFilter === 'All' || 
        order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Completed':
        return 'bg-gradient-to-r from-green-800 to-green-900 text-green-100';
      case 'In Progress':
        return 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white';
      case 'Scheduled':
        return 'bg-gradient-to-r from-blue-800 to-blue-900 text-blue-100';
      case 'Cancelled':
        return 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300';
      case 'Processing':
        return 'bg-gradient-to-r from-yellow-700 to-yellow-800 text-yellow-100';
      default:
        return 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* Hero Banner */}
      <div style={{ backgroundColor: 'var(--panel-charcoal)' }} className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">My Orders</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your service bookings and product orders</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {error && (
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-red-100 p-4 rounded-lg mb-6">
            <p>{error}</p>
            {!currentUser && (
              <button 
                onClick={() => document.getElementById('login-btn')?.click()}
                className="mt-2 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e60012] px-4 py-2 rounded-lg transition-all"
              >
                Log in
              </button>
            )}
          </div>
        )}

        {currentUser && (
          <>
            {/* Search and Filter */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by order ID, service, or technician..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                />
                <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📊</span>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#333] rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                >
                  <option value="All">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Processing">Processing</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="py-16 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e60012] mx-auto"></div>
                    <p style={{ color: 'var(--text-secondary)' }} className="mt-4">Loading orders...</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead style={{ backgroundColor: 'var(--panel-charcoal)' }}>
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Items</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Total</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders.map((order, index) => (
                        <tr 
                          key={order.id}
                          className="cursor-pointer transition-all"
                          style={{ borderTop: '1px solid var(--border-color)' }}
                          onClick={() => handleOrderClick(order)}
                          onMouseEnter={(e) => {
                            e.target.closest('tr').style.backgroundColor = isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.closest('tr').style.backgroundColor = 'transparent'
                          }}
                        >
                          <td className="px-6 py-4 font-medium bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">{order.id.slice(0, 8)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.orderType === 'service' ? 'bg-blue-900 text-blue-100' : 'bg-purple-900 text-purple-100'}`}>
                              {order.orderType === 'service' ? 'Service' : 'Product'}
                            </span>
                          </td>
                          <td className="px-6 py-4">{order.date}</td>
                          <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                            {order.items && order.items.length > 0 ? (
                              <ul className="list-disc list-inside">
                                {order.items.slice(0, 2).map((item, i) => (
                                  <li key={i}>{typeof item === 'string' ? item : item.name}</li>
                                ))}
                                {order.items.length > 2 && (
                                  <li>+{order.items.length - 2} more</li>
                                )}
                              </ul>
                            ) : (
                              'No items'
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">
                            {typeof order.total === 'number' ? `₹${order.total}` : order.total}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm ${getStatusStyle(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Pagination */}
            {filteredOrders.length > 0 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg disabled:opacity-50 transition-all"
                  style={{ 
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--panel-gray)'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-light)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = 'var(--panel-gray)'
                    }
                  }}
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      currentPage === page 
                        ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white' 
                        : ''
                    }`}
                    style={currentPage !== page ? {
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--panel-gray)'
                    } : {}}
                    onMouseEnter={(e) => {
                      if (currentPage !== page) {
                        e.target.style.backgroundColor = isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-light)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== page) {
                        e.target.style.backgroundColor = 'var(--panel-gray)'
                      }
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg disabled:opacity-50 transition-all"
                  style={{ 
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--panel-gray)'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-light)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = 'var(--panel-gray)'
                    }
                  }}
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-[#222] animate-fadeIn">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">Order Details</h2>
                <p className="text-gray-400 text-sm">
                  {selectedOrder.orderType === 'service' ? 'Service Booking' : 'Product Order'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-2xl transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-5">
              <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#222] flex justify-between items-center">
                <span className="text-gray-400">Order ID:</span>
                <span className="font-medium bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">{selectedOrder.id}</span>
              </div>
              <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#222] flex justify-between items-center">
                <span className="text-gray-400">Date:</span>
                <span className="font-medium">{selectedOrder.date}</span>
              </div>
              
              {selectedOrder.orderType === 'service' && selectedOrder.schedule && (
                <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#222] flex justify-between items-center">
                  <span className="text-gray-400">Scheduled Time:</span>
                  <span className="font-medium">
                    {selectedOrder.schedule.date} {selectedOrder.schedule.timeSlot}
                  </span>
                </div>
              )}
              
              <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#222]">
                <span className="text-gray-400 block mb-2">Items:</span>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <li key={i} className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] mr-2"></span>
                        <span className="font-medium">{typeof item === 'string' ? item : item.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-300">No items</p>
                )}
              </div>
              <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#222] flex justify-between items-center">
                <span className="text-gray-400">Total:</span>
                <span className="font-medium text-lg bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">
                  {typeof selectedOrder.total === 'number' ? `₹${selectedOrder.total}` : selectedOrder.total}
                </span>
              </div>
              <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#222] flex justify-between items-center">
                <span className="text-gray-400">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm ${getStatusStyle(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#222] flex justify-between">
                <span className="text-gray-400">Address:</span>
                <span className="text-right max-w-[60%]">{selectedOrder.address}</span>
              </div>
              {selectedOrder.technician && (
                <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#222] flex justify-between items-center">
                  <span className="text-gray-400">Technician:</span>
                  <span className="font-medium">{selectedOrder.technician}</span>
                </div>
              )}
              {selectedOrder.payment && (
                <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#222] flex justify-between items-center">
                  <span className="text-gray-400">Payment Method:</span>
                  <span className="font-medium">{selectedOrder.payment}</span>
                </div>
              )}
              <div className="pt-4 mt-4 border-t border-[#222]">
                <button 
                  className="w-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e60012] text-white py-3 rounded-lg transition-all font-medium shadow-md"
                  onClick={() => {
                    closeModal();
                    if (selectedOrder.status === 'Completed') {
                      if (selectedOrder.orderType === 'service') {
                        router.push(`/services`);
                      } else {
                        router.push(`/spare-parts`);
                      }
                    } else {
                      // Implement order tracking functionality
                      if (selectedOrder.orderType === 'service') {
                        router.push(`/services/booking-confirmation?bookingId=${selectedOrder.id}`);
                      } else {
                        alert('Order tracking feature coming soon!');
                      }
                    }
                  }}
                >
                  {selectedOrder.status === 'Completed' 
                    ? (selectedOrder.orderType === 'service' ? 'Book Again' : 'Shop Again') 
                    : 'Track Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 