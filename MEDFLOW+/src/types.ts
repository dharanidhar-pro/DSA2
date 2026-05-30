export interface User {
  id: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin' | 'superadmin';
  specialization?: string;
  rating?: number;
  avatar?: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  beds: number;
  rating: number;
  distance?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}
