"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buyerSchema, BuyerFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Loader2 } from "lucide-react";
import { useState } from "react";

interface BuyerFormProps {
  defaultValues?: Partial<BuyerFormData>;
  onSubmit: (data: BuyerFormData) => Promise<void>;
  loading?: boolean;
  title: string;
}

export default function BuyerForm({ defaultValues, onSubmit, loading, title }: BuyerFormProps) {
  const [tagInput, setTagInput] = useState("");
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      status: 'New',
      tags: [],
      ...defaultValues,
    },
  });

  const propertyType = watch("propertyType");
  const tags = watch("tags") || [];

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue("tags", tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="Enter full name"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="10-15 digit phone number"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Select onValueChange={(value) => setValue("city", value as any)} defaultValue={defaultValues?.city}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                  <SelectItem value="Mohali">Mohali</SelectItem>
                  <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                  <SelectItem value="Panchkula">Panchkula</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select onValueChange={(value) => setValue("propertyType", value as any)} defaultValue={defaultValues?.propertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Plot">Plot</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>
              {errors.propertyType && (
                <p className="text-sm text-destructive">{errors.propertyType.message}</p>
              )}
            </div>

            {/* BHK (conditional) */}
            {(propertyType === "Apartment" || propertyType === "Villa") && (
              <div className="space-y-2">
                <Label htmlFor="bhk">BHK *</Label>
                <Select onValueChange={(value) => setValue("bhk", value as any)} defaultValue={defaultValues?.bhk}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select BHK" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 BHK</SelectItem>
                    <SelectItem value="2">2 BHK</SelectItem>
                    <SelectItem value="3">3 BHK</SelectItem>
                    <SelectItem value="4">4 BHK</SelectItem>
                    <SelectItem value="Studio">Studio</SelectItem>
                  </SelectContent>
                </Select>
                {errors.bhk && (
                  <p className="text-sm text-destructive">{errors.bhk.message}</p>
                )}
              </div>
            )}

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Select onValueChange={(value) => setValue("purpose", value as any)} defaultValue={defaultValues?.purpose}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                </SelectContent>
              </Select>
              {errors.purpose && (
                <p className="text-sm text-destructive">{errors.purpose.message}</p>
              )}
            </div>

            {/* Budget Min */}
            <div className="space-y-2">
              <Label htmlFor="budgetMin">Minimum Budget (INR)</Label>
              <Input
                id="budgetMin"
                type="number"
                {...register("budgetMin")}
                placeholder="Enter minimum budget"
              />
              {errors.budgetMin && (
                <p className="text-sm text-destructive">{errors.budgetMin.message}</p>
              )}
            </div>

            {/* Budget Max */}
            <div className="space-y-2">
              <Label htmlFor="budgetMax">Maximum Budget (INR)</Label>
              <Input
                id="budgetMax"
                type="number"
                {...register("budgetMax")}
                placeholder="Enter maximum budget"
              />
              {errors.budgetMax && (
                <p className="text-sm text-destructive">{errors.budgetMax.message}</p>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline *</Label>
              <Select onValueChange={(value) => setValue("timeline", value as any)} defaultValue={defaultValues?.timeline}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-3m">0-3 months</SelectItem>
                  <SelectItem value="3-6m">3-6 months</SelectItem>
                  <SelectItem value=">6m">More than 6 months</SelectItem>
                  <SelectItem value="Exploring">Exploring</SelectItem>
                </SelectContent>
              </Select>
              {errors.timeline && (
                <p className="text-sm text-destructive">{errors.timeline.message}</p>
              )}
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">Source *</Label>
              <Select onValueChange={(value) => setValue("source", value as any)} defaultValue={defaultValues?.source}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Walk-in">Walk-in</SelectItem>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.source && (
                <p className="text-sm text-destructive">{errors.source.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue("status", value as any)} defaultValue={defaultValues?.status || 'New'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Visited">Visited</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                  <SelectItem value="Dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional notes (max 1000 characters)"
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Buyer Lead
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}