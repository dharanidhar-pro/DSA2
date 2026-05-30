import { ReactNode, useState, useEffect, ChangeEvent, DragEvent, FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, Calendar, Users, FileText, Settings, LogOut, HeartPulse, X, Upload, Shield, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast, Toaster } from 'sonner';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'patient' | 'doctor' | 'admin';
  userName: string;
}

export function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Dark/Light Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Profile Edit State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editImage, setEditImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load user data and theme on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
        setEditName(parsed.name || '');
        setEditEmail(parsed.email || '');
        setEditImage(parsed.profileImage || '');
        setImagePreview(parsed.profileImage || '');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    toast.success("Logged out successfully.", {
      description: "Secure session terminated. Redirecting..."
    });
    setTimeout(() => {
      navigate("/login");
    }, 800);
  };

  const getLinks = () => {
    if (role === 'doctor') {
      return [
        { name: 'Overview', path: '/dashboard/doctor', icon: LayoutDashboard },
        { name: 'Appointments', path: '/dashboard/doctor/appointments', icon: Calendar },
        { name: 'Patients', path: '/dashboard/doctor/patients', icon: Users },
      ];
    }
    if (role === 'admin') {
      return [
        { name: 'Overview', path: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Hospitals', path: '/dashboard/admin/hospitals', icon: Activity },
        { name: 'Doctors', path: '/dashboard/admin/doctors', icon: Users },
        { name: 'Reports', path: '/dashboard/admin/reports', icon: FileText },
      ];
    }
    return [
      { name: 'Overview', path: '/dashboard/patient', icon: LayoutDashboard },
      { name: 'Appointments', path: '/dashboard/patient/appointments', icon: Calendar },
      { name: 'Medical Records', path: '/dashboard/patient/records', icon: FileText },
      { name: 'Emergency SOS', path: '/emergency', icon: HeartPulse, special: true },
    ];
  };

  const links = getLinks();

  // File Selector helper
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Unsupported file format.', { description: 'Please choose an image file (PNG, JPG, SVG).' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeded.', { description: 'Max image upload limit is 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Result = e.target?.result as string;
      setImagePreview(base64Result);
      setEditImage(base64Result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Drag & Drop event handlers
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
      processFile(files[0]);
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      toast.error('All profile fields are required.');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          profileImage: editImage
        })
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Failed to update profile details.');
        return;
      }

      // Update storage and state
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setIsEditModalOpen(false);
      toast.success('Roster profile updated successfully!', {
        description: 'Changes successfully saved back to the persistent database.'
      });

      // Quick reload to refresh dashboard UI fully in sync
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      toast.error('Connection failed.', { description: 'Check server state connectivity and try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const activeLink = links.find(link => location.pathname === link.path || location.pathname.startsWith(link.path + '/'));

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
    <div className="min-h-screen bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 light:bg-slate-50 light:text-slate-900 flex font-sans relative overflow-hidden transition-colors duration-300">
      <Toaster position="top-right" theme={theme === 'dark' ? 'dark' : 'light'} />
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200/5 dark:border-white/10 bg-slate-900/40 dark:bg-white/5 light:bg-slate-100/90 flex-shrink-0 flex flex-col z-10 transition-all duration-300">
        <div className="h-20 flex items-center px-6 border-b border-slate-200/5 dark:border-white/10 bg-slate-950/20 dark:bg-transparent light:bg-slate-200/20">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-emerald-400 p-2 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900">MedFlow+</span>
          </Link>
        </div>
        
        <div className="p-4 flex-1">
          <div className="text-xs font-semibold text-slate-450 dark:text-slate-400 light:text-slate-500 uppercase tracking-widest mb-4 px-2">Menu</div>
          <nav className="space-y-1.5">
            {links.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/dashboard/patient' && link.path !== '/dashboard/doctor' && link.path !== '/dashboard/admin' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all border border-transparent",
                    isActive
                      ? "bg-blue-600/10 text-blue-500 dark:bg-white/10 dark:text-blue-400 border-slate-200/5 dark:border-white/10 shadow-lg shadow-black/10"
                      : "text-slate-400 dark:text-slate-400 light:text-slate-600 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-200/60 hover:text-slate-200 light:hover:text-slate-900",
                    link.special && "text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20"
                  )}
                >
                  <link.icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-500 dark:text-blue-400" : "text-slate-450 dark:text-slate-400 light:text-slate-500", link.special && "text-red-400 animate-pulse")} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between px-2 py-2 mb-2 group">
            <div className="flex items-center space-x-3">
              <Avatar className="h-9 w-9 border border-white/25">
                {currentUser?.profileImage ? (
                  <AvatarImage src={currentUser.profileImage} alt={currentUser.name} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                  {(currentUser?.name || userName).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden max-w-[110px]">
                <span className="text-sm font-medium text-white truncate">{currentUser?.name || userName}</span>
                <span className="text-xs text-slate-400 capitalize">{role}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Edit Profile"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all text-left cursor-pointer">
            <LogOut className="mr-3 h-5 w-5 text-slate-400 hover:text-red-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col z-10 relative">
        <header className="h-20 border-b border-slate-200/5 dark:border-white/10 bg-slate-900/40 dark:bg-white/5 light:bg-slate-100/60 backdrop-blur-md flex items-center px-8 justify-between sticky top-0 z-10 transition-all duration-350">
          <h1 className="text-xl font-bold tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900 capitalize">
            {activeLink ? activeLink.name : `${role} Portal`}
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all duration-200 bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 light:bg-slate-200/50 light:hover:bg-slate-200 text-slate-350 dark:text-slate-400 light:text-slate-705 cursor-pointer"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400 animate-pulse" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-600" />
              )}
            </button>
          </div>
        </header>
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>

      {/* Profile Edit Modal */}
      {isEditModalOpen && (
        <div id="profile-modal" className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0f172a] dark:bg-[#0f172a] light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative animate-scale-up transition-colors duration-305">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-emerald-400" />
            
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-blue-400" />
                  Account Profile Settings
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure your personal credentials and clinic roster profile</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
              {/* Profile Image Upload & Drag-Drop */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Profile Image / Avatar</label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 border-2 border-blue-500/30 ring-4 ring-blue-500/10">
                    <AvatarImage src={imagePreview} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-lg text-white font-bold">
                      {editName.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Drag-and-drop Image Area */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "flex-1 border border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1 bg-white/5",
                      isDragging ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/20"
                    )}
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Upload className="w-5 h-5 text-slate-400" />
                    <p className="text-xs text-slate-300 font-medium">
                      Drag & drop your photo or <span className="text-blue-400 hover:underline">browse files</span>
                    </p>
                    <p className="text-[10px] text-slate-500">Max size 2MB (PNG, JPG/JPEG)</p>
                    <input 
                      type="file" 
                      id="avatar-upload"
                      accept="image/*"
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                {/* Optional URL Input */}
                <div className="pt-2">
                  <input 
                    type="text"
                    placeholder="Alternatively, enter a custom image Web URL..."
                    value={editImage}
                    onChange={(e) => {
                      setEditImage(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Full Roster Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Jane Smith"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Communication Email Address</label>
                <input 
                  type="email"
                  required
                  placeholder="jane.smith@medflow.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Display Roster Role */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center">
                  <Shield className="w-4 h-4 mr-1.5 text-emerald-400" />
                  Security Role Hierarchy
                </span>
                <span className="font-bold text-emerald-400 capitalize px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">{role} Account</span>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-1/2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-1/2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {isSaving ? 'Saving Roster...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
