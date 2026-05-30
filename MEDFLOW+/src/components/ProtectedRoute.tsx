import { ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole: "patient" | "doctor" | "admin";
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("currentUser");

    if (!token || !savedUser) {
      toast.error("Access denied. Please log in first.");
      setIsAuthorized(false);
      return;
    }

    try {
      // Decode JWT payload on the client to inspect expiry
      const tokenParts = token.split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const nowInSeconds = Math.floor(Date.now() / 1000);

        // Check for token expiry
        if (payload.exp && nowInSeconds >= payload.exp) {
          toast.error("Your login session has expired. Please sign in again.");
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
          setIsAuthorized(false);
          return;
        }
      }

      // Check role authorization
      const user = JSON.parse(savedUser);
      if (user.role !== allowedRole) {
        toast.error(`Unauthorized portal. ${allowedRole.toUpperCase()} privilege required.`, {
          description: `Your profile role is: ${user.role}`
        });
        
        // Redirect to their own dashboard if possible
        if (user.role === "patient") {
          navigate("/dashboard/patient");
        } else if (user.role === "doctor") {
          navigate("/dashboard/doctor");
        } else if (user.role === "admin") {
          navigate("/dashboard/admin");
        } else {
          setIsAuthorized(false);
        }
        return;
      }

      setIsAuthorized(true);
    } catch (e) {
      console.error("Failed to parse local stored session:", e);
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
      setIsAuthorized(false);
    }
  }, [allowedRole, navigate]);

  if (isAuthorized === null) {
    // Elegant system validation check placeholder
    return (
      <div className="min-h-screen bg-[#070a13] flex flex-col items-center justify-center text-slate-300 font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4" />
        <p className="text-xs font-mono tracking-widest text-slate-500 uppercase">Validating Portal Security Clearance...</p>
      </div>
    );
  }

  if (isAuthorized === false) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
