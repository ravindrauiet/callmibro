'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiChevronRight, FiSearch, FiFilter } from 'react-icons/fi';

// Mock data for orders
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const router = useRouter();
  const ordersPerPage = 5;

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  // Filter orders based on search term and status filter
  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => {
      const matchesSearch = 
        searchTerm === '' || 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.technician.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'All' || 
        order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

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
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
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
                      <td className="px-6 py-4 text-red-500">{order.id}</td>
                      <td className="px-6 py-4">{order.date}</td>
                      <td className="px-6 py-4 text-gray-400">
                        <ul className="list-disc list-inside">
                          {order.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4 text-red-500">${order.total}</td>
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
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('All');
                  }}
                  className="mt-4 text-red-500 hover:text-red-400"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pagination - only show if we have orders */}
        {filteredOrders.length > 0 && (
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full hover:bg-[#2a2a2a] disabled:opacity-50"
            >
              <FiChevronLeft className="w-6 h-6" />
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
              <FiChevronRight className="w-6 h-6" />
            </button>
          </div>
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
                <ul className="list-disc list-inside text-gray-300">
                  {selectedOrder.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span className="text-red-500">${selectedOrder.total}</span>
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
              <div className="flex justify-between">
                <span className="text-gray-400">Technician:</span>
                <span>{selectedOrder.technician}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <span>{selectedOrder.payment}</span>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-700">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors">
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