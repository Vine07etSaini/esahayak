import { supabase } from '@/lib/supabase';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return Response.json({ error: 'CSV file must have at least a header and one data row' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataLines = lines.slice(1);

    const buyers = [];
    const errors = [];

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const values = dataLines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const buyerData: any = {};

        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'fullName':
              buyerData.full_name = value;
              break;
            case 'email':
              buyerData.email = value || null;
              break;
            case 'phone':
              buyerData.phone = value;
              break;
            case 'city':
              buyerData.city = value;
              break;
            case 'propertyType':
              buyerData.property_type = value;
              break;
            case 'bhk':
              buyerData.bhk = value || null;
              break;
            case 'purpose':
              buyerData.purpose = value;
              break;
            case 'budgetMin':
              buyerData.budget_min = value ? parseInt(value) : null;
              break;
            case 'budgetMax':
              buyerData.budget_max = value ? parseInt(value) : null;
              break;
            case 'timeline':
              buyerData.timeline = value;
              break;
            case 'source':
              buyerData.source = value;
              break;
            case 'notes':
              buyerData.notes = value || null;
              break;
            case 'tags':
              buyerData.tags = value ? value.split(',').map(t => t.trim()) : [];
              break;
            case 'status':
              buyerData.status = value || 'New';
              break;
          }
        });

        // Basic validation
        if (!buyerData.full_name || !buyerData.phone || !buyerData.city || 
            !buyerData.property_type || !buyerData.purpose || !buyerData.timeline || !buyerData.source) {
          errors.push(`Row ${i + 2}: Missing required fields`);
          continue;
        }

        if (!/^[0-9]{10,15}$/.test(buyerData.phone)) {
          errors.push(`Row ${i + 2}: Invalid phone number`);
          continue;
        }

        if (['Apartment', 'Villa'].includes(buyerData.property_type) && !buyerData.bhk) {
          errors.push(`Row ${i + 2}: BHK required for ${buyerData.property_type}`);
          continue;
        }

        buyerData.owner_id = 1; // Replace with actual user ID from auth
        buyerData.created_at = new Date().toISOString();
        buyerData.updated_at = new Date().toISOString();

        buyers.push(buyerData);
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    if (errors.length > 0 && buyers.length === 0) {
      return Response.json({ error: 'No valid rows found', errors }, { status: 400 });
    }

    // Insert buyers
    let imported = 0;
    if (buyers.length > 0) {
      const { data, error } = await supabase
        .from('buyers')
        .insert(buyers)
        .select();

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      imported = data?.length || 0;

      // Create history entries
      if (data) {
        const historyEntries = data.map(buyer => ({
          buyer_id: buyer.id,
          changed_by: 1, // Replace with actual user ID
          diff: {
            action: 'imported',
            source: 'csv'
          },
          changed_at: new Date().toISOString()
        }));

        await supabase
          .from('buyer_history')
          .insert(historyEntries);
      }
    }

    return Response.json({ 
      success: true, 
      imported,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}