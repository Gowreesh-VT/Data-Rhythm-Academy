# Course Visibility Fix - Show All Courses in Admin Dashboard

## Problem
Courses were being created successfully in Firebase, but they weren't appearing in the course lists for admins, instructors, or students.

## Root Cause
The AdminDashboard was using `getPublishedCourses()` which only returns courses where `isPublished: true`. Since newly created courses have `isPublished: false` by default, they were not visible in the admin dashboard.

## Solution

### 1. Created New Database Function
Added `getAllCourses()` function to retrieve ALL courses (both published and unpublished) for admin use.

**File**: `/src/lib/database.ts`

```typescript
export const getAllCourses = async () => {
  try {
    // Get ALL courses from Firestore (for admin use)
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const allCourses: Course[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Course[];

    return { data: allCourses };
  } catch (error) {
    logger.error('Error getting all courses:', error);
    return { error: error as Error };
  }
};
```

### 2. Updated Admin Dashboard
Changed AdminDashboard to use `getAllCourses()` instead of `getPublishedCourses()`.

**File**: `/src/components/AdminDashboard.tsx`

**Changes:**
- Import: `getPublishedCourses` → `getAllCourses`
- Function call: `await getPublishedCourses()` → `await getAllCourses()`

### 3. Added Visual Status Indicators
Added badges to show course publish status (Published vs Draft).

**Before:**
- Only showed enrollment type badge

**After:**
- Shows enrollment type badge (Green for Direct, Orange for Inquiry)
- Shows publish status badge (Blue for Published, Gray for Draft)

## Course Visibility Logic

### For Admins (Admin Dashboard)
- **Shows**: ALL courses (published AND unpublished)
- **Function**: `getAllCourses()`
- **Purpose**: Admins need to see all courses including drafts to manage them

### For Instructors (Instructor Dashboard)
- **Shows**: All courses created by that instructor
- **Function**: `getInstructorCourses(instructorId)`
- **Purpose**: Instructors need to see their own courses regardless of publish status

### For Students/Public (Course Listing Page)
- **Shows**: Only PUBLISHED courses
- **Function**: `getPublishedCourses()`
- **Purpose**: Students should only see courses that are ready for enrollment

## Visual Indicators

Each course card now shows two badges:

### Enrollment Type Badge (Top Right)
- **Green "Direct Enrollment"** - Students can enroll directly with payment
- **Orange "Inquiry Based"** - Students must contact for enrollment

### Publish Status Badge (Below Enrollment Badge)
- **Blue "Published"** - Course is live and visible to students
- **Gray "Draft"** - Course is not yet published (only visible to admins/instructors)

## Changes Made

### 1. Database Functions (`/src/lib/database.ts`)
```typescript
// NEW: Get all courses (for admin use)
export const getAllCourses = async () => {
  // Returns ALL courses ordered by creation date
}

// EXISTING: Get published courses (for public use)
export const getPublishedCourses = async () => {
  // Returns only published courses
}
```

### 2. Admin Dashboard Imports
```typescript
// Before
import { getPublishedCourses } from '../lib/database';

// After
import { getAllCourses } from '../lib/database';
```

### 3. Load Courses Function
```typescript
const loadCoursesData = async () => {
  try {
    const coursesResult = await getAllCourses(); // ← Changed from getPublishedCourses
    // ... rest of the function
  }
};
```

### 4. Course Card UI
```tsx
<div className="absolute top-2 right-2 flex flex-col gap-2">
  {/* Enrollment Type Badge */}
  <Badge className={course.enrollmentType === 'direct' ? 'bg-green-600' : 'bg-orange-600'}>
    {course.enrollmentType === 'direct' ? 'Direct Enrollment' : 'Inquiry Based'}
  </Badge>
  
  {/* NEW: Publish Status Badge */}
  <Badge className={course.isPublished ? 'bg-blue-600' : 'bg-gray-600'}>
    {course.isPublished ? 'Published' : 'Draft'}
  </Badge>
</div>
```

## Testing Instructions

### 1. Create a New Course
1. Log in as admin
2. Go to Admin Dashboard → Course Management
3. Click "Create New Course"
4. Fill in the form and submit
5. ✅ Course should now appear immediately in the course list

### 2. Verify Course Status
Check the course card badges:
- ✅ Should show "Draft" badge (gray) if not published
- ✅ Should show "Published" badge (blue) if published
- ✅ Should show enrollment type badge

### 3. Check Firebase
1. Open Firebase Console → Firestore
2. Navigate to `courses` collection
3. Find the newly created course
4. Verify `isPublished: false` for new courses

### 4. Test Course Visibility

**Admin Dashboard:**
- ✅ Shows ALL courses (published and drafts)

**Student View (when implemented):**
- ✅ Only shows published courses
- ❌ Should NOT show draft courses

**Instructor Dashboard (when implemented):**
- ✅ Shows instructor's own courses (all statuses)

## Expected Behavior

### After Creating a Course
1. Course is saved to Firebase with `isPublished: false`
2. Success message appears
3. Modal closes
4. Course list refreshes automatically
5. New course appears with "Draft" badge
6. Course shows enrollment type badge

### Course List Order
- Newest courses appear first (ordered by `createdAt` descending)
- All courses visible to admin regardless of publish status

## Future Enhancements

### 1. Publish/Unpublish Action
Add a button to quickly toggle course publish status:
```tsx
<Button onClick={() => togglePublishStatus(course.id, !course.isPublished)}>
  {course.isPublished ? 'Unpublish' : 'Publish'}
</Button>
```

### 2. Filter by Status
Add filter dropdown to show:
- All courses
- Published only
- Drafts only

### 3. Bulk Actions
Allow admins to:
- Publish multiple courses at once
- Delete multiple draft courses
- Change enrollment type for multiple courses

### 4. Course Statistics
Show for each course:
- Number of enrolled students
- Revenue generated
- Completion rate
- Average rating

## Files Modified

1. **`/src/lib/database.ts`**
   - Added `getAllCourses()` function

2. **`/src/components/AdminDashboard.tsx`**
   - Updated import from `getPublishedCourses` to `getAllCourses`
   - Updated `loadCoursesData()` to use `getAllCourses()`
   - Added publish status badge to course cards

## Database Impact

### Query Performance
- `getAllCourses()` fetches all courses without filtering
- Ordered by `createdAt` (indexed by default in Firestore)
- Should perform well even with thousands of courses

### Firestore Indexes Required
No additional indexes needed:
- `createdAt` is automatically indexed
- Simple query with one orderBy clause

## Troubleshooting

### Course Still Not Showing?

1. **Check Browser Console**
   - Look for errors from `getAllCourses()`
   - Check if `loadCoursesData()` is being called

2. **Verify Firebase**
   - Check Firestore Rules allow reading courses
   - Verify course document exists in Firebase Console

3. **Hard Refresh**
   - Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
   - Clear browser cache

4. **Check Console Logs**
   ```
   Look for:
   - "Course created successfully"
   - "Loaded X courses" (from getAllCourses)
   ```

### Published Status Not Showing?

- Verify `isPublished` field exists in Firestore document
- Check if badge rendering logic is correct
- Inspect element in DevTools to see actual CSS classes

---

**Status**: ✅ Fixed and Tested  
**Date**: October 20, 2025  
**Issue**: Courses not visible after creation  
**Solution**: Use `getAllCourses()` for admin, added publish status badges  
**Impact**: Admins can now see all courses including drafts
