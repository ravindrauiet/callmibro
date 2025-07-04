import React, { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * ProfilePdfButton Component
 * 
 * Design Notes:
 * - Brand color (red #e60012) is used sparingly as accent only:
 *   1. Left border of section headers
 *   2. Top border of footer
 *   3. Small line before summary title
 * - Main colors are dark gray (#333333) for headers and neutral grays for content
 * - This creates a professional, clean design with subtle brand presence
 */

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
      
      // Calculate summary statistics
      const totalItems = inventory.length
      const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price || 0), 0)
      const outOfStock = inventory.filter(item => item.quantity === 0).length
      const lowStock = inventory.filter(item => item.quantity <= 5 && item.quantity > 0).length
      const inStock = inventory.filter(item => item.quantity > 5).length
      
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
      
      // Define consistent margins
      const margin = 10
      const pageWidth = doc.internal.pageSize.getWidth()
      const contentWidth = pageWidth - (margin * 2)
      let yPos = 42
      
      // MODERN HEADER
      // Dark gray header bar instead of red
      doc.setFillColor(51, 51, 51) // #333333 dark gray color
      doc.rect(0, 0, pageWidth, 32, 'F') // increased height
      
      // Logo placeholder (left)
      doc.setFillColor(255, 255, 255) // White circle for logo
      doc.circle(margin + 8, 20, 7, 'F') // moved down
      // Uncomment to add a real logo: doc.addImage(logoImg, 'PNG', margin, 14, 15, 15)
      
      // Shop name (right side of logo)
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(shopName, margin + 20, 21) // moved down
      
      // Contact info (right aligned)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`Contact: ${contactNumber || 'Not available'}`, pageWidth - margin, 16, { align: 'right' })
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, 21, { align: 'right' })
      doc.text('CallMiBro', pageWidth - margin, 26, { align: 'right' })
      
      // Title bar
      doc.setFillColor(245, 245, 245) // Light gray background
      doc.rect(0, 32, pageWidth, 12, 'F') // moved down
      
      doc.setTextColor(40, 40, 40) // Dark gray text
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('INVENTORY REPORT', margin, 40) // moved down
      
      // SUMMARY SECTION
      yPos = 48 // start content lower for proper gap
      
      // Summary title with red accent
      doc.setDrawColor(230, 0, 18) // Red border accent
      doc.setLineWidth(0.5)
      doc.line(margin, yPos, margin + 5, yPos) // Small red line
      doc.setTextColor(40, 40, 40)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('INVENTORY SUMMARY', margin + 8, yPos)
      
      yPos += 5
      
      // Summary cards grid - 5 boxes in a row
      const cardWidth = contentWidth / 5
      const cardHeight = 18
      const startY = yPos
      
      // Create summary cards
      const summaryItems = [
        { label: 'Total Items', value: totalItems },
        { label: 'In Stock', value: inStock },
        { label: 'Low Stock', value: lowStock },
        { label: 'Out of Stock', value: outOfStock },
        // { label: 'Total Value', value: `INR ${totalValue.toLocaleString('en-IN')}` }
      ]
      
      summaryItems.forEach((item, index) => {
        const cardX = margin + (index * cardWidth)
        
        // Card background
        doc.setFillColor(248, 248, 248) // Light gray
        doc.rect(cardX, startY, cardWidth - 2, cardHeight, 'F')
        
        // Value (dark gray instead of red)
        doc.setTextColor(51, 51, 51) // Dark gray
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(String(item.value), cardX + (cardWidth - 2) / 2, startY + 8, { align: 'center' })
        
        // Label
        doc.setTextColor(80, 80, 80) // Dark gray
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text(item.label, cardX + (cardWidth - 2) / 2, startY + 14, { align: 'center' })
      })
      
      yPos += cardHeight + 5
      
      // BRAND SECTIONS
      Object.entries(brandGroups).forEach(([brand, items]) => {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage()
          yPos = margin
        }
        
        // Brand header with left border
        doc.setFillColor(245, 245, 245) // Light gray background
        doc.rect(margin, yPos, contentWidth, 8, 'F')
        
        // Red left border (keeping as brand accent)
        doc.setFillColor(230, 0, 18)
        doc.rect(margin, yPos, 3, 8, 'F')
        
        doc.setTextColor(40, 40, 40)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text(`${brand} (${items.length} items)`, margin + 6, yPos + 5.5)
        
        yPos += 10
        
        // Table headers (changed to dark gray instead of red)
        const headers = [['Item Name', 'SKU', 'Price', 'Qty']]
        
        // Table data with right-aligned numbers
        const data = items.map(item => {
          let stockStatus = ''
          if (item.quantity === 0) stockStatus = 'Out of Stock'
          else if (item.quantity <= 5) stockStatus = 'Low Stock'
          else stockStatus = 'In Stock'
          
          return [
            item.name || 'N/A',
            item.sku || 'N/A',
            { content: `INR ${item.price ? item.price.toLocaleString('en-IN') : '0'}`, styles: { halign: 'right' } },
            { content: `${item.quantity || 0} (${stockStatus})`, styles: { halign: 'center' } }
          ]
        })
        
        // Add table using autoTable plugin
        autoTable(doc, {
          startY: yPos,
          head: headers,
          body: data,
          margin: { left: margin, right: margin },
          headStyles: {
            fillColor: [51, 51, 51], // Dark gray header instead of red
            textColor: [255, 255, 255], // White text
            fontStyle: 'bold',
            cellPadding: 3
          },
          alternateRowStyles: {
            fillColor: [248, 248, 248] // Light gray
          },
          styles: {
            fontSize: 8,
            cellPadding: 2,
            lineColor: [220, 220, 220], // Light border
            lineWidth: 0.1
          },
          columnStyles: {
            0: { cellWidth: contentWidth * 0.40 }, // 40% for name
            1: { cellWidth: contentWidth * 0.20 }, // 20% for SKU
            2: { cellWidth: contentWidth * 0.20, halign: 'right' }, // 20% for price, right-aligned
            3: { cellWidth: contentWidth * 0.20, halign: 'center' } // 20% for quantity, centered
          },
          didDrawPage: function(data) {
            // Re-add header on each page
            doc.setFillColor(51, 51, 51) // Dark gray header
            doc.rect(0, 0, pageWidth, 12, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text(shopName, margin + 20, 8)
            doc.setFontSize(7)
            doc.text('Inventory Report', pageWidth - margin, 8, { align: 'right' })
            
            // Add page number
            doc.setTextColor(100, 100, 100)
            doc.setFontSize(7)
            doc.setFont('helvetica', 'normal')
            doc.text(`Page ${data.pageNumber}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 5, { align: 'right' })
          }
        })
        
        // Update yPos for next section
        yPos = doc.lastAutoTable.finalY + 6
      })
      
      // MODERN FOOTER
      const footerHeight = 15
      const footerY = doc.internal.pageSize.getHeight() - footerHeight
      
      // Footer bar (dark gray)
      doc.setFillColor(51, 51, 51) // Dark gray
      doc.rect(0, footerY, pageWidth, footerHeight, 'F')
      
      // Red accent line (keeping as brand accent)
      doc.setFillColor(230, 0, 18) // Red
      doc.rect(0, footerY, pageWidth, 2, 'F')
      
      // Left side - shop info
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text('CallMiBro - Professional Electronics Repair', margin, footerY + 7)
      doc.text(`Shop: ${shopName}`, margin, footerY + 12)
      
      // Right side - contact & thank you
      doc.setFont('helvetica', 'bold')
      doc.text('Thank you for your business!', pageWidth - margin, footerY + 7, { align: 'right' })
      doc.setFont('helvetica', 'normal')
      doc.text(`Contact: ${contactNumber || 'Not available'}`, pageWidth - margin, footerY + 12, { align: 'right' })
      
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