# Admin Dashboard User Guide

## Recent Fixes (October 19, 2025)

### ✅ Fixed: User Role & Status Change
- **Issue**: Role changes weren't reflected immediately in the UI
- **Solution**: Added immediate state updates and success notifications
- **Status**: FIXED in commit `79663214`

---

## Table of Contents
1. [User Management](#user-management)
2. [Course Creation](#course-creation)
3. [Troubleshooting](#troubleshooting)

---

## User Management

### How to Change User Roles

1. **Access User Management**
   - Login as Admin
   - Navigate to Admin Dashboard
   - Click the **"User Manage"** tab

2. **Find the User**
   - Use the search box to find by name or email
   - Or use filters:
     - **Role Filter**: All Roles, Students, Instructors, Admins
     - **Status Filter**: All, Active, Suspended, Pending

3. **Edit User**
   - Click the **"Edit"** button (👁️ icon) in the Actions column
   - A modal will appear showing user details

4. **Change Role**
   - Click the **"Role"** dropdown
   - Select new role:
     - **Student**: Regular learner access
     - **Instructor**: Can create courses, view enrolled students
     - **Admin**: Full platform access
   
   - ✅ **Success notification** will appear
   - ✅ **Dropdown updates** immediately
   - ✅ **Table refreshes** with new role
   - ✅ **Auto-generated unique ID** if switching between instructor/student

5. **Change Status**
   - Click the **"Status"** dropdown
   - Select status:
     - **Active**: Full access to platform
     - **Suspended**: Blocked from access
     - **Pending**: Awaiting verification
   
   - ✅ Success notification appears
   - ✅ UI updates immediately

6. **Close Modal**
   - Changes are saved automatically
   - Click "Close" or click outside the modal

### User Table Columns

| Column | Description |
|--------|-------------|
| **User** | Avatar, name, and email |
| **Role** | Color-coded badge (Admin=Red, Instructor=Blue, Student=Green) |
| **Status** | Active, Suspended, or Pending |
| **Joined** | Registration date |
| **Actions** | Edit button |

---

## Course Creation

### Button Locations

The **"+ Create New Course"** button appears in 3 places:

#### Location 1: Course Management Tab (Primary)
```
Admin Dashboard
  └── Course Manage Tab
      └── Top section
          └── Blue button: "+ Create New Course"
```

**Features:**
- Large blue button in header
- Visible when courses exist
- Opens course creation modal

#### Location 2: Settings Tab
```
Admin Dashboard
  └── Settings Tab
      └── Course Creation Section
          └── "+ Create New Course" button
```

**Features:**
- Located in Course Creation card
- Alternative access point
- Same modal as Location 1

#### Location 3: Empty State
```
Admin Dashboard
  └── Course Manage Tab
      └── When no courses exist
          └── Center button: "+ Create Your First Course"
```

**Features:**
- Only appears when database has no courses
- Centered in empty state message
- Prompts first-time course creation

### Course Creation Form

When you click any "Create New Course" button, a modal appears with:

#### Required Fields (*)
- **Course Title**: Main course name
- **Assign to Instructor**: Select from dropdown
- **Short Description**: Brief overview for course cards
- **Full Description**: Detailed course information
- **Category**: Data Science, Web Dev, ML, etc.
- **Level**: Beginner, Intermediate, Advanced, Expert

#### Optional Fields
- **Language**: Default is English
- **Price (₹)**: Course price in Indian Rupees
- **Duration (hours)**: Total course length
- **Thumbnail URL**: Image link for course card
- **Learning Objectives**: Multiple bullet points (add more with + button)
- **Prerequisites**: Course requirements (add more with + button)
- **Tags**: Comma-separated keywords

#### Auto-Generated Fields
When you create a course, these are set automatically:
- `enrollmentType`: 'direct' (can edit later)
- `isPublished`: false (draft mode)
- `rating`: 0
- `totalRatings`: 0
- `totalStudents`: 0
- `lessons`: [] (empty)
- Online class features enabled
- Class schedule configuration

### After Creating a Course

1. **Course is saved as Draft**
   - Not visible to students yet
   - Instructor can add content

2. **Edit Enrollment Type**
   - Go to Course Management tab
   - Find your course
   - Click "Edit Enrollment Type"
   - Choose:
     - **Direct Enrollment**: "Enroll Now" button → Payment
     - **Inquiry Based**: "Contact Us" button → Contact page

3. **Publish Course**
   - Update `isPublished` field to make visible to students
   - Students can then browse and enroll

---

## Troubleshooting

### Plus Icon Not Visible

If you can't see the `+` icon on buttons:

#### Solution 1: Hard Refresh
**Mac:**
```
Cmd + Shift + R
```

**Windows/Linux:**
```
Ctrl + Shift + R
```

#### Solution 2: Clear Browser Cache
1. Open browser settings
2. Clear cache and cookies
3. Restart browser
4. Navigate back to admin dashboard

#### Solution 3: Check Developer Console
1. Press **F12** (or **Cmd+Option+I** on Mac)
2. Go to **Console** tab
3. Look for errors related to:
   - `lucide-react`
   - Icon loading failures
   - Import errors

4. If you see errors:
   ```bash
   # Reinstall dependencies
   npm install
   
   # Restart dev server
   npm run dev
   ```

#### Solution 4: Verify Installation
```bash
# Check if lucide-react is installed
npm list lucide-react

# Should show: lucide-react@0.487.0 (or similar)
```

### Role Change Not Working

✅ **FIXED** as of October 19, 2025

If you're still experiencing issues:

1. **Check you're logged in as admin**
   - Only admins can change roles
   - Check user menu shows "Admin" role

2. **Verify Firestore permissions**
   - Check Firebase console
   - Ensure `users` collection has write permissions

3. **Check browser console for errors**
   - Open Developer Tools (F12)
   - Look for database errors
   - Check network tab for failed requests

4. **Try refreshing the page**
   ```
   Cmd + R (Mac) or Ctrl + R (Windows)
   ```

### User List Not Loading

If you see "No users have been registered yet":

1. **Check Firestore Database**
   - Open Firebase Console
   - Navigate to Firestore Database
   - Verify `users` collection exists and has documents

2. **Check Console for Errors**
   - Press F12
   - Look for connection errors
   - Check for authentication issues

3. **Verify Firebase Configuration**
   - Check `src/lib/firebase.ts`
   - Ensure all config values are correct

### Changes Not Saving

If role/status changes don't persist:

1. **Check Firestore Rules**
   ```javascript
   // firestore.rules should allow admin writes
   match /users/{userId} {
     allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
   }
   ```

2. **Check Network Tab**
   - Open Developer Tools
   - Go to Network tab
   - Filter by "firestore"
   - Look for failed write operations

3. **Verify Admin Permissions**
   - Check your user document in Firestore
   - Ensure `role: 'admin'`
   - Verify `permissions` object has required flags

---

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| User Role Change | ✅ Fixed | Immediate UI updates, toast notifications |
| User Status Change | ✅ Fixed | Immediate UI updates, toast notifications |
| Course Creation | ✅ Working | Multiple access points |
| Unique ID Assignment | ✅ Working | Auto-generated for instructors/students |
| Course Enrollment Edit | ✅ Working | Direct vs Inquiry based |
| User Search & Filter | ✅ Working | By name, email, role, status |
| Analytics Dashboard | 🚧 Coming Soon | Advanced visualizations planned |

---

## Quick Reference

### Admin Privileges
- ✅ Manage all users (create, edit, delete)
- ✅ Change user roles and status
- ✅ Create and edit courses
- ✅ Assign courses to instructors
- ✅ Assign unique IDs
- ✅ View analytics
- ✅ Manage system settings

### User Roles Explained

| Role | Access Level | Can Do |
|------|-------------|---------|
| **Student** | Basic | Enroll in courses, view content, track progress |
| **Instructor** | Elevated | Create courses, manage students, view analytics |
| **Admin** | Full | Everything (user management, course oversight, settings) |

### Unique ID Format
- **Instructors**: `DRA-INS-25XXX`
- **Students**: `DRA-STU-25XXX`

---

## Support

If you encounter issues not covered here:

1. Check browser console for errors
2. Verify you're logged in with admin credentials
3. Check Firestore database and rules
4. Review recent commits for changes
5. Contact system administrator

---

**Last Updated**: October 19, 2025  
**Version**: 2.0  
**Recent Commits**:
- `79663214`: Fix user role and status change functionality
- `1f728d83`: Fix DialogOverlay ref warning
- `a0e4eb1e`: Consolidate AdminDashboard components
