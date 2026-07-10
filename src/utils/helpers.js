export const CATEGORIES = ['Food', 'Travel', 'Rent', 'Fun', 'Other'];

// Helper to get local date string YYYY-MM-DD
export const getLocalTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Helper to get current YYYY-MM
export const getLocalCurrentMonthString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
};

// Helper to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Helper to format date for display (e.g. "Jul 8, 2026")
export const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Helper to get current month display name (e.g. "July 2026")
export const getCurrentMonthDisplayName = () => {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

// Helper to validate individual form fields (hardened trimming and range constraints)
export const validateField = (name, value) => {
  let error = '';
  if (name === 'description') {
    const trimmed = value.trim();
    if (!trimmed) {
      error = 'Description is required';
    } else if (trimmed.length < 3) {
      error = 'Description must be at least 3 characters';
    }
  } else if (name === 'amount') {
    const trimmed = String(value).trim();
    if (!trimmed) {
      error = 'Amount is required';
    } else {
      const num = Number(trimmed);
      if (isNaN(num) || !isFinite(num)) {
        error = 'Amount must be a valid number';
      } else if (num <= 0) {
        error = 'Amount must be a positive number';
      }
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

// Category symbols mapping
export const categorySymbols = {
  Food: '🍔',
  Travel: '✈️',
  Rent: '🏠',
  Fun: '🎉',
  Other: '🏷️'
};
