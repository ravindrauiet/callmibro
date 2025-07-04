import React, { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function InvoiceGenerator({ shopName, contactNumber, inventory, buttonText = 'Generate Invoice', className = '' }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
    companyName: ''
  })
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: '',
    orderNumber: '',
    paymentTerms: '30 days',
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    partialAmount: 0,
    deliveryDate: '',
    warrantyPeriod: '1 year',
    serviceCharges: 0,
    discount: 0,
    discountType: 'percentage', // percentage or fixed
    notes: '',
    terms: [
      'Payment is due within 30 days of invoice date',
      'All prices include GST as applicable',
      'Warranty is provided as per manufacturer terms',
      'Service charges are non-refundable',
      'Returns accepted within 7 days in original packaging',
      'Installation charges extra if not mentioned'
    ]
  })
  const { isDarkMode } = useTheme()

  // Generate unique invoice number
  const generateInvoiceNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `INV-${year}${month}${day}-${random}`
  }

  // Generate order number
  const generateOrderNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `ORD-${year}${month}${day}-${random}`
  }

  // Open modal
  const openModal = () => {
    setInvoiceDetails(prev => ({
      ...prev,
      invoiceNumber: generateInvoiceNumber(),
      orderNumber: generateOrderNumber(),
      deliveryDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0] // 7 days from now
    }))
    setIsModalOpen(true)
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedItems([])
    setClientInfo({
      name: '',
      email: '',
      phone: '',
      address: '',
      gstNumber: '',
      companyName: ''
    })
    setInvoiceDetails({
      invoiceNumber: '',
      orderNumber: '',
      paymentTerms: '30 days',
      paymentMethod: 'Cash',
      paymentStatus: 'Paid',
      partialAmount: 0,
      deliveryDate: '',
      warrantyPeriod: '1 year',
      serviceCharges: 0,
      discount: 0,
      discountType: 'percentage',
      notes: '',
      terms: [
        'Payment is due within 30 days of invoice date',
        'All prices include GST as applicable',
        'Warranty is provided as per manufacturer terms',
        'Service charges are non-refundable',
        'Returns accepted within 7 days in original packaging',
        'Installation charges extra if not mentioned'
      ]
    })
  }

  // Add item to invoice
  const addItemToInvoice = (item, quantity = 1) => {
    const existingItem = selectedItems.find(selected => selected.id === item.id)
    if (existingItem) {
      setSelectedItems(prev => 
        prev.map(selected => 
          selected.id === item.id 
            ? { ...selected, quantity: selected.quantity + quantity }
            : selected
        )
      )
    } else {
      setSelectedItems(prev => [...prev, { ...item, quantity: quantity }])
    }
  }

  // Remove item from invoice
  const removeItemFromInvoice = (itemId) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Update item quantity
  const updateItemQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItemFromInvoice(itemId)
      return
    }
    
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: quantity }
          : item
      )
    )
  }

  // Calculate totals
  const calculateSubtotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateDiscount = () => {
    if (invoiceDetails.discountType === 'percentage') {
      return (calculateSubtotal() * invoiceDetails.discount) / 100
    } else {
      return invoiceDetails.discount
    }
  }

  const calculateTaxableAmount = () => {
    return calculateSubtotal() - calculateDiscount() + invoiceDetails.serviceCharges
  }

  const calculateTax = () => {
    return calculateTaxableAmount() * 0.18 // 18% GST
  }

  const calculateTotal = () => {
    return calculateTaxableAmount() + calculateTax()
  }

  const calculateRemainingAmount = () => {
    return calculateTotal() - invoiceDetails.partialAmount
  }

  // Generate PDF invoice
  const generateInvoicePDF = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item for the invoice.')
      return
    }

    if (!clientInfo.name || !clientInfo.phone) {
      alert('Please fill in client name and phone number.')
      return
    }

    setIsGenerating(true)

    try {
      // Create PDF document with proper A4 size and margins
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      })

      // Set document properties
      doc.setProperties({
        title: `Invoice - ${invoiceDetails.invoiceNumber}`,
        subject: 'Invoice',
        author: shopName,
        creator: 'CallMiBro'
      })

      // Define consistent margins and dimensions
      const margin = 8;
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const contentWidth = pageWidth - (margin * 2)
      
      let currentY = margin // Track current Y position dynamically

      // Professional header with accent
      doc.setFillColor(40, 40, 40)
      doc.rect(0, 0, pageWidth, 35, 'F')
      
      // Accent line
      doc.setFillColor(230, 0, 18)
      doc.rect(0, 0, pageWidth, 3, 'F')

      // Shop name and branding
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(shopName, margin, 15)

      // Contact info
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Phone: ${contactNumber || 'N/A'}`, margin, 22)
      doc.text(`Email: support@callmibro.com`, margin, 28)

      // Invoice details
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('INVOICE', pageWidth - margin, 15, { align: 'right' })

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Invoice #: ${invoiceDetails.invoiceNumber}`, pageWidth - margin, 22, { align: 'right' })
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, 28, { align: 'right' })

      currentY = 45 // Start client section after header

      // Client information section with better layout
      doc.setFillColor(248, 248, 248)
      doc.rect(margin, currentY, contentWidth, 40, 'F')
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.rect(margin, currentY, contentWidth, 40, 'S')

      doc.setTextColor(51, 51, 51)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Bill To:', margin + 5, currentY + 8)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      // Bill To details with better spacing
      let billY = currentY + 16
      let billX = margin + 5
      
      if (clientInfo.companyName) {
        doc.text(clientInfo.companyName, billX, billY)
        billY += 6
      }
      
      doc.text(clientInfo.name, billX, billY)
      billY += 6
      
      doc.text(clientInfo.phone, billX, billY)
      billY += 6
      
      if (clientInfo.email) {
        doc.text(clientInfo.email, billX, billY)
        billY += 6
      }
      
      if (clientInfo.address) {
        // Handle multi-line address
        const addressLines = doc.splitTextToSize(clientInfo.address, contentWidth - 15)
        doc.text(addressLines, billX, billY)
        billY += 6 * (addressLines.length || 1)
      }
      
      if (clientInfo.gstNumber) {
        doc.text(`GST: ${clientInfo.gstNumber}`, billX, billY)
      }

      currentY += 45 // Move position after client section

      // Order information
      doc.setFillColor(240, 240, 240)
      doc.rect(margin, currentY, contentWidth, 25, 'F')
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.rect(margin, currentY, contentWidth, 25, 'S')
      
      doc.setTextColor(51, 51, 51)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Order Number:', margin + 10, currentY + 10)
      doc.text('Order Date:', margin + 10, currentY + 20)
      
      doc.setFont('helvetica', 'normal')
      doc.text(invoiceDetails.orderNumber, margin + 55, currentY + 10)
      doc.text(new Date().toLocaleDateString('en-IN'), margin + 55, currentY + 20)
      
      doc.setFont('helvetica', 'bold')
      doc.text('Delivery Date:', margin + contentWidth/2, currentY + 10)
      doc.text('Payment Terms:', margin + contentWidth/2, currentY + 20)
      
      doc.setFont('helvetica', 'normal')
      doc.text(invoiceDetails.deliveryDate || 'N/A', pageWidth - margin - 15, currentY + 10, { align: 'right' })
      doc.text(invoiceDetails.paymentTerms || 'N/A', pageWidth - margin - 15, currentY + 20, { align: 'right' })

      currentY += 30 // Move position after order info section

      // Format currency for display - use 'INR' instead of '₹' for compatibility
      const formatCurrency = (amount) => {
        return 'INR ' + amount.toLocaleString('en-IN', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        });
      };

      // Items table with enhanced styling and automatic pagination
      const headers = [['Item', 'Description', 'Qty', 'Unit Price', 'Total']];
      
      // Fix the undefined description issue
      const data = selectedItems.map(item => {
        // Create a proper description from available information
        const description = [
          item.brand || '',
          item.model || ''
        ].filter(Boolean).join(' ') || '';
        
        return [
          item.name || 'Product',
          description,
          item.quantity.toString(),
          formatCurrency(item.price),
          formatCurrency(item.price * item.quantity)
        ];
      });

      // Set up table configuration with proper widths
      const tableConfig = {
        startY: currentY,
        margin: { left: margin, right: margin },
        headStyles: {
          fillColor: [40, 40, 40],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248]
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.15,
          overflow: 'linebreak',
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: contentWidth * 0.24 }, // 24% width for item name
          1: { cellWidth: contentWidth * 0.33 }, // 33% width for description
          2: { cellWidth: contentWidth * 0.10, halign: 'center' }, // 10% for quantity
          3: { cellWidth: contentWidth * 0.15, halign: 'right' }, // 15% for unit price
          4: { cellWidth: contentWidth * 0.18, halign: 'right' }  // 18% for total
        },
        // Enable automatic page break
        bodyStyles: { minCellHeight: 7 },
        didDrawPage: function (data) {
          // Re-add header on new pages
          doc.setFillColor(40, 40, 40)
          doc.rect(0, 0, pageWidth, 16, 'F')
          
          doc.setFillColor(230, 0, 18)
          doc.rect(0, 0, pageWidth, 2, 'F')
          
          // Shop name on header
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(11)
          doc.setFont('helvetica', 'bold')
          doc.text(shopName, margin, 10)
          
          // Invoice number on header
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          doc.text(`Invoice: ${invoiceDetails.invoiceNumber}`, pageWidth - margin, 10, { align: 'right' })
          
          // Add page number at the bottom
          const pageNumber = `Page ${doc.internal.getNumberOfPages()}`;
          doc.setTextColor(100, 100, 100)
          doc.setFontSize(7)
          doc.text(pageNumber, pageWidth - margin, pageHeight - 6, { align: 'right' })

          // --- Footer: Terms & Conditions and shop info ---
          const footerY = pageHeight - 28;
          doc.setFillColor(40, 40, 40);
          doc.rect(0, footerY, pageWidth, 28, 'F');
          doc.setFillColor(230, 0, 18);
          doc.rect(0, footerY, pageWidth, 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text('Terms & Conditions:', margin, footerY + 7);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6);
          doc.text('• Payment due in 30 days', margin, footerY + 12);
          doc.text('• GST as applicable', margin, footerY + 16);
          doc.text('• Warranty as per manufacturer', margin, footerY + 20);
          doc.text('• Returns within 7 days', margin, footerY + 24);
          doc.text('• Service charges non-refundable', margin + 60, footerY + 12);
          doc.text('• Installation charges extra', margin + 60, footerY + 16);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.text('Thank you for your business!', pageWidth - margin, footerY + 7, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6);
          doc.text(`${shopName}`, pageWidth - margin, footerY + 12, { align: 'right' });
          doc.text(`Phone: ${contactNumber || 'N/A'}`, pageWidth - margin, footerY + 16, { align: 'right' });
          doc.text('Email: support@callmibro.com', pageWidth - margin, footerY + 20, { align: 'right' });
          doc.text('Web: www.callmibro.com', pageWidth - margin, footerY + 24, { align: 'right' });
        }
      }

      // Generate the table with automatic pagination
      autoTable(doc, {
        head: headers,
        body: data,
        ...tableConfig
      })

      // Get the final Y position after the table (accounts for page breaks)
      const finalY = doc.lastAutoTable.finalY + 10;
      
      // Check if we need to add a new page for the totals section
      if (finalY > pageHeight - 100) {
        doc.addPage();
        currentY = margin + 10; // Reset Y on new page
      } else {
        currentY = finalY; // Continue from table end
      }

      // Totals section with premium design
      const totalsWidth = 95;
      const totalsStartX = pageWidth - margin - totalsWidth;
      
      // Totals box with premium styling
      doc.setFillColor(248, 248, 248);
      doc.rect(totalsStartX, currentY, totalsWidth, 95, 'F');
      
      // Border
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.7);
      doc.rect(totalsStartX, currentY, totalsWidth, 95, 'S');
      
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      let totalsY = currentY + 12;
      doc.text('Subtotal:', totalsStartX + 10, totalsY);
      doc.text(formatCurrency(calculateSubtotal()), pageWidth - margin - 10, totalsY, { align: 'right' });

      if (calculateDiscount() > 0) {
        totalsY += 10;
        doc.text(`Discount (${invoiceDetails.discountType === 'percentage' ? invoiceDetails.discount + '%' : 'INR ' + invoiceDetails.discount}):`, totalsStartX + 10, totalsY);
        doc.text(`-${formatCurrency(calculateDiscount())}`, pageWidth - margin - 10, totalsY, { align: 'right' });
      }

      if (invoiceDetails.serviceCharges > 0) {
        totalsY += 10;
        doc.text('Service Charges:', totalsStartX + 10, totalsY);
        doc.text(formatCurrency(invoiceDetails.serviceCharges), pageWidth - margin - 10, totalsY, { align: 'right' });
      }

      totalsY += 10;
      doc.text('GST (18%):', totalsStartX + 10, totalsY);
      doc.text(formatCurrency(calculateTax()), pageWidth - margin - 10, totalsY, { align: 'right' });

      // Total with emphasis - add more visual distinction
      totalsY += 18;
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.7);
      doc.line(totalsStartX + 10, totalsY - 10, pageWidth - margin - 10, totalsY - 10);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Total:', totalsStartX + 10, totalsY);
      
      // Make total amount more prominent
      doc.setFontSize(13);
      doc.setTextColor(230, 0, 18); // Red color for total amount
      doc.text(formatCurrency(calculateTotal()), pageWidth - margin - 10, totalsY, { align: 'right' });
      doc.setTextColor(51, 51, 51); // Reset text color

      // Payment information
      if (invoiceDetails.paymentStatus === 'Partial' || invoiceDetails.paymentStatus === 'Advance') {
        totalsY += 16;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Amount Received:', totalsStartX + 10, totalsY);
        doc.text(formatCurrency(invoiceDetails.partialAmount), pageWidth - margin - 10, totalsY, { align: 'right' });
        
        totalsY += 12;
        doc.setFont('helvetica', 'bold');
        doc.text('Remaining Amount:', totalsStartX + 10, totalsY);
        doc.setTextColor(230, 0, 18); // Red for emphasis
        doc.text(formatCurrency(calculateRemainingAmount()), pageWidth - margin - 10, totalsY, { align: 'right' });
        doc.setTextColor(51, 51, 51); // Reset text color
      }

      // Payment method and status
      totalsY += 20;
      
      // Add a little style to payment info
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(totalsStartX + 10, totalsY - 5, pageWidth - margin - 10, totalsY - 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Payment Method: ${invoiceDetails.paymentMethod}`, totalsStartX + 10, totalsY);
      
      totalsY += 8;
      // Style the payment status differently based on status
      doc.text(`Status:`, totalsStartX + 10, totalsY);
      
      // Highlight payment status
      const statusColors = {
        'Paid': [0, 128, 0], // Green
        'Partial': [255, 140, 0], // Orange
        'Pending': [255, 0, 0], // Red
        'Advance': [0, 0, 255], // Blue
        'default': [51, 51, 51] // Default gray
      };
      
      const statusColor = statusColors[invoiceDetails.paymentStatus] || statusColors.default;
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(` ${invoiceDetails.paymentStatus}`, totalsStartX + 25, totalsY);
      doc.setTextColor(51, 51, 51); // Reset text color
      doc.setFont('helvetica', 'normal');

      // Add notes section if provided
      if (invoiceDetails.notes) {
        const notesY = currentY + 105;
        
        // Check if notes section would go off page, add new page if needed
        if (notesY > pageHeight - 80) {
          doc.addPage();
          currentY = margin + 30; // Reset Y on new page after header
        } else {
          currentY = notesY;
        }
        
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, currentY, contentWidth, 40, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(margin, currentY, contentWidth, 40, 'S');
        
        doc.setTextColor(51, 51, 51);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', margin + 10, currentY + 10);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const notesLines = doc.splitTextToSize(invoiceDetails.notes, contentWidth - 20);
        doc.text(notesLines, margin + 10, currentY + 20);
        
        currentY += 50;
      } else {
        currentY += 105;
      }

      // Check if we need to add a new page for the footer
      if (currentY > pageHeight - 70) {
        doc.addPage();
      }

      // Draw the footer on the current page
      const footerY = pageHeight - 60;
      
      // Footer with accent
      doc.setFillColor(40, 40, 40);
      doc.rect(0, footerY, pageWidth, 60, 'F');
      
      // Accent line
      doc.setFillColor(230, 0, 18);
      doc.rect(0, footerY, pageWidth, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Terms & Conditions:', margin, footerY + 12);
      
      // Terms - responsive column layout
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      // Calculate space for each term
      const termsColWidth = contentWidth / 2;
      const firstCol = margin;
      const secondCol = margin + termsColWidth;
      
      // First column terms
      doc.text('• Payment is due within 30 days', firstCol, footerY + 20);
      doc.text('• All prices include GST as applicable', firstCol, footerY + 26);
      doc.text('• Warranty is provided as per manufacturer terms', firstCol, footerY + 32);
      
      // Second column terms
      doc.text('• Returns accepted within 7 days in original packaging', secondCol, footerY + 20);
      doc.text('• Service charges are non-refundable', secondCol, footerY + 26);
      doc.text('• Installation charges extra if not mentioned', secondCol, footerY + 32);

      // Shop info
      doc.setFont('helvetica', 'bold');
      doc.text('Thank you for your business!', pageWidth - margin, footerY + 12, { align: 'right' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`${shopName}`, pageWidth - margin, footerY + 20, { align: 'right' });
      doc.text(`Phone: ${contactNumber || 'N/A'}`, pageWidth - margin, footerY + 26, { align: 'right' });
      doc.text('Email: support@callmibro.com', pageWidth - margin, footerY + 32, { align: 'right' });
      doc.text('Web: www.callmibro.com', pageWidth - margin, footerY + 38, { align: 'right' });
      doc.text(`Warranty Period: ${invoiceDetails.warrantyPeriod}`, pageWidth - margin, footerY + 46, { align: 'right' });

      // Generate and download PDF
      const pdfBlob = doc.output('blob');
      const fileName = `Invoice_${invoiceDetails.invoiceNumber}_${clientInfo.name.replace(/\s+/g, '_')}.pdf`;
      
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);

      closeModal();
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('There was an error generating the invoice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <button 
        onClick={openModal}
        className={`flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 ${className}`}
        style={{ 
          backgroundColor: isDarkMode ? '#059669' : '#059669',
          color: 'white'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {buttonText}
      </button>

      {/* Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'white' }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
                  Generate Invoice
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Client Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
                    Client Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={clientInfo.companyName}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Client Name *
                      </label>
                      <input
                        type="text"
                        value={clientInfo.name}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                        placeholder="Enter client name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={clientInfo.phone}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={clientInfo.email}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        GST Number
                      </label>
                      <input
                        type="text"
                        value={clientInfo.gstNumber}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, gstNumber: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                        placeholder="Enter GST number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Address
                      </label>
                      <textarea
                        value={clientInfo.address}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, address: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                        placeholder="Enter address"
                      />
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
                    Invoice Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Invoice Number
                      </label>
                      <input
                        type="text"
                        value={invoiceDetails.invoiceNumber}
                        onChange={(e) => setInvoiceDetails(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                        placeholder="Invoice number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Order Number
                      </label>
                      <input
                        type="text"
                        value={invoiceDetails.orderNumber}
                        onChange={(e) => setInvoiceDetails(prev => ({ ...prev, orderNumber: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                        placeholder="Order number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Payment Terms
                      </label>
                      <select
                        value={invoiceDetails.paymentTerms}
                        onChange={(e) => setInvoiceDetails(prev => ({ ...prev, paymentTerms: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                      >
                        <option value="Immediate">Immediate</option>
                        <option value="7 days">7 days</option>
                        <option value="15 days">15 days</option>
                        <option value="30 days">30 days</option>
                        <option value="45 days">45 days</option>
                        <option value="60 days">60 days</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Payment Method
                      </label>
                      <select
                        value={invoiceDetails.paymentMethod}
                        onChange={(e) => setInvoiceDetails(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card (Credit/Debit)</option>
                        <option value="UPI">UPI</option>
                        <option value="Net Banking">Net Banking</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Digital Wallet">Digital Wallet (Paytm/PhonePe)</option>
                        <option value="EMI">EMI</option>
                        <option value="Pending">Pending</option>
                        <option value="Advance">Advance Payment</option>
                        <option value="COD">Cash on Delivery</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Delivery Date
                      </label>
                      <input
                        type="date"
                        value={invoiceDetails.deliveryDate}
                        onChange={(e) => setInvoiceDetails(prev => ({ ...prev, deliveryDate: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Warranty Period
                      </label>
                      <select
                        value={invoiceDetails.warrantyPeriod}
                        onChange={(e) => setInvoiceDetails(prev => ({ ...prev, warrantyPeriod: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                      >
                        <option value="No warranty">No warranty</option>
                        <option value="30 days">30 days</option>
                        <option value="3 months">3 months</option>
                        <option value="6 months">6 months</option>
                        <option value="1 year">1 year</option>
                        <option value="2 years">2 years</option>
                        <option value="3 years">3 years</option>
                        <option value="5 years">5 years</option>
                        <option value="Lifetime">Lifetime</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Service Charges (INR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={invoiceDetails.serviceCharges}
                        onChange={(e) => setInvoiceDetails(prev => ({ ...prev, serviceCharges: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Discount
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={invoiceDetails.discount}
                          onChange={(e) => setInvoiceDetails(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                          style={{ 
                            backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-main)'
                          }}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Type
                        </label>
                        <select
                          value={invoiceDetails.discountType}
                          onChange={(e) => setInvoiceDetails(prev => ({ ...prev, discountType: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                          style={{ 
                            backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-main)'
                          }}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (INR)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Notes
                      </label>
                      <textarea
                        value={invoiceDetails.notes}
                        onChange={(e) => setInvoiceDetails(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                        placeholder="Additional notes for the invoice..."
                      />
                    </div>
                  </div>
                </div>

                {/* Invoice Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
                    Invoice Summary
                  </h3>
                  <div className="space-y-4">
                    {/* Selected Items */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Selected Items ({selectedItems.length})
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedItems.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex items-center justify-between p-2 border rounded"
                            style={{ borderColor: 'var(--border-color)' }}
                          >
                            <div className="flex-1">
                              <div className="font-medium" style={{ color: 'var(--text-main)' }}>
                                {item.name}
                              </div>
                              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 border rounded text-center"
                                style={{ 
                                  backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                                  borderColor: 'var(--border-color)',
                                  color: 'var(--text-main)'
                                }}
                              />
                              <button
                                onClick={() => removeItemFromInvoice(item.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                        {selectedItems.length === 0 && (
                          <div className="text-center py-4 text-gray-500" style={{ color: 'var(--text-secondary)' }}>
                            No items selected
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Totals */}
                    {selectedItems.length > 0 && (
                      <div className="border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                            <span style={{ color: 'var(--text-main)' }}>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                          </div>
                          {calculateDiscount() > 0 && (
                            <div className="flex justify-between">
                              <span style={{ color: 'var(--text-secondary)' }}>
                                Discount ({invoiceDetails.discountType === 'percentage' ? invoiceDetails.discount + '%' : 'INR ' + invoiceDetails.discount}):
                              </span>
                              <span style={{ color: 'var(--text-main)' }}>-₹{calculateDiscount().toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          {invoiceDetails.serviceCharges > 0 && (
                            <div className="flex justify-between">
                              <span style={{ color: 'var(--text-secondary)' }}>Service Charges:</span>
                              <span style={{ color: 'var(--text-main)' }}>₹{invoiceDetails.serviceCharges.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--text-secondary)' }}>GST (18%):</span>
                            <span style={{ color: 'var(--text-main)' }}>₹{calculateTax().toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-2" style={{ borderColor: 'var(--border-color)' }}>
                            <span style={{ color: 'var(--text-main)' }}>Total:</span>
                            <span style={{ color: 'var(--accent-red)' }}>₹{calculateTotal().toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Information */}
                    <div className="border-t pt-4 mt-4" style={{ borderColor: 'var(--border-color)' }}>
                      <h4 className="font-semibold mb-3" style={{ color: 'var(--text-main)' }}>Payment Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Payment Method
                          </label>
                          <select
                            value={invoiceDetails.paymentMethod}
                            onChange={(e) => setInvoiceDetails(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                            style={{ 
                              backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                              borderColor: 'var(--border-color)',
                              color: 'var(--text-main)'
                            }}
                          >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card (Credit/Debit)</option>
                            <option value="UPI">UPI</option>
                            <option value="Net Banking">Net Banking</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Digital Wallet">Digital Wallet (Paytm/PhonePe)</option>
                            <option value="EMI">EMI</option>
                            <option value="Pending">Pending</option>
                            <option value="Advance">Advance Payment</option>
                            <option value="COD">Cash on Delivery</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Payment Status
                          </label>
                          <select
                            value={invoiceDetails.paymentStatus}
                            onChange={(e) => setInvoiceDetails(prev => ({ ...prev, paymentStatus: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                            style={{ 
                              backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                              borderColor: 'var(--border-color)',
                              color: 'var(--text-main)'
                            }}
                          >
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Partial">Partial Payment</option>
                            <option value="Advance">Advance Received</option>
                            <option value="Overdue">Overdue</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                        {(invoiceDetails.paymentStatus === 'Partial' || invoiceDetails.paymentStatus === 'Advance') && (
                          <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                              Amount Received (INR)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={calculateTotal()}
                              step="0.01"
                              value={invoiceDetails.partialAmount}
                              onChange={(e) => setInvoiceDetails(prev => ({ 
                                ...prev, 
                                partialAmount: Math.min(parseFloat(e.target.value) || 0, calculateTotal())
                              }))}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                              style={{ 
                                backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'white',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-main)'
                              }}
                              placeholder="0.00"
                            />
                            {invoiceDetails.partialAmount > 0 && (
                              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded" style={{ backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : '#f9fafb' }}>
                                <div className="flex justify-between text-sm">
                                  <span style={{ color: 'var(--text-secondary)' }}>Amount Received:</span>
                                  <span style={{ color: 'var(--text-main)' }}>₹{invoiceDetails.partialAmount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm font-semibold">
                                  <span style={{ color: 'var(--text-secondary)' }}>Remaining Amount:</span>
                                  <span style={{ color: 'var(--accent-red)' }}>₹{calculateRemainingAmount().toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Inventory */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
                  Select Items from Inventory
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Click to select/deselect items. Double-click to specify quantity.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                  {inventory && inventory.length > 0 ? (
                    inventory.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedItems.some(selected => selected.id === item.id) 
                            ? 'border-[#e60012] bg-red-50 dark:bg-red-900/20' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-[#e60012]'
                        }`}
                        style={{ 
                          borderColor: selectedItems.some(selected => selected.id === item.id) ? '#e60012' : 'var(--border-color)',
                          backgroundColor: selectedItems.some(selected => selected.id === item.id) 
                            ? (isDarkMode ? 'rgba(220, 38, 38, 0.1)' : '#fef2f2')
                            : (isDarkMode ? 'var(--panel-charcoal)' : 'white')
                        }}
                        onClick={() => {
                          if (selectedItems.some(selected => selected.id === item.id)) {
                            removeItemFromInvoice(item.id)
                          } else {
                            addItemToInvoice(item)
                          }
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          const quantity = prompt(`Enter quantity for ${item.name}:`, '1')
                          if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
                            addItemToInvoice(item, parseInt(quantity))
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium" style={{ color: 'var(--text-main)' }}>
                              {item.name}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {item.brand} {item.model}
                            </div>
                            <div className="text-sm font-semibold" style={{ color: 'var(--accent-red)' }}>
                              ₹{item.price.toLocaleString('en-IN')}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Stock: {item.quantity || 0}
                            </div>
                          </div>
                          <div className="ml-2">
                            {selectedItems.some(selected => selected.id === item.id) ? (
                              <svg className="w-5 h-5 text-[#e60012]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500" style={{ color: 'var(--text-secondary)' }}>
                      No inventory items available
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={generateInvoicePDF}
                  disabled={isGenerating || selectedItems.length === 0}
                  className="px-4 py-2 bg-[#e60012] text-white rounded-lg hover:bg-[#d10010] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 