export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-travel-blue-500 via-travel-blue-600 to-travel-blue-700 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <i className="fas fa-route text-white text-lg"></i>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                <i className="fas fa-sparkles text-white text-xs"></i>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">TripSmith</h1>
              <p className="text-xs text-slate-500 -mt-1 font-medium">AI Travel Planner</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-6">
            <div className="text-sm text-slate-600">
              <span className="inline-flex items-center space-x-1">
                <i className="fas fa-shield-alt text-emerald-500"></i>
                <span>AI-Powered</span>
              </span>
            </div>
            <div className="text-sm text-slate-600">
              <span className="inline-flex items-center space-x-1">
                <i className="fas fa-check-circle text-emerald-500"></i>
                <span>Verified Sources</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
