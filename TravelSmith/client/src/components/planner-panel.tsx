import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { planTrip } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { TripPlannerRequest, Itinerary } from "@shared/schema";

export default function PlannerPanel() {
  const [tripLength, setTripLength] = useState("7 days");
  const [destination, setDestination] = useState("");
  const [travelMonth, setTravelMonth] = useState("August");
  const [partySize, setPartySize] = useState("2 adults, 1 senior");
  const [maxDriveTime, setMaxDriveTime] = useState("2 hours");
  const [interests, setInterests] = useState("Scenery, castles, local food");
  const [budget, setBudget] = useState<"budget" | "moderate" | "luxury">("moderate");
  const [result, setResult] = useState<Itinerary | null>(null);
  const { toast } = useToast();

  const planMutation = useMutation({
    mutationFn: planTrip,
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error) => {
      toast({
        title: "Planning failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const handlePlan = () => {
    const plannerRequest: TripPlannerRequest = {
      tripLength,
      travelMonth,
      partySize,
      maxDriveTime,
      interests: destination ? `${destination}, ${interests}` : interests,
      budget,
    };

    planMutation.mutate(plannerRequest);
  };

  const handleClear = () => {
    setTripLength("7 days");
    setDestination("");
    setTravelMonth("August");
    setPartySize("");
    setMaxDriveTime("2 hours");
    setInterests("");
    setBudget("moderate");
    setResult(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Trip Planner</h3>
          <p className="text-slate-600">Create a detailed itinerary tailored to your preferences and constraints</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Form */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Destination</label>
              <Input
                data-testid="input-destination"
                placeholder="e.g., Japan, Italy, Scotland"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Trip Length</label>
              <Select value={tripLength} onValueChange={setTripLength}>
                <SelectTrigger data-testid="select-trip-length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3 days">3 days</SelectItem>
                  <SelectItem value="5 days">5 days</SelectItem>
                  <SelectItem value="7 days">7 days</SelectItem>
                  <SelectItem value="10 days">10 days</SelectItem>
                  <SelectItem value="14 days">14 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Travel Month</label>
              <Select value={travelMonth} onValueChange={setTravelMonth}>
                <SelectTrigger data-testid="select-travel-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="June">June</SelectItem>
                  <SelectItem value="July">July</SelectItem>
                  <SelectItem value="August">August</SelectItem>
                  <SelectItem value="September">September</SelectItem>
                  <SelectItem value="October">October</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Party Size</label>
              <Input
                data-testid="input-party-size"
                placeholder="e.g., 2 adults, 1 senior"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Max Drive Time</label>
              <Select value={maxDriveTime} onValueChange={setMaxDriveTime}>
                <SelectTrigger data-testid="select-max-drive-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                  <SelectItem value="2 hours">2 hours</SelectItem>
                  <SelectItem value="3 hours">3 hours</SelectItem>
                  <SelectItem value="4 hours">4 hours</SelectItem>
                  <SelectItem value="5+ hours">5+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Interests & Preferences</label>
              <Input
                data-testid="input-interests"
                placeholder="e.g., Scenery, castles, local food, museums"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <label className="block text-sm font-semibold text-slate-700">Budget Range</label>
            <div className="flex space-x-4">
              <button
                data-testid="button-budget-budget"
                onClick={() => setBudget("budget")}
                className={`budget-btn px-6 py-3 rounded-xl border-2 border-slate-300 hover:border-travel-blue-500 transition-colors font-medium text-slate-700 ${
                  budget === "budget" ? "active" : ""
                }`}
              >
                $ Budget
              </button>
              <button
                data-testid="button-budget-moderate"
                onClick={() => setBudget("moderate")}
                className={`budget-btn px-6 py-3 rounded-xl border-2 border-slate-300 hover:border-travel-blue-500 transition-colors font-medium text-slate-700 ${
                  budget === "moderate" ? "active" : ""
                }`}
              >
                $$ Moderate
              </button>
              <button
                data-testid="button-budget-luxury"
                onClick={() => setBudget("luxury")}
                className={`budget-btn px-6 py-3 rounded-xl border-2 border-slate-300 hover:border-travel-blue-500 transition-colors font-medium text-slate-700 ${
                  budget === "luxury" ? "active" : ""
                }`}
              >
                $$$ Luxury
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button
              data-testid="button-generate-itinerary"
              onClick={handlePlan}
              disabled={planMutation.isPending}
              className="bg-travel-blue-600 hover:bg-travel-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              {planMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>Generate Itinerary
                </>
              )}
            </Button>
            <Button
              data-testid="button-clear-form"
              onClick={handleClear}
              variant="secondary"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-full font-medium transition-colors"
            >
              Clear Form
            </Button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="border-t border-slate-100 bg-slate-50/50">
          <div className="p-8">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/50">
                <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <i className="fas fa-route text-travel-blue-600 mr-3"></i>
                  {result.title}
                </h4>

                <div className="space-y-8">
                  {result.days.map((day) => (
                    <div 
                      key={day.dayNumber} 
                      className="border-l-4 border-travel-blue-200 pl-6"
                      data-testid={`day-${day.dayNumber}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-lg font-semibold text-slate-900">
                          Day {day.dayNumber} • {day.title}
                        </h5>
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium">
                          {day.driveTime || `${day.budget} budget`}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="font-medium text-sm text-slate-700 mb-2">
                            Morning ({day.morning.time})
                          </p>
                          <p className="text-sm text-slate-600">{day.morning.activity}</p>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-700 mb-2">
                            Afternoon ({day.afternoon.time})
                          </p>
                          <p className="text-sm text-slate-600">{day.afternoon.activity}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 text-sm">
                        <p className="font-medium text-slate-700 mb-1">Highlights:</p>
                        <p className="text-slate-600">
                          {day.highlights.map((highlight, index) => (
                            <span key={index}>• {highlight} </span>
                          ))}
                        </p>
                        <p className="font-medium text-slate-700 mt-2 mb-1">Rain Plan:</p>
                        <p className="text-slate-600">{day.rainPlan}</p>
                      </div>
                    </div>
                  ))}

                  <div className="bg-travel-blue-50 rounded-xl p-6 border border-travel-blue-200">
                    <h6 className="font-semibold text-travel-blue-900 mb-3">Complete Overview</h6>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-travel-blue-800 mb-2">Accommodation Strategy:</p>
                        {result.accommodationStrategy.map((strategy, index) => (
                          <p key={index} className="text-travel-blue-700">• {strategy}</p>
                        ))}
                      </div>
                      <div>
                        <p className="font-medium text-travel-blue-800 mb-2">Budget Breakdown (Per Day):</p>
                        <p className="text-travel-blue-700">• Accommodation: {result.budgetBreakdown.accommodation}</p>
                        <p className="text-travel-blue-700">• Meals: {result.budgetBreakdown.meals}</p>
                        <p className="text-travel-blue-700">• Attractions: {result.budgetBreakdown.attractions}</p>
                        <p className="text-travel-blue-700">• Transport: {result.budgetBreakdown.transport}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
