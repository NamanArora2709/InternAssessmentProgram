import React from 'react';
import ExpenseRow from './ExpenseRow';
import EmptyState from './EmptyState';

function ExpenseList({ filteredExpenses, expenses, onEdit, onDelete }) {
  return (
    <section className="list-section">
      <div className="list-section-header">
        <h2>List of Expenses</h2>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Showing {filteredExpenses.length} record{filteredExpenses.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="expense-list">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map(expense => (
            <ExpenseRow 
              key={expense.id} 
              expense={expense}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <EmptyState hasExpenses={expenses.length > 0} />
        )}
      </div>
    </section>
  );
}

export default ExpenseList;
