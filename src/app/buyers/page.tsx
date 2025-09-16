"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, ChevronLeft, ChevronRight, Search, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/useDebounce";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Link from "next/link";

interface Buyer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string;
  property_type: string;
  bhk: string | null;
  purpose: string;
  budget_min: number | null;
  budget_max: number | null;
  timeline: string;
  status: string;
  updated_at: string;
}

const PAGE_SIZE = 10;

export default function BuyerList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  // Get filters from URL
  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("search") || "";
  const cityFilter = searchParams.get("city") || "all";
  const propertyTypeFilter = searchParams.get("propertyType") || "all";
  const statusFilter = searchParams.get("status") || "all";
  const timelineFilter = searchParams.get("timeline") || "all";

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  const updateFilters = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all" || !value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    if (key !== "page") {
      newParams.delete("page"); // Reset to page 1 when filtering
    }
    router.push(`/buyers?${newParams.toString()}`);
  };

  const fetchBuyers = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("buyers")
        .select("*", { count: "exact" });

      // Apply search
      if (debouncedSearch) {
        query = query.or(`full_name.ilike.%${debouncedSearch}%,phone.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }

      // Apply filters
      if (cityFilter !== "all") {
        query = query.eq("city", cityFilter as any);
      }
      if (propertyTypeFilter !== "all") {
        query = query.eq("property_type", propertyTypeFilter as any);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as any);
      }
      if (timelineFilter !== "all") {
        query = query.eq("timeline", timelineFilter as any);
      }

      // Apply pagination and sorting
      query = query
        .order("updated_at", { ascending: false })
        .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      setBuyers(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch buyers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, cityFilter, propertyTypeFilter, statusFilter, timelineFilter, toast]);

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return "Not specified";
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    if (max) return `Up to ₹${max.toLocaleString()}`;
    return "Not specified";
  };

  const exportToCsv = async () => {
    try {
      // Get all buyers with current filters (no pagination)
      let query = supabase.from("buyers").select("*");

      if (debouncedSearch) {
        query = query.or(`full_name.ilike.%${debouncedSearch}%,phone.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }
      if (cityFilter !== "all") query = query.eq("city", cityFilter as any);
      if (propertyTypeFilter !== "all") query = query.eq("property_type", propertyTypeFilter as any);
      if (statusFilter !== "all") query = query.eq("status", statusFilter as any);
      if (timelineFilter !== "all") query = query.eq("timeline", timelineFilter as any);

      query = query.order("updated_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Create CSV content
      const headers = [
        "fullName", "email", "phone", "city", "propertyType", "bhk", "purpose",
        "budgetMin", "budgetMax", "timeline", "source", "notes", "tags", "status"
      ];

      const csvContent = [
        headers.join(","),
        ...(data || []).map(buyer => [
          `"${buyer.full_name}"`,
          `"${buyer.email || ""}"`,
          `"${buyer.phone}"`,
          `"${buyer.city}"`,
          `"${buyer.property_type}"`,
          `"${buyer.bhk || ""}"`,
          `"${buyer.purpose}"`,
          buyer.budget_min || "",
          buyer.budget_max || "",
          `"${buyer.timeline}"`,
          `"${buyer.source}"`,
          `"${(buyer.notes || "").replace(/"/g, '""')}"`,
          `"${(buyer.tags || []).join(', ')}"`,
          `"${buyer.status}"`
        ].join(","))
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `buyers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Exported ${data?.length || 0} buyers to CSV`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export CSV",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Buyer Leads
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Manage and track your property buyer leads
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={exportToCsv} 
                variant="outline"
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Link href="/buyers/import">
                <Button 
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </Link>
            </div>
          </div>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                🔍 Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, phone, email..."
                    value={searchQuery}
                    onChange={(e) => updateFilters("search", e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={cityFilter} onValueChange={(value) => updateFilters("city", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                    <SelectItem value="Mohali">Mohali</SelectItem>
                    <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                    <SelectItem value="Panchkula">Panchkula</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={propertyTypeFilter} onValueChange={(value) => updateFilters("propertyType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Property Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Property Types</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Plot">Plot</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(value) => updateFilters("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Visited">Visited</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                    <SelectItem value="Dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={timelineFilter} onValueChange={(value) => updateFilters("timeline", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Timelines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Timelines</SelectItem>
                    <SelectItem value="0-3m">0-3 months</SelectItem>
                    <SelectItem value="3-6m">3-6 months</SelectItem>
                    <SelectItem value=">6m">6+ months</SelectItem>
                    <SelectItem value="Exploring">Exploring</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => router.push("/buyers")}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                📊 Buyers ({totalCount} total)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse">Loading...</div>
                </div>
              ) : buyers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No buyers found matching your criteria.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Property Type</TableHead>
                          <TableHead>Budget</TableHead>
                          <TableHead>Timeline</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {buyers.map((buyer) => (
                          <TableRow key={buyer.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div>{buyer.full_name}</div>
                                {buyer.email && (
                                  <div className="text-sm text-muted-foreground">
                                    {buyer.email}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{buyer.phone}</TableCell>
                            <TableCell>{buyer.city}</TableCell>
                            <TableCell>
                              {buyer.property_type}
                              {buyer.bhk && ` (${buyer.bhk} BHK)`}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatBudget(buyer.budget_min, buyer.budget_max)}
                            </TableCell>
                            <TableCell>{buyer.timeline}</TableCell>
                            <TableCell>
                              <Badge variant={
                                buyer.status === 'Converted' ? 'default' :
                                buyer.status === 'Dropped' ? 'destructive' :
                                buyer.status === 'New' ? 'secondary' : 'outline'
                              }>
                                {buyer.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {format(new Date(buyer.updated_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <Link href={`/buyers/${buyer.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} results
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateFilters("page", String(currentPage - 1))}
                          disabled={currentPage <= 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateFilters("page", String(currentPage + 1))}
                          disabled={currentPage >= totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}