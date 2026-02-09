import { createBrowserClient } from '@supabase/ssr'

// Types temporaires - seront générés par Supabase
type Database = any

export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export const signIn = async (email: string, password: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (!error) {
    window.location.href = '/admin/login'
  }
  return { error }
}

export const getCurrentUser = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const uploadFile = async (file: File, bucket: string, path: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)
  
  if (error) throw error
  
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
  return urlData.publicUrl
}

export const deleteFile = async (bucket: string, path: string) => {
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  if (error) throw error
}
