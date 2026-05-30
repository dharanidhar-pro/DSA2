import { useState, useEffect, FormEvent, DragEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Activity, FileText, Plus, User, Search, Trash2, Eye, Download, Upload, HelpCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const initialHealthData = [
  { name: 'Mon', bpm: 72 },
  { name: 'Tue', bpm: 75 },
  { name: 'Wed', bpm: 71 },
  { name: 'Thu', bpm: 78 },
  { name: 'Fri', bpm: 74 },
  { name: 'Sat', bpm: 70 },
  { name: 'Sun', bpm: 73 },
];

const SPECIALISTS = [
  { id: 'spec-1', name: 'Dr. John Doe', spec: 'Cardiology', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200' },
  { id: 'spec-2', name: 'Dr. Sarah Peterson', spec: 'Neurology', avatar: 'https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&w=200' },
  { id: 'spec-3', name: 'Dr. Robert Vance', spec: 'Infectious Diseases', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200' },
  { id: 'spec-4', name: 'Dr. Clara Oswald', spec: 'Pediatrics', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200' },
];

const DEFAULT_APPOINTMENTS = [
  { id: 'apt-1', doctorName: 'Dr. John Doe', specialty: 'Cardiology', date: '2026-05-24', time: '10:00 AM', reason: 'Routine heart valve exam', status: 'Approved' },
  { id: 'apt-2', doctorName: 'Dr. Sarah Peterson', specialty: 'Neurology', date: '2026-05-25', time: '11:30 AM', reason: 'Post-concussion follow-up checkup', status: 'Pending Review' }
];

const DEFAULT_RECORDS = [
  { id: 'rec-1', fileName: 'Comprehensive_CBC_Blood_Panel.pdf', type: 'Laboratory Result', date: '2026-05-18', size: '1.4 MB', doctor: 'Dr. Robert Vance' },
  { id: 'rec-2', fileName: 'Brain_MRI_Structural_Axial.png', type: 'Radiology Scan', date: '2026-05-10', size: '4.8 MB', doctor: 'Dr. Sarah Peterson' },
  { id: 'rec-3', fileName: 'Electrocardiogram_ECG_Resting_Rhythm.pdf', type: 'Clinical Test', date: '2026-05-02', size: '840 KB', doctor: 'Dr. John Doe' }
];

export function PatientDashboard() {
  const location = useLocation();
  const savedUser = localStorage.getItem('currentUser');
  const user = savedUser ? JSON.parse(savedUser) : null;
  const userName = user && user.role === 'patient' ? user.name : 'Jane Smith';

  // State structures
  const [appointments, setAppointments] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  
  // Modals / Dropdowns
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSpecId, setSelectedSpecId] = useState(SPECIALISTS[0].id);
  const [bookingDate, setBookingDate] = useState('2026-05-24');
  const [bookingTime, setBookingTime] = useState('09:00 AM');
  const [bookingReason, setBookingReason] = useState('');
  
  // Drag & drop records uploader states
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRecordFile, setSelectedRecordFile] = useState<any>(null);

  // Load persistence state on mount
  useEffect(() => {
    const savedApt = localStorage.getItem('medflow_patient_appointments');
    if (savedApt) {
      setAppointments(JSON.parse(savedApt));
    } else {
      setAppointments(DEFAULT_APPOINTMENTS);
      localStorage.setItem('medflow_patient_appointments', JSON.stringify(DEFAULT_APPOINTMENTS));
    }

    const savedRec = localStorage.getItem('medflow_patient_records');
    if (savedRec) {
      setRecords(JSON.parse(savedRec));
    } else {
      setRecords(DEFAULT_RECORDS);
      localStorage.setItem('medflow_patient_records', JSON.stringify(DEFAULT_RECORDS));
    }
  }, []);

  // Sync state functions
  const saveAptsToLocal = (updated: any[]) => {
    setAppointments(updated);
    localStorage.setItem('medflow_patient_appointments', JSON.stringify(updated));
  };

  const saveRecsToLocal = (updated: any[]) => {
    setRecords(updated);
    localStorage.setItem('medflow_patient_records', JSON.stringify(updated));
  };

  // Appointment Actions
  const handleBookAppointment = (e: FormEvent) => {
    e.preventDefault();
    if (!bookingReason.trim()) {
      toast.error('Please input a clinical reason for consultation.');
      return;
    }
    const spec = SPECIALISTS.find(s => s.id === selectedSpecId);
    if (!spec) return;

    const newApt = {
      id: 'apt_' + Math.random().toString(36).substring(2, 9),
      doctorName: spec.name,
      specialty: spec.spec,
      date: bookingDate,
      time: bookingTime,
      reason: bookingReason,
      status: 'Pending Review'
    };

    const nextApts = [newApt, ...appointments];
    saveAptsToLocal(nextApts);
    setBookingReason('');
    setIsBookingOpen(false);
    toast.success('Your appointment slot has been successfully booked!', {
      description: `Waiting for ${spec.name} authorization review.`
    });
  };

  const handleCancelAppointment = (id: string) => {
    const nextApts = appointments.filter(a => a.id !== id);
    saveAptsToLocal(nextApts);
    toast.success('Appointment cancelled successfully.');
  };

  // File records upload action
  const handleUploadFile = (file: File) => {
    const newRec = {
      id: 'rec_' + Math.random().toString(36).substring(2, 9),
      fileName: file.name,
      type: file.type.includes('image') ? 'Diagnostic Scan' : 'Digital Release Report',
      date: new Date().toISOString().split('T')[0],
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      doctor: 'Uploaded by Patient'
    };

    const nextRecs = [newRec, ...records];
    saveRecsToLocal(nextRecs);
    toast.success('Medical documentation uploaded successfully!', {
      description: `Registered "${file.name}" securely in your clinical records folder.`
    });
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUploadFile(files[0]);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const next = records.filter(r => r.id !== id);
    saveRecsToLocal(next);
    toast.success('File removed from digital storage.');
  };

  // Sub-view rendering route logic
  const isAppointmentsRoute = location.pathname.endsWith('/appointments');
  const isRecordsRoute = location.pathname.endsWith('/records');

  return (
    <DashboardLayout role="patient" userName={userName}>
      {/* 1. OVERVIEW VIEW */}
      {!isAppointmentsRoute && !isRecordsRoute && (
        <div className="space-y-8 animate-fade-in">
          {/* Welcome Jumbotron Banner */}
          <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/60 border border-blue-500/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="space-y-2">
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-400">Clinical Dashboard Connected</span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back, {userName}!</h2>
              <p className="text-sm text-slate-300 max-w-lg">Manage scheduling, request urgent SOS triage, review lab work releases, and analyze bio-telemetry reports in real-time.</p>
            </div>
            <div className="flex space-x-3 w-full md:w-auto">
              <Button onClick={() => window.location.pathname = '/dashboard/patient/appointments'} className="flex-1 md:flex-initial h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold px-5 rounded-xl border-none">
                <Plus className="w-4 h-4 mr-2" /> Book Slot
              </Button>
              <Button onClick={() => window.location.pathname = '/emergency'} variant="outline" className="flex-1 md:flex-initial h-11 border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold px-5 rounded-xl">
                 Triage SOS
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md shadow-xl text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Upcoming Appts</CardTitle>
                <CalendarIcon className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold tracking-tight">{appointments.length}</div>
                <p className="text-xs text-slate-400 mt-1">
                  {appointments.length > 0 ? `Next: ${appointments[0].doctorName} (${appointments[0].time})` : 'No upcoming slots planned'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md shadow-xl text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Avg Heart Rate</CardTitle>
                <Activity className="h-5 w-5 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold tracking-tight text-emerald-400">73 <span className="text-sm font-normal text-slate-300">bpm</span></div>
                <p className="text-xs text-slate-400 mt-1">+2% from last week</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md shadow-xl text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Lab Documents</CardTitle>
                <FileText className="h-5 w-5 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold tracking-tight">{records.length}</div>
                <p className="text-xs text-slate-400 mt-1">Clinical files successfully stored</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md shadow-xl text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Biometric Sync</CardTitle>
                <Clock className="h-5 w-5 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold tracking-tight">Active</div>
                <p className="text-xs text-slate-400 mt-1">Last synchronized 2 hours ago</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-7">
            <Card className="md:col-span-4 bg-white/5 border-white/10 rounded-3xl backdrop-blur-md text-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Health Metrics (BPM Pulse History)</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={initialHealthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="bpm" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, stroke: '#3b82f6', fill: '#0a0f1d' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3 bg-white/5 border-white/10 rounded-3xl backdrop-blur-md text-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-white">Upcoming Events</CardTitle>
                <Button onClick={() => window.location.pathname = '/dashboard/patient/appointments'} variant="link" className="text-xs text-blue-400 p-0 h-auto">View scheduling</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.slice(0, 2).map((apt) => (
                    <div key={apt.id} className="flex items-center p-4 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
                      <div className="bg-blue-500/10 p-3 rounded-xl mr-4">
                        <CalendarIcon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate">{apt.doctorName}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{apt.specialty}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-semibold text-white">{apt.date}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{apt.time}</div>
                      </div>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No future appointments programmed.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 2. APPOINTMENTS SCHEDULING VIEW */}
      {isAppointmentsRoute && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest block mb-1">Clinic Booking Agent</span>
              <h2 className="text-2xl font-black text-white tracking-tight">Active Appointments & Reservations</h2>
            </div>
            <Button 
              onClick={() => setIsBookingOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-11 px-5 border-none font-bold"
            >
              <Plus className="w-4 h-4 mr-2" /> Book New Appointment
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Appointment Bookings Table */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md text-white overflow-hidden shadow-xl">
                <CardHeader className="border-b border-white/5 p-6">
                  <h3 className="font-extrabold text-white">Your Roster Schedule ({appointments.length})</h3>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="p-6 hover:bg-white/5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start space-x-4 min-w-0">
                          <div className="p-3 bg-blue-500/10 text-blue-405 rounded-2xl">
                            <CalendarIcon className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-white text-base truncate">{apt.doctorName}</h4>
                            <p className="text-xs text-slate-450 text-blue-400 font-semibold mb-1">{apt.specialty}</p>
                            <p className="text-xs text-slate-400 italic">"{apt.reason}"</p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                          <div className="text-left sm:text-right">
                            <div className="text-sm font-extrabold text-white">{apt.date}</div>
                            <div className="text-xs text-slate-400 font-medium">{apt.time}</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                              apt.status === 'Approved' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              ● {apt.status}
                            </span>
                            <button
                              onClick={() => handleCancelAppointment(apt.id)}
                              className="p-1.5 hover:bg-red-500/10 text-slate-450 hover:text-red-400 rounded-lg transition-all border border-transparent hover:border-red-500/10 cursor-pointer"
                              title="Cancel slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {appointments.length === 0 && (
                      <div className="p-12 text-center text-slate-400 text-sm">
                        No medical checkups booked. Select "Book New Appointment" to initiate scheduling.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Specialties & Doctors Directory */}
            <div className="space-y-6">
              <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md text-white shadow-xl">
                <CardHeader className="pb-4">
                  <h3 className="font-extrabold text-white text-lg">Specialists Available</h3>
                  <p className="text-xs text-slate-400">Consult with certified active practitioners on our panel</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {SPECIALISTS.map((s) => (
                    <div key={s.id} className="flex items-center p-3 border border-white/5 rounded-2xl bg-white/5">
                      <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-xl object-cover bg-slate-800 border border-white/10 mr-4 shadow-lg" />
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-sm">{s.name}</h4>
                        <p className="text-xs text-blue-400 font-semibold">{s.spec}</p>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-widest">Active</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Scheduling Modal */}
          {isBookingOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-[#0f172a] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-white">Book Clinic Slot</h3>
                  <button onClick={() => setIsBookingOpen(false)} className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer">
                    <Trash2 className="w-4 h-4 rotate-45 transform" />
                  </button>
                </div>

                <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase block">Specialist Physician</label>
                    <select
                      value={selectedSpecId}
                      onChange={(e) => setSelectedSpecId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      {SPECIALISTS.map(s => (
                        <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.name} ({s.spec})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase block">Consultation Date</label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase block">Time Slot</label>
                      <input
                        type="text"
                        placeholder="10:00 AM"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase block">Primary Clinical Symptoms</label>
                    <textarea
                      placeholder="e.g. Occasional light chest stiffness during fast jogging..."
                      value={bookingReason}
                      onChange={(e) => setBookingReason(e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsBookingOpen(false)}
                      className="w-1/2 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all"
                    >
                      Dismiss
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Authorize Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. MEDICAL RECORDS / DRAG AND DROP FILE COMPONENT */}
      {isRecordsRoute && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest block mb-1">Digitized Medical Binder</span>
            <h2 className="text-2xl font-black text-white tracking-tight">Your Health Documentation</h2>
          </div>

          {/* Guidelines Drag and Drop Container */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('manual-file-records')?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 shadow-xl ${
              isDragging 
                ? "border-blue-500 bg-blue-500/10 scale-[1.01]" 
                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
            }`}
          >
            <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg">Transmit Health Reports or Radiologies</h3>
              <p className="text-sm text-slate-350 text-slate-400 mt-1 max-w-md mx-auto">
                Drag and drop your digital PDF lab records or scan photos directly into this panel, or <span className="text-blue-400 hover:underline">browse files</span>.
              </p>
            </div>
            <p className="text-xs text-slate-500">Supports PDF, XLSX, PNG, and JPG formats. Max size limit 10MB.</p>
            <input 
              type="file" 
              id="manual-file-records" 
              className="hidden" 
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleUploadFile(files[0]);
                }
              }}
            />
          </div>

          {/* Records Table and Action Panels */}
          <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md text-white overflow-hidden shadow-xl">
            <CardHeader className="border-b border-white/5 p-6">
              <h3 className="font-extrabold text-white text-lg">Stored Medical Documentation ({records.length})</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-slate-400 uppercase tracking-wider">
                      <th className="p-6">Document File Name</th>
                      <th className="p-6">Classification</th>
                      <th className="p-6">Issue Date</th>
                      <th className="p-6">Authorized By</th>
                      <th className="p-6">Size</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-white/5 transition-all text-sm group">
                        <td className="p-6 font-bold text-white flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                          <span className="truncate max-w-xs">{rec.fileName}</span>
                        </td>
                        <td className="p-6 text-slate-300 font-medium">{rec.type}</td>
                        <td className="p-6 text-slate-400">{rec.date}</td>
                        <td className="p-6 text-slate-300">{rec.doctor}</td>
                        <td className="p-6 text-slate-500 font-mono text-xs">{rec.size}</td>
                        <td className="p-6 text-right">
                          <div className="flex items-center justify-end space-x-3">
                            <button 
                              onClick={() => {
                                toast.success(`Acquiring preview context for "${rec.fileName}"...`);
                              }}
                              className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                toast.info(`Starting download stream for ${rec.fileName}`);
                              }}
                              className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(rec.id)}
                              className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400 text-sm">
                          Digitized folder contains no active records. Drag-and-drop credentials above to populate.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
