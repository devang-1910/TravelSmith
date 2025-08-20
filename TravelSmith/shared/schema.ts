import { z } from "zod";

// Travel Explorer Schemas
export const travelQuerySchema = z.object({
  query: z.string().min(1, "Query is required"),
  preferRecent: z.boolean().default(false),
  officialSourcesOnly: z.boolean().default(false),
});

export const sourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  domain: z.string(),
  publishedDate: z.string().optional(),
  snippet: z.string(),
  citationNumber: z.number(),
});

export const travelAnswerSchema = z.object({
  id: z.string(),
  query: z.string(),
  answer: z.string(),
  sources: z.array(sourceSchema),
  timestamp: z.string(),
});

// Trip Planner Schemas
export const tripPlannerRequestSchema = z.object({
  tripLength: z.string(),
  travelMonth: z.string(),
  partySize: z.string(),
  maxDriveTime: z.string(),
  interests: z.string(),
  budget: z.enum(["budget", "moderate", "luxury"]),
});

export const itineraryDaySchema = z.object({
  dayNumber: z.number(),
  title: z.string(),
  location: z.string(),
  driveTime: z.string().optional(),
  morning: z.object({
    time: z.string(),
    activity: z.string(),
  }),
  afternoon: z.object({
    time: z.string(),
    activity: z.string(),
  }),
  highlights: z.array(z.string()),
  rainPlan: z.string(),
  budget: z.enum(["budget", "moderate", "luxury"]),
});

export const itinerarySchema = z.object({
  id: z.string(),
  title: z.string(),
  days: z.array(itineraryDaySchema),
  accommodationStrategy: z.array(z.string()),
  budgetBreakdown: z.object({
    accommodation: z.string(),
    meals: z.string(),
    attractions: z.string(),
    transport: z.string(),
  }),
  timestamp: z.string(),
});

// Type exports
export type TravelQuery = z.infer<typeof travelQuerySchema>;
export type Source = z.infer<typeof sourceSchema>;
export type TravelAnswer = z.infer<typeof travelAnswerSchema>;
export type TripPlannerRequest = z.infer<typeof tripPlannerRequestSchema>;
export type ItineraryDay = z.infer<typeof itineraryDaySchema>;
export type Itinerary = z.infer<typeof itinerarySchema>;
