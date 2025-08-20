import { apiRequest } from "./queryClient";
import type { TravelQuery, TravelAnswer, TripPlannerRequest, Itinerary } from "@shared/schema";

export const searchTravel = async (query: TravelQuery): Promise<TravelAnswer> => {
  const response = await apiRequest("POST", "/api/travel/search", query);
  return response.json();
};

export const planTrip = async (request: TripPlannerRequest): Promise<Itinerary> => {
  const response = await apiRequest("POST", "/api/travel/plan", request);
  return response.json();
};
