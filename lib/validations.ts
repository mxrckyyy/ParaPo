// PARA PO shared Zod schemas (Phase 1: used for client-side UX validation;
// enforced server-side from Phase 2/3 per docs/SECURITY.md §5).
import { z } from "zod";

export const reportTypeSchema = z.enum(["traffic", "full", "accident", "closure"]);
export const reportStatusSchema = z.enum(["pending", "approved", "rejected"]);
export const alertSeveritySchema = z.enum(["info", "warning", "critical"]);

export const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const searchInputSchema = z.object({
  origin: z.string().trim().min(2, "Origin needs at least 2 characters.").max(120),
  destination: z.string().trim().min(2, "Destination needs at least 2 characters.").max(120),
});

export const reportInputSchema = z.object({
  type: reportTypeSchema,
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer.")
    .optional(),
});

/** Full report submission (Phase 3 Server Action input). */
export const reportSubmitSchema = z.object({
  type: reportTypeSchema,
  description: z.string().trim().max(500, "Description must be 500 characters or fewer.").optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/** Vehicle ride-sharing position update (Phase 3 Server Action input). */
export const vehicleShareSchema = z.object({
  routeId: z.string().uuid().nullable(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/** Admin alert creation (Phase 4). Expires-at is an optional date input. */
export const alertCreateSchema = z.object({
  title: z.string().trim().min(3, "Title needs at least 3 characters.").max(200),
  message: z.string().trim().min(3, "Message needs at least 3 characters.").max(1000),
  severity: alertSeveritySchema,
  expiresAt: z.string().trim().optional(),
});

export type SearchInput = z.infer<typeof searchInputSchema>;
export type ReportInput = z.infer<typeof reportInputSchema>;
export type ReportSubmit = z.infer<typeof reportSubmitSchema>;
export type VehicleShare = z.infer<typeof vehicleShareSchema>;
export type AlertCreate = z.infer<typeof alertCreateSchema>;
