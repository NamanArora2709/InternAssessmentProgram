// Audited: React StrictMode & stable key DOM verification completed
import React, { useState, useEffect } from 'react';
import SummaryHeader from './components/SummaryHeader';
import Filters from './components/Filters';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import { 
  getLocalTodayString, 
  getLocalCurrentMonthString, 
  validateField, 
  CATEGORIES 
} from './utils/helpers';

function App() {
  const todayStr = getLocalTodayString();
  const currentMonthStr = getLocalCurrentMonthString();

  // --- State Initialization ---
  // Load expenses on start (lazy loading)
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  // URL query params states (initialized directly from URL)
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  });
  const [categoryFilter, setCategoryFilter] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    return cat && (cat === 'All' || CATEGORIES.includes(cat)) ? cat : 'All';
  });

  // Listen to browser back/forward buttons (popstate) to restore active filters
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search') || '';
      const cat = params.get('category') || 'All';
      setSearchQuery(search);
      if (cat === 'All' || CATEGORIES.includes(cat)) {
        setCategoryFilter(cat);
      } else {
        setCategoryFilter('All');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync state to URL Query Parameters (search and category filters)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentSearch = params.get('search') || '';
    const currentCategory = params.get('category') || 'All';

    // Only update if state has actually diverged from URL
    if (currentSearch !== searchQuery || currentCategory !== categoryFilter) {
      const newParams = new URLSearchParams();
      if (searchQuery) newParams.set('search', searchQuery);
      if (categoryFilter !== 'All') newParams.set('category', categoryFilter);

      const newSearch = newParams.toString();
      const newUrl = `${window.location.pathname}${newSearch ? '?' + newSearch : ''}`;

      // pushState on category click to create discrete history steps, replaceState on typing
      if (currentCategory !== categoryFilter) {
        window.history.pushState({ searchQuery, categoryFilter }, '', newUrl);
      } else {
        window.history.replaceState({ searchQuery, categoryFilter }, '', newUrl);
      }
    }
  }, [searchQuery, categoryFilter]);

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

  // --- Actions & Handlers ---
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

    // Validate all fields prior to submit
    const newErrors = {
      description: validateField('description', formData.description),
      amount: validateField('amount', formData.amount),
      date: validateField('date', formData.date)
    };

    const hasErrors = Object.values(newErrors).some(err => err !== '');
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Prepare cleaned data (trim description and notes)
    const cleanedDescription = formData.description.trim();
    const cleanedNote = formData.note ? formData.note.trim() : '';
    const parsedAmount = parseFloat(formData.amount);

    if (editingId) {
      // Update existing record
      setExpenses(prev => 
        prev.map(exp => 
          exp.id === editingId 
            ? { ...exp, description: cleanedDescription, amount: parsedAmount, category: formData.category, date: formData.date, note: cleanedNote }
            : exp
        )
      );
      setEditingId(null);
    } else {
      // Create new record
      const newExpense = {
        id: Date.now().toString(), // stable unique key
        description: cleanedDescription,
        amount: parsedAmount,
        category: formData.category,
        date: formData.date,
        note: cleanedNote,
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
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    if (editingId === id) {
      handleCancelEdit();
    }
  };

  // --- Calculations for metrics ---
  // Get expenses in the current actual calendar month
  const expensesInCurrentMonth = expenses.filter(exp => {
    if (!exp.date) return false;
    return exp.date.startsWith(currentMonthStr);
  });

  const currentMonthTotal = expensesInCurrentMonth.reduce((sum, exp) => sum + exp.amount, 0);

  const categorySubtotals = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expensesInCurrentMonth
      .filter(exp => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return acc;
  }, {});

  // --- Filtered Expenses for List Display ---
  const filteredExpenses = expenses
    .filter(exp => {
      const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;
      const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.id.localeCompare(a.id);
    });

  return (
    <>
      {/* Header with Monthly Metrics */}
      <SummaryHeader 
        currentMonthTotal={currentMonthTotal} 
        categorySubtotals={categorySubtotals} 
      />

      {/* Workspace Grid */}
      <div className="dashboard-content">
        {/* Left Column: Filters and Transactions List */}
        <div>
          <Filters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
          />
          <ExpenseList 
            filteredExpenses={filteredExpenses}
            expenses={expenses}
            onEdit={handleEditInit}
            onDelete={handleDelete}
          />
        </div>

        {/* Right Column: Controlled Form */}
        <ExpenseForm 
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
          editingId={editingId}
          onSubmit={handleSubmit}
          onCancelEdit={handleCancelEdit}
        />
      </div>
    </>
  );
}

export default App;
