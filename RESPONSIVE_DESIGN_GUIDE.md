# ProxyList Responsive Design Guide

## Responsive Breakpoints Overview

### 🖥️ Desktop View (1024px+)

```
┌──────────────────────────────────────────────────────────────────┐
│ PROXY TABLE                                                      │
├────┬──────────────┬────────────────────┬────────┬──────────┬──────┤
│ No │ Proxy Name   │ Curl               │ Credit │ Created  │ Action
├────┼──────────────┼────────────────────┼────────┼──────────┼──────┤
│ 1  │ Proxy 1      │ curl --proxy http… │ 1000   │ Jan 20.. │ ✏️ 🗑️ 👁️
│ 2  │ Proxy 2      │ curl --proxy https │ 500    │ Feb 10.. │ ✏️ 🗑️ 👁️
└────┴──────────────┴────────────────────┴────────┴──────────┴──────┘

Features:
- Full column widths
- All text visible
- All controls available
- Font size: 14px
- Padding: 12px
```

### 📱 Tablet View (768px - 1024px)

```
┌─────────────────────────────────────────────────┐
│ PROXY TABLE                                     │
├────┬──────────────┬─────────────┬──────┬────────┤
│ No │ Proxy Name   │ Curl (clamp)│ Cred │ Created
├────┼──────────────┼─────────────┼──────┼────────┤
│ 1  │ Proxy 1      │ curl --proxy│ 1000 │ Jan 20
│ 2  │ Proxy 2      │ curl --proxy│ 500  │ Feb 10
└────┴──────────────┴─────────────┴──────┴────────┘

Features:
- Reduced padding (10px)
- Line clamping on long text
- Font size: 12px
- Actions moved to right side (compact)
```

### 📲 Mobile View (640px - 768px)

```
┌──────────────────────────────────┐
│ PROXY TABLE                      │
├────┬──────────┬────────┬─────────┤
│ No │ Proxy    │ Credit │ Actions │
├────┼──────────┼────────┼─────────┤
│ 1  │ Proxy 1  │ 1000   │ ✏️ 🗑️ 👁️
│    │ curl...  │        │         │
├────┼──────────┼────────┼─────────┤
│ 2  │ Proxy 2  │ 500    │ ✏️ 🗑️ 👁️
└────┴──────────┴────────┴─────────┘

Features:
- Compact padding (8px)
- Text truncation
- Font size: 11px
- Button icons: 14px
- Stack-friendly layout
```

### 📱 Small Mobile (360px - 640px)

```
┌─────────────────────┐
│ PROXY TABLE         │
├────┬────────┬───────┤
│ No │ Proxy  │ Acts  │
├────┼────────┼───────┤
│ 1  │Proxy 1 │✏️ 🗑️ 👁️
│    │1000 cr │       │
├────┼────────┼───────┤
│ 2  │Proxy 2 │✏️ 🗑️ 👁️
└────┴────────┴───────┘

Features:
- Minimal padding (6px)
- Heavy text truncation
- Font size: 10-11px
- Button icons: 12px
- Optimized for thumbs
```

### 📱 Extra Small (≤360px)

```
┌──────────────────┐
│ PROXY TABLE      │
├────┬──────┬─────┤
│No. │Proxy │Acts │
├────┼──────┼─────┤
│ 1  │Px.1  │✏️🗑️👁
│ 1K │      │     │
├────┼──────┼─────┤
│ 2  │Px.2  │✏️🗑️👁
└────┴──────┴─────┘

Features:
- Ultra-minimal padding (4px)
- Abbreviations used
- Font size: 10px
- Button icons: 12px
```

## CSS Classes & Responsive Behavior

### Padding Adjustments

| Breakpoint        | Cell Padding | Font Size | Use Case                  |
| ----------------- | ------------ | --------- | ------------------------- |
| Desktop (1024px+) | 12px 8px     | 14px      | Large screens, desk work  |
| Tablet (768px+)   | 10px 6px     | 12px      | Tablets, landscape phones |
| Mobile (640px+)   | 8px 4px      | 11px      | Portrait phones           |
| Small (360px+)    | 6px 2px      | 10px      | Small phones              |

### Column Width Strategy

- **No.**: Fixed width (40-60px)
- **Proxy Name**: Flexible (min 100px)
- **Curl**: Line-clamped to 2 lines
- **Credit**: Center-aligned (70-100px)
- **Created**: Date format (90-120px)
- **Actions**: Flexible, right-aligned (100-150px)

## Search & Controls

### Desktop Search Bar

```
[Search... X] [+ Create Proxy]
```

### Mobile Search Bar

```
┌──────────────────────┐
│ [Search... X]        │
├──────────────────────┤
│ [+ Create Proxy]     │
└──────────────────────┘
```

## Pagination Responsive

### Desktop

```
Rows per page: [10 ▼]  1-10 of 150  [◄ ◄ ► ►]
```

### Mobile

```
Rows per page: [10]
1-10 of 150
[◄ ◄ ► ►]
```

## Modal Responsiveness

### Desktop Modal

```
┌────────────────────────────────────────┐
│ Proxy Details                        [X]│
├────────────────────────────────────────┤
│  Column 1              │  Column 2     │
│  ─────────────────────   ──────────── │
│  • Name: Proxy 1      │  • Domain:... │
│  • Project: Test      │  • Token:...  │
│  • Credit: 1000       │  • Created: ..│
│                                        │
│  Curl Command:                         │
│  ────────────────────────────────────  │
│ [Close]                                │
└────────────────────────────────────────┘
```

### Mobile Modal

```
┌──────────────────────┐
│ Proxy Details    [X] │
├──────────────────────┤
│  • Name: Proxy 1     │
│  • Project: Test     │
│  • Credit: 1000      │
│  • Domain: ...       │
│  • Token: ...        │
│  • Created: ...      │
│                      │
│  Curl:               │
│  ──────────────────  │
│                      │
│        [Close]       │
└──────────────────────┘
```

## Touch Interaction (Mobile)

- **Button Padding**: 5-6px (easy to tap)
- **Icon Size**: 12-14px (visible on small screens)
- **Row Height**: Min 40px (comfortable touch target)
- **Hover States**: Works on tap-enabled devices
- **Spacing**: Adequate gaps between interactive elements

## Performance Optimizations

1. **Virtual Scrolling**: DataTable handles large lists efficiently
2. **CSS Media Queries**: No JavaScript needed for responsive changes
3. **Striped Rows**: Reduced at smaller sizes to save rendering
4. **Line Clamping**: CSS-based text truncation
5. **Minimal Reflows**: Proper fixed/flex column sizing

## Accessibility

✅ **Mobile-Friendly Improvements**

- Readable text at all sizes
- Touch-friendly button sizes
- Color contrast maintained
- Focus states visible
- Keyboard navigation support

✅ **Screen Reader Support**

- Semantic HTML structure
- Proper heading hierarchy
- Alt text for icons
- ARIA labels where needed

## Testing Checklist

- [ ] Desktop: Full layout visible, all columns readable
- [ ] Tablet: Compact view, controls accessible
- [ ] Mobile: Single column focus, no horizontal scroll
- [ ] Search: Works on all screen sizes
- [ ] Pagination: Responsive controls
- [ ] Modals: Full viewport on mobile
- [ ] Touch: All buttons easily tappable
- [ ] Orientation: Works in portrait and landscape

---

**Design Philosophy**: Mobile-first approach with progressive enhancement for larger screens
**Maintenance**: CSS is organized by breakpoints for easy updates
**Future-Ready**: Easily extensible for new features
