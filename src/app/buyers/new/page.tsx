"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BuyerForm from "@/components/BuyerForm";
import { BuyerFormData } from "@/lib/validations";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

export default function NewBuyer() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (data: BuyerFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Insert buyer
      const { data: buyer, error } = await supabase
        .from("buyers")
        .insert([{
          full_name: data.fullName,
          email: data.email || null,
          phone: data.phone,
          city: data.city,
          property_type: data.propertyType,
          bhk: data.bhk || null,
          purpose: data.purpose,
          budget_min: data.budgetMin || null,
          budget_max: data.budgetMax || null,
          timeline: data.timeline,
          source: data.source,
          status: data.status,
          notes: data.notes || null,
          tags: data.tags,
          owner_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      // Create history entry
      await supabase
        .from("buyer_history")
        .insert([{
          buyer_id: buyer.id,
          changed_by: user.id,
          diff: {
            action: "created",
            changes: data,
          },
        }]);

      toast({
        title: "Success",
        description: "Buyer lead created successfully",
      });

      router.push("/buyers");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create buyer lead",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto">
          <BuyerForm
            title="Create New Buyer Lead"
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}