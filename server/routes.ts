import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { insertTATContentSchema, insertWATContentSchema, insertSRTContentSchema } from "@shared/schema";
import { z } from "zod";
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
      
      // First try to find the user by email
      let user = await storage.getUserByEmail(email);
      
      // If not found, check if using username instead (for backward compatibility)
      if (!user) {
        user = await storage.getUserByUsername(email);
      }
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Update the last login timestamp
      await storage.updateUserLastLogin(user.id);
      
      // Return user info without password
      const { password: _, ...userInfo } = user;
      
      // Ensure we have an IST timestamp if lastLogin was null
      let lastLogin = user.lastLogin;
      if (!lastLogin) {
        const now = new Date();
        lastLogin = new Date(now.getTime() + (5 * 60 + 30) * 60000).toISOString(); // IST time
      }
      
      res.json({ 
        success: true, 
        user: {
          ...userInfo,
          lastLogin
        }
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
      
      const user = await storage.createUser({
        username,
        email,
        password,
        isAdmin: false,
        lastLogin: istTime
      });
      
      // Return user info without password
      const { password: _, ...userInfo } = user;
      res.status(201).json({ success: true, user: userInfo });
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
  
  app.post("/api/tat", isAuthenticated, async (req, res) => {
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
      const content = await storage.getActiveWATContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });
  
  app.post("/api/wat", isAuthenticated, async (req, res) => {
    try {
      // If it's an array of words
      if (Array.isArray(req.body)) {
        const wordsSchema = z.array(insertWATContentSchema);
        const parsedBody = wordsSchema.safeParse(req.body);
        if (!parsedBody.success) {
          return res.status(400).json({ message: "Invalid data", errors: parsedBody.error.format() });
        }
        
        const content = await storage.createManyWATContent(parsedBody.data);
        return res.status(201).json(content);
      }
      
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
      const content = await storage.getActiveSRTContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  });
  
  app.post("/api/srt", isAuthenticated, async (req, res) => {
    try {
      // If it's an array of scenarios
      if (Array.isArray(req.body)) {
        const scenariosSchema = z.array(insertSRTContentSchema);
        const parsedBody = scenariosSchema.safeParse(req.body);
        if (!parsedBody.success) {
          return res.status(400).json({ message: "Invalid data", errors: parsedBody.error.format() });
        }
        
        const content = await storage.createManySRTContent(parsedBody.data);
        return res.status(201).json(content);
      }
      
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
      const imageSet = getRandomTATImageSet();
      if (imageSet.length === 0) {
        return res.status(404).json({ message: "No TAT image sets available" });
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
