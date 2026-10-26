import { z } from 'zod';

const locationSchema = z.object({
  id: z.number().int().nonnegative(),
  name: z.string().min(1),
  nameKh: z.string(),
  shortName: z.string().optional(),
});

const locationPairSchema = z.object({
  count: z.number().int().nonnegative(),
  fromLocation: locationSchema,
  toLocation: locationSchema,
});

export const allAvailableLocationSchema = z.object({
  count: z.number().int().nonnegative(),
  items: z.array(locationPairSchema),
});

export type AllAvailableLocation = z.infer<
  typeof allAvailableLocationSchema
>;