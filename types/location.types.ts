import { z } from 'zod';

const nonBlankString = z.string().trim().min(1);
const integerId = z.number().int().nonnegative();

const coordinateSchema = z.union([
  z.number().finite(),
  z.string().trim().min(1).refine(
    (value) => Number.isFinite(Number(value)),
    'Coordinate must be numeric',
  ),
  z.null(),
]);

const stopSchema = z.object({
  id: integerId,
  name: nonBlankString,
  nameKh: z.string().optional(),
  phone: z.string(),
  address: z.string().optional(),
  latitude: coordinateSchema,
  longitude: coordinateSchema,
});

const serviceTypeSchema = z.object({
  id: integerId,
  name: nonBlankString,
  icon: z.string().url().optional(),
});

export const locationTreeSchema = z.array(
  z.object({
    location: z.object({
      id: integerId,
      name: nonBlankString,
      nameKh: z.string(),
      shortName: z.string().optional(),
    }),
    stops: z.array(stopSchema),
    merchant: z.object({
      id: integerId,
      name: nonBlankString,
      logoUrl: z.string().url().optional(),
      subDomain: nonBlankString.optional(),
      serviceTypes: z.object({
        items: z.array(serviceTypeSchema),
      }).optional(),
    }),
  }),
);

export type LocationTree = z.infer<typeof locationTreeSchema>;