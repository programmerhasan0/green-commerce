module.exports.get404 = (req, res, next) => {
  res.status(404).render("page-not-found", {
    docTitle: "404 :: Not Found",
    path: "/not-found",
  });
};

module.exports.get500 = (error, req, res, next) => {
  res.status(error.httpStatusCode).render("500", {
    docTitle: "Internal server error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
};
