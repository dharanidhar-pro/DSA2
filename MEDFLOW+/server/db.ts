import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Check if MONGODB_URI is provided
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;
let isUsingMongoDB = false;

// Defining Schema for MongoDB Mongoose
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
  profileImage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

export const MongoUser = (mongoose.models.User || mongoose.model("User", UserSchema)) as any;

// Fallback Local JSON Persistent DB implementation
const LOCAL_DB_PATH = path.join(process.cwd(), "data", "users.json");

// Ensure the data directory exists
const ensureDirectoryExists = () => {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Initial system users
const DEFAULT_USERS = [
  {
    id: "admin-id-1",
    name: "System Admin",
    email: "admin@medflow.com",
    // default bcrypt hash for "password" to keep it fully real-world
    password: "$2a$10$n8R9q8hK.Kq.G5E8GqAIOuM6c7Bv07Gqy927zY9XbOaKzVbCOWb7q", 
    role: "admin",
    profileImage: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date("2026-05-22T00:00:00.000Z")
  },
  {
    id: "doctor-id-1",
    name: "Dr. John Doe",
    email: "doctor@medflow.com",
    // default bcrypt hash for "password"
    password: "$2a$10$n8R9q8hK.Kq.G5E8GqAIOuM6c7Bv07Gqy927zY9XbOaKzVbCOWb7q",
    role: "doctor",
    profileImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date("2026-05-22T00:00:00.000Z")
  },
  {
    id: "patient-id-1",
    name: "Jane Smith",
    email: "patient@medflow.com",
    // default bcrypt hash for "password"
    password: "$2a$10$n8R9q8hK.Kq.G5E8GqAIOuM6c7Bv07Gqy927zY9XbOaKzVbCOWb7q",
    role: "patient",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date("2026-05-22T00:00:00.000Z")
  }
];

export const readLocalUsers = (): any[] => {
  ensureDirectoryExists();
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(DEFAULT_USERS, null, 2));
    return DEFAULT_USERS;
  }
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read local DB, resetting to defaults", error);
    return DEFAULT_USERS;
  }
};

export const writeLocalUsers = (users: any[]) => {
  ensureDirectoryExists();
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(users, null, 2));
};

// Seed default users if using MongoDB and the database is fresh
const seedDefaultUsersIfNecessary = async () => {
  try {
    const count = await MongoUser.countDocuments();
    if (count === 0) {
      console.log("🌱 MongoDB User collection is currently empty. Seeding default demo profiles...");
      for (const u of DEFAULT_USERS) {
        const user = new MongoUser({
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          profileImage: u.profileImage,
          createdAt: u.createdAt
        });
        await user.save();
      }
      console.log("🌱 Default profiles successfully registered inside MongoDB.");
    }
  } catch (err) {
    console.error("🔴 Failed to seed default system accounts in MongoDB:", err);
  }
};

// Establish Database Connection
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(async () => {
      isUsingMongoDB = true;
      console.log("🟢 Successfully connected to MONGODB database.");
      await seedDefaultUsersIfNecessary();
    })
    .catch((err) => {
      console.error("🔴 Error connecting to MongoDB:", err.message);
      console.log("⚠️ Falling back to Local Persistence Storage.");
    });
} else {
  console.log("⚠️ No MONGODB_URI found. Utilizing secure Local Persistence (JSON Engine) for users.");
}

// Unified Database Provider
export const dbService = {
  isMongo: () => isUsingMongoDB,

  async findUserByEmail(email: string) {
    const searchEmail = email.toLowerCase().trim();
    if (isUsingMongoDB) {
      return await MongoUser.findOne({ email: searchEmail });
    } else {
      const users = readLocalUsers();
      const user = users.find((u) => u.email.toLowerCase() === searchEmail);
      if (user) {
        // Return MongoDB-like properties
        return {
          _id: user.id,
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        };
      }
      return null;
    }
  },

  async findUserById(id: string) {
    if (isUsingMongoDB) {
      return await MongoUser.findById(id);
    } else {
      const users = readLocalUsers();
      const user = users.find((u) => u.id === id);
      if (user) {
        return {
          _id: user.id,
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        };
      }
      return null;
    }
  },

  async createUser(userData: any) {
    if (isUsingMongoDB) {
      const user = new MongoUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        profileImage: userData.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userData.name)}`,
      });
      return await user.save();
    } else {
      const users = readLocalUsers();
      const newUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 11),
        name: userData.name,
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        role: userData.role,
        profileImage: userData.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userData.name)}`,
        createdAt: new Date()
      };
      users.push(newUser);
      writeLocalUsers(users);
      return {
        _id: newUser.id,
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profileImage: newUser.profileImage,
        createdAt: newUser.createdAt,
      };
    }
  },

  async updatePassword(email: string, newPasswordHash: string) {
    if (isUsingMongoDB) {
      return await MongoUser.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { password: newPasswordHash },
        { new: true }
      );
    } else {
      const users = readLocalUsers();
      const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (index !== -1) {
        users[index].password = newPasswordHash;
        writeLocalUsers(users);
        return true;
      }
      return false;
    }
  },

  async updateProfile(id: string, name: string, email: string, profileImage?: string) {
    const searchEmail = email.toLowerCase().trim();
    if (isUsingMongoDB) {
      return await MongoUser.findByIdAndUpdate(
        id,
        { name, email: searchEmail, ...(profileImage !== undefined ? { profileImage } : {}) },
        { new: true }
      );
    } else {
      const users = readLocalUsers();
      const index = users.findIndex(u => u.id === id);
      if (index !== -1) {
        users[index].name = name;
        users[index].email = searchEmail;
        if (profileImage !== undefined) {
          users[index].profileImage = profileImage;
        }
        writeLocalUsers(users);
        return {
          _id: users[index].id,
          id: users[index].id,
          name: users[index].name,
          email: users[index].email,
          role: users[index].role,
          profileImage: users[index].profileImage,
          createdAt: users[index].createdAt,
        };
      }
      return null;
    }
  }
};

const DEFAULT_HOSPITALS = [
  { id: "h1", name: "City General Hospital", lat: 40.7128, lng: -74.0060, beds: 120, rating: 4.5 },
  { id: "h2", name: "Downtown Medical Center", lat: 40.7150, lng: -74.0110, beds: 45, rating: 4.1 },
  { id: "h3", name: "Northside Clinic", lat: 40.7300, lng: -73.9900, beds: 10, rating: 3.9 }
];

const DEFAULT_EMERGENCIES = [
  {
    id: "emg-1",
    patientName: "Robert Vance",
    condition: "Acute Chest Pain",
    severity: "high",
    location: "45th Ave, Brooklyn",
    lat: 40.7250,
    lng: -74.0020,
    status: "Routing",
    hospitalId: "h1",
    createdAt: "2026-05-22T12:00:00.000Z"
  },
  {
    id: "emg-2",
    patientName: "Sarah Peterson",
    condition: "Severe Compound Fracture",
    severity: "medium",
    location: "8th Str, Manhattan",
    lat: 40.7180,
    lng: -74.0090,
    status: "Dispatched",
    hospitalId: "h2",
    createdAt: "2026-05-22T13:45:00.000Z"
  }
];

const HOSPITALS_DB_PATH = path.join(process.cwd(), "data", "hospitals.json");
const EMERGENCIES_DB_PATH = path.join(process.cwd(), "data", "emergencies.json");

export const readHospitals = (): any[] => {
  if (!fs.existsSync(HOSPITALS_DB_PATH)) {
    const dir = path.dirname(HOSPITALS_DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(HOSPITALS_DB_PATH, JSON.stringify(DEFAULT_HOSPITALS, null, 2));
    return DEFAULT_HOSPITALS;
  }
  try {
    return JSON.parse(fs.readFileSync(HOSPITALS_DB_PATH, "utf-8"));
  } catch {
    return DEFAULT_HOSPITALS;
  }
};

export const writeHospitals = (data: any[]) => {
  const dir = path.dirname(HOSPITALS_DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(HOSPITALS_DB_PATH, JSON.stringify(data, null, 2));
};

export const readEmergencies = (): any[] => {
  if (!fs.existsSync(EMERGENCIES_DB_PATH)) {
    const dir = path.dirname(EMERGENCIES_DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(EMERGENCIES_DB_PATH, JSON.stringify(DEFAULT_EMERGENCIES, null, 2));
    return DEFAULT_EMERGENCIES;
  }
  try {
    return JSON.parse(fs.readFileSync(EMERGENCIES_DB_PATH, "utf-8"));
  } catch {
    return DEFAULT_EMERGENCIES;
  }
};

export const writeEmergencies = (data: any[]) => {
  const dir = path.dirname(EMERGENCIES_DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(EMERGENCIES_DB_PATH, JSON.stringify(data, null, 2));
};
