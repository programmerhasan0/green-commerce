//dependencies
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
require("dotenv").config();

// Utilities
const errorHandler = require("./utilities/error.util");

//app initialization
const app = express();
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

//envirement variables -->
const uri = process.env.MONGO_URI;

// Global Routes
const adminRoutes = require("./routes/admin.route");
const shopRoutes = require("./routes/shop.route");
const authRoutes = require("./routes/auth.route");

// Error Responses
const errorControllers = require("./controllers/error.controller");

//working with users
const UserModel = require("./models/user.model");

// working with sessions {connect-mongodb-session => store}
const store = new MongoDBStore({
    uri,
    collection: "sessions",
});
//setting the view engine and view directory
app.set("view engine", "ejs");
app.set("views", "./views");

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
    session({
        secret: "xZI9M57QreeUopF0",
        resave: false,
        saveUninitialized: false,
        store,
    })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    UserModel.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            errorHandler.handle500(err, next);
        });
});

//routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorControllers.get404);
app.use(errorControllers.get500);

const port = process.env.PORT || 3000;

//mongoose
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose
    .connect(uri)
    .then(result => {
        app.listen(port, () => console.log(`listening from port ${port}`));
    })
    .catch(err => console.log(err));
