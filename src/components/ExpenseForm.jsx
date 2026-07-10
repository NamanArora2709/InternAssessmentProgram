import React from 'react';
import { CATEGORIES, categorySymbols, validateField } from '../utils/helpers';

function ExpenseForm({ 
  formData, 
  setFormData, 
  errors, 
  setErrors, 
  editingId, 
  onSubmit, 
  onCancelEdit 
}) {

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Live validation clean-up
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  return (
    <section className="form-section">
      <div className="glass-panel sticky-form">
        <h2 className="form-title">
          {editingId ? '✏️ Edit Expense' : '➕ Add Expense'}
        </h2>
        <form onSubmit={onSubmit} noValidate>
          
          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input 
              type="text" 
              id="description"
              name="description"
              className="form-control"
              placeholder="e.g. Grocery shopping"
              value={formData.description}
              onChange={handleInputChange}
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>

          {/* Amount */}
          <div className="form-group">
            <label htmlFor="amount">Amount ($)</label>
            <input 
              type="number" 
              id="amount"
              name="amount"
              step="0.01"
              min="0.01"
              className="form-control"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleInputChange}
            />
            {errors.amount && (
              <span className="error-message">{errors.amount}</span>
            )}
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select 
              id="category"
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleInputChange}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {categorySymbols[cat]} {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input 
              type="date" 
              id="date"
              name="date"
              className="form-control"
              value={formData.date}
              onChange={handleInputChange}
            />
            {errors.date && (
              <span className="error-message">{errors.date}</span>
            )}
          </div>

          {/* Note */}
          <div className="form-group">
            <label htmlFor="note">Note (Optional)</label>
            <textarea 
              id="note"
              name="note"
              className="form-control"
              placeholder="Additional details..."
              value={formData.note}
              onChange={handleInputChange}
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            {editingId && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onCancelEdit}
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>

        </form>
      </div>
    </section>
  );
}

export default ExpenseForm;
