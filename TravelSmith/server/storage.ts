import { type TravelAnswer, type Itinerary } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  saveTravelAnswer(answer: TravelAnswer): Promise<TravelAnswer>;
  getTravelAnswer(id: string): Promise<TravelAnswer | undefined>;
  saveItinerary(itinerary: Itinerary): Promise<Itinerary>;
  getItinerary(id: string): Promise<Itinerary | undefined>;
}

export class MemStorage implements IStorage {
  private travelAnswers: Map<string, TravelAnswer>;
  private itineraries: Map<string, Itinerary>;

  constructor() {
    this.travelAnswers = new Map();
    this.itineraries = new Map();
  }

  async saveTravelAnswer(answer: TravelAnswer): Promise<TravelAnswer> {
    this.travelAnswers.set(answer.id, answer);
    return answer;
  }

  async getTravelAnswer(id: string): Promise<TravelAnswer | undefined> {
    return this.travelAnswers.get(id);
  }

  async saveItinerary(itinerary: Itinerary): Promise<Itinerary> {
    this.itineraries.set(itinerary.id, itinerary);
    return itinerary;
  }

  async getItinerary(id: string): Promise<Itinerary | undefined> {
    return this.itineraries.get(id);
  }
}

export const storage = new MemStorage();
