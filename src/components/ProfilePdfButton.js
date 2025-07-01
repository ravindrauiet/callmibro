import React, { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function ProfilePdfButton({ shopName, contactNumber, inventory, buttonText = 'Download PDF', className = '' }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { isDarkMode } = useTheme()

  const generatePDF = async () => {
    setIsGenerating(true)
    
    // Group by brand
    const brandGroups = inventory.reduce((groups, item) => {
      const brand = item.brand || 'Other'
      if (!groups[brand]) {
        groups[brand] = []
      }
      groups[brand].push(item)
      return groups
    }, {})
    
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${shopName} - Inventory List</title>
          <style>
            @media print { @page { margin: 0.5in; size: A4; } body { -webkit-print-color-adjust: exact; } }
            * { box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: white; color: #333; line-height: 1.6; }
            .container { max-width: 100%; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #e60012 0%, #ff6b6b 100%); color: white; padding: 25px 20px; text-align: center; }
            .company-logo { font-size: 16px; font-weight: 500; margin-bottom: 5px; opacity: 0.8; }
            .shop-name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .shop-info { font-size: 12px; opacity: 0.9; margin-bottom: 3px; }
            .list-title { background: #f8f9fa; padding: 15px 20px; text-align: center; border-bottom: 2px solid #e60012; }
            .list-title h1 { margin: 0; font-size: 22px; color: #333; font-weight: bold; }
            .list-title p { margin: 8px 0 0 0; color: #666; font-size: 12px; }
            .brand-section { margin: 25px 0; }
            .brand-header { background: #e60012; color: white; padding: 12px 20px; font-size: 16px; font-weight: bold; border-radius: 5px 5px 0 0; display: flex; justify-content: space-between; align-items: center; }
            .brand-count { background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; font-size: 12px; }
            .items-list { background: white; border: 1px solid #dee2e6; border-top: none; border-radius: 0 0 5px 5px; }
            .item-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid #f1f3f4; }
            .item-row:last-child { border-bottom: none; }
            .item-row:nth-child(even) { background-color: #f8f9fa; }
            .item-info { flex: 1; }
            .item-name { font-weight: bold; color: #333; font-size: 14px; margin-bottom: 2px; }
            .item-details { font-size: 12px; color: #666; }
            .item-price { font-weight: bold; color: #e60012; font-size: 14px; text-align: right; min-width: 80px; }
            .item-quantity { font-size: 12px; color: #666; text-align: center; min-width: 60px; }
            .quantity-badge { display: inline-block; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: bold; }
            .quantity-in-stock { background: #d4edda; color: #155724; }
            .quantity-low { background: #fff3cd; color: #856404; }
            .quantity-out { background: #f8d7da; color: #721c24; }
            .footer { background: #343a40; color: white; text-align: center; padding: 15px; margin-top: 30px; border-radius: 5px; }
            .footer p { margin: 3px 0; font-size: 11px; }
            .footer .highlight { color: #e60012; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="shop-name">${shopName}</div>
              <div class="company-logo">CallMiBro</div>
              <div class="shop-info">📞 ${contactNumber || 'Contact number not available'}</div>
              <div class="shop-info">📅 Generated on: ${new Date().toLocaleDateString('en-IN')}</div>
            </div>
            
            <div class="list-title">
              <h1>Available Inventory</h1>
              <p>Complete list of available items organized by brand</p>
            </div>
            
            ${Object.entries(brandGroups).map(([brand, items]) => `
              <div class="brand-section">
                <div class="brand-header">
                  <span>📦 ${brand}</span>
                  <span class="brand-count">${items.length} items</span>
                </div>
                <div class="items-list">
                  ${items.map(item => {
                    const quantityClass = item.quantity === 0 ? 'quantity-out' : 
                                        item.quantity <= 5 ? 'quantity-low' : 'quantity-in-stock'
                    const quantityText = item.quantity === 0 ? 'Out of Stock' : 
                                        item.quantity <= 5 ? 'Low Stock' : 'In Stock'
                    
                    return `
                      <div class="item-row">
                        <div class="item-info">
                          <div class="item-name">${item.name || 'N/A'}</div>
                          <div class="item-details">
                            ${item.sku ? `SKU: ${item.sku} • ` : ''}
                            ${item.model ? `Model: ${item.model} • ` : ''}
                            ${item.category ? `Category: ${item.category} • ` : ''}
                            ${item.condition ? `Condition: ${item.condition}` : ''}
                          </div>
                        </div>
                        <div class="item-quantity">
                          <span class="quantity-badge ${quantityClass}">
                            ${item.quantity || 0} ${quantityText}
                          </span>
                        </div>
                        <div class="item-price">
                          ₹${item.price ? item.price.toLocaleString('en-IN') : '0'}
                        </div>
                      </div>
                    `
                  }).join('')}
                </div>
              </div>
            `).join('')}
            
            <div class="footer">
              <p><strong>CallMiBro</strong> - Professional Electronics Repair & Spare Parts</p>
              <p>This inventory list was generated for <span class="highlight">${shopName}</span></p>
              <p>For inquiries, please contact: <span class="highlight">${contactNumber || 'Contact number not available'}</span></p>
              <p>Generated on <span class="highlight">${new Date().toLocaleString('en-IN')}</span></p>
            </div>
          </div>
        </body>
      </html>
    `
    
    try {
      // Create a blob from the HTML content
      const blob = new Blob([pdfContent], { type: 'text/html' })
      
      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob)
      
      // Create a temporary iframe to render the content
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = url
      document.body.appendChild(iframe)
      
      iframe.onload = () => {
        // Wait for iframe to load, then trigger print
        setTimeout(() => {
          iframe.contentWindow.print()
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(iframe)
            URL.revokeObjectURL(url)
            setIsGenerating(false)
            
            // Create a PDF file
            const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' })
            const fileName = `${shopName.replace(/\s+/g, '_')}_Inventory_${new Date().toISOString().split('T')[0]}.pdf`
            
            // Create a file object for sharing
            const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' })
            
            // Check if Web Share API is supported and can share files
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
              navigator.share({
                title: `${shopName} - Inventory List`,
                text: `Check out the inventory list from ${shopName}`,
                files: [pdfFile]
              })
              .then(() => console.log('PDF shared successfully'))
              .catch(error => {
                console.error('Error sharing PDF:', error)
                // Fallback to WhatsApp direct link
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shopName} - Inventory List`)}`
                window.open(whatsappUrl, '_blank')
              })
            } else {
              // Fallback for browsers that don't support file sharing
              // Create a direct WhatsApp link
              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shopName} - Inventory List is ready! Please check your downloads folder for the PDF file.`)}`
              window.open(whatsappUrl, '_blank')
              
              // Also download the file
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
            
          }, 2000)
        }, 1000)
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      setIsGenerating(false)
    }
  }

  return (
    <button 
      onClick={generatePDF} 
      disabled={isGenerating}
      className={`flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 ${className} ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ 
        backgroundColor: isDarkMode ? '#2563eb' : '#2563eb',
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