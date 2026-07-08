import React, { useState, useEffect } from 'react';

// Categories options as per requirements
const CATEGORIES = ['Food', 'Travel', 'Rent', 'Fun', 'Other'];

// Helper to get local date string YYYY-MM-DD
const getLocalTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Helper to get current YYYY-MM
const getLocalCurrentMonthString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
};

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Helper to format date for display (e.g. "Jul 8, 2026")
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

function App() {
  const todayStr = getLocalTodayString();
  const defaultMonthStr = getLocalCurrentMonthString();

  // --- State Initialization ---
  // Load expenses on start
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  // URL query params initialization
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState(defaultMonthStr);

  // Parse URL on initial render
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    const categoryParam = params.get('category');
    const monthParam = params.get('month');

    if (searchParam !== null) setSearchQuery(searchParam);
    if (categoryParam !== null && (categoryParam === 'All' || CATEGORIES.includes(categoryParam))) {
      setCategoryFilter(categoryParam);
    }
    if (monthParam !== null && /^\d{4}-\d{2}$/.test(monthParam)) {
      setSelectedMonth(monthParam);
    }
  }, []);

  // Sync state to URL Query Parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (categoryFilter !== 'All') params.set('category', categoryFilter);
    if (selectedMonth !== defaultMonthStr) params.set('month', selectedMonth);

    const newSearch = params.toString();
    const newUrl = `${window.location.pathname}${newSearch ? '?' + newSearch : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, categoryFilter, selectedMonth]);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Form states
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: todayStr,
    note: ''
  });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  // --- Form Validation ---
  const validateField = (name, value) => {
    let error = '';
    if (name === 'description') {
      if (!value.trim()) {
        error = 'Description is required';
      } else if (value.trim().length < 3) {
        error = 'Description must be at least 3 characters';
      }
    } else if (name === 'amount') {
      const num = parseFloat(value);
      if (!value || isNaN(num)) {
        error = 'Amount is required';
      } else if (num <= 0) {
        error = 'Amount must be a positive number';
      }
    } else if (name === 'date') {
      if (!value) {
        error = 'Date is required';
      } else {
        const today = getLocalTodayString();
        if (value > today) {
          error = 'Date cannot be in the future';
        }
      }
    }
    return error;
  };

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

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      description: '',
      amount: '',
      category: 'Food',
      date: todayStr,
      note: ''
    });
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      description: validateField('description', formData.description),
      amount: validateField('amount', formData.amount),
      date: validateField('date', formData.date)
    };

    // Filter out empty errors
    const hasErrors = Object.values(newErrors).some(err => err !== '');
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    if (editingId) {
      // Update existing record
      setExpenses(prev => 
        prev.map(exp => 
          exp.id === editingId 
            ? { ...exp, ...formData, amount: parseFloat(formData.amount) }
            : exp
        )
      );
      setEditingId(null);
    } else {
      // Create new record
      const newExpense = {
        id: Date.now().toString(), // Stable unique ID
        ...formData,
        amount: parseFloat(formData.amount),
        createdAt: new Date().toISOString()
      };
      setExpenses(prev => [newExpense, ...prev]);
    }

    // Reset Form
    setFormData({
      description: '',
      amount: '',
      category: 'Food',
      date: todayStr,
      note: ''
    });
    setErrors({});
  };

  const handleEditInit = (expense) => {
    setEditingId(expense.id);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      note: expense.note || ''
    });
    setErrors({});
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      if (editingId === id) {
        handleCancelEdit();
      }
    }
  };

  // --- Calculations for metrics ---
  // Get expenses in the selected month
  const expensesInSelectedMonth = expenses.filter(exp => {
    if (!exp.date) return false;
    return exp.date.startsWith(selectedMonth);
  });

  const currentMonthTotal = expensesInSelectedMonth.reduce((sum, exp) => sum + exp.amount, 0);

  const categorySubtotals = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expensesInSelectedMonth
      .filter(exp => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return acc;
  }, {});

  // --- Filtering for expense list ---
  // Note: the list displays expenses filtered by search & category filter, but is NOT restricted to the selected month, 
  // or is it? The dashboard has a monthly picker which defines "the current-month total". It's best if the list shows 
  // all expenses that match search/filter, sorted newest first, showing their full details. 
  // Let's filter the list by search and category filter. Let's keep the list global but let user view all months, 
  // or restrict it to the selected month? Wait! If the user changes the month, they might want to see the list filtered 
  // by that month as well. But let's check: "Outcome: A personal expense tracker where you add, edit, search, and filter expenses and always see accurate monthly totals."
  // If the list is global, search and filter apply to all. This is very powerful, but to make the subtotals and totals matching,
  // let's filter the list by the selected month as well, or let the list show all months. 
  // Let's filter the list by the selected month *in addition* to search and category filter. This makes the screen unified, 
  // showing only the selected month's expenses and subtotals. This matches "Header shows the current-month total and per-category subtotals for the current month, always derived live from the data." 
  // Let's check: if we filter the list by selected month, it's very consistent. But what if there are no expenses in that month? 
  // We show empty state "no expenses matching".
  // Let's apply: Month filter + Category filter + Search query. That is super clean and matches exactly what a user expects!
  // Wait, let's check if the requirements say: "Search + filter combined show the right rows and the right subtotals."
  // If the list is filtered by month, search, and category, then the totals and rows match perfectly. Let's implement that!
  
  const filteredExpenses = expenses
    .filter(exp => {
      // Month match
      const matchesMonth = exp.date && exp.date.startsWith(selectedMonth);
      // Category match
      const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;
      // Search match (case-insensitive)
      const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesMonth && matchesCategory && matchesSearch;
    })
    // Sort newest first: primary by date (descending), secondary by stable ID/creation time (descending)
    .sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.id.localeCompare(a.id);
    });

  // Check if there are any expenses at all in localStorage for this month
  const hasExpensesInMonth = expenses.some(exp => exp.date && exp.date.startsWith(selectedMonth));

  // Category symbols mapping
  const categorySymbols = {
    Food: '🍔',
    Travel: '✈️',
    Rent: '🏠',
    Fun: '🎉',
    Other: '🏷️'
  };

  return (
    <>
      {/* App Header */}
      <header className="app-header glass-panel">
        <div className="app-title-group">
          <h1>Expense Tracker</h1>
          <p>Manage and track your monthly spending</p>
        </div>
        <div className="month-picker-container">
          <label htmlFor="month-select">Selected Month</label>
          <input 
            type="month" 
            id="month-select" 
            className="month-input" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </header>

      {/* Metrics Dashboard */}
      <section className="metrics-grid">
        <div className="total-card glass-panel">
          <span className="total-label">Monthly Total</span>
          <span className="total-amount">{formatCurrency(currentMonthTotal)}</span>
        </div>

        <div className="glass-panel">
          <span className="total-label" style={{ display: 'block', marginBottom: '1rem' }}>Category Subtotals</span>
          <div className="category-subtotals">
            {CATEGORIES.map(cat => {
              const amount = categorySubtotals[cat] || 0;
              const percent = currentMonthTotal > 0 ? (amount / currentMonthTotal) * 100 : 0;
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

      {/* Main Grid: Left List, Right Form */}
      <div className="dashboard-content">
        {/* Expenses List & Filters */}
        <section className="list-section">
          {/* Search & Filter Controls */}
          <div className="filter-bar glass-panel">
            <div className="search-wrapper">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search expenses by description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="list-section-header">
            <h2>List of Expenses</h2>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Showing {filteredExpenses.length} record{filteredExpenses.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Expenses List Render */}
          <div className="expense-list">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map(expense => (
                <div 
                  key={expense.id} 
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
                      onClick={() => handleEditInit(expense)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(expense.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Distinct empty states
              !hasExpensesInMonth ? (
                <div className="empty-state">
                  <span className="empty-icon">📅</span>
                  <h3>No expenses yet</h3>
                  <p>You haven't added any expenses for this month yet. Use the form to add your first expense!</p>
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">🔍</span>
                  <h3>No results found</h3>
                  <p>No expenses match your search query or selected category filter. Try widening your criteria.</p>
                </div>
              )
            )}
          </div>
        </section>

        {/* Add/Edit Sticky Form */}
        <section className="form-section">
          <div className="glass-panel sticky-form">
            <h2 className="form-title">
              {editingId ? '✏️ Edit Expense' : '➕ Add Expense'}
            </h2>
            <form onSubmit={handleSubmit} noValidate>
              
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
                    onClick={handleCancelEdit}
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
      </div>
    </>
  );
}

export default App;
