# ProxyList Component - Developer Quick Reference

## File Structure

```
client/src/pages/proxy/
├── ProxyList.tsx        ← Main component with DataTable
├── ProxyList.css        ← Responsive styles
└── proxyRow.tsx         ← [Deprecated - no longer used]
```

## Key Component Features

### State Variables

```typescript
const [page, setPage]; // Current page (1-based)
const [limit, setLimit]; // Rows per page (5, 10, 25, 50, 100)
const [total, setTotal]; // Total number of records
const [search, setSearch]; // Search query string
const [sortOrder, setSortOrder]; // "asc" or "desc"
const [apiData, setApiData]; // Array of IProxy objects
const [loading, setLoading]; // Loading state
const [selectedRow, setSelectedRow]; // Selected proxy for modal
const [showModal, setShowModal]; // Show detail modal
const [deleteId, setDeleteId]; // ID to delete
const [showDeleteModal, setShowDeleteModal]; // Show delete confirmation
```

### API Integration

```typescript
// Fetches proxy list from backend
// Endpoint: GET /api/proxy
// Params: page, limit, search, sortField, sortOrder
fetchData();

// Delete proxy
// Endpoint: DELETE /api/proxy/{id}
handleConfirmDelete();

// Show detail modal
handleActionClick();

// Delete confirmation
handleDeleteClick();
```

## DataTable Configuration

### Columns Definition

```typescript
const columns: TableColumn<IProxy>[] = [
  {
    name: "No.",                    // Display name
    selector: (_row, index) => ..., // Data accessor
    width: "60px",                  // Column width
    sortable: false,                // Sorting enabled?
    center: true,                   // Center align?
  },
  // ... more columns
]
```

### Custom Styles

```typescript
const customTableStyles = {
  headRow: {
    /* header styling */
  },
  rows: {
    /* row styling */
  },
  pagination: {
    /* pagination styling */
  },
  noData: {
    /* empty state styling */
  },
};
```

## Responsive Design

### CSS Breakpoints in ProxyList.css

- **1024px+**: Desktop (full table)
- **768px - 1024px**: Tablet (compact)
- **640px - 768px**: Mobile (condensed)
- **360px - 640px**: Small phone (minimal)
- **≤360px**: Extra small (ultra-minimal)

### Responsive Classes Used

- `.line-clamp-2`: Limit text to 2 lines
- `.truncate`: Single line truncation
- Media queries adjust padding, font-size, widths

## Common Tasks

### Add a New Column

```typescript
const columns: TableColumn<IProxy>[] = [
  // ... existing columns
  {
    name: "New Column",
    selector: (row) => row.new_field,
    sortable: true,
    grow: 1,
  },
];
```

### Change Pagination Limits

```typescript
<select onChange={(e) => {
  setLimit(Number(e.target.value));
  setPage(1);
}}>
  <option value={5}>5</option>
  <option value={10}>10</option>
  {/* Add new options here */}
</select>
```

### Customize Table Colors

```typescript
// In customTableStyles:
headRow: {
  style: {
    backgroundColor: "#new-color",
    color: "#text-color",
  }
}
```

### Add Column Formatting

```typescript
{
  name: "Created",
  cell: (row) => new Date(row.createdAt).toLocaleDateString('en-US'),
  sortable: true,
}
```

## Component Lifecycle

1. **Mount**: useEffect fetches initial data
2. **Search**: setSearch triggers fetchData
3. **Pagination**: onChangePage triggers fetchData
4. **Rows/Page**: onChangeRowsPerPage updates limit
5. **Modal**: onClick on row opens detail modal
6. **Delete**: handleConfirmDelete removes from list

## Error Handling

```typescript
// API errors are caught and displayed as toasts
try {
  const { data } = await apiClient.get(...)
  // Success
} catch (error: unknown) {
  const err = error as Error & { response?: { data?: { message?: string } } }
  toast.error(err?.response?.data?.message || "Failed")
}
```

## Performance Tips

1. **Pagination**: Use server-side pagination for large datasets ✅
2. **Search**: Debounce search input if needed (current: immediate)
3. **Virtual Scrolling**: DataTable handles this automatically ✅
4. **Memoization**: Consider using `useMemo` for columns array
5. **Avoid Re-renders**: Keep sortOrder in state, not sortField

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Testing Guidelines

```typescript
// Test data
const mockProxies: IProxy[] = [
  {
    _id: "1",
    proxy_name: "Test Proxy",
    curl: "curl --proxy http://...",
    credit: 1000,
    createdAt: new Date().toISOString(),
  }
]

// Test cases
✅ Render table with data
✅ Search functionality
✅ Pagination navigation
✅ Delete confirmation modal
✅ Detail modal
✅ Responsive layout (mobile/tablet/desktop)
✅ Error handling
✅ Loading state
```

## Common Issues & Solutions

### Issue: Table not responsive on mobile

**Solution**: Check if ProxyList.css is imported and breakpoints match viewport

### Issue: Columns too wide on mobile

**Solution**: Reduce `grow` values or set fixed widths, check CSS width rules

### Issue: Actions column misaligned

**Solution**: Verify ActionColumn component JSX alignment, check flex centering

### Issue: Pagination controls broken

**Solution**: Ensure `paginationServer` prop is set, verify page state

### Issue: Search not working

**Solution**: Check if fetchData is being called, verify API endpoint

### Issue: Modal not showing

**Solution**: Verify showModal state is being set, check modal CSS z-index

## Related Files

- `/proxy.interface.ts`: IProxy type definition
- `/admin.proxy.controller.ts`: Backend API controller
- `/ProxyList.css`: Responsive styles
- `/App.tsx`: Routing configuration

## API Response Expected Format

```typescript
{
  data: [
    {
      _id: string,
      proxy_name: string,
      proxy_token: string,
      curl_token: string,
      curl: string,
      credit: number,
      domain_name: string,
      project_name: string,
      createdAt: string (ISO date),
      // ... other fields
    }
  ],
  pagination: {
    total: number,
    page: number,
    limit: number,
  }
}
```

## Future Enhancement Ideas

- [ ] Add row selection with bulk delete
- [ ] Export to CSV/Excel functionality
- [ ] Advanced filtering options
- [ ] Column visibility toggle
- [ ] Drag-to-reorder columns
- [ ] Custom column width resizing
- [ ] Dark mode support
- [ ] Real-time data updates with WebSocket

## Support Resources

- React Data Table Docs: https://jbetancur.github.io/react-data-table-component/
- React Hooks: https://react.dev/reference/react
- TypeScript: https://www.typescriptlang.org/docs/
- TailwindCSS: https://tailwindcss.com/docs

---

**Last Updated**: 2026-04-20
**Version**: 2.0 (React Data Table)
**Maintainer**: Development Team
