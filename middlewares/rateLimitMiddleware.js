const {rateLimit} = require('express-rate-limit');
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 100,
    limit:8,
    message:{
        message: 'Too many login attempts. Try again Later.',
    },
    standardHeaders: 'draft-8',
    legacyHeaders: false
})

module.exports = loginLimiter;