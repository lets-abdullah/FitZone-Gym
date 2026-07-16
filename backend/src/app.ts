import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB, readCollection, writeCollection } from "./db/mongodb";

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "fitzone_super_secret_jwt_key_2026";
const ADMIN_IDENTIFIER = process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "fitzone2026";

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.FRONTEND_URL,
    process.env.APP_URL,
  ].filter(Boolean) as string[];

  if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ─── Database Auto-Connect Middleware ─────────────────────────────────────────
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Database auto-connection failure in middleware:", err);
  }
  next();
});

// ─── Auth Middleware: Admin ───────────────────────────────────────────────────
const authenticateAdmin = (req: any, res: any, next: any) => {
  const token = req.cookies.fitzone_admin_token;
  if (!token) return res.status(401).json({ error: "Access denied. Administrator authorization required." });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.role === "admin") {
      req.admin = decoded;
      next();
    } else {
      res.status(403).json({ error: "Access denied. Invalid administrator token." });
    }
  } catch {
    res.status(401).json({ error: "Invalid or expired administrator token." });
  }
};

// ─── Auth Middleware: User ────────────────────────────────────────────────────
const authenticateUser = (req: any, res: any, next: any) => {
  const token = req.cookies.fitzone_token;
  if (!token) return res.status(401).json({ error: "Access denied. Login required." });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired login session." });
  }
};

// ─── Health / Status Check ───────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "healthy", message: "FitZone Gym API is running" });
});

app.get("/api", (_req, res) => {
  res.json({ status: "healthy", message: "FitZone Gym API is running" });
});

// ==========================================
// USER AUTHENTICATION ENDPOINTS
// ==========================================

// POST /api/auth/signup
app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string")
    return res.status(400).json({ error: "Registration parameters must be strings." });

  const u = username.trim(), e = email.trim(), p = password.trim();
  if (!u || !e || !p) return res.status(400).json({ error: "Registration parameters cannot be empty." });
  if (u.length < 3 || u.length > 30) return res.status(400).json({ error: "Username must be between 3 and 30 characters." });
  if (!e.includes("@") || !e.includes(".")) return res.status(400).json({ error: "Invalid email address format." });
  if (p.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters long." });

  try {
    const users = await readCollection("users");
    const exists = users.find((u2: any) => u2.username?.toLowerCase() === u.toLowerCase() || u2.email?.toLowerCase() === e.toLowerCase());
    if (exists) return res.status(400).json({ error: "Username or email address already registered." });

    const hashedPassword = bcrypt.hashSync(p, 10);
    const newUser = { id: "u_" + Date.now(), username: u, email: e, password: hashedPassword, createdAt: new Date().toISOString() };
    users.push(newUser);
    await writeCollection("users", users);

    const token = jwt.sign({ id: newUser.id, username: newUser.username, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("fitzone_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });

    const logs = await readCollection("logs");
    logs.push({ id: "log_" + Date.now(), time: new Date().toLocaleTimeString(), action: `New user '${u}' registered through secure signup portal`, category: "Security" });
    await writeCollection("logs", logs);

    res.json({ success: true, user: { id: newUser.id, username: newUser.username, email: newUser.email } });
  } catch (err) {
    console.error("Signup endpoint failure:", err);
    res.status(500).json({ error: "Internal server error during registration." });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== "string" || typeof password !== "string")
    return res.status(400).json({ error: "Invalid login input format." });

  const u = username.trim(), p = password.trim();
  if (!u || !p) return res.status(400).json({ error: "Username and password are required." });

  try {
    const users = await readCollection("users");
    const user = users.find((usr: any) => usr.username?.toLowerCase() === u.toLowerCase());
    if (!user || !bcrypt.compareSync(p, user.password))
      return res.status(400).json({ error: "Invalid username or password credentials." });

    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("fitzone_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });

    const logs = await readCollection("logs");
    logs.push({ id: "log_" + Date.now(), time: new Date().toLocaleTimeString(), action: `User '${u}' authenticated and logged into client interface`, category: "Security" });
    await writeCollection("logs", logs);

    res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error("Login endpoint failure:", err);
    res.status(500).json({ error: "Internal server error during authentication." });
  }
});

// POST /api/auth/logout
app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("fitzone_token", { sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", secure: process.env.NODE_ENV === "production" });
  res.json({ success: true });
});

// GET /api/auth/me
app.get("/api/auth/me", (req, res) => {
  const token = req.cookies.fitzone_token;
  if (!token) return res.status(401).json({ error: "No active login session." });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return res.json({ success: true, user: { id: decoded.id, username: decoded.username, email: decoded.email } });
  } catch {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
});

// ==========================================
// ADMIN AUTHENTICATION ENDPOINTS
// ==========================================

// POST /api/admin/login
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== "string" || typeof password !== "string")
    return res.status(400).json({ error: "Invalid login input format." });

  const u = username.trim(), p = password.trim();
  if (!u || !p) return res.status(400).json({ error: "Username and password are required." });

  if (u.toLowerCase() === ADMIN_IDENTIFIER.toLowerCase() && p === ADMIN_PASSWORD) {
    const token = jwt.sign({ username: "admin", role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("fitzone_admin_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", maxAge: 24 * 60 * 60 * 1000 });

    try {
      const logs = await readCollection("logs");
      logs.push({ id: "log_" + Date.now(), time: new Date().toLocaleTimeString(), action: "Administrator logged in through secure authentication", category: "Security" });
      await writeCollection("logs", logs);
    } catch (err) {
      console.warn("Failed syncing admin login audit logs:", err);
    }
    return res.json({ success: true });
  }
  return res.status(400).json({ error: "Invalid administrator credentials." });
});

// POST /api/admin/logout
app.post("/api/admin/logout", (_req, res) => {
  res.clearCookie("fitzone_admin_token", { sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", secure: process.env.NODE_ENV === "production" });
  res.json({ success: true });
});

// GET /api/admin/me
app.get("/api/admin/me", (req, res) => {
  const token = req.cookies.fitzone_admin_token;
  if (!token) return res.json({ isAuthenticated: false });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.role === "admin") return res.json({ isAuthenticated: true, username: "admin" });
  } catch {}
  res.json({ isAuthenticated: false });
});

// ==========================================
// MEMBERS ENDPOINTS
// ==========================================

// GET /api/members (Admin only)
app.get("/api/members", authenticateAdmin, async (_req, res) => {
  try {
    res.json(await readCollection("members"));
  } catch {
    res.status(500).json({ error: "Failed to fetch members list" });
  }
});

// POST /api/members (Public — enrollment from user checkout)
app.post("/api/members", async (req, res) => {
  const newMember = req.body;
  if (!newMember || typeof newMember !== "object") return res.status(400).json({ error: "Invalid member data payload." });

  const { id, name } = newMember;
  if (typeof id !== "string" || typeof name !== "string") return res.status(400).json({ error: "Member id and name must be strings." });

  const trimmedId = id.trim(), trimmedName = name.trim();
  if (!trimmedId || !trimmedName) return res.status(400).json({ error: "Member id and name cannot be empty." });
  newMember.id = trimmedId;
  newMember.name = trimmedName;
  if (newMember.email && typeof newMember.email === "string") newMember.email = newMember.email.trim();

  try {
    const members = await readCollection("members");
    const index = members.findIndex((m: any) => m.id === trimmedId);
    if (index >= 0) members[index] = newMember; else members.push(newMember);
    await writeCollection("members", members);

    const logs = await readCollection("logs");
    logs.push({ id: "log_" + Date.now(), time: new Date().toLocaleTimeString(), action: `Member '${trimmedName}' enrollment / active pass class updated`, category: "Members" });
    await writeCollection("logs", logs);

    res.json({ success: true, members });
  } catch (err) {
    console.error("Save member endpoint error:", err);
    res.status(500).json({ error: "Failed to save member profile details." });
  }
});

// DELETE /api/members/:id (Admin only)
app.delete("/api/members/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  if (typeof id !== "string" || !id.trim()) return res.status(400).json({ error: "Invalid or missing member ID parameter." });
  const trimmedId = id.trim();
  try {
    const members = await readCollection("members");
    const filtered = members.filter((m: any) => m.id !== trimmedId);
    await writeCollection("members", filtered);

    const logs = await readCollection("logs");
    logs.push({ id: "log_" + Date.now(), time: new Date().toLocaleTimeString(), action: `Member with registry ID '${trimmedId}' purged from system database`, category: "Members" });
    await writeCollection("logs", logs);

    res.json({ success: true, members: filtered });
  } catch (err) {
    console.error("Delete member endpoint error:", err);
    res.status(500).json({ error: "Failed to remove member profile" });
  }
});

// ==========================================
// PRODUCTS ENDPOINTS
// ==========================================

// GET /api/products (Public)
app.get("/api/products", async (_req, res) => {
  try {
    res.json(await readCollection("products"));
  } catch {
    res.status(500).json({ error: "Failed to fetch products catalog" });
  }
});

// POST /api/products (Admin only)
app.post("/api/products", authenticateAdmin, async (req, res) => {
  const newProduct = req.body;
  if (!newProduct || typeof newProduct !== "object") return res.status(400).json({ error: "Invalid product data payload." });

  const { id, name } = newProduct;
  if (typeof id !== "string" || typeof name !== "string") return res.status(400).json({ error: "Product id and name must be strings." });

  const trimmedId = id.trim(), trimmedName = name.trim();
  if (!trimmedId || !trimmedName) return res.status(400).json({ error: "Product id and name cannot be empty." });
  newProduct.id = trimmedId;
  newProduct.name = trimmedName;
  if (typeof newProduct.price !== "undefined") {
    const priceNum = Number(newProduct.price);
    if (isNaN(priceNum) || priceNum < 0) return res.status(400).json({ error: "Product price must be a valid positive number." });
    newProduct.price = priceNum;
  }

  try {
    const products = await readCollection("products");
    const index = products.findIndex((p: any) => p.id === trimmedId);
    if (index >= 0) products[index] = newProduct; else products.push(newProduct);
    await writeCollection("products", products);

    const logs = await readCollection("logs");
    logs.push({ id: "log_" + Date.now(), time: new Date().toLocaleTimeString(), action: `Product Supplement '${trimmedName}' added / modified in catalog`, category: "Products" });
    await writeCollection("logs", logs);

    res.json({ success: true, products });
  } catch (err) {
    console.error("Save product endpoint error:", err);
    res.status(500).json({ error: "Failed to save product details." });
  }
});

// DELETE /api/products/:id (Admin only)
app.delete("/api/products/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  if (typeof id !== "string" || !id.trim()) return res.status(400).json({ error: "Invalid or missing product ID parameter." });
  const trimmedId = id.trim();
  try {
    const products = await readCollection("products");
    const filtered = products.filter((p: any) => p.id !== trimmedId);
    await writeCollection("products", filtered);

    const logs = await readCollection("logs");
    logs.push({ id: "log_" + Date.now(), time: new Date().toLocaleTimeString(), action: `Product Supplement with ID '${trimmedId}' purged from system database`, category: "Products" });
    await writeCollection("logs", logs);

    res.json({ success: true, products: filtered });
  } catch (err) {
    console.error("Delete product endpoint error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ==========================================
// ORDERS ENDPOINTS
// ==========================================

// GET /api/orders (Public)
app.get("/api/orders", async (_req, res) => {
  try {
    res.json(await readCollection("orders"));
  } catch {
    res.status(500).json({ error: "Failed to retrieve checkout transactions" });
  }
});

// POST /api/orders (Public — user checkout)
app.post("/api/orders", async (req, res) => {
  const newOrder = req.body;
  if (!newOrder || typeof newOrder !== "object") return res.status(400).json({ error: "Invalid order data payload." });

  const { orderId, itemName } = newOrder;
  if (typeof orderId !== "string" || typeof itemName !== "string") return res.status(400).json({ error: "Order ID and Item Name must be strings." });

  const trimmedOrderId = orderId.trim(), trimmedItemName = itemName.trim();
  if (!trimmedOrderId || !trimmedItemName) return res.status(400).json({ error: "Order ID and Item Name cannot be empty." });
  newOrder.orderId = trimmedOrderId;
  newOrder.itemName = trimmedItemName;

  try {
    const orders = await readCollection("orders");
    orders.unshift(newOrder);
    await writeCollection("orders", orders);

    const logs = await readCollection("logs");
    logs.push({ id: "log_" + Date.now(), time: new Date().toLocaleTimeString(), action: `Payment of ${newOrder.price || "Rs 0"} verified for item '${trimmedItemName}' via ${newOrder.method}`, category: "Finance" });
    await writeCollection("logs", logs);

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Save order endpoint error:", err);
    res.status(500).json({ error: "Failed to save checkout transaction" });
  }
});

// ==========================================
// LOGS ENDPOINTS
// ==========================================

// GET /api/logs (Admin only)
app.get("/api/logs", authenticateAdmin, async (_req, res) => {
  try {
    res.json(await readCollection("logs"));
  } catch {
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

// POST /api/logs (Public — client-side event logging)
app.post("/api/logs", async (req, res) => {
  const newLog = req.body;
  if (!newLog || typeof newLog !== "object") return res.status(400).json({ error: "Invalid log data payload." });

  const { action, category } = newLog;
  if (typeof action !== "string" || typeof category !== "string") return res.status(400).json({ error: "Log action and category must be strings." });

  const trimmedAction = action.trim(), trimmedCategory = category.trim();
  if (!trimmedAction || !trimmedCategory) return res.status(400).json({ error: "Log action and category cannot be empty." });
  newLog.action = trimmedAction;
  newLog.category = trimmedCategory;

  try {
    const logs = await readCollection("logs");
    logs.push(newLog);
    await writeCollection("logs", logs);
    res.json({ success: true, logs });
  } catch {
    res.status(500).json({ error: "Failed to write system log" });
  }
});

// DELETE /api/logs (Admin only)
app.delete("/api/logs", authenticateAdmin, async (_req, res) => {
  try {
    await writeCollection("logs", []);
    res.json({ success: true, logs: [] });
  } catch {
    res.status(500).json({ error: "Failed to flush system logs" });
  }
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("Unhandled server error:", err);
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" ? "An internal server error occurred." : err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

export default app;
