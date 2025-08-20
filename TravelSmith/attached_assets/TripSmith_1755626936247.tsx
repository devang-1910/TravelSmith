"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Source = { id: number; title: string; url: string; snippet?: string; published_date?: string | null };

export default function TripSmith() {
  // Frontend-safe API base (no process.env usage in the browser code)
  const DEFAULT_API_BASE = "http://localhost:8000";
  const [apiBase, setApiBase] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const fromMeta = document.querySelector('meta[name="api-base"]')?.getAttribute("content");
        const fromLS = localStorage.getItem("API_BASE");
        return fromMeta || fromLS || DEFAULT_API_BASE;
      } catch {
        return DEFAULT_API_BASE;
      }
    }
    return DEFAULT_API_BASE;
  });
  const API_BASE = apiBase;

  const [tab, setTab] = useState("explorer");

  // Explorer state
  const [query, setQuery] = useState("");
  const [freshOnly, setFreshOnly] = useState(false);
  const [officialOnly, setOfficialOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string>("");
  const [sources, setSources] = useState<Source[]>([]);

  // Planner state
  const [days, setDays] = useState(5);
  const [month, setMonth] = useState("August");
  const [party, setParty] = useState("2 adults, 1 senior");
  const [maxDrive, setMaxDrive] = useState(2);
  const [interests, setInterests] = useState("Scenery, castles, local food");
  const [budget, setBudget] = useState<"$" | "$$" | "$$$">("$$");
  const [planAnswer, setPlanAnswer] = useState<string>("");
  const [planLoading, setPlanLoading] = useState(false);

  const [errMsg, setErrMsg] = useState<string>("");

  const mockSources: Source[] = useMemo(
    () => [
      {
        id: 1,
        title: "Visit Scotland – Highlands road trips",
        url: "https://www.visitscotland.com/",
        snippet: "Official guidance on scenic routes, seasonal tips, and travel times.",
        published_date: "2025-05-11"
      },
      {
        id: 2,
        title: "ScotRail – Jacobite Steam Train info",
        url: "https://www.scotrail.co.uk/",
        snippet: "Schedules, booking windows, and accessibility notes.",
        published_date: "2025-04-02"
      },
      {
        id: 3,
        title: "Lonely Planet – Scotland",
        url: "https://www.lonelyplanet.com/scotland",
        snippet: "Highlights, sample itineraries, and food picks.",
        published_date: "2025-03-18"
      }
    ],
    []
  );

  async function onAsk() {
    setLoading(true);
    setErrMsg("");
    setAnswer("");
    setSources([]);

    try {
      const r = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, freshOnly, officialOnly })
      });
      if (!r.ok) throw new Error(`Ask failed: ${r.status}`);
      const data = await r.json();
      setAnswer(data.answer || "No answer.");
      setSources(Array.isArray(data.sources) ? data.sources : []);
    } catch (e: any) {
      // fallback to mock if backend not available
      setAnswer(
        "• (Preview) Relaxed 5-day Highlands loop with short drives and highlights [1][3].\n" +
          "• (Preview) Jacobite steam train is seasonal—book early [2].\n\nSources\n[1] Visit Scotland\n[2] ScotRail\n[3] Lonely Planet"
      );
      setSources(mockSources);
      setErrMsg(e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function onPlan() {
    setPlanLoading(true);
    setErrMsg("");
    setPlanAnswer("");
    try {
      const r = await fetch(`${API_BASE}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, month, party, maxDrive, interests, budget })
      });
      if (!r.ok) throw new Error(`Plan failed: ${r.status}`);
      const data = await r.json();
      setPlanAnswer(data.answer || "No plan generated.");
    } catch (e: any) {
      setPlanAnswer(
        "Day 1 — Inverness base (preview)\nAM: Arrive, PM: Loch Ness viewpoints (~0.8h)\nDay 2 — Fort William (preview)\n..."
      );
      setErrMsg(e?.message || "Request failed");
    } finally {
      setPlanLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <header className="sticky top-0 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white grid place-items-center font-bold">TS</div>
            <div>
              <h1 className="text-lg font-semibold">TripSmith</h1>
              <p className="text-xs text-slate-500">Travel Planner & Explorer</p>
            </div>
          </div>
          <div className="text-xs text-slate-500">Starter UI • React + Tailwind</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 max-w-md">
            <TabsTrigger value="explorer">Explorer</TabsTrigger>
            <TabsTrigger value="planner">Planner</TabsTrigger>
          </TabsList>

          {/* Explorer */}
          <TabsContent value="explorer" className="mt-6">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="grid gap-3">
                  <label className="text-sm font-medium">Ask a travel question</label>
                  <Textarea
                    placeholder="e.g., 5-day Scotland Highlands loop with drives under 2 hours, include Jacobite train"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-h-[90px]"
                  />
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="accent-slate-900"
                        checked={freshOnly}
                        onChange={() => setFreshOnly(!freshOnly)}
                      />
                      Prefer recent (≤12 months)
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="accent-slate-900"
                        checked={officialOnly}
                        onChange={() => setOfficialOnly(!officialOnly)}
                      />
                      Official sources only
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button disabled={loading || query.trim().length < 3} onClick={onAsk}>
                      {loading ? "Searching & drafting…" : "Search & Answer"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setAnswer("");
                        setSources([]);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {answer && (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 grid md:grid-cols-3 gap-4"
              >
                <Card className="md:col-span-2 rounded-2xl">
                  <CardContent className="p-4 md:p-6">
                    <h3 className="font-semibold mb-2">Answer</h3>
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">{answer}</pre>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="p-4 md:p-6">
                    <h3 className="font-semibold mb-3">Sources</h3>
                    <ol className="list-decimal ml-5 space-y-3">
                      {sources.map((s) => (
                        <li key={s.id} className="text-sm">
                          <a className="underline" href={s.url} target="_blank" rel="noreferrer">
                            {s.title}
                          </a>
                          {s.published_date ? <span className="text-slate-500"> — ({s.published_date})</span> : null}
                          {s.snippet ? <div className="text-slate-600 mt-1">{s.snippet}</div> : null}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </motion.section>
            )}
          </TabsContent>

          {/* Planner */}
          <TabsContent value="planner" className="mt-6">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Trip length (days)</label>
                    <Input
                      type="number"
                      min={2}
                      max={14}
                      value={days}
                      onChange={(e) => setDays(parseInt(e.target.value || "5"))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Month</label>
                    <Input value={month} onChange={(e) => setMonth(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Party profile</label>
                    <Input value={party} onChange={(e) => setParty(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Max drive per leg (hours)</label>
                    <Input
                      type="number"
                      min={0.5}
                      max={5}
                      step={0.5}
                      value={maxDrive}
                      onChange={(e) => setMaxDrive(parseFloat(e.target.value || "2"))}
                    />
                  </div>
                </div>
                <div className="grid gap-2 mt-4">
                  <label className="text-sm font-medium">Interests</label>
                  <Input
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="Scenery, castles, local food"
                  />
                </div>
                <div className="grid gap-2 mt-4">
                  <label className="text-sm font-medium">Budget</label>
                  <div className="flex gap-2">
                    {(["$", "$$", "$$$"] as const).map((b) => (
                      <Button key={b} variant={budget === b ? "default" : "secondary"} onClick={() => setBudget(b)}>
                        {b}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <Button onClick={onPlan} disabled={planLoading}>
                    {planLoading ? "Generating…" : "Generate Itinerary"}
                  </Button>
                  <Button variant="secondary" onClick={() => setPlanAnswer("")}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {planAnswer && (
              <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <Card className="rounded-2xl">
                  <CardContent className="p-4 md:p-6">
                    <h3 className="font-semibold mb-2">Proposed Plan</h3>
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">{planAnswer}</pre>
                    <div className="text-xs text-slate-500 mt-3">
                      Preview uses mocked content if backend is unreachable.
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}
          </TabsContent>
        </Tabs>

        {errMsg && <div className="mt-4 text-sm text-red-600">{errMsg}</div>}

        {/* Developer Tools / Test cases */}
        <section className="mt-8">
          <Card className="rounded-2xl">
            <CardContent className="p-4 md:p-6">
              <h3 className="font-semibold mb-3">Developer Tools</h3>
              <div className="grid md:grid-cols-3 gap-3 items-end">
                <div className="grid gap-2">
                  <label className="text-sm">API Base URL</label>
                  <Input
                    value={apiBase}
                    onChange={(e) => setApiBase(e.target.value)}
                    placeholder="http://localhost:8000"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        try {
                          localStorage.setItem("API_BASE", apiBase);
                        } catch {}
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        try {
                          const fromMeta = document
                            .querySelector('meta[name="api-base"]')
                            ?.getAttribute("content");
                          setApiBase(fromMeta || DEFAULT_API_BASE);
                        } catch {}
                      }}
                    >
                      Use meta
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        const r = await fetch(`${API_BASE}/health`);
                        alert(`Health: ${r.status}`);
                      } catch (e: any) {
                        alert(`Health check failed: ${e?.message}`);
                      }
                    }}
                  >
                    Ping /health
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        const r = await fetch(`${API_BASE}/ask`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            query: "Test: best time to visit Scotland",
                            freshOnly: true,
                            officialOnly: true
                          })
                        });
                        const d = await r.json();
                        alert(d.answer ? "ASK ok" : "ASK no answer");
                      } catch (e: any) {
                        alert(`ASK failed: ${e?.message}`);
                      }
                    }}
                  >
                    Test /ask
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const r = await fetch(`${API_BASE}/plan`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            days: 5,
                            month: "August",
                            party: "2 adults",
                            maxDrive: 2,
                            interests: "scenery, castles",
                            budget: "$$"
                          })
                        });
                        const d = await r.json();
                        alert(d.answer ? "PLAN ok" : "PLAN no answer");
                      } catch (e: any) {
                        alert(`PLAN failed: ${e?.message}`);
                      }
                    }}
                  >
                    Test /plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-10 text-xs text-slate-500">
        Built for preview • Hook this UI to your Python backend (FastAPI) when ready.
      </footer>
    </div>
  );
}
