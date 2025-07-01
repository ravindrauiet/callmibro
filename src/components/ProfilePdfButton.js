import React, { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Set up worker for PDF.js
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function ProfilePdfButton({ shopName, contactNumber, inventory, buttonText = 'Download PDF', className = '' }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { isDarkMode } = useTheme()

  const generateAndSharePDF = async () => {
    setIsGenerating(true)
    
    try {
      // Group by brand
      const brandGroups = inventory.reduce((groups, item) => {
        const brand = item.brand || 'Other'
        if (!groups[brand]) {
          groups[brand] = []
        }
        groups[brand].push(item)
        return groups
      }, {})
      
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      // Set document properties
      doc.setProperties({
        title: `${shopName} - Inventory List`,
        subject: 'Inventory List',
        author: 'CallMiBro',
        creator: 'CallMiBro'
      })
      
      // Add header
      doc.setFillColor(230, 0, 18) // #e60012 red color
      doc.rect(0, 0, 210, 40, 'F')
      
      // Shop name
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text(shopName, 105, 15, { align: 'center' })
      
      // CallMiBro text
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('CallMiBro', 105, 22, { align: 'center' })
      
      // Contact info
      doc.setFontSize(10)
      doc.text(`Contact: ${contactNumber || 'Not available'}`, 105, 28, { align: 'center' })
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 34, { align: 'center' })
      
      // Title
      doc.setFillColor(248, 249, 250) // Light gray background
      doc.rect(0, 40, 210, 15, 'F')
      
      doc.setTextColor(51, 51, 51) // #333333
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Available Inventory', 105, 48, { align: 'center' })
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Complete list of available items organized by brand', 105, 53, { align: 'center' })
      
      // Starting Y position for content
      let yPos = 60
      
      // For each brand group
      Object.entries(brandGroups).forEach(([brand, items]) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }
        
        // Brand header
        doc.setFillColor(230, 0, 18) // #e60012
        doc.rect(15, yPos, 180, 10, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(`${brand} (${items.length} items)`, 20, yPos + 6)
        
        yPos += 12
        
        // Table headers
        const headers = [['Item Name', 'SKU', 'Price', 'Qty']]
        
        // Table data
        const data = items.map(item => {
          let stockStatus = ''
          if (item.quantity === 0) stockStatus = 'Out of Stock'
          else if (item.quantity <= 5) stockStatus = 'Low Stock'
          else stockStatus = 'In Stock'
          
          return [
            item.name || 'N/A',
            item.sku || 'N/A',
            `₹${item.price ? item.price.toLocaleString('en-IN') : '0'}`,
            `${item.quantity || 0} (${stockStatus})`
          ]
        })
        
        // Add table using autoTable plugin
        autoTable(doc, {
          startY: yPos,
          head: headers,
          body: data,
          margin: { left: 15, right: 15 },
          headStyles: {
            fillColor: [248, 249, 250],
            textColor: [51, 51, 51],
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          styles: {
            fontSize: 10
          }
        })
        
        // Update yPos for next section
        yPos = doc.lastAutoTable.finalY + 10
      })
      
      // Add footer on the last page
      doc.setFillColor(52, 58, 64) // #343a40
      doc.rect(15, doc.internal.pageSize.height - 20, 180, 15, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('CallMiBro - Professional Electronics Repair & Spare Parts', 105, doc.internal.pageSize.height - 15, { align: 'center' })
      doc.text(`This inventory list was generated for ${shopName}`, 105, doc.internal.pageSize.height - 11, { align: 'center' })
      doc.text(`For inquiries, please contact: ${contactNumber || 'Contact number not available'}`, 105, doc.internal.pageSize.height - 7, { align: 'center' })
      
      // Generate PDF as blob
      const pdfBlob = doc.output('blob')
      const fileName = `${shopName.replace(/\s+/g, '_')}_Inventory_${new Date().toISOString().split('T')[0]}.pdf`
      
      // Create a File object for sharing
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' })
      
      // Try to share the PDF directly using Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: `${shopName} - Inventory List`,
            text: `Check out the inventory list from ${shopName}`
          })
          console.log('PDF shared successfully')
        } catch (error) {
          console.error('Error sharing PDF:', error)
          
          // If sharing fails, fall back to opening WhatsApp directly
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shopName} - Inventory List is ready! Check it out.`)}`
          window.open(whatsappUrl, '_blank')
          
          // Also download the PDF
          const pdfUrl = URL.createObjectURL(pdfBlob)
          const downloadLink = document.createElement('a')
          downloadLink.href = pdfUrl
          downloadLink.download = fileName
          document.body.appendChild(downloadLink)
          downloadLink.click()
          document.body.removeChild(downloadLink)
          
          // Clean up
          setTimeout(() => {
            URL.revokeObjectURL(pdfUrl)
          }, 1000)
        }
      } else {
        // If Web Share API is not supported, open WhatsApp directly
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shopName} - Inventory List is ready! Check it out.`)}`
        window.open(whatsappUrl, '_blank')
        
        // Also download the PDF
        const pdfUrl = URL.createObjectURL(pdfBlob)
        const downloadLink = document.createElement('a')
        downloadLink.href = pdfUrl
        downloadLink.download = fileName
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl)
        }, 1000)
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('There was an error generating the PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button 
      onClick={generateAndSharePDF} 
      disabled={isGenerating}
      className={`flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 ${className} ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ 
        backgroundColor: isDarkMode ? '#2563eb' : '#2563eb',
        color: 'white'
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
      {isGenerating ? 'Generating...' : buttonText}
    </button>
  )
} 