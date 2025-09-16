"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

export default function ImportBuyers() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/buyers/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Imported ${result.imported} buyers successfully`,
        });
        router.push("/buyers");
      } else {
        throw new Error(result.error || "Import failed");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import buyers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "fullName", "email", "phone", "city", "propertyType", "bhk", "purpose",
      "budgetMin", "budgetMax", "timeline", "source", "notes", "tags", "status"
    ];

    const sampleData = [
      "John Doe", "john@example.com", "9876543210", "Chandigarh", "Apartment", "2", "Buy",
      "5000000", "7000000", "0-3m", "Website", "Interested in 2BHK", "urgent,premium", "New"
    ];

    const csvContent = [
      headers.join(","),
      sampleData.join(",")
    ].join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buyer-import-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push("/buyers")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Buyers
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Import Buyers from CSV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Button 
                  variant="outline" 
                  onClick={downloadTemplate}
                  className="mb-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <p className="text-sm text-muted-foreground">
                  Download the CSV template to see the required format for importing buyers.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csv-file">Select CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                />
                <p className="text-sm text-muted-foreground">
                  Choose a CSV file with buyer data to import.
                </p>
              </div>

              {file && (
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm">
                    <strong>Selected file:</strong> {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Size: {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              <Button 
                onClick={handleImport} 
                disabled={!file || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Buyers
                  </>
                )}
              </Button>

              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>CSV Format Requirements:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>First row should contain column headers</li>
                  <li>Required fields: fullName, phone, city, propertyType, purpose, timeline, source</li>
                  <li>Optional fields: email, bhk, budgetMin, budgetMax, notes, tags, status</li>
                  <li>Tags should be comma-separated within quotes</li>
                  <li>BHK is required for Apartment and Villa property types</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}