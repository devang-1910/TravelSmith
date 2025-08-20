import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { searchTravel } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { TravelQuery, TravelAnswer } from "@shared/schema";

export default function ExplorerPanel() {
  const [query, setQuery] = useState("");
  const [preferRecent, setPreferRecent] = useState(false);
  const [officialSourcesOnly, setOfficialSourcesOnly] = useState(false);
  const [result, setResult] = useState<TravelAnswer | null>(null);
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: searchTravel,
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error) => {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please enter a travel question to search",
        variant: "destructive",
      });
      return;
    }

    const searchQuery: TravelQuery = {
      query: query.trim(),
      preferRecent,
      officialSourcesOnly,
    };

    searchMutation.mutate(searchQuery);
  };

  const handleClear = () => {
    setQuery("");
    setPreferRecent(false);
    setOfficialSourcesOnly(false);
    setResult(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Travel Explorer</h3>
          <p className="text-slate-600">Ask any travel question and get expert advice with verified sources</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              What would you like to know?
            </label>
            <Textarea
              data-testid="input-travel-query"
              placeholder="e.g., 5-day Scotland Highlands loop with drives under 2 hours, include Jacobite train"
              className="h-32 resize-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center space-x-2 text-sm">
              <Checkbox
                data-testid="checkbox-prefer-recent"
                checked={preferRecent}
                onCheckedChange={(checked) => setPreferRecent(!!checked)}
              />
              <span className="text-slate-700">Prefer recent (≤12 months)</span>
            </label>
            <label className="inline-flex items-center space-x-2 text-sm">
              <Checkbox
                data-testid="checkbox-official-sources"
                checked={officialSourcesOnly}
                onCheckedChange={(checked) => setOfficialSourcesOnly(!!checked)}
              />
              <span className="text-slate-700">Official sources only</span>
            </label>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button
              data-testid="button-search"
              onClick={handleSearch}
              disabled={searchMutation.isPending}
              className="bg-travel-blue-600 hover:bg-travel-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              {searchMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>Searching...
                </>
              ) : (
                <>
                  <i className="fas fa-search mr-2"></i>Search & Answer
                </>
              )}
            </Button>
            <Button
              data-testid="button-clear"
              onClick={handleClear}
              variant="secondary"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-full font-medium transition-colors"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="border-t border-slate-100 bg-slate-50/50">
          <div className="p-8">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
              {/* Answer Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <i className="fas fa-lightbulb text-travel-blue-600 mr-2"></i>
                    Expert Answer
                  </h4>
                  <div 
                    className="prose prose-slate max-w-none text-sm leading-relaxed"
                    data-testid="text-answer"
                    dangerouslySetInnerHTML={{ __html: result.answer.replace(/\n/g, '<br>') }}
                  />
                </div>
              </div>

              {/* Sources Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 h-fit">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <i className="fas fa-link text-emerald-600 mr-2"></i>
                    Verified Sources
                  </h4>
                  <div className="space-y-4">
                    {result.sources.map((source) => (
                      <div 
                        key={source.id} 
                        className="border-l-4 border-travel-blue-200 pl-4"
                        data-testid={`source-${source.citationNumber}`}
                      >
                        <p className="font-medium text-sm text-slate-900">
                          [{source.citationNumber}] {source.title}
                        </p>
                        <p className="text-xs text-slate-500 mb-2">
                          {source.domain} {source.publishedDate && `• ${new Date(source.publishedDate).toLocaleDateString()}`}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {source.snippet}
                        </p>
                      </div>
                    ))}
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
