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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create buyer');
      }

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