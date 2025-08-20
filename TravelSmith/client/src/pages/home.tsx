import { useState } from "react";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import ExplorerPanel from "@/components/explorer-panel";
import PlannerPanel from "@/components/planner-panel";
import Footer from "@/components/footer";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"explorer" | "planner">("explorer");

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-lg border border-slate-200">
            <button
              data-testid="tab-explorer"
              onClick={() => setActiveTab("explorer")}
              className={`tab-button px-6 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === "explorer" ? "active" : ""
              }`}
            >
              <i className="fas fa-search mr-2"></i>Explorer
            </button>
            <button
              data-testid="tab-planner"
              onClick={() => setActiveTab("planner")}
              className={`tab-button px-6 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === "planner" ? "active" : ""
              }`}
            >
              <i className="fas fa-calendar-alt mr-2"></i>Planner
            </button>
          </div>
        </div>

        {/* Tab Panels */}
        {activeTab === "explorer" && (
          <div className="tab-panel">
            <ExplorerPanel />
          </div>
        )}
        
        {activeTab === "planner" && (
          <div className="tab-panel">
            <PlannerPanel />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
