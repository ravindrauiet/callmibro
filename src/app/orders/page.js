'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase/config';
import { collection, query, where, orderBy, getDocs, serverTimestamp, addDoc } from 'firebase/firestore';

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
  
  // Uncomment to create sample orders for testing
  // useEffect(() => {
  //   if (currentUser) {
  //     createSampleOrders();
  //   }
  // }, [currentUser]);

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
        
        if (querySnapshot.empty) {
          // If no orders found in Firebase, use empty array 
          // (we won't use mock data in production)
          setOrders([]);
          
          // For demo purposes, you can create sample orders here
          await createSampleOrders();
          
          // Fetch again after creating sample orders
          const newQuerySnapshot = await getDocs(q);
          if (!newQuerySnapshot.empty) {
            const ordersData = newQuerySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              // Ensure date is properly formatted string if it's a timestamp
              date: doc.data().date instanceof Date ? 
                doc.data().date.toISOString().split('T')[0] : 
                doc.data().date
            }));
            setOrders(ordersData);
          }
        } else {
          const ordersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Ensure date is properly formatted string if it's a timestamp
            date: doc.data().date instanceof Date ? 
              doc.data().date.toISOString().split('T')[0] : 
              doc.data().date
          }));
          setOrders(ordersData);
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

  const handleOrderClick = (order) => {
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Banner */}
      <div className="bg-[#1a1a1a] py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Order History</h1>
          <p className="text-gray-400">Track your past purchases</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-900 text-red-100 p-4 rounded-lg mb-6">
            <p>{error}</p>
            {!currentUser && (
              <button 
                onClick={() => document.getElementById('login-btn')?.click()}
                className="mt-2 bg-red-700 hover:bg-red-800 px-4 py-2 rounded-md"
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
                  className="w-full bg-[#2a2a2a] border border-[#444] rounded-md py-2 px-4 pl-10 text-white focus:outline-none focus:border-red-500"
                />
                <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📊</span>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#2a2a2a] border border-[#444] rounded-md py-2 px-4 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="All">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
              {loading ? (
                <div className="py-16 text-center">
                  <p className="text-gray-400">Loading orders...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {currentOrders.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#2a2a2a]">
                          <th className="px-6 py-4 text-left">Order ID</th>
                          <th className="px-6 py-4 text-left">Date</th>
                          <th className="px-6 py-4 text-left">Items</th>
                          <th className="px-6 py-4 text-left">Total</th>
                          <th className="px-6 py-4 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentOrders.map((order, index) => (
                          <tr 
                            key={order.id}
                            className={`border-t border-[#333] cursor-pointer hover:bg-[#2a2a2a] transition-colors ${
                              index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#222]'
                            }`}
                            onClick={() => handleOrderClick(order)}
                          >
                            <td className="px-6 py-4 text-red-500">{order.id.slice(0, 8)}</td>
                            <td className="px-6 py-4">{order.date}</td>
                            <td className="px-6 py-4 text-gray-400">
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
                            <td className="px-6 py-4 text-red-500">
                              {typeof order.total === 'number' ? `$${order.total}` : order.total}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                order.status === 'Completed' ? 'bg-green-900 text-green-300' :
                                order.status === 'In Progress' ? 'bg-yellow-900 text-yellow-300' :
                                'bg-blue-900 text-blue-300'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-16 text-center">
                      <p className="text-gray-400">No orders found matching your filters</p>
                      {searchTerm || statusFilter !== 'All' ? (
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('All');
                          }}
                          className="mt-4 text-red-500 hover:text-red-400"
                        >
                          Clear filters
                        </button>
                      ) : (
                        <p className="mt-4 text-gray-400">Your order history will appear here after you make a purchase.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pagination - only show if we have orders */}
            {filteredOrders.length > 0 && (
              <div className="flex justify-center items-center mt-8 space-x-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full hover:bg-[#2a2a2a] disabled:opacity-50"
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full ${
                      currentPage === page ? 'bg-red-600' : 'hover:bg-[#2a2a2a]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full hover:bg-[#2a2a2a] disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Order ID:</span>
                <span className="text-red-500">{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span>{selectedOrder.date}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-2">Items:</span>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-300">
                    {selectedOrder.items.map((item, i) => (
                      <li key={i}>{typeof item === 'string' ? item : item.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-300">No items</p>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span className="text-red-500">
                  {typeof selectedOrder.total === 'number' ? `$${selectedOrder.total}` : selectedOrder.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  selectedOrder.status === 'Completed' ? 'bg-green-900 text-green-300' :
                  selectedOrder.status === 'In Progress' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-blue-900 text-blue-300'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Address:</span>
                <span className="text-right">{selectedOrder.address}</span>
              </div>
              {selectedOrder.technician && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Technician:</span>
                  <span>{selectedOrder.technician}</span>
                </div>
              )}
              {selectedOrder.payment && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Method:</span>
                  <span>{selectedOrder.payment}</span>
                </div>
              )}
              <div className="pt-4 mt-4 border-t border-gray-700">
                <button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors"
                  onClick={() => {
                    closeModal();
                    if (selectedOrder.status === 'Completed') {
                      router.push(`/services`);
                    } else {
                      // Implement order tracking functionality
                      alert('Order tracking feature coming soon!');
                    }
                  }}
                >
                  {selectedOrder.status === 'Completed' ? 'Book Again' : 'Track Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 