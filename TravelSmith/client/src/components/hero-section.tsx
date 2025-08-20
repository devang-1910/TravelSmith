export default function HeroSection() {
  return (
    <section className="py-12 bg-gradient-to-r from-travel-blue-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">Plan Your Perfect Journey</h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
          Get expert travel advice and create detailed itineraries with AI-powered insights from trusted sources.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow-sm border border-white/50">
            <i className="fas fa-search text-3xl text-travel-blue-600 mb-4"></i>
            <h3 className="font-semibold text-slate-900 mb-2">Smart Explorer</h3>
            <p className="text-sm text-slate-600">Ask any travel question and get comprehensive, cited answers</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow-sm border border-white/50">
            <i className="fas fa-route text-3xl text-travel-blue-600 mb-4"></i>
            <h3 className="font-semibold text-slate-900 mb-2">Trip Planner</h3>
            <p className="text-sm text-slate-600">Generate detailed day-by-day itineraries tailored to your preferences</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow-sm border border-white/50">
            <i className="fas fa-link text-3xl text-travel-blue-600 mb-4"></i>
            <h3 className="font-semibold text-slate-900 mb-2">Verified Sources</h3>
            <p className="text-sm text-slate-600">All recommendations backed by official and trusted travel sources</p>
          </div>
        </div>
      </div>
    </section>
  );
}
