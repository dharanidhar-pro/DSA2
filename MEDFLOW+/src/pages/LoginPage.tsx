import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast, Toaster } from "sonner";
import {
  Activity,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Stethoscope,
  KeyRound,
  Eye,
  EyeOff
} from "lucide-react";

type AuthMode = "signin" | "signup" | "forgot" | "reset";

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailPlaceholder, setResetEmailPlaceholder] = useState("");
  const [mockResetKey, setMockResetKey] = useState<string | null>(null);

  const navigate = useNavigate();

  // React Hook Form for Sign In
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    setValue: setLoginValue,
    reset: resetLoginForm
  } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // React Hook Form for Sign Up
  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    watch: signupWatch,
    formState: { errors: signupErrors },
    reset: resetSignupForm
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "patient" as "patient" | "doctor"
    }
  });

  // React Hook Form for Forgot Password
  const {
    register: forgotRegister,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
    reset: resetForgotForm
  } = useForm({
    defaultValues: {
      email: ""
    }
  });

  // React Hook Form for Reset Password
  const {
    register: resetRegister,
    handleSubmit: handleResetSubmit,
    watch: resetWatch,
    formState: { errors: resetErrors },
    setValue: setResetValue,
    reset: resetResetForm
  } = useForm({
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const watchSignupPassword = signupWatch("password");
  const watchResetPassword = resetWatch("newPassword");

  // Login handler
  const onLogin = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (res.ok) {
        toast.success("Welcome back! Securely logging you in...", {
          description: `Access granted for ${result.user.name}`
        });

        // Store user and token in localStorage
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("currentUser", JSON.stringify(result.user));

        // Delay slightly for visual effect
        setTimeout(() => {
          if (result.user.role === "patient") navigate("/dashboard/patient");
          else if (result.user.role === "doctor") navigate("/dashboard/doctor");
          else if (result.user.role === "admin") navigate("/dashboard/admin");
        }, 1200);
      } else {
        toast.error(result.error || "Authentication failed.");
      }
    } catch (e) {
      toast.error("Network connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Signup handler
  const onSignup = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (res.ok) {
        toast.success("Account registered securely!", {
          description: "Routing to your healthcare portal..."
        });

        localStorage.setItem("authToken", result.token);
        localStorage.setItem("currentUser", JSON.stringify(result.user));

        setTimeout(() => {
          if (result.user.role === "patient") navigate("/dashboard/patient");
          else if (result.user.role === "doctor") navigate("/dashboard/doctor");
        }, 1200);
      } else {
        toast.error(result.error || "Signup error occurred.");
      }
    } catch (e) {
      toast.error("Network error. Could not register account.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password helper
  const onForgot = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (res.ok) {
        setResetEmailPlaceholder(data.email);
        setMockResetKey(result.resetCode);
        setResetValue("email", data.email);

        toast.info("A bypass reset code has been generated", {
          description: `Code: ${result.resetCode}. Copying logic enabled.`,
          duration: 10000
        });

        // Show verification reset form
        setMode("reset");
      } else {
        toast.error(result.error || "Email not discovered in system.");
      }
    } catch (e) {
      toast.error("Could not process forgot password dispatch.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password helper
  const onReset = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword
        })
      });
      const result = await res.json();

      if (res.ok) {
        toast.success("Security credentials updated! Please log in now.");
        setMockResetKey(null);
        setMode("signin");
        resetResetForm();
        resetLoginForm();
      } else {
        toast.error(result.error || "Failed to update security credentials.");
      }
    } catch (e) {
      toast.error("Communication error updating credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col md:flex-row relative font-sans overflow-hidden">
      <Toaster position="top-right" theme="dark" closeButton />

      {/* Decorative Radial Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[200px] pointer-events-none" />

      {/* Back to Home Action Button */}
      <div className="absolute top-6 left-6 z-30">
        <Link
          to="/"
          className="inline-flex items-center text-slate-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-2" />
          Back to Home
        </Link>
      </div>

      {/* LEFT SPLIT PANEL: Hospital Illustration & Branding */}
      <div className="hidden md:flex md:w-1/2 bg-[#090e1a] border-r border-white/5 flex-col justify-between p-12 relative overflow-hidden">
        {/* Animated matrix dots */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="z-10 mt-12">
          <div className="inline-flex items-center space-x-3 mb-6 bg-blue-500/10 px-4 py-2 border border-blue-500/20 rounded-2xl">
            <Activity className="h-6 w-6 text-blue-400 animate-pulse" />
            <span className="text-sm font-extrabold text-blue-400 tracking-wider">MEDFLOW+ ENTERPRISE</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] tracking-tight max-w-lg">
            Smart, unified care delivery for patients & specialists.
          </h2>

          <p className="text-slate-400 mt-4 text-sm max-w-md leading-relaxed">
            From hospital bed balancing, real-time diagnostic visualizers, to immediate dispatch route optimization, MedFlow+ streamlines hospital ops so you can focus on life.
          </p>
        </div>

        {/* Feature Cards or Testimonials */}
        <div className="z-10 grid grid-cols-2 gap-4 max-w-md">
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
            <ShieldCheck className="w-6 h-6 text-blue-400 mb-2" />
            <h4 className="text-white text-xs font-bold font-sans">Role-Based Gateways</h4>
            <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Strict HIPAA & JWT encrypted barriers protecting clinical data portals.</p>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
            <Stethoscope className="w-6 h-6 text-emerald-400 mb-2" />
            <h4 className="text-white text-xs font-bold font-sans">Real-time Analytics</h4>
            <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Dynamic visualization of system nodes, queue loads, and routing.</p>
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10 text-[11px] text-slate-500 tracking-wide font-mono flex justify-between">
          <span>SECURED WITH SHA-256 / JWT</span>
          <span>© 2026 MEDFLOW INC.</span>
        </div>
      </div>

      {/* RIGHT SPLIT PANEL: Auth Forms Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 z-10">
        <div className="w-full max-w-md pt-12 md:pt-0">
          {/* Header on mobile */}
          <div className="flex flex-col items-center mb-6 md:hidden">
            <div className="bg-gradient-to-br from-blue-500 to-emerald-400 p-2.5 rounded-2xl mb-3 shadow-lg shadow-blue-500/20">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">MedFlow+</h1>
          </div>

          <Card className="bg-white/5 border-white/10 rounded-[32px] backdrop-blur-md text-white shadow-2xl p-2 md:p-4 overflow-hidden relative border">
            <CardContent className="pt-6">
              <AnimatePresence mode="wait">
                {/* SIGN IN FORM */}
                {mode === "signin" && (
                  <motion.div
                    key="signin"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-white mb-1.5 flex items-center">
                        Welcome Back <span className="ml-2 animate-pulse">👋</span>
                      </h2>
                      <p className="text-slate-400 text-xs">Enter your registered credentials to access your gateway portal.</p>
                    </div>

                    <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-slate-300 font-semibold text-xs tracking-wider uppercase">Email address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="doctor@medflow.com"
                            className="bg-white/5 border-white/10 rounded-xl focus:ring-blue-500/30 text-white placeholder-slate-500 text-sm h-11 pl-11"
                            {...loginRegister("email", {
                              required: "Email is required",
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Enter a valid email address"
                              }
                            })}
                          />
                        </div>
                        {loginErrors.email && (
                          <div className="text-red-400 text-[11px] flex items-center mt-1">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {loginErrors.email.message}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password" className="text-slate-300 font-semibold text-xs tracking-wider uppercase">Password</Label>
                          <button
                            type="button"
                            onClick={() => setMode("forgot")}
                            className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="bg-white/5 border-white/10 rounded-xl focus:ring-blue-500/30 text-white placeholder-slate-500 text-sm h-11 pl-11 pr-10"
                            {...loginRegister("password", {
                              required: "Password is required"
                            })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {loginErrors.password && (
                          <div className="text-red-400 text-[11px] flex items-center mt-1">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {loginErrors.password.message}
                          </div>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold rounded-xl h-11 border-none shadow-lg shadow-blue-500/10 mt-6"
                      >
                        {isLoading ? "Signing in securely..." : "Sign In Portal"}
                      </Button>
                    </form>

                    {/* Quick Access/Demo Portals Block */}
                    <div className="border-t border-white/5 pt-4 mt-6">
                      <div className="text-slate-400 text-[11px] font-semibold tracking-wider uppercase mb-2.5 text-center">
                        🔒 Demo Quick-Access Portals
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setLoginValue("email", "admin@medflow.com");
                            setLoginValue("password", "password");
                            toast.success("Loaded Admin security token!");
                          }}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs py-2 px-1 rounded-xl transition-all border border-red-500/20 active:scale-95 cursor-pointer"
                        >
                          🔑 Admin Portal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginValue("email", "doctor@medflow.com");
                            setLoginValue("password", "password");
                            toast.success("Loaded Specialist security token!");
                          }}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs py-2 px-1 rounded-xl transition-all border border-emerald-500/20 active:scale-95 cursor-pointer"
                        >
                          ⚕️ Doctor Portal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginValue("email", "patient@medflow.com");
                            setLoginValue("password", "password");
                            toast.success("Loaded Patient security token!");
                          }}
                          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-bold text-xs py-2 px-1 rounded-xl transition-all border border-blue-500/20 active:scale-95 cursor-pointer"
                        >
                          👤 Patient Portal
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-center text-slate-400 mt-4 border-t border-white/5 pt-4">
                      Are you a new specialist or patient?{" "}
                      <button
                        onClick={() => {
                          setMode("signup");
                          resetSignupForm();
                        }}
                        className="text-blue-400 font-bold hover:underline"
                      >
                        Create account
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* SIGN UP FORM */}
                {mode === "signup" && (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-white mb-1.5 flex items-center">
                        Portal Registration
                      </h2>
                      <p className="text-slate-400 text-xs">Establish credentials for Patient or Doctor dashboard access.</p>
                    </div>

                    <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-name" className="text-slate-300 font-semibold text-xs tracking-wider uppercase">Full name</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Dr. John Doe / Jane Smith"
                            className="bg-white/5 border-white/10 rounded-xl focus:ring-blue-500/30 text-white placeholder-slate-500 text-sm h-11 pl-11"
                            {...signupRegister("name", { required: "Full name is required" })}
                          />
                        </div>
                        {signupErrors.name && (
                          <div className="text-red-400 text-[11px] flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {signupErrors.name.message}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="signup-email" className="text-slate-300 font-semibold text-xs tracking-wider uppercase">Email address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="name@example.com"
                            className="bg-white/5 border-white/10 rounded-xl focus:ring-blue-500/30 text-white placeholder-slate-500 text-sm h-11 pl-11"
                            {...signupRegister("email", {
                              required: "Email address is required",
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Enter a valid email address"
                              }
                            })}
                          />
                        </div>
                        {signupErrors.email && (
                          <div className="text-red-400 text-[11px] flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {signupErrors.email.message}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="signup-password" className="text-slate-300 font-semibold text-xs tracking-wider uppercase">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="bg-white/5 border-white/10 rounded-xl focus:ring-blue-500/30 text-white placeholder-slate-500 text-sm h-11 pl-11 pr-10"
                            {...signupRegister("password", {
                              required: "Password is required",
                              pattern: {
                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message: "Password requires 8+ chars, uppercase, lowercase, number, and special character"
                              }
                            })}
                          />
                        </div>
                        {signupErrors.password && (
                          <div className="text-red-400 text-[11px] leading-snug">
                            {signupErrors.password.message}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="signup-confirm" className="text-slate-300 font-semibold text-xs tracking-wider uppercase">Confirm password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <Input
                            id="signup-confirm"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="bg-white/5 border-white/10 rounded-xl focus:ring-blue-500/30 text-white placeholder-slate-500 text-sm h-11 pl-11"
                            {...signupRegister("confirmPassword", {
                              required: "Confirmation is required",
                              validate: (val: string) => {
                                if (val !== watchSignupPassword) {
                                  return "Passwords do not match";
                                }
                              }
                            })}
                          />
                        </div>
                        {signupErrors.confirmPassword && (
                          <div className="text-red-400 text-[11px] flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {signupErrors.confirmPassword.message}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 font-semibold text-xs tracking-wider uppercase">Your Platform Role</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className={`flex items-center justify-between px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                            signupWatch("role") === "patient"
                              ? "bg-blue-600/20 border-blue-500 text-blue-400"
                              : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                          }`}>
                            <span className="text-xs font-bold flex items-center">
                              <User className="w-3.5 h-3.5 mr-2" />
                              Patient
                            </span>
                            <input
                              type="radio"
                              value="patient"
                              className="sr-only"
                              {...signupRegister("role")}
                            />
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${signupWatch("role") === "patient" ? "border-blue-500" : "border-slate-500"}`}>
                              {signupWatch("role") === "patient" && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                            </div>
                          </label>

                          <label className={`flex items-center justify-between px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                            signupWatch("role") === "doctor"
                              ? "bg-emerald-600/20 border-emerald-500 text-emerald-400"
                              : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                          }`}>
                            <span className="text-xs font-bold flex items-center">
                              <Stethoscope className="w-3.5 h-3.5 mr-2" />
                              Doctor
                            </span>
                            <input
                              type="radio"
                              value="doctor"
                              className="sr-only"
                              {...signupRegister("role")}
                            />
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${signupWatch("role") === "doctor" ? "border-emerald-500" : "border-slate-500"}`}>
                              {signupWatch("role") === "doctor" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                            </div>
                          </label>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold rounded-xl h-11 border-none shadow-lg shadow-blue-500/10 mt-3"
                      >
                        {isLoading ? "Creating HIPAA-compliant account..." : "Complete Registration"}
                      </Button>
                    </form>

                    <div className="text-xs text-center text-slate-400 mt-2 border-t border-white/5 pt-3">
                      Already have access?{" "}
                      <button
                        onClick={() => setMode("signin")}
                        className="text-blue-400 font-bold hover:underline"
                      >
                        Sign in now
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* FORGOT PASSWORD FORM */}
                {mode === "forgot" && (
                  <motion.div
                    key="forgot"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-white mb-1.5">Reset Gateway Key</h2>
                      <p className="text-slate-400 text-xs text-left">We will initiate a credentials recovery pipeline. Enter your registered email address.</p>
                    </div>

                    <form onSubmit={handleForgotSubmit(onForgot)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email" className="text-slate-300 font-semibold text-xs tracking-wider uppercase">Email address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="doctor@medflow.com"
                            className="bg-white/5 border-white/10 rounded-xl focus:ring-blue-500/30 text-white placeholder-slate-500 text-sm h-11 pl-11"
                            {...forgotRegister("email", {
                              required: "Registered email is required",
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Enter a valid email address"
                              }
                            })}
                          />
                        </div>
                        {forgotErrors.email && (
                          <div className="text-red-400 text-[11px] flex items-center mt-1">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {forgotErrors.email.message}
                          </div>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold rounded-xl h-11 border-none shadow-lg shadow-blue-500/10 mt-6"
                      >
                        {isLoading ? "Validating email..." : "Dispatched Secret Token"}
                      </Button>
                    </form>

                    <div className="text-xs text-center text-slate-400 mt-4 border-t border-white/5 pt-4">
                      Remember login details?{" "}
                      <button
                        onClick={() => setMode("signin")}
                        className="text-blue-400 font-bold hover:underline"
                      >
                        Sign In Page
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* RESET PASSWORD FORM */}
                {mode === "reset" && (
                  <motion.div
                    key="reset"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-white mb-1.5 flex items-center">
                        <KeyRound className="w-5 h-5 mr-2 text-emerald-400" /> Establish New Key
                      </h2>
                      <p className="text-slate-400 text-xs">Verify credentials and input your updated password.</p>
                    </div>

                    {mockResetKey && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-emerald-400 text-xs space-y-1 mt-1 leading-relaxed">
                        <div className="font-bold flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                          Secured Verification Code Dispatched!
                        </div>
                        <p className="text-slate-300">Offline developer bypass code is: <strong className="font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-sm">{mockResetKey}</strong></p>
                      </div>
                    )}

                    <form onSubmit={handleResetSubmit(onReset)} className="space-y-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="reset-email" className="text-slate-300 font-semibold text-xs tracking-wider uppercase">Email address</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          readOnly
                          className="bg-white/5 border-white/10 rounded-xl focus:ring-blue-500/30 text-white placeholder-slate-500 text-sm h-11"
                          {...resetRegister("email", { required: "Email is required" })}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="reset-newPassword" className="text-slate-300 font-semibold text-xs tracking-wider uppercase">New Password</Label>
                        <Input
                          id="reset-newPassword"
                          type="password"
                          placeholder="••••••••"
                          className="bg-white/5 border-white/10 rounded-xl focus:ring-blue-500/30 text-white placeholder-slate-500 text-sm h-11"
                          {...resetRegister("newPassword", {
                            required: "New password is required",
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                              message: "8+ characters, uppercase, lowercase, number, and special glyph required"
                            }
                          })}
                        />
                        {resetErrors.newPassword && (
                          <div className="text-red-400 text-[11px] leading-snug">
                            {resetErrors.newPassword.message}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="reset-confirm" className="text-slate-300 font-semibold text-xs tracking-wider uppercase">Confirm New Password</Label>
                        <Input
                          id="reset-confirm"
                          type="password"
                          placeholder="••••••••"
                          className="bg-white/5 border-white/10 rounded-xl focus:ring-blue-500/30 text-white placeholder-slate-500 text-sm h-11"
                          {...resetRegister("confirmPassword", {
                            required: "Password confirmation is required",
                            validate: (val: string) => {
                              if (val !== watchResetPassword) {
                                return "Passwords do not match";
                              }
                            }
                          })}
                        />
                        {resetErrors.confirmPassword && (
                          <div className="text-red-400 text-[11px] flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {resetErrors.confirmPassword.message}
                          </div>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-bold rounded-xl h-11 border-none shadow-lg shadow-emerald-500/10 mt-3"
                      >
                        {isLoading ? "Applying credentials override..." : "Confirm Credentials Override"}
                      </Button>
                    </form>

                    <div className="text-xs text-center text-slate-400 mt-2 border-t border-white/5 pt-3">
                      Go back to{" "}
                      <button
                        onClick={() => setMode("signin")}
                        className="text-blue-400 font-bold hover:underline"
                      >
                        Sign In Gate
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
