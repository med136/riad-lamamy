# API Réservations

## Vue d'ensemble
Cette API gère les réservations du Riad. Elle permet de créer, lire, mettre à jour et supprimer des réservations, ainsi que de vérifier la disponibilité et le pricing.

## Endpoints

### 1. Lister les réservations
**GET** `/api/reservations`

Retourne la liste paginée des réservations avec filtrage optionnel.

**Paramètres de query:**
- `status` (optionnel): `pending`, `confirmed`, `checked_in`, `checked_out`, `cancelled`
- `room_id` (optionnel): UUID de la chambre
- `guest_email` (optionnel): Email du client (recherche partielle)
- `page` (optionnel, défaut: 1): Numéro de page
- `limit` (optionnel, défaut: 50): Nombre de résultats par page

**Réponse:**
```json
{
  "reservations": [
    {
      "id": "uuid",
      "reference": "RES-XXXXX",
      "guest_name": "John Doe",
      "guest_email": "john@example.com",
      "guest_phone": "+212612345678",
      "guest_count": 2,
      "room_id": "uuid",
      "check_in": "2026-01-20",
      "check_out": "2026-01-25",
      "total_amount": 1500.00,
      "paid_amount": 750.00,
      "status": "confirmed",
      "special_requests": "Late arrival",
      "admin_notes": "VIP client",
      "created_at": "2026-01-16T10:30:00Z",
      "updated_at": "2026-01-16T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3
}
```

### 2. Créer une réservation
**POST** `/api/reservations`

Crée une nouvelle réservation avec une référence unique générée automatiquement.

**Body (JSON):**
```json
{
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+212612345678",
  "guest_count": 2,
  "room_id": "uuid",
  "check_in": "2026-01-20",
  "check_out": "2026-01-25",
  "total_amount": 1500.00,
  "paid_amount": 750.00,
  "status": "pending",
  "special_requests": "Late arrival",
  "admin_notes": "VIP client"
}
```

**Réponse:** (201 Created)
```json
{
  "id": "uuid",
  "reference": "RES-XXXXX",
  "guest_name": "John Doe",
  ...
}
```

### 3. Récupérer une réservation
**GET** `/api/reservations/:id`

Retourne les détails d'une réservation spécifique.

**Réponse:**
```json
{
  "id": "uuid",
  "reference": "RES-XXXXX",
  ...
}
```

### 4. Mettre à jour une réservation
**PUT** `/api/reservations/:id`

Met à jour une réservation existante.

**Body (JSON):** (tous les champs sont optionnels)
```json
{
  "status": "confirmed",
  "paid_amount": 1500.00,
  "admin_notes": "Updated notes"
}
```

**Réponse:**
```json
{
  "id": "uuid",
  ...
}
```

### 5. Supprimer une réservation
**DELETE** `/api/reservations/:id`

Supprime une réservation.

**Réponse:**
```json
{
  "success": true,
  "message": "Reservation deleted successfully"
}
```

### 6. Vérifier la disponibilité
**POST** `/api/reservations/availability`

Vérifie si une chambre est disponible pour les dates spécifiées.

**Body (JSON):**
```json
{
  "room_id": "uuid",
  "check_in": "2026-01-20",
  "check_out": "2026-01-25"
}
```

**Réponse:**
```json
{
  "available": true,
  "conflictingReservations": [],
  "message": "Room is available for the selected dates"
}
```

### 7. Calculer le prix
**POST** `/api/reservations/pricing`

Calcule le prix total pour une réservation.

**Body (JSON):**
```json
{
  "room_id": "uuid",
  "check_in": "2026-01-20",
  "check_out": "2026-01-25"
}
```

**Réponse:**
```json
{
  "room_id": "uuid",
  "room_name": "Chambre Deluxe",
  "check_in": "2026-01-20",
  "check_out": "2026-01-25",
  "nights": 5,
  "base_price": 300.00,
  "price_per_night": 300.00,
  "total_price": 1500.00,
  "currency": "MAD"
}
```

### 8. Statistiques des réservations
**GET** `/api/reservations/stats?period=month`

Retourne les statistiques des réservations pour une période donnée.

**Paramètres de query:**
- `period` (optionnel): `day`, `week`, `month`, `year` (défaut: `month`)

**Réponse:**
```json
{
  "period": "month",
  "start_date": "2025-12-16T00:00:00Z",
  "end_date": "2026-01-16T00:00:00Z",
  "total_reservations": 25,
  "total_revenue": 37500.00,
  "total_paid": 18750.00,
  "pending": 8,
  "confirmed": 12,
  "checked_in": 3,
  "checked_out": 2,
  "cancelled": 0,
  "average_reservation_value": 1500.00
}
```

## Statuts de réservation

- `pending` - En attente de confirmation
- `confirmed` - Confirmée
- `checked_in` - Client arrivé
- `checked_out` - Client parti
- `cancelled` - Annulée

## Codes d'erreur

- `400` - Requête invalide (champs manquants ou invalides)
- `404` - Réservation non trouvée
- `500` - Erreur serveur

## Exemple d'utilisation (JavaScript)

```javascript
// Créer une réservation
const response = await fetch('/api/reservations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    guest_name: 'John Doe',
    guest_email: 'john@example.com',
    guest_phone: '+212612345678',
    guest_count: 2,
    room_id: 'room-uuid',
    check_in: '2026-01-20',
    check_out: '2026-01-25',
    total_amount: 1500.00,
    paid_amount: 750.00
  })
})

const reservation = await response.json()
console.log(reservation)

// Vérifier la disponibilité
const availResponse = await fetch('/api/reservations/availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    room_id: 'room-uuid',
    check_in: '2026-01-20',
    check_out: '2026-01-25'
  })
})

const availability = await availResponse.json()
console.log(availability)

// Mettre à jour une réservation
const updateResponse = await fetch('/api/reservations/reservation-uuid', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'confirmed',
    paid_amount: 1500.00
  })
})

const updated = await updateResponse.json()
console.log(updated)
```
