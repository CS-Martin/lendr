import { z } from 'zod';

export const bidFormSchema = z.object({
  bidAmount: z.number().positive('Bid must be positive').min(0.0001, 'Bid must be at least 0.0001 POL'),
  rentalDuration: z.number().min(1, 'Minimum 1 hour').max(720, 'Cannot exceed 720 hours (30 days)'),
  message: z.string().max(500).optional().or(z.literal('')),
});

export type BidFormValues = z.infer<typeof bidFormSchema>;
