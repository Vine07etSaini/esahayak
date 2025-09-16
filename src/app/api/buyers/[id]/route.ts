import { createClient } from '@supabase/supabase-js';
import { buyerSchema } from '@/lib/validations';

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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { updatedAt, ...data } = await request.json();
    
    // Check for concurrent updates
    const { data: currentBuyer, error: fetchError } = await supabaseAdmin
      .from('buyers')
      .select('updated_at')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single();

    if (fetchError) {
      return Response.json({ error: 'Buyer not found or access denied' }, { status: 404 });
    }

    if (updatedAt && currentBuyer.updated_at !== updatedAt) {
      return Response.json({ error: 'Record changed, please refresh' }, { status: 409 });
    }
    
    const validationResult = buyerSchema.safeParse(data);
    if (!validationResult.success) {
      return Response.json({ 
        error: 'Validation failed', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const validatedData = validationResult.data;

    const { error: updateError } = await supabaseAdmin
      .from('buyers')
      .update({
        full_name: validatedData.fullName,
        email: validatedData.email || null,
        phone: validatedData.phone,
        city: validatedData.city,
        property_type: validatedData.propertyType,
        bhk: validatedData.bhk || null,
        purpose: validatedData.purpose,
        budget_min: validatedData.budgetMin || null,
        budget_max: validatedData.budgetMax || null,
        timeline: validatedData.timeline,
        source: validatedData.source,
        status: validatedData.status,
        notes: validatedData.notes || null,
        tags: validatedData.tags || [],
      })
      .eq('id', id)
      .eq('owner_id', user.id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    // Create history entry
    await supabaseAdmin
      .from('buyer_history')
      .insert({
        buyer_id: id,
        changed_by: user.id,
        diff: { action: 'updated', details: 'Lead updated' },
      });

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { error } = await supabaseAdmin
      .from('buyers')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}