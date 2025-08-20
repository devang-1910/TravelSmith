export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-travel-blue-500 via-travel-blue-600 to-travel-blue-700 rounded-xl flex items-center justify-center shadow-md">
                  <i className="fas fa-route text-white text-sm"></i>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-sparkles text-white text-xs"></i>
                </div>
              </div>
              <h4 className="text-lg font-bold">TripSmith</h4>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              AI-powered travel planning with verified sources and expert insights. 
              Plan smarter, travel better.
            </p>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Features</h5>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Travel Question Explorer</li>
              <li>• Custom Itinerary Generator</li>
              <li>• Verified Source Citations</li>
              <li>• Real-time Travel Data</li>
              <li>• Responsive Design</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Technology</h5>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• FastAPI Backend</li>
              <li>• OpenAI Integration</li>
              <li>• Next.js Frontend</li>
              <li>• Tailwind CSS</li>
              <li>• Framer Motion</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            © 2024 TripSmith. Built with modern web technologies.
          </p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span className="text-xs">Powered by AI</span>
            <i className="fas fa-robot text-travel-blue-500"></i>
          </div>
        </div>
      </div>
    </footer>
  );
}
