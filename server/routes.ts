import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { insertTATContentSchema, insertWATContentSchema, insertSRTContentSchema } from "@shared/schema";
import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';

const getRandomItems = (array: any[], count: number) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
import { upload, extractImagesFromPPTX, getRandomTATImageSet, handleUploadErrors } from "./pptHandler";

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
  const [email, password] = credentials.split(":");
  
  // Check if the credentials match our admin user
  storage.getUserByEmail(email)
    .then(async (user) => {
      if (!user) {
        // Let's also check by username for backward compatibility
        user = await storage.getUserByUsername(email);
      }
      
      if (!user || !user.isAdmin || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials or not an admin" });
      }
      
      // Update the last login timestamp for the admin
      await storage.updateUserLastLogin(user.id);
      
      next();
    })
    .catch(error => {
      res.status(500).json({ message: "Authentication error", error: error.message });
    });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.use("/api", (req, res, next) => {
    res.header("Cache-Control", "no-store");
    next();
  });
  
  // Authentication routes
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Read user credentials file
      const userCredsPath = path.join(process.cwd(), 'InhouseDB/user_creds.json');
      let userData;
      try {
        const userCredsData = await fs.readFile(userCredsPath, 'utf-8');
        userData = JSON.parse(userCredsData);
      } catch (error) {
        return res.status(500).json({ message: "Error reading user credentials" });
      }

      // Find user by email (case insensitive)
      const user = userData.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        return res.status(401).json({ message: "You need to register first" });
      }

      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login timestamp
      const now = new Date();
      const istTime = new Date(now.getTime() + (5 * 60 + 30) * 60000).toISOString();
      user.lastLogin = istTime;

      // Save updated user data back to file
      await fs.writeFile(userCredsPath, JSON.stringify(userData, null, 2));

      // Return user info without password
      const { password: _, ...userInfo } = user;
      
      res.json({ 
        success: true, 
        user: userInfo
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });
  
  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email and password are required" });
      }

      // Read existing users
      const userCredsPath = path.join(process.cwd(), 'InhouseDB/user_creds.json');
      let userData;
      try {
        const userCredsData = await fs.readFile(userCredsPath, 'utf-8');
        userData = JSON.parse(userCredsData);
      } catch (error) {
        // Initialize new users array if file doesn't exist
        userData = { users: [] };
      }

      // Check for existing email
      const existingUser = userData.users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Check if user with same email already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Check if user with same username already exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already in use" });
      }
      
      // Create the new user (non-admin by default)
      const now = new Date();
      const istTime = new Date(now.getTime() + (5 * 60 + 30) * 60000).toISOString(); // IST time
      
      // Add new user
      const newUser = {
        username,
        email,
        password,
        isAdmin: false,
        lastLogin: istTime
      };
      
      userData.users.push(newUser);
      await fs.writeFile(userCredsPath, JSON.stringify(userData, null, 2));
      
      // Return new user info without password
      const { password: _, ...userInfo } = newUser;
      res.status(201).json({ 
        success: true, 
        message: "Registered successfully, Please login",
        user: userInfo 
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });
  
  // TAT Content routes
  app.get("/api/tat", async (_, res) => {
    try {
      const content = await storage.getActiveTATContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });
  
  app.post("/api/tat", async (req, res) => {
    try {
      const parsedBody = insertTATContentSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsedBody.error.format() });
      }
      
      const content = await storage.createTATContent(parsedBody.data);
      res.status(201).json(content);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });
  
  app.delete("/api/tat/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteTATContent(id);
      if (!success) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });
  
  // WAT Content routes
  app.get("/api/wat", async (_, res) => {
    try {
      const watData = await fs.readFile(path.join(process.cwd(), 'InhouseDB/wat_list.json'), 'utf-8');
      const { words } = JSON.parse(watData);
      const randomWords = getRandomItems(words, 60);
      res.json(randomWords.map((word: string) => ({ word, active: true })));
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });
  
  app.post("/api/wat", async (req, res) => {
    try {
      const { words } = req.body;
      if (!Array.isArray(words)) {
        return res.status(400).json({ message: "Invalid data format" });
      }

      // Read existing WAT list
      const watPath = path.join(process.cwd(), 'InhouseDB/wat_list.json');
      let watData = { words: [] };
      try {
        const existingData = await fs.readFile(watPath, 'utf-8');
        watData = JSON.parse(existingData);
      } catch (error) {
        // File doesn't exist, use default empty array
      }

      // Add new words
      watData.words = [...new Set([...watData.words, ...words])];
      
      // Save back to file
      await fs.writeFile(watPath, JSON.stringify(watData, null, 2));
      
      return res.status(201).json({ success: true, message: "Words added successfully" });
      
      // If it's a single word
      const parsedBody = insertWATContentSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsedBody.error.format() });
      }
      
      const content = await storage.createWATContent(parsedBody.data);
      res.status(201).json(content);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });
  
  app.delete("/api/wat/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteWATContent(id);
      if (!success) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });
  
  // SRT Content routes
  app.get("/api/srt", async (_, res) => {
    try {
      const srtData = await fs.readFile(path.join(process.cwd(), 'InhouseDB/srt_list.json'), 'utf-8');
      const { scenarios } = JSON.parse(srtData);
      const randomScenarios = getRandomItems(scenarios, 60);
      res.json(randomScenarios.map((scenario: string) => ({ scenario, active: true })));
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });
  
  app.post("/api/srt", async (req, res) => {
    try {
      const { scenarios } = req.body;
      if (!Array.isArray(scenarios)) {
        return res.status(400).json({ message: "Invalid data format" });
      }

      // Read existing SRT list
      const srtPath = path.join(process.cwd(), 'InhouseDB/srt_list.json');
      let srtData = { scenarios: [] };
      try {
        const existingData = await fs.readFile(srtPath, 'utf-8');
        srtData = JSON.parse(existingData);
      } catch (error) {
        // File doesn't exist, use default empty array
      }

      // Add new scenarios
      srtData.scenarios = [...new Set([...srtData.scenarios, ...scenarios])];
      
      // Save back to file
      await fs.writeFile(srtPath, JSON.stringify(srtData, null, 2));
      
      return res.status(201).json({ success: true, message: "Scenarios added successfully" });
      
      // If it's a single scenario
      const parsedBody = insertSRTContentSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsedBody.error.format() });
      }
      
      const content = await storage.createSRTContent(parsedBody.data);
      res.status(201).json(content);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });
  
  app.delete("/api/srt/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteSRTContent(id);
      if (!success) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });
  
  // Student SDT Question routes
  app.get("/api/sdt/student", async (_, res) => {
    try {
      const questions = await storage.getActiveStudentSDTQuestions();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });
  
  // Professional SDT Question routes
  app.get("/api/sdt/professional", async (_, res) => {
    try {
      const questions = await storage.getActiveProfessionalSDTQuestions();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });

  // PPT Upload route for TAT images
  app.post("/api/upload/ppt", isAuthenticated, upload.single('ppt'), handleUploadErrors, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Extract images from the uploaded PPT
      const imageUrls = await extractImagesFromPPTX(req.file.path);
      
      if (imageUrls.length === 0) {
        return res.status(400).json({ message: "No images found in the PowerPoint file" });
      }
      
      res.status(201).json({ 
        success: true, 
        message: `Successfully extracted ${imageUrls.length} images from PPT`,
        images: imageUrls
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });

  // Get random TAT image set
  app.get("/api/tat/random-set", async (_, res) => {
    try {
      const imageSet = await getRandomTATImageSet();
      if (imageSet.length === 0) {
        return res.status(404).json({ message: "No TAT images available" });
      }
      
      res.json({ 
        success: true, 
        images: imageSet
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Serve static files from uploads directory
    const filePath = path.join(process.cwd(), req.url);
    res.sendFile(filePath, (err) => {
      if (err) {
        next();
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
