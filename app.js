
require("dotenv").config();
const path = require("path");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { sequelize } = require("./models");
require("./cron/dailyReport");


const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});



// Load Swagger file
let swaggerDocument;
try {
  const swaggerPath = path.join(__dirname, "swagger", "swagger.yaml");
  console.log("Loading Swagger from:", swaggerPath);
  swaggerDocument = YAML.load(swaggerPath);
  console.log(" Swagger file loaded successfully");
} catch (err) {
  console.error(" Error loading Swagger YAML:", err);
}

// Swagger UI route
if (swaggerDocument) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Initialize cart in session
app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = [];
  next();
});

// EJS and static files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Routes
const authRoutes = require("./routes/auth");
const homeRoutes = require("./routes/home");
const cartRoutes = require("./routes/cart");
const mainRoutes = require("./routes/main");
const adminRoutes = require("./routes/admin");
const productsRoutes = require("./routes/products");
const checkoutRoutes = require("./routes/checkout");
const userRoutes = require("./routes/userRoutes");
const ordersRoutes = require("./routes/orders");
const productsRouter = require("./routes/products");


app.use("/auth", authRoutes);
app.use("/home", homeRoutes);
app.use("/cart", cartRoutes);
app.use("/main", mainRoutes);
app.use("/admin", adminRoutes);
app.use("/products", productsRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/users", userRoutes);
app.use("/orders", ordersRoutes);
app.use("/products", productsRouter);


// Default route
app.get("/", (req, res) => res.redirect("/home"));

// Test endpoint
app.get("/ping", (req, res) => res.json({ message: "Server is alive!" }));

// 404 handler
app.use((req, res) => {
  res.status(404).send("Page not found.");
});


const PORT = process.env.PORT;

async function startServer() {
  try {
    // 1. Test DB connection
    await sequelize.authenticate();
    console.log(" Database connected successfully");

    // 2. Sync models 
    await sequelize.sync(); 

    // 3. Start Express server
    app.listen(PORT, () => {
      console.log(` Server running at http://localhost:${PORT}`);
      console.log(` Swagger docs at http://localhost:${PORT}/api-docs`);
    });

  } catch (err) {
    console.error(" Database connection failed:", err);
    process.exit(1); 
  }
}

startServer();











