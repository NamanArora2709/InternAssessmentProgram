import React from 'react';

function EmptyState({ hasExpenses }) {
  if (!hasExpenses) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📅</span>
        <h3>No expenses yet</h3>
        <p>You haven't added any expenses yet. Use the form on the right to add your first expense!</p>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <span className="empty-icon">🔍</span>
      <h3>No results found</h3>
      <p>No expenses match your search query or selected category filter. Try clearing them.</p>
    </div>
  );
}

export default EmptyState;
