// 1. useEffect for syncing filter state to URL query string is missing `categoryFilter` in its dependency array.
// 2. `expensesInCurrentMonth` includes any expense whose date string <= currentMonthStr, thus includes earlier months, not only the current month.
// Both cause incorrect app state in practice.