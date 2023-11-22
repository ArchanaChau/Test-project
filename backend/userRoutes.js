// userRoutes.js
import express from "express";
import pool from "./db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import validator from "validator";
import { v4 as uuidv4 } from "uuid";

// Load environment variables from .env file
dotenv.config();

// Access the JWT secret key
const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment.");
}

// const db = require("your-database-library"); 
const router = express.Router();

router.use(express.json());

router.get("/test", (req, res) => {
  pool.query("SELECT NOW()", (error) => {
    if (error) {
      console.error("Error testing the database connection:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
    res.status(200).json({ message: "Database connection test successful." });
  });
});

router.get("/users", (req, res) => {
  pool.query(
    "SELECT id, first_name, last_name, employee_id, email FROM public.user",
    (error, result) => {
      if (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: "Internal server error." });
      }
      res.status(200).json(result.rows); 
    }
  );
});

router.post("/signup", async (req, res) => {
  try {
    const { first_name, last_name, employee_id, email, password } = req.body;

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).send({ error: "Invalid email format" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the email already exists in the database
    const existingUser = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );

    if (existingUser.rowCount > 0) {
      return res.status(400).send({ error: "Email already registered" });
    }

    // Generate a new user UUID or ID
    const userId = uuidv4();

    // Insert new user data into the database
    await pool.query(
      `INSERT INTO "user" (id, first_name, last_name, employee_id, email, password) VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, first_name, last_name, employee_id, email, hashedPassword]
    );

    res.status(201).send({
      message: "User registered successfully",
      userId,
      first_name,
      last_name,
      employee_id,
      email,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide both email and password." });
  }

  pool.query(
    "SELECT id, email, password FROM public.user WHERE email = $1",
    [email],
    (error, result) => {
      if (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error." });
      }

      if (result.rows.length === 1) {
        const user = result.rows[0];
        const hashedPassword = user.password;

        // Compare the provided password with the stored hashed password
        bcrypt.compare(password, hashedPassword, (bcryptError, isMatch) => {
          if (bcryptError) {
            console.error("Error during password comparison:", bcryptError);
            return res.status(500).json({ message: "Internal server error." });
          }

          if (isMatch) {
            // User authentication is successful
            const token = jwt.sign(
              { userId: user.id, email: user.email },
              process.env.JWT_SECRET, // Access the JWT_SECRET from the environment variable
              { expiresIn: "1hr" }
            );

            res.status(200).json({
              status: "success",
              message: "Login successful",
              data: {
                user: {
                  id: user.id,
                  email: user.email,
                },
                token: token,
              },
            });
          } else {
            // User authentication failed
            res.status(401).json({
              status: "error",
              message: "Authentication failed. Please check your credentials.",
            });
          }
        });
      } else {
        // User with the provided email not found
        res.status(401).json({
          status: "error",
          message: "Authentication failed. Please check your credentials.",
        });
      }
    }
  );
});
export default router;
