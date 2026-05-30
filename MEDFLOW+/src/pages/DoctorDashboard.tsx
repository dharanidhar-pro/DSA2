import { useState, useEffect, FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, CheckCircle, Clock, Check, X, Calendar, Search, FileText, Plus, Heart, Sparkles, SlidersHorizontal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const initialPatientData = [
  { name: 'Mon', patients: 12 },
  { name: 'Tue', patients: 15 },
  { name: 'Wed', patients: 10 },
  { name: 'Thu', patients: 18 },
  { name: 'Fri', patients: 14 },
];

const DEFAULT_SCHEDULE = [
  { id: 'sch-1', name: 'Alice Walker', email: 'alice.w@example.com', age: 34, gender: 'Female', time: '10:00 AM', type: 'Checkup', status: 'completed', reason: 'Annual respiratory health screening' },
  { id: 'sch-2', name: 'Bob Smith', email: 'bob.smith@example.com', age: 48, gender: 'Male', time: '11:00 AM', type: 'Follow Up', status: 'pending', reason: 'High blood pressure medicine dosage adjustment' },
  { id: 'sch-3', name: 'Charlie Davis', email: 'charlie.d@example.com', age: 29, gender: 'Male', time: '02:00 PM', type: 'Consultation', status: 'pending', reason: 'Chronic migraine trigger points discussion' }
];

const DEFAULT_PATIENTS = [
  { id: 'pat-1', name: 'Alice Walker', age: 34, gender: 'Female', email: 'alice.w@example.com', phone: '(555) 123-4567', condition: 'Mild Asthma', vitals: 'BP 118/75, HR 72, SpO2 98%', lastVisit: '2026-05-15', observations: 'Slight wheezing heard during exercise tests. Prescribed inhaled corticosteroid.' },
  { id: 'pat-2', name: 'Bob Smith', age: 48, gender: 'Male', email: 'bob.smith@example.com', phone: '(555) 234-5678', condition: 'Stage 1 Hypertension', vitals: 'BP 138/88, HR 68, SpO2 96%', lastVisit: '2026-05-18', observations: 'Initiated lisinopril with low daily dosing. Monitor vitals weekly.' },
  { id: 'pat-3', name: 'Charlie Davis', age: 29, gender: 'Male', email: 'charlie.d@example.com', phone: '(555) 345-6789', condition: 'Frequent Migraines', vitals: 'BP 120/80, HR 65, SpO2 99%', lastVisit: '2026-05-22', observations: 'Identified dietary triggers. Advised limiting blue light exposure before bedtime.' },
  { id: 'pat-4', name: 'Diana Prince', age: 31, gender: 'Female', email: 'diana.p@example.com', phone: '(555) 456-7890', condition: 'Athletic Wellness', vitals: 'BP 112/68, HR 55, SpO2 100%', lastVisit: '2026-05-10', observations: 'Superb health benchmarks. Cardiac functions exceptional.' }
];

export function DoctorDashboard() {
  const location = useLocation();
  const savedUser = localStorage.getItem('currentUser');
  const user = savedUser ? JSON.parse(savedUser) : null;
  const userName = user && user.role === 'doctor' ? user.name : 'Dr. John Doe';

  // Persistence hooks
  const [schedule, setSchedule] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Observation logging states
  const [selectedPatId, setSelectedPatId] = useState<string | null>(null);
  const [newObservation, setNewObservation] = useState('');
  const [newVitals, setNewVitals] = useState('');

  // Create patient states
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addAge, setAddAge] = useState('35');
  const [addGender, setAddGender] = useState('Female');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addCondition, setAddCondition] = useState('Healthy');
  
  useEffect(() => {
    // Sync schedules
    const savedSchedules = localStorage.getItem('medflow_doctor_schedule');
    if (savedSchedules) {
      setSchedule(JSON.parse(savedSchedules));
    } else {
      setSchedule(DEFAULT_SCHEDULE);
      localStorage.setItem('medflow_doctor_schedule', JSON.stringify(DEFAULT_SCHEDULE));
    }

    // Sync patients
    const savedPatients = localStorage.getItem('medflow_doctor_patients');
    if (savedPatients) {
      setPatients(JSON.parse(savedPatients));
    } else {
      setPatients(DEFAULT_PATIENTS);
      localStorage.setItem('medflow_doctor_patients', JSON.stringify(DEFAULT_PATIENTS));
    }
  }, []);

  const saveScheduleToLocal = (updated: any[]) => {
    setSchedule(updated);
    localStorage.setItem('medflow_doctor_schedule', JSON.stringify(updated));
  };

  const savePatientsToLocal = (updated: any[]) => {
    setPatients(updated);
    localStorage.setItem('medflow_doctor_patients', JSON.stringify(updated));
  };

  // Schedule mutations
  const handleApproveSchedule = (id: string) => {
    const updated = schedule.map(item => 
      item.id === id ? { ...item, status: 'approved' } : item
    );
    saveScheduleToLocal(updated);
    toast.success('Roster slot approved.', { description: 'The patient will receive immediate email notification.' });
  };

  const handleCompleteSchedule = (id: string) => {
    const updated = schedule.map(item => 
      item.id === id ? { ...item, status: 'completed' } : item
    );
    saveScheduleToLocal(updated);
    toast.success('Consultation checked out.', { description: 'Status marked as finalized.' });
  };

  const handleCancelSchedule = (id: string) => {
    const updated = schedule.filter(item => item.id !== id);
    saveScheduleToLocal(updated);
    toast.success('Roster reservation removed.');
  };

  // Add clinical observations action
  const handleUpdateObservations = (e: FormEvent) => {
    e.preventDefault();
    if (!newObservation.trim()) {
      toast.error('Observation summary cannot be blank.');
      return;
    }
    const updated = patients.map(p => {
      if (p.id === selectedPatId) {
        return {
          ...p,
          observations: newObservation,
          vitals: newVitals.trim() ? newVitals : p.vitals,
          lastVisit: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    });
    savePatientsToLocal(updated);
    setNewObservation('');
    setNewVitals('');
    setSelectedPatId(null);
    toast.success('Observations updated.', { description: 'New diagnostic facts locked into patient medical records.' });
  };

  // Add Patient Action
  const handleAddPatient = (e: FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim()) {
      toast.error('Required fields are missing.');
      return;
    }

    const newPat = {
      id: 'pat_' + Math.random().toString(36).substring(2, 9),
      name: addName,
      age: Number(addAge),
      gender: addGender,
      email: addEmail,
      phone: addPhone || '(555) 777-9999',
      condition: addCondition,
      vitals: 'BP 120/80, HR 60, SpO2 100%',
      lastVisit: new Date().toISOString().split('T')[0],
      observations: 'Initial clinical induction file established.'
    };

    const nextPats = [newPat, ...patients];
    savePatientsToLocal(nextPats);
    setAddName('');
    setAddEmail('');
    setAddPhone('');
    setIsAddPatientOpen(false);
    toast.success('Patient admitted to clinic roster.', {
      description: `Permanent record created for ${newPat.name}.`
    });
  };

  // Searching patients array
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePat = patients.find(p => p.id === selectedPatId);

  // Sub-view checking
  const isAppointmentsRoute = location.pathname.endsWith('/appointments');
  const isPatientsRoute = location.pathname.endsWith('/patients');

  return (
    <DashboardLayout role="doctor" userName={userName}>
      {/* 1. OVERVIEW VIEW */}
      {!isAppointmentsRoute && !isPatientsRoute && (
        <div className="space-y-8 animate-fade-in">
          {/* Quick Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md shadow-xl text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Clinician Roster Patients</CardTitle>
                <Users className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold tracking-tight">{patients.length}</div>
                <p className="text-xs text-slate-400 mt-1">Active patient records persisted</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md shadow-xl text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Pending Approvals</CardTitle>
                <UserPlus className="h-5 w-5 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold tracking-tight text-emerald-400">
                  {schedule.filter(s => s.status === 'pending').length}
                </div>
                <p className="text-xs text-slate-400 mt-1">Awaiting scheduling authorization</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md shadow-xl text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Reviews Completed</CardTitle>
                <CheckCircle className="h-5 w-5 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold tracking-tight">
                  {schedule.filter(s => s.status === 'completed').length}
                </div>
                <p className="text-xs text-slate-400 mt-1">Rounds finished today</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Daily Outpatient Traffic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={initialPatientData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                      />
                      <Bar dataKey="patients" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md text-white shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-white">Today's Active Rounds</CardTitle>
                <Button onClick={() => window.location.pathname = '/dashboard/doctor/appointments'} variant="link" className="text-xs text-blue-400 p-0 h-auto">Optimize Calendar</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedule.slice(0, 3).map((apt) => (
                    <div key={apt.id} className="flex justify-between items-center p-4 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className={`p-2.5 rounded-xl ${apt.status === 'completed' ? 'bg-emerald-500/10' : 'bg-blue-500/10'} flex-shrink-0`}>
                          <Clock className={`w-5 h-5 ${apt.status === 'completed' ? 'text-emerald-400' : 'text-blue-400'}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{apt.name}</p>
                          <p className="text-xs text-slate-400 truncate">{apt.type} • {apt.reason}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-white">{apt.time}</p>
                        <p className={`text-xs font-semibold mt-1 uppercase tracking-wider ${apt.status === 'completed' ? 'text-emerald-405 text-emerald-400' : 'text-blue-400'}`}>{apt.status}</p>
                      </div>
                    </div>
                  ))}
                  {schedule.length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      No consultations registered today.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 2. APPOINTMENTS SUB-VIEW */}
      {isAppointmentsRoute && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">Clinic Organizer</span>
            <h2 className="text-2xl font-black text-white tracking-tight">Manage Booking Schedule</h2>
          </div>

          <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md text-white overflow-hidden shadow-xl">
            <CardHeader className="p-6 border-b border-white/5">
              <h3 className="font-extrabold">Active Registrations and Approvals ({schedule.length})</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {schedule.map((apt) => (
                  <div key={apt.id} className="p-6 hover:bg-white/5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4 min-w-0">
                      <div className={`p-3 rounded-2xl ${
                        apt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2.5">
                          <h4 className="font-extrabold text-white text-base truncate">{apt.name}</h4>
                          <span className="text-[10px] text-slate-450 px-2 py-0.5 rounded bg-white/5 border border-white/10">{apt.age}y.o / {apt.gender}</span>
                        </div>
                        <p className="text-xs text-blue-400 font-semibold mt-0.5">{apt.type}</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xl italic">"{apt.reason}"</p>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 flex-shrink-0">
                      <div className="text-left md:text-right">
                        <p className="text-sm font-extrabold text-white">{apt.time}</p>
                        <p className="text-xs text-slate-400">Scheduled Outpatient</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {apt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveSchedule(apt.id)}
                              className="px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold transition-all flex items-center cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Approve
                            </button>
                            <button
                              onClick={() => handleCancelSchedule(apt.id)}
                              className="p-1.5 bg-white/5 hover:bg-red-500/10 text-slate-450 hover:text-red-400 rounded-lg transition-all border border-white/5 hover:border-red-500/10 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {apt.status === 'approved' && (
                          <button
                            onClick={() => handleCompleteSchedule(apt.id)}
                            className="px-3.5 py-1.5 bg-blue-500 border border-blue-600 hover:bg-blue-605 text-white rounded-xl text-xs font-bold transition-all flex items-center cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Checkout
                          </button>
                        )}
                        {apt.status === 'completed' && (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center">
                            <Check className="w-3.5 h-3.5 mr-1" /> Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {schedule.length === 0 && (
                  <div className="p-12 text-center text-slate-450">No roster entries scheduled today.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. PATIENTS DATABASE DIRECTORY */}
      {isPatientsRoute && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">Roster Database</span>
              <h2 className="text-2xl font-black text-white tracking-tight">Outpatient Directory Logs</h2>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-450 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Query by diagnostic name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 w-60 text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <Button 
                onClick={() => setIsAddPatientOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-10 px-4 border-none font-bold text-xs"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Force Admit
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Table Directory */}
            <div className="lg:col-span-2">
              <Card className="bg-white/5 border-white/10 rounded-3xl backdrop-blur-md text-white overflow-hidden shadow-xl">
                <CardContent className="p-0">
                  <div className="overflow-x-auto font-sans">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-xs text-slate-400 uppercase tracking-wider">
                          <th className="p-6">Patient Identifier</th>
                          <th className="p-6">Condition Profile</th>
                          <th className="p-6">Vitals Check</th>
                          <th className="p-6">Last Active Round</th>
                          <th className="p-6 text-right">Observations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredPatients.map((p) => (
                          <tr key={p.id} className="hover:bg-white/5 transition-all text-xs cursor-pointer group" onClick={() => {
                            setSelectedPatId(p.id);
                            setNewObservation(p.observations);
                            setNewVitals(p.vitals);
                          }}>
                            <td className="p-6">
                              <div>
                                <h4 className="font-extrabold text-white group-hover:text-blue-400 transition-colors">{p.name}</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5">{p.age}y.o / {p.gender} • {p.phone}</p>
                              </div>
                            </td>
                            <td className="p-6 font-semibold text-slate-350">
                              <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md">
                                {p.condition}
                              </span>
                            </td>
                            <td className="p-6 text-slate-400 font-mono text-[10px]">{p.vitals}</td>
                            <td className="p-6 text-slate-300 font-medium">{p.lastVisit}</td>
                            <td className="p-6 text-right">
                              <span className="text-blue-400 font-bold hover:underline group-hover:translate-x-1 duration-200 transform inline-block">Edit Clinical Stats →</span>
                            </td>
                          </tr>
                        ))}
                        {filteredPatients.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-slate-500">No records found matching query criteria.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Diagnostic Observation Logging Form */}
            <div>
              {activePat ? (
                <Card className="bg-gradient-to-br from-slate-900/60 to-slate-900/40 border-blue-500/15 border rounded-3xl backdrop-blur-md text-white shadow-2xl relative overflow-hidden animate-scale-up">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-indigo-500" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-1" /> Outpatient File Active
                      </span>
                      <button onClick={() => setSelectedPatId(null)} className="p-1 bg-white/5 hover:bg-white/10 hover:text-white text-slate-400 rounded-lg">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <CardTitle className="text-xl font-black mt-2 text-white">{activePat.name}</CardTitle>
                    <p className="text-xs text-slate-400">{activePat.email} • {activePat.phone}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-2 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-1.5 text-slate-400">
                        <span>Physical Profile:</span>
                        <span className="font-bold text-white">{activePat.age}y.o {activePat.gender}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5 text-slate-400">
                        <span>Previous Indication:</span>
                        <span className="font-bold text-blue-400">{activePat.condition}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Active System Vitals:</span>
                        <span className="font-bold text-white font-mono">{activePat.vitals}</span>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateObservations} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 uppercase block">Log Advanced Diagnostic Vitals</label>
                        <input
                          type="text"
                          value={newVitals}
                          onChange={(e) => setNewVitals(e.target.value)}
                          placeholder="e.g. BP 122/78, HR 71, SpO2 99%"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 uppercase block">Observations & Prescriptions</label>
                        <textarea
                          value={newObservation}
                          onChange={(e) => setNewObservation(e.target.value)}
                          placeholder="Note active clinical issues or medication instructions..."
                          rows={4}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex space-x-2 pt-1">
                        <Button type="button" onClick={() => setSelectedPatId(null)} className="w-1/3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl h-10 border-none font-bold">Dismiss</Button>
                        <Button type="submit" className="w-2/3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:bg-blue-600 text-white rounded-xl h-10 border-none font-bold">Save Roster File</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/5 border-dashed border-white/10 border rounded-3xl p-8 text-center text-slate-400 flex flex-col items-center justify-center space-y-3 shadow-xl">
                  <div className="p-3 bg-white/5 rounded-2xl text-slate-450">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="font-extrabold text-white text-base">Select Outpatient Account</h4>
                  <p className="text-xs max-w-xs leading-relaxed text-slate-450">Select any patient record from the roster catalog list to examine diagnostic vitals and edit clinical prescriptions.</p>
                </Card>
              )}
            </div>
          </div>

          {/* Fallback Add Patient Modal */}
          {isAddPatientOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-[#0f172a] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-white">Roster Induction</h3>
                  <button onClick={() => setIsAddPatientOpen(false)} className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddPatient} className="p-6 space-y-4 font-sans">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase block">Full Roster Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase block">Age</label>
                      <input
                        type="number"
                        placeholder="35"
                        value={addAge}
                        onChange={(e) => setAddAge(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase block">Biological Gender</label>
                      <select
                        value={addGender}
                        onChange={(e) => setAddGender(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Female" className="bg-slate-900 text-white">Female</option>
                        <option value="Male" className="bg-slate-900 text-white">Male</option>
                        <option value="Other" className="bg-slate-900 text-white">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase block">Communication Mail Address</label>
                    <input
                      type="email"
                      required
                      placeholder="jane.doe@example.com"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase block">Contact Phone Number</label>
                    <input
                      type="text"
                      placeholder="(555) 777-9999"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase block">Primary Disease Classification / Condition</label>
                    <input
                      type="text"
                      placeholder="e.g. Mild Chronic Asthma"
                      value={addCondition}
                      onChange={(e) => setAddCondition(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddPatientOpen(false)}
                      className="w-1/2 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all"
                    >
                      Dismiss
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Process Admission
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
