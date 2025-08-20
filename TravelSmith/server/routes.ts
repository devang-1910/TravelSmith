import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { travelQuerySchema, tripPlannerRequestSchema, type TravelAnswer, type Itinerary, type Source } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Travel Explorer endpoint
  app.post("/api/travel/search", async (req, res) => {
    try {
      const query = travelQuerySchema.parse(req.body);
      
      // Get API keys from environment
      const openaiApiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
      const tavilyApiKey = process.env.TAVILY_API_KEY || process.env.TAVILY_KEY;
      
      if (!openaiApiKey || !tavilyApiKey) {
        return res.status(500).json({ 
          message: "API keys not configured. Please set OPENAI_API_KEY and TAVILY_API_KEY environment variables." 
        });
      }

      // Search for travel information using Tavily
      const searchResponse = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tavilyApiKey}`,
        },
        body: JSON.stringify({
          query: query.query,
          search_depth: "advanced",
          include_domains: query.officialSourcesOnly ? [
            "visitscotland.com", "scotrail.co.uk", "lonelyplanet.com", 
            "tripadvisor.com", "booking.com", "airbnb.com", "gov.uk"
          ] : undefined,
          max_results: 8,
          include_answer: false,
          include_raw_content: false,
        }),
      });

      if (!searchResponse.ok) {
        throw new Error(`Tavily search failed: ${searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();
      
      // Format sources
      const sources: Source[] = searchData.results.map((result: any, index: number) => ({
        id: randomUUID(),
        title: result.title,
        url: result.url,
        domain: new URL(result.url).hostname,
        publishedDate: result.published_date,
        snippet: result.content,
        citationNumber: index + 1,
      }));

      // Generate AI answer using OpenAI
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a travel expert. Provide comprehensive, helpful travel advice based on the search results provided. Format your response with clear structure, bullet points where appropriate, and cite sources using [1], [2], etc. Be specific about practical details like timing, costs, and logistics.",
            },
            {
              role: "user",
              content: `Travel question: ${query.query}\n\nSearch results:\n${sources.map((source, index) => `[${index + 1}] ${source.title}\n${source.snippet}\nSource: ${source.domain}\n`).join('\n')}`,
            },
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API failed: ${openaiResponse.statusText}`);
      }

      const openaiData = await openaiResponse.json();
      const answer = openaiData.choices[0].message.content;

      // Create and save travel answer
      const travelAnswer: TravelAnswer = {
        id: randomUUID(),
        query: query.query,
        answer,
        sources,
        timestamp: new Date().toISOString(),
      };

      await storage.saveTravelAnswer(travelAnswer);

      res.json(travelAnswer);
    } catch (error) {
      console.error("Travel search error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An error occurred while processing your travel query" 
      });
    }
  });

  // Trip Planner endpoint
  app.post("/api/travel/plan", async (req, res) => {
    try {
      const plannerRequest = tripPlannerRequestSchema.parse(req.body);
      console.log("Trip planner request:", plannerRequest);
      
      const openaiApiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
      
      if (!openaiApiKey) {
        return res.status(500).json({ 
          message: "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable." 
        });
      }

      // Generate itinerary using OpenAI
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a professional travel planner. Create detailed day-by-day itineraries with specific activities, timing, and practical information. Include accommodation strategies, budget breakdowns, and weather contingencies. Format your response as structured JSON that matches the expected itinerary schema.",
            },
            {
              role: "user",
              content: `Create a ${plannerRequest.tripLength} travel itinerary for ${plannerRequest.travelMonth} with the following requirements:
- Party size: ${plannerRequest.partySize}
- Maximum drive time: ${plannerRequest.maxDriveTime}
- Interests: ${plannerRequest.interests}
- Budget level: ${plannerRequest.budget}

IMPORTANT: The interests field contains the destination. Extract the destination from: "${plannerRequest.interests}". If multiple destinations are mentioned, choose the primary one. If no specific destination is mentioned, suggest an appropriate one based on the other interests.

Provide a detailed day-by-day breakdown with morning and afternoon activities, highlights, rain backup plans, and accommodation strategy for the chosen destination.`,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API failed: ${openaiResponse.statusText}`);
      }

      const openaiData = await openaiResponse.json();
      const aiResponse = openaiData.choices[0].message.content;
      console.log("AI Response received:", aiResponse);

      // Try to parse the AI response as JSON, fall back to text if it fails
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch (e) {
        parsedResponse = null;
      }

      // Parse different AI response formats
      let days = [];
      let destination = "Custom Destination";
      
      if (parsedResponse) {
        // Format 1: { "Destination": "Australia", "Day1": { "Morning": { "Activity": ... }, "Afternoon": { ... } } }
        if (parsedResponse.Destination && (parsedResponse.Day1 || parsedResponse.day1)) {
          destination = parsedResponse.Destination;
          const dayKeys = Object.keys(parsedResponse).filter(key => key.startsWith('Day') || key.startsWith('day'));
          days = dayKeys.map((dayKey, index) => {
            const dayData = parsedResponse[dayKey];
            return {
              dayNumber: index + 1,
              title: `Day ${index + 1} - ${destination}`,
              location: destination,
              morning: {
                time: dayData.Morning?.Time || "9:00 AM - 12:00 PM",
                activity: dayData.Morning?.Activity || dayData.Morning?.Details || "Morning activities",
              },
              afternoon: {
                time: dayData.Afternoon?.Time || "1:00 PM - 6:00 PM",
                activity: dayData.Afternoon?.Activity || dayData.Afternoon?.Details || "Afternoon activities",
              },
              highlights: [dayData.Morning?.Activity, dayData.Afternoon?.Activity].filter(Boolean),
              rainPlan: dayData.Morning?.RainBackupPlan || dayData.Afternoon?.RainBackupPlan || "Indoor alternatives",
              budget: plannerRequest.budget,
            };
          });
        }
        // Format 2: { destination, itinerary: { day1: { morning: { activity, highlight, rainBackupPlan }, afternoon: {...} } } }
        else if (parsedResponse.itinerary && typeof parsedResponse.itinerary === 'object' && !Array.isArray(parsedResponse.itinerary)) {
          destination = parsedResponse.destination || destination;
          const itineraryDays = parsedResponse.itinerary;
          days = Object.keys(itineraryDays).map((dayKey, index) => {
            const dayData = itineraryDays[dayKey];
            return {
              dayNumber: index + 1,
              title: `Day ${index + 1} - ${destination}`,
              location: destination,
              morning: {
                time: dayData.morning?.timing || "9:00 AM - 12:00 PM",
                activity: dayData.morning?.activity || "Morning activities",
              },
              afternoon: {
                time: dayData.afternoon?.timing || "1:00 PM - 6:00 PM",
                activity: dayData.afternoon?.activity || "Afternoon activities",
              },
              highlights: [dayData.morning?.highlight, dayData.afternoon?.highlight].filter(Boolean),
              rainPlan: dayData.morning?.rainBackupPlan || dayData.afternoon?.rainBackupPlan || "Indoor alternatives",
              budget: plannerRequest.budget,
            };
          });
        }
        // Format 2: { Destination, Itinerary: [{ Day, MorningActivity, AfternoonActivity }] }
        else if (parsedResponse.Itinerary && Array.isArray(parsedResponse.Itinerary)) {
          destination = parsedResponse.Destination || destination;
          days = parsedResponse.Itinerary.map((dayData: any, index: number) => ({
            dayNumber: index + 1,
            title: `Day ${index + 1} - ${destination}`,
            location: destination,
            morning: {
              time: dayData.MorningActivity?.Time || "9:00 AM - 12:00 PM",
              activity: dayData.MorningActivity?.Activity || "Morning activities",
            },
            afternoon: {
              time: dayData.AfternoonActivity?.Time || "1:00 PM - 6:00 PM", 
              activity: dayData.AfternoonActivity?.Activity || "Afternoon activities",
            },
            highlights: [dayData.Highlights].filter(Boolean),
            rainPlan: dayData.MorningActivity?.RainBackupPlan || dayData.AfternoonActivity?.RainBackupPlan || "Indoor alternatives",
            budget: plannerRequest.budget,
          }));
        }
        // Format 3: { itinerary: { breakdown: { day1: { morning, afternoon } } } }
        else if (parsedResponse.itinerary?.breakdown) {
          destination = parsedResponse.itinerary.destination || destination;
          days = Object.keys(parsedResponse.itinerary.breakdown).map((dayKey, index) => {
            const dayData = parsedResponse.itinerary.breakdown[dayKey];
            return {
              dayNumber: index + 1,
              title: `Day ${index + 1} - ${destination}`,
              location: destination,
              morning: {
                time: "9:00 AM - 12:00 PM",
                activity: dayData.morning?.activity || "Morning activities",
              },
              afternoon: {
                time: "1:00 PM - 6:00 PM",
                activity: dayData.afternoon?.activity || "Afternoon activities",
              },
              highlights: [dayData.morning?.highlight, dayData.afternoon?.highlight].filter(Boolean),
              rainPlan: dayData.morning?.rainBackupPlan || dayData.afternoon?.rainBackupPlan || "Indoor alternatives",
              budget: plannerRequest.budget,
            };
          });
        }
      }
      
      // Fallback if no valid format found
      if (days.length === 0) {
        days = [
          {
            dayNumber: 1,
            title: "Custom Travel Plan",
            location: "Custom Destination",
            morning: {
              time: "9:00 AM - 12:00 PM",
              activity: "AI-generated morning activities",
            },
            afternoon: {
              time: "1:00 PM - 6:00 PM",
              activity: "AI-generated afternoon activities",
            },
            highlights: ["Personalized recommendations"],
            rainPlan: "Weather alternatives included",
            budget: plannerRequest.budget,
          },
        ];
      }

      // Create the final itinerary object
      const itinerary: Itinerary = {
        id: randomUUID(),
        title: `${plannerRequest.tripLength} ${destination} Itinerary`,
        days: days,
        accommodationStrategy: parsedResponse?.Day1?.Accommodation ? 
          [parsedResponse.Day1.Accommodation] : 
          parsedResponse?.itinerary?.day1?.accommodation ? 
          [parsedResponse.itinerary.day1.accommodation] : 
          parsedResponse?.itinerary?.breakdown?.day1?.accommodation ? 
          [parsedResponse.itinerary.breakdown.day1.accommodation] : 
          ["Mid-range accommodations as per budget"],
        budgetBreakdown: {
          accommodation: parsedResponse?.Budget?.Accommodation || parsedResponse?.totalEstimatedBudget?.accommodation || parsedResponse?.itinerary?.budgetBreakdown?.accommodation || (plannerRequest.budget === "budget" ? "$50-100" : plannerRequest.budget === "moderate" ? "$100-200" : "$200-400"),
          meals: parsedResponse?.Budget?.Food || parsedResponse?.totalEstimatedBudget?.meals || parsedResponse?.itinerary?.budgetBreakdown?.food || (plannerRequest.budget === "budget" ? "$30-50" : plannerRequest.budget === "moderate" ? "$50-80" : "$80-150"),
          attractions: parsedResponse?.Budget?.Activities || parsedResponse?.totalEstimatedBudget?.activities || parsedResponse?.itinerary?.budgetBreakdown?.activities || (plannerRequest.budget === "budget" ? "$20-40" : plannerRequest.budget === "moderate" ? "$40-70" : "$70-120"),
          transport: parsedResponse?.Budget?.Transportation || parsedResponse?.totalEstimatedBudget?.transportation || parsedResponse?.itinerary?.budgetBreakdown?.transport || (plannerRequest.budget === "budget" ? "$20-40" : plannerRequest.budget === "moderate" ? "$40-70" : "$70-120"),
        },
        timestamp: new Date().toISOString(),
      };

      await storage.saveItinerary(itinerary);

      res.json(itinerary);
    } catch (error) {
      console.error("Trip planning error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An error occurred while generating your itinerary" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
