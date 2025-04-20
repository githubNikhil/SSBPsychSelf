import {
  users, type User, type InsertUser,
  tatContent, type TATContent, type InsertTATContent,
  watContent, type WATContent, type InsertWATContent,
  srtContent, type SRTContent, type InsertSRTContent,
  studentSDTQuestions, type StudentSDTQuestion, type InsertStudentSDTQuestion,
  professionalSDTQuestions, type ProfessionalSDTQuestion, type InsertProfessionalSDTQuestion
} from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  
  // TAT content methods
  getAllTATContent(): Promise<TATContent[]>;
  getActiveTATContent(): Promise<TATContent[]>;
  createTATContent(content: InsertTATContent): Promise<TATContent>;
  updateTATContent(id: number, content: Partial<InsertTATContent>): Promise<TATContent | undefined>;
  deleteTATContent(id: number): Promise<boolean>;
  
  // WAT content methods
  getAllWATContent(): Promise<WATContent[]>;
  getActiveWATContent(): Promise<WATContent[]>;
  createWATContent(content: InsertWATContent): Promise<WATContent>;
  updateWATContent(id: number, content: Partial<InsertWATContent>): Promise<WATContent | undefined>;
  deleteWATContent(id: number): Promise<boolean>;
  createManyWATContent(contents: InsertWATContent[]): Promise<WATContent[]>;
  
  // SRT content methods
  getAllSRTContent(): Promise<SRTContent[]>;
  getActiveSRTContent(): Promise<SRTContent[]>;
  createSRTContent(content: InsertSRTContent): Promise<SRTContent>;
  updateSRTContent(id: number, content: Partial<InsertSRTContent>): Promise<SRTContent | undefined>;
  deleteSRTContent(id: number): Promise<boolean>;
  createManySRTContent(contents: InsertSRTContent[]): Promise<SRTContent[]>;
  
  // Student SDT question methods
  getAllStudentSDTQuestions(): Promise<StudentSDTQuestion[]>;
  getActiveStudentSDTQuestions(): Promise<StudentSDTQuestion[]>;
  createStudentSDTQuestion(question: InsertStudentSDTQuestion): Promise<StudentSDTQuestion>;
  updateStudentSDTQuestion(id: number, question: Partial<InsertStudentSDTQuestion>): Promise<StudentSDTQuestion | undefined>;
  deleteStudentSDTQuestion(id: number): Promise<boolean>;
  
  // Professional SDT question methods
  getAllProfessionalSDTQuestions(): Promise<ProfessionalSDTQuestion[]>;
  getActiveProfessionalSDTQuestions(): Promise<ProfessionalSDTQuestion[]>;
  createProfessionalSDTQuestion(question: InsertProfessionalSDTQuestion): Promise<ProfessionalSDTQuestion>;
  updateProfessionalSDTQuestion(id: number, question: Partial<InsertProfessionalSDTQuestion>): Promise<ProfessionalSDTQuestion | undefined>;
  deleteProfessionalSDTQuestion(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tatContents: Map<number, TATContent>;
  private watContents: Map<number, WATContent>;
  private srtContents: Map<number, SRTContent>;
  private studentSDTQuestions: Map<number, StudentSDTQuestion>;
  private professionalSDTQuestions: Map<number, ProfessionalSDTQuestion>;
  
  private userId: number;
  private tatContentId: number;
  private watContentId: number;
  private srtContentId: number;
  private studentSDTQuestionId: number;
  private professionalSDTQuestionId: number;

  constructor() {
    this.users = new Map();
    this.tatContents = new Map();
    this.watContents = new Map();
    this.srtContents = new Map();
    this.studentSDTQuestions = new Map();
    this.professionalSDTQuestions = new Map();
    
    this.userId = 1;
    this.tatContentId = 1;
    this.watContentId = 1;
    this.srtContentId = 1;
    this.studentSDTQuestionId = 1;
    this.professionalSDTQuestionId = 1;
    
    // Initialize with admin user
    this.createUser({
      username: "admin",
      email: "inikhilthhp@gmail.com",
      password: "Nikadmin26@", // In production, this would be hashed
      isAdmin: true,
      lastLogin: null
    });
    
    // Initialize with default content
    this.initializeDefaultContent();
  }

  private initializeDefaultContent() {
    // Default Student SDT questions
    const studentQuestions = [
      "What do your parents think about you?",
      "What do your teachers think about you?",
      "What do your friends think about you?",
      "What do you think about yourself?",
      "What would you like to be?"
    ];
    
    studentQuestions.forEach(question => {
      this.createStudentSDTQuestion({ question, active: true });
    });
    
    // Default Professional SDT questions
    const professionalQuestions = [
      "What do your colleagues think about you?",
      "What does your manager think of you?",
      "What do your subordinates think of you?",
      "What do you think about yourself?",
      "Where do you see yourself in the future?"
    ];
    
    professionalQuestions.forEach(question => {
      this.createProfessionalSDTQuestion({ question, active: true });
    });
    
    // Default WAT words (20 sample words)
    const watWords = [
      "Success", "Failure", "Leadership", "Challenge", "Family",
      "Friend", "Enemy", "Love", "Hate", "Work",
      "Play", "Fear", "Courage", "Money", "Health",
      "Happiness", "Sadness", "Life", "Death", "Future"
    ];
    
    watWords.forEach(word => {
      this.createWATContent({ word, active: true });
    });
    
    // Default SRT scenarios (10 sample scenarios)
    const srtScenarios = [
      "You are walking in a park when you notice a child crying and looking lost. What would you do?",
      "Your friend asks to borrow a significant amount of money. You know they have not repaid previous loans. How would you respond?",
      "You witness a colleague taking credit for your work during a meeting. What would you do?",
      "You find a wallet containing a large sum of money and identification. What actions would you take?",
      "You are offered a promotion that requires relocating to another city, but your family prefers to stay. How would you handle this situation?",
      "You notice a team member struggling with their workload but not asking for help. What would you do?",
      "While shopping, you notice someone shoplifting. How would you react?",
      "You receive an email that appears to be from your bank requesting personal information. What steps would you take?",
      "A friend shares confidential information about another mutual friend. How would you respond?",
      "You're driving and see an accident happen right in front of you. What would you do?"
    ];
    
    srtScenarios.forEach(scenario => {
      this.createSRTContent({ scenario, active: true });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    // Ensure isAdmin is always a boolean
    const isAdmin = insertUser.isAdmin === undefined ? false : insertUser.isAdmin;
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin,
      lastLogin: insertUser.lastLogin || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    // Get IST time (India Standard Time is UTC+5:30)
    const now = new Date();
    const istTime = new Date(now.getTime() + (5 * 60 + 30) * 60000).toISOString();
    
    const updatedUser: User = { 
      ...user, 
      lastLogin: istTime
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // TAT content methods
  async getAllTATContent(): Promise<TATContent[]> {
    return Array.from(this.tatContents.values());
  }

  async getActiveTATContent(): Promise<TATContent[]> {
    return Array.from(this.tatContents.values()).filter(content => content.active);
  }

  async createTATContent(content: InsertTATContent): Promise<TATContent> {
    const id = this.tatContentId++;
    // Ensure active property is always set to a boolean
    const active = content.active === undefined ? true : content.active;
    const tatContent: TATContent = { ...content, id, active };
    this.tatContents.set(id, tatContent);
    return tatContent;
  }

  async updateTATContent(id: number, content: Partial<InsertTATContent>): Promise<TATContent | undefined> {
    const existingContent = this.tatContents.get(id);
    if (!existingContent) return undefined;
    
    const updatedContent: TATContent = { ...existingContent, ...content };
    this.tatContents.set(id, updatedContent);
    return updatedContent;
  }

  async deleteTATContent(id: number): Promise<boolean> {
    return this.tatContents.delete(id);
  }

  // WAT content methods
  async getAllWATContent(): Promise<WATContent[]> {
    return Array.from(this.watContents.values());
  }

  async getActiveWATContent(): Promise<WATContent[]> {
    return Array.from(this.watContents.values()).filter(content => content.active);
  }

  async createWATContent(content: InsertWATContent): Promise<WATContent> {
    const id = this.watContentId++;
    // Ensure active property is always set to a boolean
    const active = content.active === undefined ? true : content.active;
    const watContent: WATContent = { ...content, id, active };
    this.watContents.set(id, watContent);
    return watContent;
  }

  async createManyWATContent(contents: InsertWATContent[]): Promise<WATContent[]> {
    return Promise.all(contents.map(content => this.createWATContent(content)));
  }

  async updateWATContent(id: number, content: Partial<InsertWATContent>): Promise<WATContent | undefined> {
    const existingContent = this.watContents.get(id);
    if (!existingContent) return undefined;
    
    const updatedContent: WATContent = { ...existingContent, ...content };
    this.watContents.set(id, updatedContent);
    return updatedContent;
  }

  async deleteWATContent(id: number): Promise<boolean> {
    return this.watContents.delete(id);
  }

  // SRT content methods
  async getAllSRTContent(): Promise<SRTContent[]> {
    return Array.from(this.srtContents.values());
  }

  async getActiveSRTContent(): Promise<SRTContent[]> {
    return Array.from(this.srtContents.values()).filter(content => content.active);
  }

  async createSRTContent(content: InsertSRTContent): Promise<SRTContent> {
    const id = this.srtContentId++;
    // Ensure active property is always set to a boolean
    const active = content.active === undefined ? true : content.active;
    const srtContent: SRTContent = { ...content, id, active };
    this.srtContents.set(id, srtContent);
    return srtContent;
  }

  async createManySRTContent(contents: InsertSRTContent[]): Promise<SRTContent[]> {
    return Promise.all(contents.map(content => this.createSRTContent(content)));
  }

  async updateSRTContent(id: number, content: Partial<InsertSRTContent>): Promise<SRTContent | undefined> {
    const existingContent = this.srtContents.get(id);
    if (!existingContent) return undefined;
    
    const updatedContent: SRTContent = { ...existingContent, ...content };
    this.srtContents.set(id, updatedContent);
    return updatedContent;
  }

  async deleteSRTContent(id: number): Promise<boolean> {
    return this.srtContents.delete(id);
  }

  // Student SDT question methods
  async getAllStudentSDTQuestions(): Promise<StudentSDTQuestion[]> {
    return Array.from(this.studentSDTQuestions.values());
  }

  async getActiveStudentSDTQuestions(): Promise<StudentSDTQuestion[]> {
    return Array.from(this.studentSDTQuestions.values()).filter(question => question.active);
  }

  async createStudentSDTQuestion(question: InsertStudentSDTQuestion): Promise<StudentSDTQuestion> {
    const id = this.studentSDTQuestionId++;
    // Ensure active property is always set to a boolean
    const active = question.active === undefined ? true : question.active;
    const sdtQuestion: StudentSDTQuestion = { ...question, id, active };
    this.studentSDTQuestions.set(id, sdtQuestion);
    return sdtQuestion;
  }

  async updateStudentSDTQuestion(id: number, question: Partial<InsertStudentSDTQuestion>): Promise<StudentSDTQuestion | undefined> {
    const existingQuestion = this.studentSDTQuestions.get(id);
    if (!existingQuestion) return undefined;
    
    const updatedQuestion: StudentSDTQuestion = { ...existingQuestion, ...question };
    this.studentSDTQuestions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async deleteStudentSDTQuestion(id: number): Promise<boolean> {
    return this.studentSDTQuestions.delete(id);
  }

  // Professional SDT question methods
  async getAllProfessionalSDTQuestions(): Promise<ProfessionalSDTQuestion[]> {
    return Array.from(this.professionalSDTQuestions.values());
  }

  async getActiveProfessionalSDTQuestions(): Promise<ProfessionalSDTQuestion[]> {
    return Array.from(this.professionalSDTQuestions.values()).filter(question => question.active);
  }

  async createProfessionalSDTQuestion(question: InsertProfessionalSDTQuestion): Promise<ProfessionalSDTQuestion> {
    const id = this.professionalSDTQuestionId++;
    // Ensure active property is always set to a boolean
    const active = question.active === undefined ? true : question.active;
    const sdtQuestion: ProfessionalSDTQuestion = { ...question, id, active };
    this.professionalSDTQuestions.set(id, sdtQuestion);
    return sdtQuestion;
  }

  async updateProfessionalSDTQuestion(id: number, question: Partial<InsertProfessionalSDTQuestion>): Promise<ProfessionalSDTQuestion | undefined> {
    const existingQuestion = this.professionalSDTQuestions.get(id);
    if (!existingQuestion) return undefined;
    
    const updatedQuestion: ProfessionalSDTQuestion = { ...existingQuestion, ...question };
    this.professionalSDTQuestions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async deleteProfessionalSDTQuestion(id: number): Promise<boolean> {
    return this.professionalSDTQuestions.delete(id);
  }
}

export const storage = new MemStorage();
