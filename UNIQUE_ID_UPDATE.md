# Unique ID System - Complete Implementation Guide

## Overview
The unique ID system provides automatic and manual ID management for instructors and students with robust validation and admin controls.

## ID Format

### Current Format (2025):
- **Instructors**: `DRA-INS-25001`, `DRA-INS-25002`, etc.
- **Students**: `DRA-STU-25001`, `DRA-STU-25002`, etc.

### Format Breakdown:
- `DRA` = Data Rhythm Academy
- `INS` = Instructor, `STU` = Student  
- `25` = Current year (auto-updates each year)
- `001` = Sequential 3-digit number

## Admin Controls

### ✅ Automatic ID Generation
- **Auto-assign on role change**: When admin changes user from instructor ↔ student
- **Auto-increment**: System finds next available number automatically
- **Year integration**: IDs automatically include current year

### ✅ Manual ID Override
**Yes, admins can manually change the numbers!** 

#### How to Manually Set IDs:
1. **Access**: Admin Dashboard → System Settings → Unique ID Management
2. **Select User**: Choose instructor or student from the list
3. **Custom Number**: Enter custom ID following the format:
   - For instructors: `DRA-INS-25xxx` (e.g., `DRA-INS-25100`)
   - For students: `DRA-STU-25xxx` (e.g., `DRA-STU-25500`)
4. **Validation**: System checks format and availability
5. **Apply**: Admin can override auto-generated numbers

#### Manual Override Features:
- **Format Validation**: Ensures proper `DRA-INS-25xxx` / `DRA-STU-25xxx` format
- **Conflict Prevention**: Checks if ID is already taken
- **Role Validation**: Ensures ID matches user's role (instructor vs student)
- **Admin Logging**: All manual changes are logged with admin details
- **Error Feedback**: Clear error messages for invalid formats

#### Examples of Manual Changes:
- Auto-generated: `DRA-INS-25001` → Admin can change to: `DRA-INS-25100`
- Auto-generated: `DRA-STU-25001` → Admin can change to: `DRA-STU-25999`
- Custom ranges: Admins can reserve ranges (e.g., 100-199 for special instructors)

## Validation Rules

### ✅ Format Requirements:
- Must start with `DRA-INS-25` or `DRA-STU-25`
- Must end with exactly 3 digits (001-999)
- Case sensitive format
- Current year automatically included

### ✅ Business Rules:
- **Instructors only**: Can only have `DRA-INS-25xxx` format
- **Students only**: Can only have `DRA-STU-25xxx` format  
- **Admins**: Do not receive unique IDs
- **Uniqueness**: Each ID can only be assigned to one user
- **Role consistency**: ID format must match user's current role

### ✅ Error Handling:
- Invalid format → Clear error message with expected format
- Duplicate ID → "ID already assigned to another user"
- Wrong role → "ID format doesn't match user role"
- Admin validation → Only admins can assign/modify IDs

## Implementation Features

### 🔄 Automatic Operations:
```typescript
// Role change triggers automatic ID update
instructor → student: Gets new DRA-STU-25xxx ID
student → instructor: Gets new DRA-INS-25xxx ID
```

### 🎛️ Manual Operations:
```typescript
// Admin manual override
assignUniqueId(userId, 'DRA-INS-25100', adminId)
// Validates format, checks conflicts, updates user
```

### 📋 Admin Logging:
- All ID changes logged with timestamps
- Tracks who made changes (admin ID)
- Records old and new IDs for audit trail
- Distinguishes automatic vs manual changes

## UI Features

### System Settings Panel:
- **User List**: Shows all users with current unique IDs
- **Search/Filter**: Find users by name, email, or ID
- **Quick Actions**: 
  - Auto-generate new ID
  - Manually set custom ID
  - View ID history
- **Validation Feedback**: Real-time format checking
- **Bulk Operations**: Generate IDs for multiple users

### ID Assignment Modal:
- **Role-specific placeholders**: Shows correct format examples
- **Format validation**: Real-time checking as admin types
- **Conflict detection**: Warns if ID already exists
- **Success confirmation**: Shows when ID successfully assigned

## Use Cases

### 🎯 Admin Scenarios:

1. **Department Organization**: 
   - Instructors 001-099: Core faculty
   - Instructors 100-199: Guest lecturers
   - Students 001-499: Regular students  
   - Students 500-999: Special programs

2. **Migration from Legacy System**:
   - Import existing ID numbers from old system
   - Maintain continuity with manual assignment

3. **Special Requirements**:
   - VIP students get specific number ranges
   - Department-specific numbering schemes
   - Integration with external systems

### 🔧 Technical Benefits:

- **Flexibility**: Both automatic and manual control
- **Scalability**: Supports 999 users per role per year  
- **Maintainability**: Clear format with year tracking
- **Auditability**: Complete logging of all changes
- **Reliability**: Robust validation prevents conflicts

## Year Transition

When the year changes (2025 → 2026):
- New format: `DRA-INS-26xxx`, `DRA-STU-26xxx`
- Existing IDs remain unchanged
- New assignments use new year automatically
- No manual intervention required

## Summary

**✅ Admins have complete control over unique ID numbers:**
- Automatic generation for convenience
- Manual override for custom requirements  
- Robust validation for data integrity
- Comprehensive logging for accountability
- Flexible format supporting organizational needs

The system balances automation with administrative control, ensuring both efficiency and flexibility for your organization's unique requirements.