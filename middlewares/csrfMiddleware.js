
const { doubleCsrf } = require('csrf-csrf');

const {
    generateCsrfToken,
    doubleCsrfProtection
} = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET,

    // Bind each token to the authenticated admin.
    getSessionIdentifier: (req) => String(req.admin._id),

    cookieName: 'csrf-token',

    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000
    },

    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],

    getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token']
});

module.exports = {
    generateCsrfToken,
    doubleCsrfProtection
};
