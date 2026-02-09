import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'

async function initRooms() {
  try {
    const supabase = createAdminClient()
    
    // D'abord, récupérer un enregistrement pour voir la structure réelle
    const { data: existing, error: checkError } = await supabase
      .from('rooms')
      .select('*')
      .limit(1)

    if (checkError) {
      console.error('Error checking room structure:', checkError)
      return { 
        error: checkError.message,
        code: checkError.code
      }
    }

    // Analyser les colonnes disponibles
    let sampleRoom = existing?.[0]
    console.log('Sample room structure:', sampleRoom)
    
    // Données de test - utiliser les colonnes disponibles
    const testRooms = [
      {
        name: 'Suite Royale',
        description: 'Notre suite la plus luxueuse avec vue sur les montagnes de l\'Atlas',
        price: 450
      },
      {
        name: 'Chambre Deluxe',
        description: 'Chambre spacieuse avec décoration traditionnelle marocaine',
        price: 280
      },
      {
        name: 'Suite Familiale',
        description: 'Parfaite pour les familles, deux chambres communicantes',
        price: 520
      },
      {
        name: 'Chambre Standard',
        description: 'Chambre confortable avec lit double et salle de bain privée',
        price: 150
      }
    ]

    // Insérer les chambres
    const { data, error } = await supabase
      .from('rooms')
      .insert(testRooms)
      .select()

    if (error) {
      console.error('Error inserting rooms:', error)
      return { 
        error: error.message,
        details: error.details,
        code: error.code
      }
    }

    return {
      message: 'Chambres initialisées avec succès',
      rooms: data
    }
  } catch (err: any) {
    console.error('Unexpected error:', err)
    return { error: err?.message || 'Unknown error' }
  }
}

// Accepter GET et POST
export async function GET() {
  const result = await initRooms()
  return NextResponse.json(result, { 
    status: result.error ? 500 : 201 
  })
}

export async function POST() {
  const result = await initRooms()
  return NextResponse.json(result, { 
    status: result.error ? 500 : 201 
  })
}
