import { z } from 'zod';

const locationSchema = z.object({
  id: z.number().int().nonnegative(),
  name: z.string().trim().min(1),
  nameKh: z.string(),
  shortName: z.string().optional(),
});

export const availablePairsSchema = z.object({
  count: z.number().int().nonnegative(),
  items: z.array(
    z.object({
      count: z.number().int().nonnegative(),
      fromLocation: locationSchema,
      toLocation: locationSchema,
    }),
  ),
});

export type AvailablePairs = z.infer<
  typeof availablePairsSchema
>;