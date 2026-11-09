const jwt = require('jsonwebtoken');
const Admin = require('../model/adminModel');
require('dotenv').config();


const protect = async (req,res,next) => {
    try{
        const token = req.cookies.token;
        if(!token){
            if(req.accepts('html')){
                return res.redirect('/login.html');
            }
            return res.status(401).json({
                message: 'Unauthorized access'
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const admin = await Admin.findById(decoded.id);
        if(!admin){
            return res.status(401).json({
                message: 'Unauthorized Access'
            })
        }

       
        if(!admin.isActive){
            return res.status(403).json({
                message: 'Account inactive'
            })
        } 

        req.admin = admin;

        next();



    }
    catch(error){
         if (error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError' ||
            error.name === 'NotBeforeError') {
            return res.status(401).json({
                message: 'Invalid or expired token'
            });
        }

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = {protect}