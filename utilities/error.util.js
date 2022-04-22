function handle500(err, next) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
};

module.exports.handle500 = handle500;