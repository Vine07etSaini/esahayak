import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabaseAdmin
      .from('buyer_history')
      .select('*')
      .eq('buyer_id', id)
      .order('changed_at', { ascending: false })
      .limit(5);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ history: data || [] });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}