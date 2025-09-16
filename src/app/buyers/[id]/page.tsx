"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BuyerForm from "@/components/BuyerForm";
import { BuyerFormData } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

interface Buyer extends BuyerFormData {
  id: string;
  updated_at: string;
  owner_id: string;
}

interface HistoryEntry {
  id: string;
  changed_at: string;
  diff: any;
  changed_by: string;
}

export default function BuyerDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBuyer();
      fetchHistory();
    }
  }, [id]);

  const fetchBuyer = async () => {
    try {
      const { data, error } = await supabase
        .from("buyers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setBuyer({
        id: data.id,
        fullName: data.full_name,
        email: data.email || "",
        phone: data.phone,
        city: data.city,
        propertyType: data.property_type,
        bhk: data.bhk || undefined,
        purpose: data.purpose,
        budgetMin: data.budget_min || undefined,
        budgetMax: data.budget_max || undefined,
        timeline: data.timeline,
        source: data.source,
        status: data.status,
        notes: data.notes || "",
        tags: data.tags || [],
        updated_at: data.updated_at,
        owner_id: data.owner_id,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch buyer details",
        variant: "destructive",
      });
      router.push("/buyers");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("buyer_history")
        .select("*")
        .eq("buyer_id", id)
        .order("changed_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error("Failed to fetch history:", error);
    }
  };

  const handleUpdate = async (data: BuyerFormData) => {
    if (!buyer || !user) return;
    
    setSaving(true);
    try {
      // Check for concurrent updates
      const { data: currentBuyer, error: fetchError } = await supabase
        .from("buyers")
        .select("updated_at")
        .eq("id", buyer.id)
        .single();

      if (fetchError) throw fetchError;

      if (currentBuyer.updated_at !== buyer.updated_at) {
        toast({
          title: "Record changed",
          description: "This record has been updated by someone else. Please refresh and try again.",
          variant: "destructive",
        });
        return;
      }

      // Calculate diff for history
      const changes: any = {};
      Object.keys(data).forEach((key) => {
        const oldValue = buyer[key as keyof BuyerFormData];
        const newValue = data[key as keyof BuyerFormData];
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes[key] = { from: oldValue, to: newValue };
        }
      });

      // Update buyer
      const { error: updateError } = await supabase
        .from("buyers")
        .update({
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
        })
        .eq("id", buyer.id);

      if (updateError) throw updateError;

      // Add history entry if there were changes
      if (Object.keys(changes).length > 0) {
        await supabase
          .from("buyer_history")
          .insert([{
            buyer_id: buyer.id,
            changed_by: user.id,
            diff: {
              action: "updated",
              changes,
            },
          }]);
      }

      toast({
        title: "Success",
        description: "Buyer updated successfully",
      });

      // Refresh data
      fetchBuyer();
      fetchHistory();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update buyer",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!buyer || !user) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("buyers")
        .delete()
        .eq("id", buyer.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Buyer deleted successfully",
      });

      router.push("/buyers");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete buyer",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center py-8">
            <div className="animate-pulse">Loading buyer details...</div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!buyer) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Buyer not found</p>
            <Button onClick={() => router.push("/buyers")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Buyers
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const canEdit = user?.id === buyer.owner_id;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push("/buyers")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Buyers
            </Button>
            
            {canEdit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Buyer</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this buyer lead? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {canEdit ? (
            <BuyerForm
              title={`Edit Buyer: ${buyer.fullName}`}
              defaultValues={buyer}
              onSubmit={handleUpdate}
              loading={saving}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Buyer Details: {buyer.fullName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Contact Information</h3>
                    <p>Name: {buyer.fullName}</p>
                    <p>Phone: {buyer.phone}</p>
                    {buyer.email && <p>Email: {buyer.email}</p>}
                  </div>
                  <div>
                    <h3 className="font-semibold">Property Requirements</h3>
                    <p>City: {buyer.city}</p>
                    <p>Property Type: {buyer.propertyType}</p>
                    {buyer.bhk && <p>BHK: {buyer.bhk}</p>}
                    <p>Purpose: {buyer.purpose}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Budget & Timeline</h3>
                    {buyer.budgetMin && <p>Min Budget: ₹{buyer.budgetMin.toLocaleString()}</p>}
                    {buyer.budgetMax && <p>Max Budget: ₹{buyer.budgetMax.toLocaleString()}</p>}
                    <p>Timeline: {buyer.timeline}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Other Details</h3>
                    <p>Source: {buyer.source}</p>
                    <p>Status: {buyer.status}</p>
                    {buyer.tags.length > 0 && <p>Tags: {buyer.tags.join(", ")}</p>}
                  </div>
                </div>
                {buyer.notes && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Notes</h3>
                    <p className="text-muted-foreground">{buyer.notes}</p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-4">
                  You can only view this buyer. Only the owner can edit.
                </p>
              </CardContent>
            </Card>
          )}

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Changes</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground">No changes recorded</p>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-muted pl-4">
                      <div className="text-sm font-medium">
                        {entry.diff.action === "created" ? "Lead created" : "Lead updated"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(entry.changed_at), "PPp")}
                      </div>
                      {entry.diff.changes && (
                        <div className="text-sm mt-1">
                          {Object.entries(entry.diff.changes).map(([field, change]: [string, any]) => (
                            <div key={field}>
                              <span className="font-medium">{field}:</span> {JSON.stringify(change.from)} → {JSON.stringify(change.to)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}