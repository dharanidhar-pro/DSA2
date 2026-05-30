import { useState } from 'react';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Activity, Users, ShieldAlert, HeartPulse, Clock, Database, Play, AlertTriangle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function LandingPage() {
  const [selectedMetric, setSelectedMetric] = useState<'queue' | 'success' | 'patients' | 'response'>('queue');
  const [sosCount, setSosCount] = useState(24);
  const [sosList, setSosList] = useState([
    { label: 'SOS #4802 - Arrhythmia', status: 'En Route', time: '1.2m ago', color: 'text-amber-400' },
    { label: 'SOS #4804 - Dyspnea', status: 'Dispatched', time: '2m ago', color: 'text-blue-400' },
    { label: 'SOS #4805 - Trauma', status: 'Triaging', time: '30s ago', color: 'text-red-400' },
  ]);
  const [patientsCount, setPatientsCount] = useState(10482);

  const handleSimulateIncident = () => {
    const incidents = [
      { label: 'SOS #4810 - Hypotension', status: 'Dispatched', time: 'Just now', color: 'text-blue-400' },
      { label: 'SOS #4811 - Cardiac Arrest', status: 'En Route', time: 'Just now', color: 'text-amber-400' },
      { label: 'SOS #4812 - Trauma Injury', status: 'Triaging', time: 'Just now', color: 'text-red-400' },
      { label: 'SOS #4813 - Anaphylaxis', status: 'Dispatched', time: 'Just now', color: 'text-blue-400' },
    ];
    const randomLoc = incidents[Math.floor(Math.random() * incidents.length)];
    const matchedInc = { 
      ...randomLoc, 
      label: randomLoc.label.replace(/\d+/, Math.floor(1000 + Math.random() * 9000).toString()) 
    };
    setSosList(prev => [matchedInc, ...prev.slice(0, 2)]);
    setSosCount(prev => prev + 1);
    setPatientsCount(prev => prev + 1);
    setSelectedMetric('queue');
    toast.success('Simulation Incident Activated!', {
      description: `Initiated emergency shortest-path ambulance routing for ${matchedInc.label.split(' - ')[1]}.`
    });
  };

  const metricsData = {
    queue: {
      title: 'Emergency Queue Pressure',
      subtitle: 'Active tactical dispatches',
      value: `${sosCount} Custom Cases`,
      chart: [45, 75, 50, 95, 70, 85, 55],
      results: sosList
    },
    success: {
      title: 'Dispatches Matching Rate',
      subtitle: 'Optimal resource pairing',
      value: '98.9% Success',
      chart: [92, 98, 96, 99, 95, 98, 99],
      results: [
        { label: 'Ambulance #9 ↔ St. Jude Hospital', status: 'Optimal', time: 'Match Score 99%', color: 'text-emerald-400' },
        { label: 'Ambulance #14 ↔ General Medical', status: 'Optimal', time: 'Match Score 98%', color: 'text-emerald-400' },
        { label: 'Specialist Dr. Vance ↔ Case #1105', status: 'Optimal', time: 'Match Score 100%', color: 'text-emerald-400' },
      ]
    },
    patients: {
      title: 'System Enrollment History',
      subtitle: 'Clinical database footprint',
      value: `${patientsCount.toLocaleString()} Enrolled`,
      chart: [60, 70, 75, 80, 85, 98, 110],
      results: [
        { label: 'Database Sync Completed', status: 'O(log n)', time: '1.2ms latency', color: 'text-indigo-400' },
        { label: 'Index BST Rebalanced', status: 'Optimal', time: 'Height-balanced', color: 'text-indigo-400' },
        { label: 'Biometrics Feed Stream', status: 'Active', time: 'Ready', color: 'text-indigo-400' },
      ]
    },
    response: {
      title: 'Average Response Delay',
      subtitle: 'Dynamic routing latency',
      value: '2.5 min Average',
      chart: [120, 90, 60, 45, 30, 25, 20],
      results: [
        { label: 'Route Math Optimization', status: 'Dijkstra', time: 'Cached', color: 'text-amber-400' },
        { label: 'Traffic Density Bypass', status: 'Active', time: 'Avoided delay', color: 'text-emerald-400' },
        { label: 'Dispatch Handshake', status: 'Synced', time: '0.4s payload', color: 'text-blue-400' },
      ]
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Immersive background glow decorations */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-600/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-emerald-600/25 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <Navbar />
      
      <main className="flex-1 relative z-10">
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-32 px-4 md:px-8">
          <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              className="flex-1 space-y-8"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 text-sm text-blue-300">
                <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 mr-2.5 animate-pulse"></span>
                Next-Gen Healthcare Management
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
                Intelligent care <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
                  when it matters most.
                </span>
              </h1>
              <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
                MedFlow+ connects patients, doctors, and hospitals using state-of-the-art dispatch path optimization algorithms and elegant analytics workflows.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/login">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base h-13 px-8 rounded-xl shadow-lg shadow-blue-500/20 border-none">
                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/emergency">
                  <Button size="lg" variant="outline" className="text-base h-13 px-8 rounded-xl border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-white transition-all">
                    Emergency SOS
                  </Button>
                </Link>
              </div>
            </motion.div>
            
             <motion.div 
              className="flex-1 w-full relative"
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15 }}
            >
               {/* Decorative Dashboard element */}
               <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 md:p-8 relative z-10 flex flex-col overflow-hidden transition-all duration-300">
                  <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#a8b2d1]">System Telemetry Demo</span>
                      <h4 className="text-sm font-black text-white mt-1 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} /> {metricsData[selectedMetric].title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{metricsData[selectedMetric].subtitle}</p>
                    </div>
                    
                    <button 
                      onClick={handleSimulateIncident}
                      className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer duration-150 active:scale-95"
                      title="Simulate dispatch incident live in front-end preview"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Dispatch SOS
                    </button>
                  </div>

                  {/* Dynamic interactive tabs grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                      onClick={() => {
                        setSelectedMetric('queue');
                        toast.success('Analyzing emergency dispatch pressure...');
                      }}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        selectedMetric === 'queue' 
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/5 scale-[1.01]' 
                          : 'border-white/5 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Active Queue</span>
                      <span className="text-base font-black text-blue-300 block mt-1">{sosCount} SOS Cases</span>
                    </button>

                    <button 
                      onClick={() => {
                        setSelectedMetric('success');
                        toast.success('Analyzing dispatch matching efficiency...');
                      }}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        selectedMetric === 'success' 
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/5 scale-[1.01]' 
                          : 'border-white/5 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Heuristic Success</span>
                      <span className="text-base font-black text-emerald-300 block mt-1">98.9% Rate</span>
                    </button>
                  </div>

                  {/* Simulated dynamic charts panel */}
                  <div className="h-28 bg-white/5 rounded-2xl border border-white/5 p-4 flex items-end justify-between space-x-2 relative group mb-6">
                    <span className="absolute top-2.5 left-3 text-[10px] font-mono font-semibold text-slate-500 tracking-wider">INDEX LOAD MAGNITUDE</span>
                    {metricsData[selectedMetric].chart.map((h, i) => (
                      <motion.div 
                        key={`${selectedMetric}-${i}`} 
                        className="w-full bg-gradient-to-t from-blue-600/70 via-indigo-500/70 to-emerald-400/80 rounded-t-lg" 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.04 }}
                      />
                    ))}
                  </div>

                  {/* Telemetry live results feed */}
                  <div className="border-t border-white/5 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest text-slate-450">Telemetry Logs ({metricsData[selectedMetric].value})</span>
                      <span className="text-[9px] text-emerald-400 animate-pulse font-mono flex items-center gap-1">
                        ● Live Loop
                      </span>
                    </div>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {metricsData[selectedMetric].results.map((res, index) => (
                        <div key={index} className="flex justify-between items-center text-xs bg-white/5 hover:bg-white/10 transition-all p-2.5 rounded-xl border border-white/5">
                          <span className="text-white font-semibold truncate max-w-[180px]">{res.label}</span>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/5 ${res.color}`}>{res.status}</span>
                            <span className="text-slate-450 font-mono text-[9px] text-slate-400">{res.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
               
               {/* Floating Badges */}
               <motion.div 
                  onClick={() => {
                    setSelectedMetric('patients');
                    toast.success('Analyzing live database footprint...');
                  }}
                  className={`absolute -top-6 -right-4 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border flex items-center gap-3.5 z-20 transition-all hover:scale-[1.05] cursor-pointer ${
                    selectedMetric === 'patients' ? 'border-indigo-400 bg-indigo-500/20' : 'bg-[#0f172a]/90 hover:bg-[#0f172a] border-white/10'
                  }`}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                >
                 <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                   <Users className="w-6 h-6 text-emerald-400" />
                 </div>
                 <div>
                   <div className="font-extrabold text-white text-base">{patientsCount.toLocaleString()}+</div>
                   <div className="text-[10px] uppercase font-bold tracking-widest text-[#a8b2d1]">Active Patients</div>
                 </div>
               </motion.div>
               
               <motion.div 
                  onClick={() => {
                    setSelectedMetric('response');
                    toast.success('Analyzing travel density overheads...');
                  }}
                  className={`absolute -bottom-6 -left-4 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border flex items-center gap-3.5 z-20 transition-all hover:scale-[1.05] cursor-pointer ${
                    selectedMetric === 'response' ? 'border-amber-400 bg-amber-500/20' : 'bg-[#0f172a]/90 hover:bg-[#0f172a] border-white/10'
                  }`}
                  animate={{ y: [0, 12, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                >
                 <div className="bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                   <Clock className="w-6 h-6 text-red-400 animate-pulse" />
                 </div>
                 <div>
                   <div className="font-extrabold text-white text-base">2.5 min</div>
                   <div className="text-[10px] uppercase font-bold tracking-widest text-[#a8b2d1]">Avg Response</div>
                 </div>
               </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-28 relative">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">Core Capabilities</h2>
              <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">Algorithmically optimized healthcare delivery ensuring the right resources reach the right patients instantly.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 px-4 md:px-0">
              {[
                { icon: ShieldAlert, title: "Emergency Dispatch", desc: "Shortest-path calculations for instant tactical ambulance allocation.", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                { icon: HeartPulse, title: "Smart Matching", desc: "Greedy heuristics pairing critical patients with available subject specialists.", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                { icon: Database, title: "O(log n) Lookups", desc: "BST structured patient database architecture for robust lookups.", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
              ].map((feature, i) => (
                <Card key={i} className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 text-white">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 ${feature.bg} rounded-2xl border flex items-center justify-center mb-6`}>
                      <feature.icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-slate-300 leading-relaxed text-sm">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* EMERGENCY BANNER */}
        <section className="py-24 px-4 md:px-8">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-3xl p-8 md:p-14 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden backdrop-blur-xl">
               <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10">
                 <ShieldAlert className="w-64 h-64 text-red-500" />
               </div>
               <div className="relative z-10 mb-8 md:mb-0 space-y-2">
                 <h3 className="text-3xl font-extrabold tracking-tight">Need Immediate Assistance?</h3>
                 <p className="text-red-200/80 text-base max-w-md leading-relaxed">
                   Initiate high-priority rescue routing algorithms instantly matching the closest response vehicle.
                 </p>
               </div>
               <Link to="/emergency" className="relative z-10 flex-shrink-0">
                 <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white text-lg font-bold h-15 px-10 rounded-2xl shadow-lg shadow-red-500/40 border-none">
                   Trigger SOS
                 </Button>
               </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
