# Debugging Guide - Modal Not Visible Issue

## Current Status
The modal state is changing to `true` (confirmed by console log: `showCreateCourseModal state changed:true`), but the modal is not visible on screen.

## Changes Applied

### 1. Portal Container Fix
**File**: `/src/components/ui/dialog.tsx`

Added explicit `container={document.body}` to ensure Portal renders at the body level:
```tsx
function DialogPortal({...props}) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" container={document.body} {...props} />;
}
```

### 2. DialogContent Debugging
Added console log to track when DialogContent renders:
```tsx
function DialogContent({...props}) {
  React.useEffect(() => {
    console.log('DialogContent mounted/updated');
  });
  // ... rest of component
}
```

### 3. Force Visibility Styles
**File**: `/src/components/AdminDashboard.tsx`

Added explicit inline styles to force modal visibility:
```tsx
<DialogContent 
  className="max-w-2xl max-h-[80vh] overflow-y-auto"
  style={{ 
    zIndex: 9999,
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    display: 'grid',
    visibility: 'visible',
    opacity: 1
  }}
>
```

## Debugging Steps

### Step 1: Check Browser Console
After clicking "Create Course", check for these console logs:

```
✓ showCreateCourseModal state changed: true
✓ Dialog onOpenChange called with: true
✓ DialogContent mounted/updated
```

If you don't see "DialogContent mounted/updated", the component is not rendering at all.

### Step 2: Inspect DOM
1. Open DevTools (F12)
2. Click "Create Course" button
3. In Elements tab, search for (Ctrl/Cmd+F):
   - `dialog-content`
   - `dialog-overlay`
   - `data-slot="dialog-portal"`

**Expected**: You should find these elements in the DOM
**If not found**: The Dialog is not rendering at all

### Step 3: Check Computed Styles
If the element exists in DOM:
1. Right-click on the `dialog-content` element
2. Inspect Element
3. Check Computed tab for:
   - `display`: should be `grid`
   - `position`: should be `fixed`
   - `z-index`: should be `9999`
   - `visibility`: should be `visible`
   - `opacity`: should be `1`
   - `top`: should be `50%`
   - `left`: should be `50%`

### Step 4: Check for Overlapping Elements
In DevTools:
1. Click the "Select Element" tool (arrow icon)
2. Try clicking where the modal should be
3. See what element is actually being selected

### Step 5: Check Parent Container Styles
The AdminDashboard container might have styles affecting the modal:
```
- Check for `position: relative` creating a new stacking context
- Check for `overflow: hidden` clipping the modal
- Check for low `z-index` on parent containers
```

## Expected Console Output

When working correctly, you should see:
```
showCreateCourseModal state changed: true
Dialog onOpenChange called with: true
DialogContent mounted/updated
```

## Possible Root Causes

### 1. Dialog Not Rendering
**Symptom**: No "DialogContent mounted/updated" in console
**Cause**: React conditional rendering issue or component error
**Check**: Look for React error boundaries or errors in console

### 2. Dialog Rendered But Hidden
**Symptom**: "DialogContent mounted/updated" appears but no visual
**Cause**: CSS issue (z-index, opacity, transform, etc.)
**Check**: Inspect element styles in DevTools

### 3. Dialog Rendered Off-Screen
**Symptom**: Element exists but positioned incorrectly
**Cause**: Transform or positioning calculation error
**Check**: Element position in computed styles

### 4. Dialog Blocked by Another Element
**Symptom**: Element exists with correct styles but not clickable
**Cause**: Another element with higher z-index or pointer-events
**Check**: Click test with DevTools element selector

## Additional Fixes to Try

### Fix 1: Force Re-render
Add a key prop to force fresh render:
```tsx
<Dialog 
  key={showCreateCourseModal ? 'open' : 'closed'}
  open={showCreateCourseModal}
>
```

### Fix 2: Remove Animations
Temporarily disable animations to see if they're causing issues:
```tsx
<DialogPrimitive.Content
  className="... [remove all animate-in/out classes]"
>
```

### Fix 3: Simplify Dialog Usage
Try a minimal version:
```tsx
<Dialog open={showCreateCourseModal} onOpenChange={setShowCreateCourseModal}>
  <DialogContent style={{ zIndex: 9999, background: 'white' }}>
    <div style={{ padding: '20px' }}>
      <h2>Test Modal</h2>
      <p>If you can see this, the modal is working!</p>
      <button onClick={() => setShowCreateCourseModal(false)}>Close</button>
    </div>
  </DialogContent>
</Dialog>
```

## Manual Testing Script

Run this in the browser console after clicking "Create Course":

```javascript
// Check if modal elements exist
const overlay = document.querySelector('[data-slot="dialog-overlay"]');
const content = document.querySelector('[data-slot="dialog-content"]');

console.log('Overlay found:', !!overlay);
console.log('Content found:', !!content);

if (overlay) {
  console.log('Overlay styles:', {
    display: getComputedStyle(overlay).display,
    position: getComputedStyle(overlay).position,
    zIndex: getComputedStyle(overlay).zIndex,
    opacity: getComputedStyle(overlay).opacity,
  });
}

if (content) {
  console.log('Content styles:', {
    display: getComputedStyle(content).display,
    position: getComputedStyle(content).position,
    zIndex: getComputedStyle(content).zIndex,
    opacity: getComputedStyle(content).opacity,
    top: getComputedStyle(content).top,
    left: getComputedStyle(content).left,
    visibility: getComputedStyle(content).visibility,
  });
  console.log('Content bounding rect:', content.getBoundingClientRect());
}
```

## Quick Visual Test

Add this temporary test button to AdminDashboard (outside any containers):

```tsx
{/* Temporary Test Modal - Remove after debugging */}
{showCreateCourseModal && (
  <div style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 99999,
    backgroundColor: 'red',
    color: 'white',
    padding: '50px',
    fontSize: '24px',
    border: '5px solid yellow'
  }}>
    TEST MODAL - If you see this, z-index works!
    <button 
      onClick={() => setShowCreateCourseModal(false)}
      style={{ display: 'block', marginTop: '20px', padding: '10px' }}
    >
      Close
    </button>
  </div>
)}
```

If this test modal appears, the problem is with the Dialog component itself, not z-index.

## Report Back

Please check your browser console and report:
1. ✓ or ✗ - "DialogContent mounted/updated" appears in console
2. ✓ or ✗ - Dialog elements found in DOM
3. ✓ or ✗ - Test modal (red box) is visible
4. Any error messages in console
5. Screenshot of DevTools showing the dialog-content element (if it exists)

This will help narrow down the exact cause of the issue.

---

**Status**: Debugging in Progress
**Date**: October 20, 2025
**Priority**: High
