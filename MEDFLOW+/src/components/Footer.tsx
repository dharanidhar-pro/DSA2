export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070a13] py-16 px-4 md:px-8 relative z-10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <h3 className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">MedFlow+</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Smart healthcare management, Dijkstra ambulance routing and emergency response operations.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-slate-200 mb-4 tracking-wider uppercase text-xs">Platform</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li className="hover:text-white transition-colors cursor-pointer">Patient Portal</li>
            <li className="hover:text-white transition-colors cursor-pointer">Doctor Dashboard</li>
            <li className="hover:text-white transition-colors cursor-pointer">Hospital Admin</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-200 mb-4 tracking-wider uppercase text-xs">Resources</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li className="hover:text-white transition-colors cursor-pointer">DSA Visualizations</li>
            <li className="hover:text-white transition-colors cursor-pointer">API Documentation</li>
            <li className="hover:text-white transition-colors cursor-pointer">Emergency Guides</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-200 mb-4 tracking-wider uppercase text-xs">Legal</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
            <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-12 pt-8 border-t border-white/5 text-center text-xs text-slate-500 tracking-wider">
        © 2026 MedFlow+. Powered by advanced algorithmic dispatch routing. All rights reserved.
      </div>
    </footer>
  );
}
