if (process.env.NODE_ENV !== "production") require("dotenv").config();

const path = require("path");

const flash = require("connect-flash");
const MongoStore = require("connect-mongo");
const engine = require("ejs-mate");
const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");
const session = require("express-session");
const helmet = require("helmet");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/User");
const campgroundsRoute = require("./routes/campgroundsRoute");
const reviewsRoute = require("./routes/reviewsRoute");
const usersRoute = require("./routes/usersRoute");
const ExpressError = require("./utils/ExpressError");

const app = express();

(async function () {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to database");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();

app.engine("ejs", engine);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(mongoSanitize());

// Session Configurations
const sessionConfig = {
  name: "session",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    touchAfter: 86400, // 1 day
  }),
  cookie: {
    maxAge: 604800000, // 1 week
    httpOnly: true,
  },
};
// if (process.env.NODE_ENV === "production") sessionConfig.cookie.secure = true;
app.use(session(sessionConfig));

// Security
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        "default-src": [
          "'self'",
          "https://api.mapbox.com/",
          "https://events.mapbox.com/",
        ],
        "img-src": [
          "'self'",
          "data:",
          "https://images.unsplash.com/",
          "https://res.cloudinary.com/",
        ],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "blob:",
          "https://cdn.jsdelivr.net/",
          "https://api.mapbox.com/",
        ],
      },
    },
  })
);

// passport.js Configurations
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Locals Variables
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// returnTo Behaviour
app.get("*", (req, res, next) => {
  const returnToExceptions = ["/", "/login"];
  if (!returnToExceptions.includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});

// Routes
app.use("/campgrounds", campgroundsRoute);
app.use("/campgrounds/:campgroundId/reviews", reviewsRoute);
app.use("/", usersRoute);

app.get("/", (req, res) => {
  res.render("home");
});

// Error Handling
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Something Went Wrong";
  }
  res.status(statusCode).render("error", { err });
});

app.listen(process.env.PORT, () => console.log("server is up"));
