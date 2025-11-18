function ErrorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: 'Validation Error',
            errors
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: `${field} already exists`,
            field
        });
    }

    // Mongoose cast error (invalid ID format)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: 'Invalid ID format',
            error: err.message
        });
    }   


    

    // Default error response
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        stack: err.stack });
};


module.exports = ErrorHandler;