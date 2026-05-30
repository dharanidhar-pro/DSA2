import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity, Sun, Moon } from 'lucide-react';

export function Navbar() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Sync React state with document class list
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

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
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/5 bg-slate-900/40 dark:bg-slate-950/40 light:bg-slate-100/60 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto flex h-20 items-center px-4 md:px-8 justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-emerald-400 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 dark:from-white dark:to-slate-300 light:from-slate-900 light:to-slate-700">MedFlow+</span>
        </Link>
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide">
          <Link to="/" className="transition-colors text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-blue-400 dark:hover:text-blue-400 light:hover:text-blue-600">Home</Link>
          <a href="#features" className="transition-colors text-slate-400 dark:text-slate-400 light:text-slate-500 hover:text-blue-450 dark:hover:text-white light:hover:text-slate-900">Features</a>
          <Link to="/emergency" className="transition-all text-red-500 dark:text-red-400 hover:text-red-300 font-bold animate-pulse">Emergency SOS</Link>
        </div>
        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <Button 
            onClick={toggleTheme}
            variant="ghost" 
            className="text-slate-300 dark:text-slate-300 light:text-slate-800 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 p-2 rounded-xl"
            title="Toggle light/dark theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-400 animate-pulse" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-600" />
            )}
          </Button>

          <Link to="/login">
            <Button variant="ghost" className="text-slate-300 dark:text-slate-300 light:text-slate-800 hover:text-white dark:hover:text-white light:hover:text-slate-950 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 font-semibold">Sign In</Button>
          </Link>
          <Link to="/login">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none rounded-xl px-5 font-bold shadow-lg shadow-blue-500/20 text-white">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
