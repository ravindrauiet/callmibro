'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function Pagination({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  totalItems = 0,
  itemsPerPage = 6
}) {
  const { isDarkMode } = useTheme()
  
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      if (onPageChange) {
        onPageChange(page)
      }
    }
  }
  
  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages = []
    
    // Always show first page
    pages.push(1)
    
    // Add current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 2 && currentPage > 3) {
        pages.push('...')
      } else {
        pages.push(i)
      }
    }
    
    // Add last ellipsis and last page if needed
    if (currentPage < totalPages - 2) {
      pages.push('...')
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages)
    }
    
    return pages
  }

  return (
    <section className="py-8 sm:py-12" style={{ backgroundColor: 'var(--panel-dark)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-center items-center gap-2">
          {/* Previous button */}
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-10 h-10 flex items-center justify-center rounded-full border ${
              currentPage === 1 
                ? 'cursor-not-allowed' 
                : 'hover:border-[#e60012] hover:text-[#e60012] transition-colors'
            }`}
            style={{ 
              borderColor: 'var(--border-color)',
              color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-main)'
            }}
            aria-label="Previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Page numbers */}
          {getPageNumbers().map((page, index) => (
            <button 
              key={index} 
              onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                page === currentPage 
                  ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white' 
                  : page === '...' 
                    ? 'cursor-default' 
                    : 'hover:text-[#e60012] transition-all'
              }`}
              style={{ 
                backgroundColor: page === currentPage ? '' : page === '...' ? 'transparent' : 'var(--panel-gray)',
                color: page === currentPage ? 'white' : page === '...' ? 'var(--text-secondary)' : 'var(--text-main)'
              }}
              disabled={page === '...'}
            >
              {page}
            </button>
          ))}
          
          {/* Next button */}
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`w-10 h-10 flex items-center justify-center rounded-full border ${
              currentPage === totalPages 
                ? 'cursor-not-allowed' 
                : 'hover:border-[#e60012] hover:text-[#e60012] transition-colors'
            }`}
            style={{ 
              borderColor: 'var(--border-color)',
              color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-main)'
            }}
            aria-label="Next page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
} 