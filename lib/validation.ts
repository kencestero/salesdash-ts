import { z } from "zod";

export const CreateCustomerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  zipcode: z.string().regex(/^\d{5}$/).optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  companyName: z.string().optional(),
  businessType: z.string().optional(),
  source: z.string().optional(),
  assignedTo: z.string().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  salesRepName: z.string().optional(),
  assignedToName: z.string().optional(),
});

export const ImportInventorySchema = z.object({
  supplier: z.enum(["DIAMOND", "QUALITY"]),
});
