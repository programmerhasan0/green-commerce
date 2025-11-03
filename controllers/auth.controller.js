const UserModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const errorHandler = require("../utilities/error.util");
const {
    sendForgetPasswordMail,
    sendWelcomeEmail,
} = require("../utilities/sendMail.util");

module.exports.getLogin = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/login", {
        path: "/login",
        docTitle: "Login",
        errorMessage: message,
        oldInput: { email: "" },
    });
};

module.exports.postLogin = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    const { email, password } = req.body;
    UserModel.findOne({ email })
        .then(user => {
            if (!user) {
                req.flash("error", "Invalid Email or Password");
                return res.redirect("/login");
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.user = user;
                        req.session.isLoggedIn = true;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect("/");
                        });
                    }
                    res.render("auth/login", {
                        path: "/login",
                        docTitle: "Login",
                        errorMessage: message,
                        oldInput: { email },
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.redirect("/login");
                });
        })
        .catch(err => {
            errorHandler.handle500(err, next);
        });
};

module.exports.postLogOut = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
};

module.exports.getSignUp = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/signup", {
        docTitle: "Sign Up",
        path: "/signup",
        errorMessage: message,
        oldInput: { email: "", password: "", passwordConfirm: "" },
        validationErrors: [],
    });
};

module.exports.postSignUp = (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array(), "from express validator");
        return res.status(422).render("auth/signup", {
            docTitle: "Sign Up",
            path: "/signup",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email,
                password,
                confirmPassword: req.body.confirmPassword,
            },
            validationErrors: errors.array(),
        });
    }
    bcrypt
        .hash(password, 12)
        .then(hashedPass => {
            const user = new UserModel({
                email,
                password: hashedPass,
                cart: { item: [] },
            });
            return user.save();
        })
        .then(() => {
            res.redirect("/login");
            const _process = process.env;
            return sendWelcomeEmail(email);
        })
        .catch(err => {
            console.log("mail server error");
            errorHandler.handle500(err, next);
        });
};

module.exports.getReset = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/reset", {
        path: "/reset",
        docTitle: "Reset Password",
        errorMessage: message,
    });
};

module.exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect("/reset");
        }
        const token = buffer.toString("hex");
        UserModel.findOne({ email: req.body.email })
            .then(user => {
                console.log(user);
                if (!user) {
                    req.flash(
                        "error",
                        `No Account with Email ${req.body.email}`
                    );
                    return res.redirect("/reset");
                }
                user.resetToken = token;
                user.resetTokenExpires = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                sendForgetPasswordMail(result.email, token)
                    .then(() => {
                        res.redirect("/login");
                    })
                    .catch(err => {
                        console.log("logging the error", err);
                        errorHandler.handle500(err, next);
                    });
            })
            .catch(err => {
                errorHandler.handle500(err, next);
            });
    });
};

module.exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    UserModel.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: Date.now() },
    })
        .then(user => {
            let message = req.flash("error");
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render("auth/new-password", {
                path: "/new-password",
                docTitle: "Enter new Password",
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token,
            });
        })
        .catch(err => {
            errorHandler.handle500(err, next);
        });
};

module.exports.postNewPassword = (req, res, next) => {
    const { newPassword, userId, passwordToken } = req.body;
    console.log(newPassword);
    let resetUser;

    UserModel.findOne({
        resetToken: passwordToken,
        resetTokenExpires: { $gt: Date.now() },
        _id: userId,
    })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPass => {
            resetUser.password = hashedPass;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpires = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect("/login");
        })
        .catch(err => {
            errorHandler.handle500(err, next);
        });
};
