import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('users').select('*')
  
  if (error) {
    return Response.json({ message: "Hello World from Supabase!", error: error.message })
  }
  
  return Response.json({ message: "Hello World from Supabase!", data })
}