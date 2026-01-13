import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { swaggerUi, swaggerSpec } from "./swagger.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mongosh
mongoose
  .connect("mongodb://127.0.0.1:27017/entertainmentDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// user schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// ===== Test Route =====
/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test API
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Backend working
 */
app.get("/test", (req, res) => {
  res.json({ message: "Backend working" });
});

// ===== Signup Route =====
/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User Signup
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ayushi Jain"
 *               email:
 *                 type: string
 *                 example: "ayushi@test.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Signup successful
 *       400:
 *         description: Email already registered
 */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already registered" });

    const user = new User({ name, email, password });
    await user.save();

    res.json({ message: "Signup successful", user: { name, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Login Route =====
/**
 * @swagger
 * /login:
 *   post:
 *     summary: User Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "ayushi@test.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Wrong password
 *       404:
 *         description: Wrong email
 */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Wrong email" });

    if (user.password !== password) return res.status(400).json({ message: "Wrong password" });

    res.json({ message: "Login successful", user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//Start Server 
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
