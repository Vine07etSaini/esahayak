import { z } from "zod";

// Enums matching database
export const CityEnum = z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']);
export const PropertyTypeEnum = z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']);
export const BhkEnum = z.enum(['1', '2', '3', '4', 'Studio']);
export const PurposeEnum = z.enum(['Buy', 'Rent']);
export const TimelineEnum = z.enum(['0-3m', '3-6m', '>6m', 'Exploring']);
export const SourceEnum = z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']);
export const StatusEnum = z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']);

// Phone validation for Indian numbers (10-15 digits)
const phoneRegex = /^[0-9]{10,15}$/;

// Buyer validation schema
export const buyerSchema = z.object({
  fullName: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must be at most 80 characters"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string()
    .regex(phoneRegex, "Phone must be 10-15 digits"),
  city: CityEnum,
  propertyType: PropertyTypeEnum,
  bhk: BhkEnum.optional(),
  purpose: PurposeEnum,
  budgetMin: z.coerce.number().min(0, "Budget must be positive").optional(),
  budgetMax: z.coerce.number().min(0, "Budget must be positive").optional(),
  timeline: TimelineEnum,
  source: SourceEnum,
  status: StatusEnum.default('New'),
  notes: z.string().max(1000, "Notes must be at most 1000 characters").optional(),
  tags: z.array(z.string()).default([]),
}).refine((data) => {
  // BHK required for Apartment/Villa
  if (['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: "BHK is required for Apartment and Villa properties",
  path: ["bhk"]
}).refine((data) => {
  // Budget max >= budget min
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: "Maximum budget must be greater than or equal to minimum budget",
  path: ["budgetMax"]
});

export type BuyerFormData = z.infer<typeof buyerSchema>;