import React, { useState } from 'react';
import { formatDateDisplay, formatCurrency, categorySymbols } from '../utils/helpers';

function ExpenseRow({ expense, onEdit, onDelete }) {
  // Custom in-app inline delete confirmation state (replaces window.confirm)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (isConfirmingDelete) {
    return (
      <div 
        className="expense-card"
        style={{ borderLeft: `4px solid var(--danger)` }}
      >
        <div className="delete-confirm-container">
          <span className="delete-confirm-title">
            🗑️ Delete "{expense.description}"?
          </span>
          <p className="delete-confirm-subtitle">
            This action cannot be undone.
          </p>
          <div className="delete-confirm-actions">
            <button 
              className="btn btn-secondary" 
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary bg-danger-override" 
              type="button"
              onClick={() => {
                onDelete(expense.id);
                setIsConfirmingDelete(false);
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="expense-card"
      style={{ borderLeft: `4px solid var(--cat-${expense.category.toLowerCase()})` }}
    >
      <div className="expense-card-top">
        <div className="expense-desc-group">
          <span className="expense-desc">{expense.description}</span>
          <div className="expense-tag-row">
            <span 
              className="expense-tag"
              style={{ '--cat-bg': `var(--cat-${expense.category.toLowerCase()})` }}
            >
              {categorySymbols[expense.category]} {expense.category}
            </span>
            <span className="expense-date">{formatDateDisplay(expense.date)}</span>
          </div>
        </div>
        <span className="expense-amount">{formatCurrency(expense.amount)}</span>
      </div>

      {expense.note && (
        <p 
          className="expense-note"
          style={{ '--cat-color': `var(--cat-${expense.category.toLowerCase()})` }}
        >
          {expense.note}
        </p>
      )}

      <div className="expense-actions">
        <button 
          className="btn btn-edit"
          onClick={() => onEdit(expense)}
        >
          Edit
        </button>
        <button 
          className="btn btn-danger"
          onClick={() => setIsConfirmingDelete(true)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default ExpenseRow;
