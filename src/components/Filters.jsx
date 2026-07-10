import React from 'react';
import { CATEGORIES } from '../utils/helpers';

function Filters({ searchQuery, setSearchQuery, categoryFilter, setCategoryFilter }) {
  return (
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
  );
}

export default Filters;
