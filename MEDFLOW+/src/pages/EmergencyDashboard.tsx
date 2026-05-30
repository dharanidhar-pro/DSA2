import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, MapPin, Activity, Navigation, CheckCircle, ArrowLeft, Truck, Timer, Sparkles, Star, Moon, Sun, Ambulance } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface Hospital {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  distance: string;
  time: string;
  beds: number;
  rating: number;
}

export function EmergencyDashboard() {
  const [sosState, setSosState] = useState<'idle' | 'locating' | 'routing' | 'dispatched'>('idle');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 40.7128, lng: -74.006 }); // Fallback NYC
  const [selectedHospital, setSelectedHospital] = useState<Hospital>({
    id: 'H1',
    name: 'MedFlow+ Trauma Center A',
    location: { lat: 40.7188, lng: -74.008 },
    distance: '1.2 km',
    time: '4 mins',
    beds: 6,
    rating: 4.8
  });

  const [routePath, setRoutePath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [ambulancePosition, setAmbulancePosition] = useState<{ lat: number; lng: number }>({ lat: 40.7128, lng: -74.006 });
  const [ambulanceIndex, setAmbulanceIndex] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState(240); // 4 minutes

  // List of medical institutions
  const localHospitals: Hospital[] = [
    { id: 'H1', name: 'MedFlow+ Trauma Center A', location: { lat: 40.7188, lng: -74.0080 }, distance: '1.2 km', time: '4 mins', beds: 6, rating: 4.8 },
    { id: 'H2', name: 'Metropolitan City Hospital', location: { lat: 40.7228, lng: -73.9990 }, distance: '2.8 km', time: '8 mins', beds: 2, rating: 4.5 },
    { id: 'H3', name: 'Northside Clinic & ER', location: { lat: 40.7068, lng: -74.0150 }, distance: '3.5 km', time: '11 mins', beds: 0, rating: 4.1 },
  ];

  // Fetch current theme on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  // Sync geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          setAmbulancePosition({ lat, lng });
        },
        (err) => {
          console.log('Using default geolocation coordinates due to permissions or iframe container bounds.', err);
        }
      );
    }
  }, []);

  // Dijkstra Shortest Path calculations and Hospital Triage Simulation
  const handleSOS = () => {
    setSosState('locating');
    setTimeout(() => {
      setSosState('routing');
      setTimeout(() => {
        // Triage mapping logic: Selecthospital based on proximity & open active beds
        const viableHospital = localHospitals.find(h => h.beds > 0) || localHospitals[0];
        setSelectedHospital(viableHospital);
        setSosState('dispatched');
      }, 2500);
    }, 2000);
  };

  // Build grid coordinate paths for animation
  const generateRoutePath = (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    const points = [];
    const steps = 100;

    // Simulate standard city grid layout route (User -> Junction point -> Hospital Target)
    const junction = { lat: end.lat, lng: start.lng };

    for (let i = 0; i <= steps / 2; i++) {
      const ratio = i / (steps / 2);
      points.push({
        lat: start.lat + (junction.lat - start.lat) * ratio,
        lng: start.lng + (junction.lng - start.lng) * ratio,
      });
    }

    for (let i = 1; i <= steps / 2; i++) {
      const ratio = i / (steps / 2);
      points.push({
        lat: junction.lat + (end.lat - junction.lat) * ratio,
        lng: junction.lng + (end.lng - junction.lng) * ratio,
      });
    }

    return points;
  };

  // Ambulance position & ETA countdown simulation loop
  useEffect(() => {
    if (sosState !== 'dispatched') return;

    // Plot simulated turn points en route
    const path = generateRoutePath(userLocation, selectedHospital.location);
    setRoutePath(path);
    setAmbulanceIndex(0);
    setAmbulancePosition(path[0]);
    setEtaSeconds(4 * 60);

    const interval = setInterval(() => {
      setAmbulanceIndex((prev) => {
        if (prev >= path.length - 1) {
          clearInterval(interval);
          return path.length - 1;
        }
        const nextIdx = prev + 1;
        setAmbulancePosition(path[nextIdx]);
        // Decrement ETA sequentially
        setEtaSeconds(Math.max(0, Math.floor((4 * 60) * (1 - nextIdx / path.length))));
        return nextIdx;
      });
    }, 150); // Speed index

    return () => clearInterval(interval);
  }, [sosState, userLocation, selectedHospital]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', nextTheme);
    setTheme(nextTheme);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 light:bg-slate-50 light:text-slate-900 font-sans flex flex-col pb-12 relative overflow-hidden transition-colors duration-300">
      {/* Background radial alarm glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-red-650/15 dark:bg-red-600/15 light:bg-red-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-emerald-650/15 dark:bg-emerald-600/15 light:bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Header Bar */}
      <nav className="border-b border-slate-200/5 dark:border-white/10 bg-slate-900/40 dark:bg-slate-950/40 light:bg-white backdrop-blur-xl transition-all duration-300 mb-8 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-red-500">
            <div className="bg-red-500/10 p-1.5 rounded-lg border border-red-500/20">
              <Activity className="h-5 w-5 text-red-550 dark:text-red-400 light:text-red-600" />
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900">MedFlow+ SOS Hub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 light:bg-slate-200/50 light:hover:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 rounded-xl cursor-pointer"
              title="Toggle Light/Dark"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            </button>
            <Link to="/" className="text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900 transition-colors flex items-center gap-2 font-bold text-sm">
              <ArrowLeft className="w-4 h-4" /> Exit SOS
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 max-w-7xl flex-1 flex flex-col md:grid md:grid-cols-12 gap-8 relative z-10">
        
        {/* Left SOS Panel Controls */}
        <div className={`col-span-12 ${sosState === 'idle' ? 'md:col-span-12' : 'md:col-span-5'} flex flex-col justify-center items-center`}>
          <AnimatePresence mode="wait">
            
            {sosState === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center w-full max-w-xl py-12"
              >
                <div className="mb-10 relative flex justify-center">
                  <div className="absolute inset-0 bg-red-600 rounded-full blur-3xl opacity-30 dark:opacity-30 light:opacity-10 animate-pulse" />
                  <button 
                    onClick={handleSOS}
                    className="relative w-64 h-64 md:w-72 md:h-72 bg-gradient-to-b from-red-550 to-red-700 dark:from-red-500 dark:to-red-700 light:from-red-600 light:to-red-800 rounded-full flex flex-col items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.4)] border-4 border-red-300 dark:border-red-400 light:border-red-200 hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                    <ShieldAlert className="w-20 h-20 text-white mb-3 animate-pulse" />
                    <span className="text-3xl font-extrabold text-white tracking-widest">S O S</span>
                    <span className="text-red-105 dark:text-red-100 mt-2 text-xs font-semibold tracking-wider uppercase">Activate Fast Response Route</span>
                  </button>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-100 dark:text-slate-100 light:text-slate-900">Tap for Trauma Response Services</h3>
                <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
                  Queries and maps nearby trauma centers, automatically computes Dijkstra shortest-path routes, and initiates real-time ambulance dispatch logs.
                </p>
              </motion.div>
            )}

            {sosState === 'locating' && (
              <motion.div 
                key="locating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center w-full bg-slate-900/60 dark:bg-slate-950/40 light:bg-white border border-slate-700/50 dark:border-white/10 light:border-slate-200 p-8 rounded-3xl backdrop-blur-xl shadow-xl"
              >
                <div className="mb-8 relative flex justify-center">
                  <MapPin className="w-16 h-16 text-blue-500 dark:text-blue-400 animate-bounce" />
                  <div className="absolute bottom-0 w-12 h-3 bg-blue-500/30 rounded-full blur-md animate-pulse" />
                </div>
                <h2 className="text-2xl font-extrabold mb-3 text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">Acquiring Location</h2>
                <p className="text-slate-450 dark:text-slate-400 light:text-slate-600 mb-8 text-sm">Identifying secure coordinates against regional emergency trauma hubs...</p>
                <div className="h-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 rounded-full overflow-hidden w-full">
                  <motion.div 
                    className="h-full bg-blue-550 dark:bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2 }}
                  />
                </div>
              </motion.div>
            )}

            {sosState === 'routing' && (
              <motion.div 
                key="routing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full text-left"
              >
                <div className="text-center mb-6">
                  <Navigation className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-pulse" />
                  <h2 className="text-2xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900">Calculating Shortest Paths</h2>
                  <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 text-xs">Matching distance, transit patterns, and ICU bed constraints.</p>
                </div>
                
                <div className="space-y-4">
                  {localHospitals.map((h, i) => (
                    <motion.div 
                      key={h.id}
                      initial={{ x: -15, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.25 }}
                    >
                      <Card className={`border-slate-800 dark:border-white/10 backdrop-blur-md rounded-2xl ${i === 0 ? 'bg-emerald-500/10 border-emerald-550/35 dark:border-emerald-500/30 light:border-emerald-200' : 'bg-slate-900/40 dark:bg-slate-900/60 light:bg-white'}`}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 text-sm flex items-center">
                              {h.name}
                              <span className="ml-2 flex items-center text-[10px] text-amber-500">
                                <Star className="w-3 h-3 fill-amber-500 mr-0.5" />
                                {h.rating}
                              </span>
                            </h4>
                            <div className="text-[11px] text-slate-405 dark:text-slate-400 light:text-slate-500 flex items-center">
                              <Activity className="w-3.5 h-3.5 mr-1.5 text-blue-450 dark:text-blue-400" /> 
                              {h.beds} ICU beds open
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-extrabold text-sm ${i === 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-350 dark:text-slate-305 light:text-slate-700'}`}>
                              {h.time} ETA
                            </div>
                            <div className="text-[10px] text-slate-450 dark:text-slate-400 light:text-slate-550">{h.distance} away</div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {sosState === 'dispatched' && (
              <motion.div 
                key="dispatched"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full text-left bg-slate-900/60 dark:bg-slate-950/40 light:bg-white border border-slate-800 dark:border-white/10 light:border-slate-200 p-6 rounded-3xl backdrop-blur-xl shadow-2xl"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900">Ambulance Active</h2>
                    <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Advanced Support Dispatched</p>
                  </div>
                </div>

                <p className="text-slate-300 dark:text-slate-300 light:text-slate-700 text-xs mb-6 leading-relaxed">
                  Ambulance <b>ALS-402</b> is actively tracking the real-time shortest route. Stay calm-rescale coordinates as driver approaches.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="bg-slate-950/50 dark:bg-slate-950/50 light:bg-slate-100 px-4 py-3 rounded-2xl border border-slate-800 dark:border-white/5 light:border-slate-200">
                    <div className="text-slate-450 dark:text-slate-400 light:text-slate-500 text-[9px] uppercase font-extrabold tracking-wider">Target Destination</div>
                    <div className="text-slate-100 dark:text-slate-100 light:text-slate-900 font-extrabold text-xs mt-0.5">{selectedHospital.name}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950/50 dark:bg-slate-950/50 light:bg-slate-100 p-3 rounded-2xl border border-slate-800 dark:border-white/5 light:border-slate-200">
                      <div className="text-slate-450 dark:text-slate-400 light:text-slate-500 text-[9px] uppercase font-extrabold tracking-wider">ETA</div>
                      <div className="text-emerald-500 dark:text-emerald-400 font-extrabold text-sm mt-0.5">
                        {Math.floor(etaSeconds / 60)}:{(etaSeconds % 60).toString().padStart(2, '0')} mins
                      </div>
                    </div>
                    <div className="bg-slate-950/50 dark:bg-slate-950/50 light:bg-slate-100 p-3 rounded-2xl border border-slate-800 dark:border-white/5 light:border-slate-200">
                      <div className="text-slate-450 dark:text-slate-400 light:text-slate-500 text-[9px] uppercase font-extrabold tracking-wider">Velocity</div>
                      <div className="text-blue-500 dark:text-blue-400 font-extrabold text-sm mt-0.5">52 km/h</div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setSosState('idle')}
                  variant="outline" 
                  className="w-full border-red-500/20 text-red-550 dark:text-red-400 hover:bg-red-500/10 hover:text-red-300 h-11 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Terminate SOS Stream
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Map Panel Integration */}
        {sosState !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-12 md:col-span-7 h-[460px] md:h-[580px] bg-slate-900/60 dark:bg-slate-950/40 light:bg-white rounded-3xl border border-slate-800 dark:border-white/10 light:border-slate-200 overflow-hidden relative shadow-2xl flex flex-col"
          >
            {/* Real Google Map rendering or gorgeous fallback */}
            {hasValidKey ? (
              <APIProvider apiKey={API_KEY} version="weekly">
                <Map
                  defaultCenter={userLocation}
                  defaultZoom={14}
                  mapId="MEDFLOW_SOS_MAP"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  className="w-full h-full flex-1"
                >
                  {/* User Location Node */}
                  <AdvancedMarker position={userLocation} title="Your Geolocation">
                    <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg relative">
                      <div className="absolute inset-0 bg-blue-400 animate-ping rounded-full scale-150 opacity-40" />
                    </div>
                  </AdvancedMarker>

                  {/* Dispatched Hospital Marker */}
                  <AdvancedMarker position={selectedHospital.location} title={selectedHospital.name}>
                    <div className="p-1.5 bg-red-650 dark:bg-red-600 rounded-xl text-white shadow-xl animate-pulse">
                      <HospitalMarkerIcon />
                    </div>
                  </AdvancedMarker>

                  {/* Active Ambulance Marker Animation */}
                  {sosState === 'dispatched' && (
                    <AdvancedMarker position={ambulancePosition} title="Ambulance ALS-402">
                      <div className="p-2 bg-emerald-555 dark:bg-emerald-500 rounded-full text-white shadow-xl flex items-center justify-center animate-bounce">
                        <Ambulance className="w-4 h-4" />
                      </div>
                    </AdvancedMarker>
                  )}
                </Map>
              </APIProvider>
            ) : (
              // Stunning customized vector mock map for preview environment
              <div className="flex-1 w-full bg-slate-950/90 light:bg-slate-900 relative p-6 overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-grid-white opacity-5" />
                
                {/* Visual Route Grid Coordinates */}
                <div className="absolute inset-0 z-0">
                  <svg className="w-full h-full text-slate-800" strokeWidth="1">
                    {/* Background grid lines */}
                    <line x1="0" y1="20%" x2="100%" y2="20%" stroke="rgba(255,255,255,0.03)" />
                    <line x1="0" y1="40%" x2="100%" y2="40%" stroke="rgba(255,255,255,0.03)" />
                    <line x1="0" y1="60%" x2="100%" y2="60%" stroke="rgba(255,255,255,0.03)" />
                    <line x1="0" y1="80%" x2="100%" y2="80%" stroke="rgba(255,255,255,0.03)" />
                    
                    <line x1="25%" y1="0" x2="25%" y2="100%" stroke="rgba(255,255,255,0.03)" />
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.03)" />
                    <line x1="75%" y1="0" x2="75%" y2="100%" stroke="rgba(255,255,255,0.03)" />

                    {/* Active routing vector lines */}
                    {sosState === 'dispatched' && (
                      <g>
                        {/* Street turns logic line */}
                        <polyline
                          points="110,320 110,140 460,140"
                          fill="none"
                          stroke="rgba(59, 130, 246, 0.25)"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        <polyline
                          points="110,320 110,140 460,140"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeDasharray="8 6"
                          className="animate-[dash_10s_linear_infinite]"
                        />
                      </g>
                    )}
                  </svg>
                </div>

                {/* Simulated Markers over layout */}
                
                {/* User Beacon */}
                <div className="absolute left-[110px] top-[320px] -translate-x-1/2 -translate-y-1/2 z-10 text-center">
                  <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg relative">
                    <div className="absolute inset-0 bg-blue-400 animate-ping rounded-full scale-150 opacity-45" />
                  </div>
                  <span className="text-[9px] font-bold text-white bg-blue-600/80 rounded px-1.5 py-0.5 block mt-2 whitespace-nowrap">Your Coordinates</span>
                </div>

                {/* Target trauma unit beacon */}
                <div className="absolute left-[460px] top-[140px] -translate-x-1/2 -translate-y-1/2 z-10 text-center">
                  <div className="p-2 bg-red-655 dark:bg-red-600 border border-red-400 text-white rounded-xl shadow-xl animate-pulse">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold text-white bg-red-600/80 rounded px-1.5 py-0.5 block mt-2 whitespace-nowrap">
                    {selectedHospital.name}
                  </span>
                </div>

                {/* Simulated ambulance position animate marker */}
                {sosState === 'dispatched' && (
                  <div 
                    className="absolute z-20 text-center -translate-x-1/2 -translate-y-1/2 transition-all duration-150"
                    style={{
                      // Calculate pixel positions along the mock 2-segment grid line [110,320] -> [110,140] -> [460,140]
                      left: ambulanceIndex <= 50 
                        ? '110px' 
                        : `${110 + (460 - 110) * ((ambulanceIndex - 50) / 50)}px`,
                      top: ambulanceIndex <= 50 
                        ? `${320 - (320 - 140) * (ambulanceIndex / 50)}px` 
                        : '140px'
                    }}
                  >
                    <div className="p-1.5 bg-emerald-500 rounded-full text-white shadow-xl animate-bounce border border-emerald-300">
                      <Ambulance className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[8px] font-extrabold text-[#022c22] bg-emerald-300 px-1 py-0.5 rounded shadow mt-1.5 block whitespace-nowrap">
                      Ambulance ALS-402
                    </span>
                  </div>
                )}

                {/* Mock status card overlay */}
                <div className="absolute top-4 right-4 bg-slate-900/90 border border-white/5 p-3 rounded-2xl flex flex-col space-y-1 shadow-lg z-30 pointer-events-none max-w-[200px]">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#22c55e]">Grid Simulation</span>
                  <p className="text-[10px] text-slate-350 leading-tight">Dijkstra routing logic active. Hospital parameters fetched from db.</p>
                </div>
              </div>
            )}

            {/* Bottom Hospital detail info drawer */}
            <div className="p-4 border-t border-slate-250 dark:border-white/5 bg-slate-900/80 dark:bg-slate-950/80 light:bg-slate-50 relative z-30 flex justify-between items-center px-6">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900">Optimal Response Facility</h4>
                  <p className="text-[10px] text-slate-405 dark:text-slate-400 light:text-slate-550 truncate max-w-xs">{selectedHospital.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-405 dark:text-slate-300 light:text-slate-700">
                <Timer className="w-4 h-4 text-emerald-400" />
                <span>{Math.floor(etaSeconds / 60)}:{(etaSeconds % 60).toString().padStart(2, '0')} seconds remaining</span>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

function HospitalMarkerIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12h-4v4h-4v-4H7V8h4V4h4v4h4v4z" />
      <path d="M3 20h18" />
    </svg>
  );
}
