import React, { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function SharePdfButton({ shopName, contactNumber, inventory, buttonText = 'Download PDF', className = '' }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { isDarkMode } = useTheme()

  const generatePDF = () => {
    setIsGenerating(true)
    
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank')
    
    // Calculate summary statistics
    const totalItems = inventory.length
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    const outOfStock = inventory.filter(item => item.quantity === 0).length
    const lowStock = inventory.filter(item => item.quantity <= 5 && item.quantity > 0).length
    const inStock = inventory.filter(item => item.quantity > 5).length
    
    // Group by category
    const categoryGroups = inventory.reduce((groups, item) => {
      const category = item.category || 'Uncategorized'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
      return groups
    }, {})
    
    // Generate the HTML content for the PDF
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${shopName} - Inventory Report</title>
          <style>
            @media print {
              @page {
                margin: 0.5in;
                size: A4;
              }
              body { -webkit-print-color-adjust: exact; }
            }
            
            * {
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
              background: white;
              color: #333;
              line-height: 1.6;
            }
            
            .container {
              max-width: 100%;
              margin: 0 auto;
            }
            
            .header {
              background: linear-gradient(135deg, #e60012 0%, #ff6b6b 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            
            .header-content {
              position: relative;
              z-index: 1;
            }
            
            .company-logo {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .shop-name {
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 15px;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }
            
            .shop-info {
              font-size: 14px;
              opacity: 0.9;
              margin-bottom: 5px;
            }
            
            .report-title {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-bottom: 3px solid #e60012;
            }
            
            .report-title h1 {
              margin: 0;
              font-size: 28px;
              color: #333;
              font-weight: bold;
            }
            
            .report-title p {
              margin: 10px 0 0 0;
              color: #666;
              font-size: 14px;
            }
            
            .summary-section {
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              padding: 25px 20px;
              margin: 20px 0;
              border-radius: 10px;
              border: 1px solid #dee2e6;
            }
            
            .summary-title {
              text-align: center;
              margin-bottom: 20px;
            }
            
            .summary-title h2 {
              margin: 0;
              font-size: 20px;
              color: #333;
              font-weight: bold;
            }
            
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .summary-card {
              background: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              border: 1px solid #dee2e6;
            }
            
            .summary-value {
              font-size: 32px;
              font-weight: bold;
              color: #e60012;
              margin-bottom: 5px;
            }
            
            .summary-label {
              font-size: 14px;
              color: #666;
              font-weight: 500;
            }
            
            .inventory-section {
              margin: 30px 0;
            }
            
            .section-title {
              background: #e60012;
              color: white;
              padding: 15px 20px;
              font-size: 18px;
              font-weight: bold;
              border-radius: 5px 5px 0 0;
            }
            
            .inventory-table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .inventory-table th {
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              font-size: 12px;
              color: #495057;
            }
            
            .inventory-table td {
              border: 1px solid #dee2e6;
              padding: 10px 8px;
              font-size: 12px;
              vertical-align: top;
            }
            
            .inventory-table tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            
            .inventory-table tr:hover {
              background-color: #e9ecef;
            }
            
            .price {
              font-weight: bold;
              color: #e60012;
            }
            
            .quantity {
              text-align: center;
              font-weight: bold;
            }
            
            .low-stock {
              color: #dc3545;
              font-weight: bold;
            }
            
            .out-of-stock {
              color: #6c757d;
              font-style: italic;
            }
            
            .category-header {
              background: #e9ecef;
              font-weight: bold;
              color: #495057;
              padding: 10px 15px;
              border-left: 4px solid #e60012;
              margin: 20px 0 10px 0;
              font-size: 16px;
            }
            
            .footer {
              background: #343a40;
              color: white;
              text-align: center;
              padding: 20px;
              margin-top: 40px;
              border-radius: 5px;
            }
            
            .footer p {
              margin: 5px 0;
              font-size: 12px;
            }
            
            .footer .highlight {
              color: #e60012;
              font-weight: bold;
            }
            
            .page-break {
              page-break-before: always;
            }
            
            @media print {
              .header {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .summary-section {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .section-title {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="header-content">
                <div class="company-logo">CallMiBro</div>
                <div class="shop-name">${shopName}</div>
                <div class="shop-info">📞 ${contactNumber || 'Contact number not available'}</div>
                <div class="shop-info">📅 Generated on: ${new Date().toLocaleDateString('en-IN')}</div>
              </div>
            </div>
            
            <!-- Report Title -->
            <div class="report-title">
              <h1>Inventory Report</h1>
              <p>Comprehensive inventory analysis and stock management report</p>
            </div>
            
            <!-- Summary Section -->
            <div class="summary-section">
              <div class="summary-title">
                <h2>📊 Inventory Summary</h2>
              </div>
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="summary-value">${totalItems}</div>
                  <div class="summary-label">Total Items</div>
                </div>
                <div class="summary-card">
                  <div class="summary-value">₹${totalValue.toLocaleString('en-IN')}</div>
                  <div class="summary-label">Total Value</div>
                </div>
                <div class="summary-card">
                  <div class="summary-value">${inStock}</div>
                  <div class="summary-label">In Stock</div>
                </div>
                <div class="summary-card">
                  <div class="summary-value">${lowStock}</div>
                  <div class="summary-label">Low Stock</div>
                </div>
                <div class="summary-card">
                  <div class="summary-value">${outOfStock}</div>
                  <div class="summary-label">Out of Stock</div>
                </div>
                <div class="summary-card">
                  <div class="summary-value">${Object.keys(categoryGroups).length}</div>
                  <div class="summary-label">Categories</div>
                </div>
              </div>
            </div>
            
            <!-- Inventory by Category -->
            ${Object.entries(categoryGroups).map(([category, items]) => `
              <div class="inventory-section">
                <div class="category-header">
                  📦 ${category} (${items.length} items)
                </div>
                <table class="inventory-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Brand</th>
                      <th>Model</th>
                      <th>SKU</th>
                      <th>Price (₹)</th>
                      <th>Quantity</th>
                      <th>Condition</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map(item => `
                      <tr>
                        <td><strong>${item.name || 'N/A'}</strong></td>
                        <td>${item.brand || 'N/A'}</td>
                        <td>${item.model || 'N/A'}</td>
                        <td>${item.sku || 'N/A'}</td>
                        <td class="price">₹${item.price ? item.price.toLocaleString('en-IN') : '0'}</td>
                        <td class="quantity ${item.quantity === 0 ? 'out-of-stock' : item.quantity <= 5 ? 'low-stock' : ''}">
                          ${item.quantity || 0}
                        </td>
                        <td>${item.condition || 'N/A'}</td>
                        <td>${item.description || 'N/A'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
            
            <!-- Footer -->
            <div class="footer">
              <p><strong>CallMiBro</strong> - Professional Electronics Repair & Spare Parts</p>
              <p>This inventory report was generated for <span class="highlight">${shopName}</span></p>
              <p>For inquiries, please contact: <span class="highlight">${contactNumber || 'Contact number not available'}</span></p>
              <p>Generated on <span class="highlight">${new Date().toLocaleString('en-IN')}</span></p>
            </div>
          </div>
        </body>
      </html>
    `
    
    // Write the content to the new window
    printWindow.document.write(pdfContent)
    printWindow.document.close()
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
        setIsGenerating(false)
      }, 1000)
    }
  }

  return (
    <button 
      onClick={generatePDF} 
      disabled={isGenerating}
      className={`flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 ${className} ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ 
        backgroundColor: isDarkMode ? '#dc2626' : '#dc2626',
        color: 'white'
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {isGenerating ? 'Generating...' : buttonText}
    </button>
  )
} 