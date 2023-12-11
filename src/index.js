const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const collection = require("./mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortId = require("shortid");

// Define the path to the templates directory
const templatePath = path.join(__dirname, '../templates');

// Configure Express app
app.use(express.json()); // Parse incoming JSON requests
app.set("view engine", "hbs"); // Set Handlebars as the view engine
app.set("views", templatePath); // Set the path to the templates directory
app.use(express.urlencoded({ extended: false })); // Parse incoming URL-encoded requests

// Secret key for JWT (store it securely, consider using environment variable)
const jwtSecret = "your_secret_key";

// Middleware to check if the user is authenticated
const authenticateUser = (req, res, next) => {
  const token = req?.cookies?.token;

  // if (!token) {
  //   return res.status(401).send("Unauthorized");
  // }

  try {
    // const decoded = jwt.verify(token, jwtSecret);
    // req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send("Unauthorized");
  }
};

// Route for rendering the login page
app.get("/", (req, res) => {
  res.render("login");
});

// Route for rendering the signup page
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Route for handling user signup
app.post("/signup", async (req, res) => {
  try {
    const { name, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      name,
      password: hashedPassword,
    };

    console.log("Received data:", data);

    await collection.create(data);

    console.log("Data inserted successfully");

    res.render("home"); // Render the home page after successful signup
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).render("error", { message: "Internal Server Error" });
  }
});

// Route for handling user login
app.post("/login", async (req, res) => {
  try {
    const user = await collection.findOne({ name: req.body.name });

    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      // Generate a JWT token using the secret
      const token = jwt.sign({ userId: user._id, username: user.name }, jwtSecret);
      res.cookie("token", token); // Set the token as a cookie
      res.render("home"); // Render the home page after successful login
    } else {
      res.status(401).send("Wrong username or password");
    }
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).render("error", { message: "Internal Server Error" });
  }
});

app.post("/urls/shorten", authenticateUser, async (req, res) => {
  try {
    const longUrl = req.body.longUrl;

    // Generate a short ID using shortid
    const shortId = shortId.generate();

    // Update the user's "urls" field with the new short URL information
    await collection.updateOne(
      { _id: req.user.userId },
      { $push: { urls: { longUrl, shortId } } }
    );

    // Return the short URL to the client
    res.json({ shortUrl: shortId });
  } catch (error) {
    console.error("Error shortening URL:", error.message);
    res.status(500).send("Internal Server Error");
  }
});


// Route for user logout
app.get("/logout", (req, res) => {
  res.clearCookie("token"); // Clear the token cookie
  res.redirect("/"); // Redirect to the login page
});

// Start the Express server on port 3000
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
