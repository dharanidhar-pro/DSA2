import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import path from "path";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import {
  dbService,
  MongoUser,
  readLocalUsers,
  writeLocalUsers,
  readHospitals,
  writeHospitals,
  readEmergencies,
  writeEmergencies
} from "./server/db";
import {
  handleSignup,
  handleLogin,
  handleForgotPassword,
  handleResetPassword,
  handleGetMe,
  verifyJWT
} from "./server/auth";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", mode: dbService.isMongo() ? "mongodb" : "local-persistence" });
  });

  // Authentication Endpoints
  app.post("/api/auth/signup", handleSignup);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/forgot-password", handleForgotPassword);
  app.post("/api/auth/reset-password", handleResetPassword);
  app.get("/api/auth/me", verifyJWT as any, handleGetMe as any);

  app.put("/api/auth/profile", verifyJWT as any, async (req: any, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Access denied. Authentication required." });
      }
      const { name, email, profileImage } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required fields." });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please provide a valid email address." });
      }

      const existing = await dbService.findUserByEmail(email);
      if (existing && String(existing.id || existing._id) !== String(req.user.id)) {
        return res.status(400).json({ error: "An account with this email address already exists." });
      }

      const updated = await dbService.updateProfile(req.user.id, name, email, profileImage);
      if (!updated) {
        return res.status(404).json({ error: "User profile not found." });
      }

      res.json({
        message: "Profile updated successfully!",
        user: {
          id: updated.id || updated._id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          profileImage: updated.profileImage,
          createdAt: updated.createdAt
        }
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile details." });
    }
  });

  // --- HOSPITALS API ---
  app.get("/api/hospitals", (req: Request, res: Response) => {
    try {
      const hList = readHospitals();
      res.json(hList);
    } catch (error) {
      res.status(500).json({ error: "Failed to load hospitals list" });
    }
  });

  app.post("/api/hospitals", (req: Request, res: Response) => {
    try {
      const { name, lat, lng, beds, rating } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });
      const hList = readHospitals();
      const newHospital = {
        id: "h_" + Math.random().toString(36).substring(2, 9),
        name,
        lat: Number(lat) || 40.7128,
        lng: Number(lng) || -74.0060,
        beds: Number(beds) || 20,
        rating: Number(rating) || 4.0
      };
      hList.push(newHospital);
      writeHospitals(hList);
      res.status(201).json(newHospital);
    } catch (error) {
      res.status(500).json({ error: "Failed to append medical facility" });
    }
  });

  app.put("/api/hospitals/:id", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, lat, lng, beds, rating } = req.body;
      const hList = readHospitals();
      const idx = hList.findIndex(h => h.id === id);
      if (idx === -1) return res.status(404).json({ error: "Hospital index not found" });

      hList[idx] = {
        ...hList[idx],
        name: name !== undefined ? name : hList[idx].name,
        lat: lat !== undefined ? Number(lat) : hList[idx].lat,
        lng: lng !== undefined ? Number(lng) : hList[idx].lng,
        beds: beds !== undefined ? Number(beds) : hList[idx].beds,
        rating: rating !== undefined ? Number(rating) : hList[idx].rating
      };

      writeHospitals(hList);
      res.json(hList[idx]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update hospital metrics" });
    }
  });

  app.delete("/api/hospitals/:id", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const hList = readHospitals();
      const filtered = hList.filter(h => h.id !== id);
      writeHospitals(filtered);
      res.json({ message: "Hospital deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete hospital profile" });
    }
  });

  // --- DOCTORS API ---
  app.get("/api/doctors", async (req: Request, res: Response) => {
    try {
      if (dbService.isMongo()) {
        const doctors = await MongoUser.find({ role: "doctor" }).select("-password").lean();
        res.json(doctors);
      } else {
        const users = readLocalUsers();
        const doctors = users
          .filter((u) => u.role === "doctor")
          .map(({ password, ...u }) => u);
        res.json(doctors);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to load doctors list" });
    }
  });

  app.post("/api/doctors", async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "All credentials are required to onboard specialist." });
      }

      const existing = await dbService.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "An account with that email already exists on MedFlow." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const doctor = await dbService.createUser({
        name,
        email,
        password: hashedPassword,
        role: "doctor"
      });

      res.status(201).json(doctor);
    } catch (error) {
      res.status(500).json({ error: "Failed to onboard medical specialist." });
    }
  });

  app.delete("/api/doctors/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (dbService.isMongo()) {
        await MongoUser.findByIdAndDelete(id);
      } else {
        const users = readLocalUsers();
        const filtered = users.filter((u) => u.id !== id);
        writeLocalUsers(filtered);
      }
      res.json({ message: "Specialist profile terminated successfully." });
    } catch (error) {
      res.status(500).json({ error: "Failed to terminate specialist profile." });
    }
  });

  // --- EMERGENCIES API ---
  app.get("/api/emergencies", (req: Request, res: Response) => {
    try {
      const emgList = readEmergencies();
      res.json(emgList);
    } catch (error) {
      res.status(500).json({ error: "Failed to load active emergencies list" });
    }
  });

  app.post("/api/emergencies", (req: Request, res: Response) => {
    try {
      const { patientName, condition, severity, location, lat, lng, hospitalId } = req.body;
      if (!patientName || !condition) {
        return res.status(400).json({ error: "Patient name and clinical condition are required" });
      }
      const emgList = readEmergencies();
      const newEmergency = {
        id: "emg_" + Math.random().toString(36).substring(2, 9),
        patientName,
        condition,
        severity: severity || "medium",
        location: location || "Downtown Plaza",
        lat: Number(lat) || 40.7200,
        lng: Number(lng) || -74.0050,
        status: "Routing",
        hospitalId: hospitalId || "h1",
        createdAt: new Date().toISOString()
      };
      emgList.push(newEmergency);
      writeEmergencies(emgList);
      res.status(201).json(newEmergency);
    } catch (error) {
      res.status(500).json({ error: "Failed to log emergency dispatch event" });
    }
  });

  app.patch("/api/emergencies/:id", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, hospitalId } = req.body;
      const emgList = readEmergencies();
      const idx = emgList.findIndex(e => e.id === id);
      if (idx === -1) return res.status(404).json({ error: "Emergency report not found" });

      if (status !== undefined) emgList[idx].status = status;
      if (hospitalId !== undefined) emgList[idx].hospitalId = hospitalId;

      writeEmergencies(emgList);
      res.json(emgList[idx]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update emergency dispatch" });
    }
  });

  app.delete("/api/emergencies/:id", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const emgList = readEmergencies();
      const filtered = emgList.filter(e => e.id !== id);
      writeEmergencies(filtered);
      res.json({ message: "Emergency record dismissed." });
    } catch (error) {
      res.status(500).json({ error: "Failed to dismiss emergency report" });
    }
  });

  // --- AI HEALTH ASSISTANT API ---
  app.post("/api/ai/health-assistant", async (req: Request, res: Response) => {
    try {
      const { message, chatHistory } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured on MedFlow+ server. Please add your key under Settings > Secrets."
        });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const client = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const contents = [];
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const h of chatHistory) {
          contents.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.content }],
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: "You are 'MedFlow+ AI Assistant', a premium medical healthcare companion. Assist users with general inquiry, smart symptoms triage, ambulance navigation support, ICU bed inquiry, and recommended clinical departments. If symptoms indicate emergency (chest pain, breathing issues, heavy bleeding, stroke signs), immediately advise dialling emergency services, and provide sequential first-aid steps.",
        },
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini AI Assistant error:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with AI health core." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
