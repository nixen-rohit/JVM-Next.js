// app/api/projects/validators.ts


import { z } from "zod";

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Feature item schema
export const FeatureItemSchema = z.object({
  id: z.string(),
  text: z.string(),
});

// Key Features schema
export const KeyFeaturesSchema = z.object({
  heading: z.string().optional().default("Key Features"),
  paragraph: z.string().optional().default("Modern responsive layout for every device"),
  features: z.array(FeatureItemSchema).optional().default([]),
});

// Main update schema
export const updateProjectSchema = z.object({
  name: z.string().max(255).optional(),
  slug: z.string().max(255).optional(),
  status: z.enum(["ongoing", "sold", "upcoming"]).optional(),
  is_published: z
    .boolean()
    .or(z.number().transform((val) => Boolean(val)))
    .optional(),

  config: z
    .object({
      sections: z.record(z.string(), z.boolean()).optional(),
      hero: z.object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
      }).optional(),
      info: z.object({
        title: z.string().optional(),
        firstDescription: z.string().optional(),
        secondDescription: z.string().optional(),
      }).optional(),
      stats: z.array(z.object({
        icon: z.string().optional(),
        title: z.string().optional(),
        desc: z.string().optional(),
      })).optional(),
      highlight: z.object({
        title: z.string().optional(),
        paragraph: z.string().optional(),
      }).optional(),
      location: z.object({
        googleMapEmbedUrl: z.string().optional(),
      }).optional(),
      collage: z.object({
        showMoreLimit: z.number().int().positive().optional(),
        layoutPattern: z.enum(["modulo-6", "masonry", "grid"]).optional(),
      }).optional(),
      keyFeatures: KeyFeaturesSchema.optional(),
    })
    .optional(),
});

export type UpdatePayload = z.infer<typeof updateProjectSchema>;