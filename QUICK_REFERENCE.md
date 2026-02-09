# Reservation System - Quick Reference Guide

## What Was Completed ✅

### 1. **API System** (5 Core Endpoints + 3 Utilities)
- ✅ GET /api/reservations - List with filtering & pagination
- ✅ POST /api/reservations - Create new reservation
- ✅ GET /api/reservations/[id] - Get single reservation
- ✅ PUT /api/reservations/[id] - Update reservation
- ✅ DELETE /api/reservations/[id] - Delete reservation
- ✅ POST /api/reservations/availability - Check dates available
- ✅ POST /api/reservations/pricing - Calculate total price
- ✅ GET /api/reservations/stats - Get statistics

### 2. **Admin Page Verification** - Fully Refactored
- ✅ Removed mock data structure
- ✅ Integrated with real API endpoints
- ✅ Updated all field names (snake_case)
- ✅ Implemented proper state management
- ✅ Added inline modals (removed component dependencies)
- ✅ Proper error handling & notifications
- ✅ Full TypeScript support

### 3. **Type System** - Properly Defined
- ✅ Reservation interface with all fields
- ✅ ReservationFilters for API queries
- ✅ ReservationStats for analytics

---

## API Field Mapping

| Database Field | Form Field | Type | Example |
|---|---|---|---|
| id | - | UUID | 550e8400-e29b-41d4-a716-446655440000 |
| reference | - | VARCHAR | RES-00001 |
| guest_name | guest_name | TEXT | "Ahmed Ali" |
| guest_email | guest_email | TEXT | "ahmed@example.com" |
| guest_phone | guest_phone | TEXT | "+212612345678" |
| guest_count | guest_count | INT | 2 |
| room_id | room_id | UUID | 550e8400-e29b-41d4-a716-446655440001 |
| check_in | check_in | DATE | "2025-01-15" |
| check_out | check_out | DATE | "2025-01-18" |
| total_amount | total_amount | DECIMAL | 1500.00 |
| paid_amount | paid_amount | DECIMAL | 750.00 |
| status | status | ENUM | pending/confirmed/checked_in/checked_out/cancelled |
| special_requests | special_requests | TEXT | "Early check-in requested" |
| admin_notes | admin_notes | TEXT | "VIP customer" |
| created_at | - | TIMESTAMP | Auto-generated |
| updated_at | - | TIMESTAMP | Auto-updated |

---

## Status Values & Colors

| Status | French | Color | Icon |
|---|---|---|---|
| pending | En attente | Yellow | Clock |
| confirmed | Confirmée | Green | CheckCircle |
| checked_in | Arrivée | Blue | CheckCircle |
| checked_out | Départ | Purple | CheckCircle |
| cancelled | Annulée | Red | XCircle |

---

## Admin Page Flow

```
1. Load Page
   ↓
2. fetchReservations() → GET /api/reservations
   ↓
3. Display Table with filtering & search
   ↓
4. User Action:
   ├─ Add → handleAdd() → showModal = true
   ├─ Edit → handleEdit() → showModal = true + editingId
   └─ Delete → handleDelete() → reservationToDelete
   ↓
5. User submits form → handleSave()
   ├─ CREATE → POST /api/reservations
   └─ UPDATE → PUT /api/reservations/{id}
   ↓
6. Refresh table & close modal
```

---

## Quick Start - Testing the System

### 1. Start Server
```bash
cd riad-website
npm run dev
```

### 2. Access Admin Page
```
http://localhost:3000/admin/reservations
```

### 3. Create Test Reservation
- Click "Ajouter une réservation"
- Fill in:
  - Name: "Test User"
  - Email: "test@example.com"
  - Phone: "+212612345678"
  - Room UUID: (any valid UUID)
  - Check-in: (any future date)
  - Check-out: (after check-in)
  - Guest Count: 2
  - Total Amount: 1500
  - Paid Amount: 750
  - Status: pending
- Click "Sauvegarder"
- Should see success toast & new row in table

### 4. Edit Reservation
- Click edit button on any row
- Change a field (e.g., status to "confirmed")
- Click "Sauvegarder"
- Should see updated data in table

### 5. Delete Reservation
- Click delete button on any row
- Confirm deletion
- Should see success message & row removed

### 6. Filter & Search
- Use status dropdown to filter
- Use search box to find by name/email
- Table updates in real-time

---

## API Call Examples

### Create Reservation
```javascript
const response = await fetch('/api/reservations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    guest_name: 'Ahmed Ali',
    guest_email: 'ahmed@example.com',
    guest_phone: '+212612345678',
    room_id: '550e8400-e29b-41d4-a716-446655440001',
    check_in: '2025-01-15',
    check_out: '2025-01-18',
    guest_count: 2,
    total_amount: 1500,
    paid_amount: 750,
    status: 'pending',
    special_requests: 'Early check-in',
    admin_notes: 'VIP'
  })
})
const reservation = await response.json()
```

### Update Reservation
```javascript
const response = await fetch('/api/reservations/550e8400-e29b-41d4-a716-446655440000', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'confirmed',
    paid_amount: 1500
  })
})
const updated = await response.json()
```

### Delete Reservation
```javascript
const response = await fetch('/api/reservations/550e8400-e29b-41d4-a716-446655440000', {
  method: 'DELETE'
})
const result = await response.json()
```

### Get Reservations with Filter
```javascript
const response = await fetch(
  '/api/reservations?limit=50&page=1&status=pending&guest_email=test'
)
const data = await response.json()
// data.reservations[]
// data.total
// data.page
// data.limit
// data.totalPages
```

---

## Component Structure

### State Variables (13 total)
- `reservations` - Array of Reservation objects
- `isLoading` - Boolean for initial load
- `search` - String for search filter
- `statusFilter` - String for status filter
- `showModal` - Boolean for modal visibility
- `editingId` - String|null for which reservation is being edited
- `reservationToDelete` - String|null for delete confirmation
- `isSaving` - Boolean for form submission state
- `form` - ReservationForm object for form state

### Functions (8 total)
- `fetchReservations()` - Load data
- `handleAdd()` - New reservation
- `handleEdit(res)` - Edit reservation
- `handleDelete(id)` - Delete confirmation
- `confirmDelete()` - Execute delete
- `handleSave(e)` - Create/Update
- `getStatusColor()` - Utility
- `getStatusIcon()` - Utility
- `getStatusLabel()` - Utility

### JSX Elements (3 sections)
1. **Header** - Title, buttons, search/filter controls
2. **Table** - List of reservations with actions
3. **Modals** - Add/Edit form, Delete confirmation

---

## TypeScript Interfaces

### Reservation (From API)
```typescript
interface Reservation {
  id: string; // UUID
  reference: string; // RES-XXXXX
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  guest_count: number;
  room_id: string; // UUID
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  total_amount: number;
  paid_amount: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  special_requests?: string;
  admin_notes?: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

### ReservationForm (Local Form State)
```typescript
interface ReservationForm {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  room_id: string;
  check_in: string;
  check_out: string;
  guest_count: string; // String in form, converted to number on submit
  total_amount: string; // String in form, converted to number on submit
  paid_amount: string; // String in form, converted to number on submit
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  special_requests: string;
  admin_notes: string;
}
```

---

## Important Notes

1. **Room ID**: Must be a valid UUID from the `rooms` table
2. **Dates**: Use ISO format YYYY-MM-DD (e.g., "2025-01-15")
3. **Reference**: Auto-generated on creation in format RES-XXXXX
4. **Amounts**: Stored as DECIMAL(10, 2) - up to 99,999.99
5. **Status**: Can only be the 5 predefined values
6. **Timestamps**: Auto-managed by database

---

## File Locations Summary

| Purpose | File |
|---|---|
| API Routes | src/app/api/reservations/ |
| Admin Page | src/app/admin/reservations/page.tsx |
| Types | src/types/index.ts |
| Custom Hook | src/hooks/useReservations.ts |
| Documentation | src/app/api/reservations/README.md |

---

## Troubleshooting

### API Returns 400 Bad Request
- Check all required fields are provided
- Verify UUID format for room_id
- Check date format (YYYY-MM-DD)
- Verify status is one of: pending, confirmed, checked_in, checked_out, cancelled

### API Returns 404 Not Found
- Verify UUID is valid format
- Check reservation exists in database
- Verify room_id references valid room

### API Returns 500 Server Error
- Check Supabase connection
- Verify table schema matches code
- Check for JavaScript errors in console

### Modal doesn't show/hide
- Check `showModal` state is being toggled
- Verify `setShowModal()` is called
- Check modal JSX is conditionally rendered

### Data doesn't update in table
- Check API response contains all fields
- Verify state.setReservations() is called
- Check network tab for successful API response

---

**Version:** 1.0.0 Final
**Date:** January 2025
**Status:** Production Ready ✅
