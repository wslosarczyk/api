const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Wystąpił błąd serwera';

    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
};

module.exports = errorHandler;