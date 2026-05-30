import React, { useState, useEffect, FormEvent } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building,
  Users,
  Activity,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Stethoscope,
  Send,
  RefreshCw,
  TrendingUp,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  UserPlus
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { toast, Toaster } from "sonner";

interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  beds: number;
  rating: number;
}

interface Doctor {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  profileImage: string;
  createdAt: string;
}

interface Emergency {
  id: string;
  patientName: string;
  condition: string;
  severity: "high" | "medium" | "low";
  location: string;
  lat: number;
  lng: number;
  status: "Routing" | "Dispatched" | "Arrived" | "Resolved";
  hospitalId?: string;
  createdAt: string;
}

export function AdminDashboard() {
  const savedUser = localStorage.getItem('currentUser');
  const user = savedUser ? JSON.parse(savedUser) : null;
  const userName = user && user.role === 'admin' ? user.name : 'System Admin';

  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "hospitals" | "doctors" | "emergencies">("overview");

  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith("/hospitals")) {
      setActiveTab("hospitals");
    } else if (path.endsWith("/doctors")) {
      setActiveTab("doctors");
    } else if (path.endsWith("/reports")) {
      setActiveTab("emergencies");
    } else {
      setActiveTab("overview");
    }
  }, [location.pathname]);

  // State
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Hospital Form State
  const [showHospForm, setShowHospForm] = useState(false);
  const [hospForm, setHospForm] = useState({ name: "", beds: "50", rating: "4.5", lat: "40.7128", lng: "-74.0060" });
  const [editingHospId, setEditingHospId] = useState<string | null>(null);

  // New Doctor Form State
  const [showDocForm, setShowDocForm] = useState(false);
  const [docForm, setDocForm] = useState({ name: "", email: "", password: "Password123!" });

  // New Simulated Emergency Form State
  const [showEmgForm, setShowEmgForm] = useState(false);
  const [emgForm, setEmgForm] = useState({
    patientName: "",
    condition: "",
    severity: "high" as "high" | "medium" | "low",
    location: "",
    hospitalId: ""
  });

  // Load Data
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [hRes, dRes, eRes] = await Promise.all([
        fetch("/api/hospitals"),
        fetch("/api/doctors"),
        fetch("/api/emergencies")
      ]);

      if (hRes.ok) setHospitals(await hRes.json());
      if (dRes.ok) setDoctors(await dRes.json());
      if (eRes.ok) setEmergencies(await eRes.json());
    } catch (err) {
      toast.error("Error communicating with servers. Falling back to buffered local UI states.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- Hospital Handlers ---
  const handleAddHospital = async (e: FormEvent) => {
    e.preventDefault();
    if (!hospForm.name) {
      toast.error("Please provide the medical facility name.");
      return;
    }
    try {
      if (editingHospId) {
        // Edit flow
        const res = await fetch(`/api/hospitals/${editingHospId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hospForm)
        });
        if (res.ok) {
          toast.success("Medical facility metrics updated securely.");
          setEditingHospId(null);
          setShowHospForm(false);
          setHospForm({ name: "", beds: "50", rating: "4.5", lat: "40.7128", lng: "-74.0060" });
          loadAllData();
        } else {
          const errData = await res.json();
          toast.error(errData.error || "Failed to update hospital.");
        }
      } else {
        // Add flow
        const res = await fetch("/api/hospitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hospForm)
        });
        if (res.ok) {
          toast.success("New hospital established inside clinical workspace!");
          setShowHospForm(false);
          setHospForm({ name: "", beds: "50", rating: "4.5", lat: "40.7128", lng: "-74.0060" });
          loadAllData();
        } else {
          toast.error("Error registering new clinical facility.");
        }
      }
    } catch (err) {
      toast.error("Connection failed.");
    }
  };

  const deleteHospital = async (id: string) => {
    if (!confirm("Are you certain you wish to remove this critical care facility?")) return;
    try {
      const res = await fetch(`/api/hospitals/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Facility deregistered successfully.");
        loadAllData();
      } else {
        toast.error("Could not complete deregistration profile.");
      }
    } catch (e) {
      toast.error("Deregister action error.");
    }
  };

  const startEditHospital = (h: Hospital) => {
    setEditingHospId(h.id);
    setHospForm({
      name: h.name,
      beds: String(h.beds),
      rating: String(h.rating),
      lat: String(h.lat),
      lng: String(h.lng)
    });
    setShowHospForm(true);
  };

  // --- Doctor Handlers ---
  const handleAddDoctor = async (e: FormEvent) => {
    e.preventDefault();
    if (!docForm.name || !docForm.email || !docForm.password) {
      toast.error("All credential attributes are required.");
      return;
    }
    // Verify Email
    if (!docForm.email.includes("@")) {
      toast.error("Please specify a valid SMTP email.");
      return;
    }
    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docForm)
      });
      const result = await res.json();

      if (res.ok) {
        toast.success(`Specialist credentials established for ${docForm.name}`);
        setDocForm({ name: "", email: "", password: "Password123!" });
        setShowDocForm(false);
        loadAllData();
      } else {
        toast.error(result.error || "Failed to establish doctor credentials.");
      }
    } catch (e) {
      toast.error("Could not establish server connection.");
    }
  };

  const deleteDoctor = async (id: string) => {
    if (!confirm("Confirm dismissal of this specialist from active staff?")) return;
    try {
      const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Specialist dismissed successfully.");
        loadAllData();
      } else {
        toast.error("Could not process dismissal.");
      }
    } catch (e) {
      toast.error("Error connecting with onboarding pipeline.");
    }
  };

  // --- Emergency Handlers ---
  const handleAddSimulatedEmergency = async (e: FormEvent) => {
    e.preventDefault();
    if (!emgForm.patientName || !emgForm.condition) {
      toast.error("Provide patient identifier name & triage condition.");
      return;
    }
    try {
      const res = await fetch("/api/emergencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emgForm,
          lat: 40.7100 + Math.random() * 0.03,
          lng: -74.0100 - Math.random() * 0.03
        })
      });

      if (res.ok) {
        toast.success("Emergency logged and transit routes configured!");
        setShowEmgForm(false);
        setEmgForm({ patientName: "", condition: "", severity: "high", location: "", hospitalId: "" });
        loadAllData();
      } else {
        toast.error("Fail safely to construct emergency transit logs.");
      }
    } catch (err) {
      toast.error("Connection failed.");
    }
  };

  const updateEmergencyStatus = async (id: string, newStatus: "Routing" | "Dispatched" | "Arrived" | "Resolved") => {
    try {
      const res = await fetch(`/api/emergencies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Emergency status advanced to [${newStatus}]`);
        loadAllData();
      } else {
        toast.error("Could not update triage progress status.");
      }
    } catch (e) {
      toast.error("Failed to sync dispatch status.");
    }
  };

  const deleteEmergency = async (id: string) => {
    try {
      const res = await fetch(`/api/emergencies/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Emergency log archived.");
        loadAllData();
      }
    } catch (e) {
      toast.error("Critical communications failure.");
    }
  };

  // --- Calculations for Analytics Charts ---
  const totalBeds = hospitals.reduce((sum, h) => sum + h.beds, 0);
  const activeEmergenciesCount = emergencies.filter(e => e.status !== "Resolved").length;

  const hospitalChartData = hospitals.map(h => ({
    name: h.name.split(" ")[0] || h.name,
    Beds: h.beds,
    Rating: h.rating * 20 // scale rating to viewable metrics
  }));

  const severityChartData = [
    { name: "Critical Severity", count: emergencies.filter(e => e.severity === "high").length, fill: "#ef4444" },
    { name: "Medium Severity", count: emergencies.filter(e => e.severity === "medium").length, fill: "#f59e0b" },
    { name: "Low Severity", count: emergencies.filter(e => e.severity === "low").length, fill: "#10b981" }
  ];

  const occupancyTimelineData = [
    { month: "Jan", "ICU Room Occupancy": 52, "Oxygen Beds Occupancy": 64, "Ventilator Load": 45 },
    { month: "Feb", "ICU Room Occupancy": 68, "Oxygen Beds Occupancy": 70, "Ventilator Load": 52 },
    { month: "Mar", "ICU Room Occupancy": 84, "Oxygen Beds Occupancy": 75, "Ventilator Load": 65 },
    { month: "Apr", "ICU Room Occupancy": 80, "Oxygen Beds Occupancy": 72, "Ventilator Load": 55 },
    { month: "May", "ICU Room Occupancy": 74, "Oxygen Beds Occupancy": 68, "Ventilator Load": 48 },
    { month: "Jun", "ICU Room Occupancy": 62, "Oxygen Beds Occupancy": 59, "Ventilator Load": 40 },
  ];

  const operationsRevenueData = [
    { month: "Jan", "Cardiology Clinic": 45000, "Emergency ALS Operations": 24000, "Virtual AI Consults": 5000 },
    { month: "Feb", "Cardiology Clinic": 52000, "Emergency ALS Operations": 28000, "Virtual AI Consults": 7500 },
    { month: "Mar", "Cardiology Clinic": 58000, "Emergency ALS Operations": 34000, "Virtual AI Consults": 12000 },
    { month: "Apr", "Cardiology Clinic": 55000, "Emergency ALS Operations": 32000, "Virtual AI Consults": 15000 },
    { month: "May", "Cardiology Clinic": 61200, "Emergency ALS Operations": 38100, "Virtual AI Consults": 19800 },
    { month: "Jun", "Cardiology Clinic": 68000, "Emergency ALS Operations": 44000, "Virtual AI Consults": 25400 },
  ];

  return (
    <DashboardLayout role="admin" userName={userName}>
      <Toaster position="top-right" theme="dark" closeButton />

      {/* Admin Module Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/20 to-[#070a13] border border-blue-500/20 p-6 md:p-8 rounded-[32px] text-white mb-8 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="z-10 relative">
          <div className="inline-flex items-center space-x-2 text-xs font-bold font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Root Ops Authorized</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans">
            MedFlow+ Operations Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
            Configure networks hospitals, onboard specialist medical profiles, monitor emergency dispatches, and optimize real-time routing structures.
          </p>

          {/* Quick Refresh Status Trigger */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={loadAllData}
              disabled={isLoading}
              className="inline-flex items-center text-xs text-white bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-xl transition-all font-semibold active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Syncing..." : "Sync Live Data"}
            </button>
            <span className="text-[11px] text-slate-500 font-mono">
              Status update: <span className="text-emerald-400">ONLINE</span> • 2026-05-22
            </span>
          </div>
        </div>
      </div>

      {/* Root Status Quick Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md text-white shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide text-slate-300">Registered Facilities</CardTitle>
            <Building className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{hospitals.length}</div>
            <p className="text-xs text-slate-400 mt-1">Total critical beds: <span className="font-bold text-white font-mono">{totalBeds}</span></p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md text-white shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide text-slate-300">Onboarded Doctors</CardTitle>
            <Users className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{doctors.length}</div>
            <p className="text-xs text-slate-400 mt-1">Specialist staff members</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0b171c] border-indigo-500/20 rounded-3xl backdrop-blur-md text-white shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide text-indigo-300">Total Incidents</CardTitle>
            <Activity className="h-4 w-4 text-indigo-400 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{emergencies.length}</div>
            <p className="text-xs text-indigo-300 mt-1 font-semibold">Logged triage history</p>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-500/30 rounded-3xl backdrop-blur-md text-white shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide text-red-300">Active Emergencies</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400 animate-bounce" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-red-400">{activeEmergenciesCount}</div>
            <p className="text-xs text-red-300 mt-1 font-semibold">Active dispatch transit</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Controller Panel */}
      <div className="flex border-b border-white/5 mb-8 overflow-x-auto space-x-2">
        <button
          onClick={() => navigate("/dashboard/admin")}
          className={`px-5 py-3 text-sm font-bold border-b-2 uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "overview"
              ? "border-blue-500 text-blue-400 bg-white/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          📈 System Analytics
        </button>
        <button
          onClick={() => navigate("/dashboard/admin/hospitals")}
          className={`px-5 py-3 text-sm font-bold border-b-2 uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "hospitals"
              ? "border-blue-500 text-blue-400 bg-white/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          🏥 Manage Hospitals ({hospitals.length})
        </button>
        <button
          onClick={() => navigate("/dashboard/admin/doctors")}
          className={`px-5 py-3 text-sm font-bold border-b-2 uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "doctors"
              ? "border-blue-500 text-blue-400 bg-white/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          ⚕️ Onboard Staff ({doctors.length})
        </button>
        <button
          onClick={() => navigate("/dashboard/admin/reports")}
          className={`px-5 py-3 text-sm font-bold border-b-2 uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "emergencies"
              ? "border-blue-500 text-blue-400 bg-white/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          🚨 Incident Monitor ({activeEmergenciesCount})
        </button>
      </div>

      {/* TAB CONTENTS */}

      {/* 1. STATE WORKSPACE OVERVIEW & ANALYTICS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Live Bed Capacity & Healthcare Resources */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white/5 border border-emerald-500/20 rounded-3xl text-white relative overflow-hidden backdrop-blur-md">
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ICU Active Beds</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="font-extrabold text-2xl text-emerald-400">142 / 200</div>
                <p className="text-[10px] text-slate-400 mt-1">71% Bed Occupancy Rate • Live Sync</p>
              </div>
            </Card>

            <Card className="bg-white/5 border border-blue-500/20 rounded-3xl text-white relative overflow-hidden backdrop-blur-md">
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Oxygen Beds Allocation</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                </div>
                <div className="font-extrabold text-2xl text-blue-400">415 / 500</div>
                <p className="text-[10px] text-slate-400 mt-1">83% Oxygen Beds utilized</p>
              </div>
            </Card>

            <Card className="bg-white/5 border border-cyan-500/25 rounded-3xl text-white relative overflow-hidden backdrop-blur-md">
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Ventilator Spans</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                </div>
                <div className="font-extrabold text-2xl text-cyan-400">89 / 150</div>
                <p className="text-[10px] text-slate-400 mt-1">High capacity available</p>
              </div>
            </Card>

            <Card className="bg-white/5 border border-red-500/20 rounded-3xl text-white relative overflow-hidden backdrop-blur-md">
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auxiliary Trauma Units</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </div>
                <div className="font-extrabold text-2xl text-red-400">12 Dispatch Units</div>
                <p className="text-[10px] text-slate-400 mt-1">Dijkstra routing systems active</p>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Network Hospital Load Grid */}
            <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md text-white">
              <CardHeader>
                <div className="flex items-center space-x-2 text-blue-400">
                  <Building className="w-5 h-5" />
                  <CardTitle className="text-lg font-bold">Facility Bed Allocations</CardTitle>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">Rating scale vs Bed Capacity indices per facility.</CardDescription>
              </CardHeader>
              <CardContent>
                {hospitalChartData.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hospitalChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#070a13', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                        <Legend />
                        <Bar dataKey="Beds" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Rating" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-slate-500 text-xs font-mono">
                    No hospital metrics registered in system.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Severity Analytics Chart */}
            <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md text-white">
              <CardHeader>
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                  <CardTitle className="text-lg font-bold">Incident Risk Triages</CardTitle>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">Severity levels monitored by emergency network systems.</CardDescription>
              </CardHeader>
              <CardContent>
                {emergencies.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={severityChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} width={120} />
                        <Tooltip contentStyle={{ backgroundColor: '#070a13', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                        <Bar dataKey="count" fill="#8884d8" radius={[0, 6, 6, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-slate-500 text-xs font-mono">
                    No incident records populated inside dispatcher.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Live Hospital Occupancy Trends Area Chart */}
            <Card className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md text-white">
              <CardHeader>
                <div className="flex items-center space-x-2 text-cyan-400">
                  <Activity className="w-5 h-5" />
                  <CardTitle className="text-sm font-bold">Hospital Occupancy & Utilization</CardTitle>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Active trends comparing general ICU, oxygen-equipped capacity, and ventilator margins.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={occupancyTimelineData}>
                      <defs>
                        <linearGradient id="colorIcu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOxygen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} unit="%" />
                      <Tooltip contentStyle={{ backgroundColor: '#070a13', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                      <Legend />
                      <Area type="monotone" dataKey="ICU Room Occupancy" stroke="#ef4444" fillOpacity={1} fill="url(#colorIcu)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Oxygen Beds Occupancy" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOxygen)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Glowing Operations Revenue Line Chart */}
            <Card className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md text-white">
              <CardHeader>
                <div className="flex items-center space-x-2 text-indigo-400">
                  <TrendingUp className="w-5 h-5" />
                  <CardTitle className="text-sm font-bold">Clinical Operations Revenue Trends</CardTitle>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Monthly performance analytics across core therapeutic clinics and AI consult operations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={operationsRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} unit="$" />
                      <Tooltip contentStyle={{ backgroundColor: '#070a13', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="Cardiology Clinic" stroke="#4f46e5" strokeWidth={2.5} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Emergency ALS Operations" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="Virtual AI Consults" stroke="#38bdf8" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secure System Configurations Panel */}
          <Card className="bg-[#090d19] border border-white/5 rounded-3xl text-white">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-md font-extrabold flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-emerald-400" />
                Specialist Allocations Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-3 text-center">
                <div className="p-4 bg-white/5 rounded-2xl">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Active Hospitals</div>
                  <div className="text-3xl font-extrabold text-blue-400 mt-1">{hospitals.length}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Clinical Staff Ratio</div>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                    {hospitals.length > 0 ? (doctors.length / hospitals.length).toFixed(1) : 0}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Doctors per facility</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Bed Occupancy Rates</div>
                  <div className="text-3xl font-extrabold text-indigo-400 mt-1">74%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. MANAGE HOSPITALS WORKSPACE */}
      {activeTab === "hospitals" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold text-white">Clinical Network Facilities</h2>
              <p className="text-xs text-slate-400">Add, configure, and monitor regional hospital assets.</p>
            </div>
            <Button
              onClick={() => {
                setEditingHospId(null);
                setHospForm({ name: "", beds: "50", rating: "4.5", lat: "40.7128", lng: "-74.0060" });
                setShowHospForm(!showHospForm);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-xl space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{showHospForm ? "Close Form Panel" : "Add Facility"}</span>
            </Button>
          </div>

          {/* Hospital Form Panel */}
          {showHospForm && (
            <Card className="bg-white/5 border border-blue-500/30 rounded-3xl text-white p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
              <CardTitle className="text-sm font-bold tracking-wider mb-4 uppercase">
                {editingHospId ? "📝 Update Facility Metrics" : "🏥 Register New Medical Facility"}
              </CardTitle>
              <form onSubmit={handleAddHospital} className="grid gap-4 md:grid-cols-5 items-end">
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Hospital Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Mount Sinai Emergency Wing"
                    className="bg-white/5 border-white/10 text-xs h-10 rounded-xl"
                    value={hospForm.name}
                    onChange={(e) => setHospForm({ ...hospForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Max Bed Capacity</Label>
                  <Input
                    type="number"
                    placeholder="120"
                    className="bg-white/5 border-white/10 text-xs h-10 rounded-xl"
                    value={hospForm.beds}
                    onChange={(e) => setHospForm({ ...hospForm, beds: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Rating (1-5)</Label>
                  <Input
                    type="text"
                    placeholder="4.7"
                    className="bg-white/5 border-white/10 text-xs h-10 rounded-xl"
                    value={hospForm.rating}
                    onChange={(e) => setHospForm({ ...hospForm, rating: e.target.value })}
                  />
                </div>
                <div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-xs h-10 rounded-xl border-none"
                  >
                    {editingHospId ? "Update Metrics" : "Register Facility"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Hospitals List Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hospitals.map((h) => (
              <Card key={h.id} className="bg-white/5 border border-white/10 rounded-3xl text-white hover:border-blue-500/30 transition-all overflow-hidden group">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/25">
                      <Building className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => startEditHospital(h)}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Configure Metrics"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteHospital(h.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-all cursor-pointer"
                        title="Deregister"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-md font-bold mt-4 line-clamp-1">{h.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center mt-2.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Coordinate Lat/Lng: <span className="text-slate-300 font-mono ml-1">{h.lat.toFixed(4)}, {h.lng.toFixed(4)}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5 text-center">
                    <div className="bg-white/5 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Capacity</div>
                      <div className="text-sm font-extrabold text-blue-300 mt-0.5">{h.beds} Beds</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Score</div>
                      <div className="text-sm font-extrabold text-emerald-300 mt-0.5">★ {h.rating}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 3. MANAGE MEDICAL RECRUITING (DOCTORS) */}
      {activeTab === "doctors" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold text-white">Active Specialist Registry</h2>
              <p className="text-xs text-slate-400">Onboard professional clinical specialists and manage medical rosters.</p>
            </div>
            <Button
              onClick={() => {
                setDocForm({ name: "", email: "", password: "Password123!" });
                setShowDocForm(!showDocForm);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-xl space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{showDocForm ? "Hide Onboarding Panel" : "Onboard Specialist"}</span>
            </Button>
          </div>

          {/* Doctor Registration Form */}
          {showDocForm && (
            <Card className="bg-white/5 border border-emerald-500/30 rounded-3xl text-white p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
              <CardTitle className="text-sm font-bold tracking-wider mb-4 uppercase">
                ⚕️ Onboard Specialist Profile
              </CardTitle>
              <form onSubmit={handleAddDoctor} className="grid gap-4 md:grid-cols-4 items-end">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Physician Name</Label>
                  <Input
                    type="text"
                    placeholder="Dr. Gregory House"
                    className="bg-white/5 border-white/10 text-xs h-10 rounded-xl"
                    value={docForm.name}
                    onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Corporate SMTP Email</Label>
                  <Input
                    type="email"
                    placeholder="house@medflow.com"
                    className="bg-white/5 border-white/10 text-xs h-10 rounded-xl"
                    value={docForm.email}
                    onChange={(e) => setDocForm({ ...docForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Temporary Password</Label>
                  <Input
                    type="text"
                    className="bg-white/5 border-white/10 text-xs h-10 rounded-xl font-mono"
                    value={docForm.password}
                    onChange={(e) => setDocForm({ ...docForm, password: e.target.value })}
                  />
                </div>
                <div>
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-xs h-10 rounded-xl border-none"
                  >
                    Onboard Specialist
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Doctors Grid List */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doc) => (
              <Card key={doc.id || doc._id} className="bg-white/5 border border-white/10 rounded-3xl text-white p-5 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={doc.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(doc.name)}`}
                      alt={doc.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200";
                      }}
                      className="w-12 h-12 rounded-2xl object-cover border border-emerald-500/20"
                    />
                    <div>
                      <h4 className="text-sm font-extrabold tracking-tight">{doc.name}</h4>
                      <div className="inline-flex items-center text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1.5 font-bold uppercase tracking-wider">
                        Active Physician
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteDoctor(doc.id || doc._id || "")}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 hover:text-red-300 rounded-xl transition-all cursor-pointer"
                    title="Terminate Profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 text-xs text-slate-400 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-slate-300 font-semibold">{doc.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Onboarded:</span>
                    <span className="text-slate-500">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 4. EMERGENCY dispatch INCIDENTS MONITOR */}
      {activeTab === "emergencies" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold text-white">Live EMS Dispatch Routing</h2>
              <p className="text-xs text-slate-400">Monitor active ambulances, triage patient severity values, and allocate clinical care portals.</p>
            </div>
            <Button
              onClick={() => {
                // Pre-fill mock data for quick trial simulation
                const mockNames = ["James Carter", "Olivia Vance", "Timothy Bell", "Alexander Mercer"];
                const mockConditions = ["Acute Cardiac Arrest", "Stabbing Wound", "Severe Anaphylaxis", "Sepsis Shock"];
                const randIndex = Math.floor(Math.random() * mockNames.length);

                setEmgForm({
                  patientName: mockNames[randIndex],
                  condition: mockConditions[randIndex],
                  severity: "high",
                  location: `${Math.floor(10 + Math.random() * 80)}th Avenue, New York`,
                  hospitalId: hospitals[0]?.id || "h1"
                });
                setShowEmgForm(!showEmgForm);
              }}
              className="bg-red-600 hover:bg-red-700 text-xs font-bold rounded-xl space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{showEmgForm ? "Close Simulator Panel" : "Logged Fake Incident"}</span>
            </Button>
          </div>

          {/* Simulator Form Panel */}
          {showEmgForm && (
            <Card className="bg-white/5 border border-red-500/40 rounded-3xl text-white p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 animate-pulse" />
              <CardTitle className="text-sm font-bold tracking-wider mb-4 uppercase text-red-400">
                🚨 Simulate Emergency Dispatch Trigger
              </CardTitle>
              <form onSubmit={handleAddSimulatedEmergency} className="grid gap-4 md:grid-cols-4 items-end">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Patient Identifier Name</Label>
                  <Input
                    type="text"
                    className="bg-white/5 border-white/10 text-xs h-10 rounded-xl"
                    value={emgForm.patientName}
                    onChange={(e) => setEmgForm({ ...emgForm, patientName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Triage Condition</Label>
                  <Input
                    type="text"
                    className="bg-white/5 border-white/10 text-xs h-10 rounded-xl"
                    value={emgForm.condition}
                    onChange={(e) => setEmgForm({ ...emgForm, condition: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Street Location</Label>
                  <Input
                    type="text"
                    className="bg-white/5 border-white/10 text-xs h-10 rounded-xl"
                    value={emgForm.location}
                    onChange={(e) => setEmgForm({ ...emgForm, location: e.target.value })}
                  />
                </div>
                <div>
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 font-bold text-xs h-10 rounded-xl border-none"
                  >
                    Dispatch Simulator Engine
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Emergencies Dispatch Logs Table */}
          <Card className="bg-white/5 border border-white/10 rounded-3xl text-white overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <CardTitle className="text-md font-bold">Ambulance Transit Queue</CardTitle>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 uppercase tracking-wider text-[10px] font-mono border-b border-white/5">
                  <tr>
                    <th className="p-4">Report Token</th>
                    <th className="p-4">Patient & Condition</th>
                    <th className="p-4">Street Coordinates</th>
                    <th className="p-4">Severity Status</th>
                    <th className="p-4">Transit Badge Steps</th>
                    <th className="p-4 text-center">Roster Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {emergencies.map((e) => (
                    <tr key={e.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-slate-500 font-bold">#{e.id}</td>
                      <td className="p-4">
                        <div className="font-extrabold text-white text-sm">{e.patientName}</div>
                        <div className="text-slate-400 mt-0.5">{e.condition}</div>
                      </td>
                      <td className="p-4 flex items-center space-x-1 mt-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{e.location}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          e.severity === "high"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : e.severity === "medium"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                          {e.severity} Urgent
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
                          e.status === "Routing"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
                            : e.status === "Dispatched"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : e.status === "Arrived"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-1.5">
                          {e.status === "Routing" && (
                            <button
                              onClick={() => updateEmergencyStatus(e.id, "Dispatched")}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-[10px] font-bold text-white rounded-lg transition-all"
                            >
                              Dispatch EMS
                            </button>
                          )}
                          {e.status === "Dispatched" && (
                            <button
                              onClick={() => updateEmergencyStatus(e.id, "Arrived")}
                              className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-[10px] font-bold text-white rounded-lg transition-all"
                            >
                              Confirm Arrival
                            </button>
                          )}
                          {e.status === "Arrived" && (
                            <button
                              onClick={() => updateEmergencyStatus(e.id, "Resolved")}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold text-white rounded-lg transition-all"
                            >
                              Mark Resolved
                            </button>
                          )}
                          <button
                            onClick={() => deleteEmergency(e.id)}
                            className="p-1.5 bg-white/5 hover:bg-red-500/15 text-slate-500 hover:text-red-400 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                            title="Audit Clear"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {emergencies.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-500 font-mono text-xs">
                        All ambulance emergency fleets are currently idle inside system routing zones.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
