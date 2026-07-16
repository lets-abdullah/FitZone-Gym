import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB, readCollection, writeCollection } from "./db/mongodb";

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "fitzone_super_secret_jwt_key_2026";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "fitzone2026";

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS Configuration for Production & Development
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.FRONTEND_URL,
    process.env.APP_URL
  ].filter(Boolean) as string[];

  if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


// Database Auto-Connect Middleware (Guarantees connection is alive on Vercel and locally)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Database auto-connection failure in middleware:", err);
  }
  next();
});

// Middleware to enforce administrator authentication via signed cookie JWTs
const authenticateAdmin = (req: any, res: any, next: any) => {
  const token = req.cookies.fitzone_admin_token;
  if (!token) {
    return res.status(401).json({ error: "Access denied. Administrator authorization required." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.role === "admin") {
      req.admin = decoded;
      next();
    } else {
      res.status(403).json({ error: "Access denied. Invalid administrator token." });
    }
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired administrator token." });
  }
};

// Middleware to enforce regular user authentication
const authenticateUser = (req: any, res: any, next: any) => {
  const token = req.cookies.fitzone_token;
  if (!token) {
    return res.status(401).json({ error: "Access denied. Login required." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired login session." });
  }
};

// ==========================================
// USER AUTHENTICATION ENDPOINTS
// ==========================================

// User Signup
app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Registration parameters must be strings." });
  }

  const trimmedUsername = username.trim();
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
    return res.status(400).json({ error: "Registration parameters cannot be empty." });
  }
  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    return res.status(400).json({ error: "Username must be between 3 and 30 characters." });
  }
  if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
    return res.status(400).json({ error: "Invalid email address format." });
  }
  if (trimmedPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  try {
    const users = await readCollection("users");
    const exists = users.find(u => u.username.toLowerCase() === trimmedUsername.toLowerCase() || u.email.toLowerCase() === trimmedEmail.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: "Username or email address already registered." });
    }

    // Hash the password securely with bcrypt
    const hashedPassword = bcrypt.hashSync(trimmedPassword, 10);

    const newUser = {
      id: "u_" + Date.now(),
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeCollection("users", users);

    // Generate JWT token for automatic sign-in
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("fitzone_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
    });

    // Seed security action logs
    const logs = await readCollection("logs");
    logs.push({
      id: "log_" + Date.now(),
      time: new Date().toLocaleTimeString(),
      action: `New user '${username}' registered through secure signup portal`,
      category: "Security"
    });
    await writeCollection("logs", logs);

    res.json({ success: true, user: { id: newUser.id, username: newUser.username, email: newUser.email } });
  } catch (e) {
    console.error("Signup endpoint failure:", e);
    res.status(500).json({ error: "Internal server error during registration." });
  }
});

// User Login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Invalid login input format." });
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const users = await readCollection("users");
    const user = users.find(u => u.username.toLowerCase() === trimmedUsername.toLowerCase());
    
    // Compare cryptographically secure hashed password
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: "Invalid username or password credentials." });
    }

    // Generate secure session token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("fitzone_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
    });

    // Write audit logs
    const logs = await readCollection("logs");
    logs.push({
      id: "log_" + Date.now(),
      time: new Date().toLocaleTimeString(),
      action: `User '${username}' authenticated and logged into client interface`,
      category: "Security"
    });
    await writeCollection("logs", logs);

    res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
  } catch (e) {
    console.error("Login endpoint failure:", e);
    res.status(500).json({ error: "Internal server error during authentication." });
  }
});

// User Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("fitzone_token");
  res.json({ success: true });
});

// Verify Current User Session
app.get("/api/auth/me", (req, res) => {
  const token = req.cookies.fitzone_token;
  if (!token) {
    return res.status(401).json({ error: "No active login session." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return res.json({ success: true, user: { id: decoded.id, username: decoded.username, email: decoded.email } });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
});

// ==========================================
// CENTRAL ADMINISTRATOR ENDPOINTS
// ==========================================

// Admin Login
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Invalid login input format." });
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  if (trimmedUsername.toLowerCase() === ADMIN_USERNAME.toLowerCase() && trimmedPassword === ADMIN_PASSWORD) {
    // Generate admin session token
    const token = jwt.sign(
      { username: "admin", role: "admin" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("fitzone_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 Hours
    });

    try {
      const logs = await readCollection("logs");
      logs.push({
        id: "log_" + Date.now(),
        time: new Date().toLocaleTimeString(),
        action: "Administrator logged in through secure authentication",
        category: "Security"
      });
      await writeCollection("logs", logs);
    } catch (err) {
      console.warn("Failed syncing admin login audit logs:", err);
    }

    return res.json({ success: true });
  } else {
    return res.status(400).json({ error: "Invalid administrator credentials." });
  }
});

// Admin Logout
app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("fitzone_admin_token");
  res.json({ success: true });
});

// Verify Admin Session
app.get("/api/admin/me", (req, res) => {
  const token = req.cookies.fitzone_admin_token;
  if (!token) {
    return res.json({ isAuthenticated: false });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.role === "admin") {
      return res.json({ isAuthenticated: true, username: "admin" });
    }
  } catch (err) {}
  res.json({ isAuthenticated: false });
});

// ==========================================
// MEMBERS MODULE ENDPOINTS
// ==========================================

// Get Members (Admin Protected)
app.get("/api/members", authenticateAdmin, async (req, res) => {
  try {
    const members = await readCollection("members");
    res.json(members);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch members list" });
  }
});

// Save or Enroll Member (Public/User checkout available)
app.post("/api/members", async (req, res) => {
  const newMember = req.body;
  if (!newMember || typeof newMember !== "object") {
    return res.status(400).json({ error: "Invalid member data payload." });
  }

  const { id, name } = newMember;
  if (typeof id !== "string" || typeof name !== "string") {
    return res.status(400).json({ error: "Member id and name must be strings." });
  }

  const trimmedId = id.trim();
  const trimmedName = name.trim();

  if (!trimmedId || !trimmedName) {
    return res.status(400).json({ error: "Member id and name cannot be empty." });
  }

  // Sanitize input payload
  newMember.id = trimmedId;
  newMember.name = trimmedName;
  if (newMember.email && typeof newMember.email === "string") {
    newMember.email = newMember.email.trim();
  }

  try {
    const members = await readCollection("members");
    const index = members.findIndex(m => m.id === trimmedId);
    if (index >= 0) {
      members[index] = newMember;
    } else {
      members.push(newMember);
    }
    await writeCollection("members", members);

    const logs = await readCollection("logs");
    logs.push({
      id: "log_" + Date.now(),
      time: new Date().toLocaleTimeString(),
      action: `Member '${newMember.name}' enrollment / active pass class updated`,
      category: "Members"
    });
    await writeCollection("logs", logs);

    res.json({ success: true, members });
  } catch (e) {
    console.error("Save member endpoint error:", e);
    res.status(500).json({ error: "Failed to save member profile details." });
  }
});

// Delete Member (Admin Protected)
app.delete("/api/members/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({ error: "Invalid or missing member ID parameter." });
  }
  const trimmedId = id.trim();
  try {
    const members = await readCollection("members");
    const filtered = members.filter(m => m.id !== trimmedId);
    await writeCollection("members", filtered);

    const logs = await readCollection("logs");
    logs.push({
      id: "log_" + Date.now(),
      time: new Date().toLocaleTimeString(),
      action: `Member with registry ID '${trimmedId}' purged from system database`,
      category: "Members"
    });
    await writeCollection("logs", logs);

    res.json({ success: true, members: filtered });
  } catch (e) {
    console.error("Delete member endpoint error:", e);
    res.status(500).json({ error: "Failed to remove member profile" });
  }
});

// ==========================================
// SUPPLEMENT PRODUCTS CATALOG ENDPOINTS
// ==========================================

// Get Products Catalog (Public)
app.get("/api/products", async (req, res) => {
  try {
    const products = await readCollection("products");
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch products catalog" });
  }
});

// Add / Update Product (Admin Protected)
app.post("/api/products", authenticateAdmin, async (req, res) => {
  const newProduct = req.body;
  if (!newProduct || typeof newProduct !== "object") {
    return res.status(400).json({ error: "Invalid product data payload." });
  }

  const { id, name } = newProduct;
  if (typeof id !== "string" || typeof name !== "string") {
    return res.status(400).json({ error: "Product id and name must be strings." });
  }

  const trimmedId = id.trim();
  const trimmedName = name.trim();

  if (!trimmedId || !trimmedName) {
    return res.status(400).json({ error: "Product id and name cannot be empty." });
  }

  newProduct.id = trimmedId;
  newProduct.name = trimmedName;
  if (typeof newProduct.price !== "undefined") {
    const priceNum = Number(newProduct.price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: "Product price must be a valid positive number." });
    }
    newProduct.price = priceNum;
  }

  try {
    const products = await readCollection("products");
    const index = products.findIndex(p => p.id === trimmedId);
    if (index >= 0) {
      products[index] = newProduct;
    } else {
      products.push(newProduct);
    }
    await writeCollection("products", products);

    const logs = await readCollection("logs");
    logs.push({
      id: "log_" + Date.now(),
      time: new Date().toLocaleTimeString(),
      action: `Product Supplement '${newProduct.name}' added / modified in catalog`,
      category: "Products"
    });
    await writeCollection("logs", logs);

    res.json({ success: true, products });
  } catch (e) {
    console.error("Save product endpoint error:", e);
    res.status(500).json({ error: "Failed to save product details." });
  }
});

// Delete Product (Admin Protected)
app.delete("/api/products/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({ error: "Invalid or missing product ID parameter." });
  }
  const trimmedId = id.trim();
  try {
    const products = await readCollection("products");
    const filtered = products.filter(p => p.id !== trimmedId);
    await writeCollection("products", filtered);

    const logs = await readCollection("logs");
    logs.push({
      id: "log_" + Date.now(),
      time: new Date().toLocaleTimeString(),
      action: `Product Supplement with ID '${trimmedId}' purged from system database`,
      category: "Products"
    });
    await writeCollection("logs", logs);

    res.json({ success: true, products: filtered });
  } catch (e) {
    console.error("Delete product endpoint error:", e);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ==========================================
// TRANSACTIONS / ORDERS ENDPOINTS
// ==========================================

// Get Transactions (Public/User checkouts list)
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await readCollection("orders");
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: "Failed to retrieve checkout transactions" });
  }
});

// Add Transaction (Public/Checkout triggered)
app.post("/api/orders", async (req, res) => {
  const newOrder = req.body;
  if (!newOrder || typeof newOrder !== "object") {
    return res.status(400).json({ error: "Invalid order data payload." });
  }

  const { orderId, itemName } = newOrder;
  if (typeof orderId !== "string" || typeof itemName !== "string") {
    return res.status(400).json({ error: "Order ID and Item Name must be strings." });
  }

  const trimmedOrderId = orderId.trim();
  const trimmedItemName = itemName.trim();

  if (!trimmedOrderId || !trimmedItemName) {
    return res.status(400).json({ error: "Order ID and Item Name cannot be empty." });
  }

  newOrder.orderId = trimmedOrderId;
  newOrder.itemName = trimmedItemName;

  try {
    const orders = await readCollection("orders");
    orders.unshift(newOrder);
    await writeCollection("orders", orders);

    const logs = await readCollection("logs");
    logs.push({
      id: "log_" + Date.now(),
      time: new Date().toLocaleTimeString(),
      action: `Payment of ${newOrder.price || "Rs 0"} verified for item '${newOrder.itemName}' via ${newOrder.method}`,
      category: "Finance"
    });
    await writeCollection("logs", logs);

    res.json({ success: true, orders });
  } catch (e) {
    console.error("Save order endpoint error:", e);
    res.status(500).json({ error: "Failed to save checkout transaction" });
  }
});

// ==========================================
// SYSTEM AUDIT LOGS ENDPOINTS
// ==========================================

// Get Logs (Admin Protected)
app.get("/api/logs", authenticateAdmin, async (req, res) => {
  try {
    const logs = await readCollection("logs");
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

// Post Log Item (Public for automatic logging from user triggers)
app.post("/api/logs", async (req, res) => {
  const newLog = req.body;
  if (!newLog || typeof newLog !== "object") {
    return res.status(400).json({ error: "Invalid log data payload." });
  }

  const { action, category } = newLog;
  if (typeof action !== "string" || typeof category !== "string") {
    return res.status(400).json({ error: "Log action and category must be strings." });
  }

  const trimmedAction = action.trim();
  const trimmedCategory = category.trim();

  if (!trimmedAction || !trimmedCategory) {
    return res.status(400).json({ error: "Log action and category cannot be empty." });
  }

  newLog.action = trimmedAction;
  newLog.category = trimmedCategory;

  try {
    const logs = await readCollection("logs");
    logs.push(newLog);
    await writeCollection("logs", logs);
    res.json({ success: true, logs });
  } catch (e) {
    res.status(500).json({ error: "Failed to write system log" });
  }
});

// Clear Logs Database (Admin Protected)
app.delete("/api/logs", authenticateAdmin, async (req, res) => {
  try {
    await writeCollection("logs", []);
    res.json({ success: true, logs: [] });
  } catch (e) {
    res.status(500).json({ error: "Failed to flush system logs" });
  }
});

// Global Error Handler Middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled server error:", err);
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" 
    ? "An internal server error occurred." 
    : err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

export default app;
