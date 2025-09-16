import { supabase } from '@/lib/supabase';
import { buyerSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate with Zod schema
    const validationResult = buyerSchema.safeParse(data);
    if (!validationResult.success) {
      return Response.json({ 
        error: 'Validation failed', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const validatedData = validationResult.data;

    // Create buyer record
    const { data: buyer, error: buyerError } = await supabase
      .from('buyers')
      .insert({
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
        notes: validatedData.notes || null,
        tags: validatedData.tags || [],
        status: validatedData.status || 'New',
        owner_id: '1', // Replace with actual current user ID from auth
      })
      .select()
      .single();

    if (buyerError) {
      return Response.json({ error: buyerError.message }, { status: 500 });
    }

    // Create history entry
    await supabase
      .from('buyer_history')
      .insert({
        buyer_id: buyer.id,
        changed_by: '1', // Replace with actual current user ID
        diff: {
          action: 'created',
          changes: validatedData,
        },
      });

    return Response.json({ success: true, buyer });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}