import React from 'react';
import { formatCurrency, getCurrentMonthDisplayName, CATEGORIES, categorySymbols } from '../utils/helpers';

function SummaryHeader({ currentMonthTotal, categorySubtotals }) {
  const currentMonthName = getCurrentMonthDisplayName();

  return (
    <>
      {/* App Title Header */}
      <header className="app-header glass-panel">
        <div className="app-title-group">
          <h1>Expense Tracker</h1>
          <p>Manage and track your monthly spending</p>
        </div>
        <div className="month-picker-container">
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Current Month
          </span>
          <span className="month-input" style={{ cursor: 'default', display: 'inline-block', fontWeight: 600 }}>
            {currentMonthName}
          </span>
        </div>
      </header>

      {/* Metrics Cards */}
      <section className="metrics-grid">
        <div className="total-card glass-panel">
          <span className="total-label">{currentMonthName} Total</span>
          <span className="total-amount">{formatCurrency(currentMonthTotal)}</span>
        </div>

        <div className="glass-panel">
          <span className="total-label" style={{ display: 'block', marginBottom: '1rem' }}>
            Category Subtotals ({currentMonthName})
          </span>
          <div className="category-subtotals">
            {CATEGORIES.map(cat => {
              const amount = categorySubtotals[cat] || 0;
              return (
                <div 
                  key={cat} 
                  className="subtotal-card"
                  style={{ '--cat-color': `var(--cat-${cat.toLowerCase()})` }}
                >
                  <span className="subtotal-name">
                    {categorySymbols[cat]} {cat}
                  </span>
                  <span className="subtotal-val">{formatCurrency(amount)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export default SummaryHeader;
