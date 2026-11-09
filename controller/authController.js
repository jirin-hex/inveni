const Admin = require('../model/adminModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateCsrfToken } = require('../middlewares/csrfMiddleware');
require ('dotenv').config();


const loginAdmin = async (req,res) =>{
    try{
        const {email,password} = req.body
        const admin = await Admin.findOne({
            email: email
        }).select('+password');
        if(!admin){
            return res.status(401).json({
                message: 'Invalid username or password'
            })
        }

         if(!admin.isActive){
                    return res.status(401).json({
                        message: 'Invalid username or password'
                    })
                }

            const isMatch = await bcrypt.compare(password,admin.password);
            if(!isMatch){
                return res.status(401).json({
                    message: 'Invalid username or password'
                })
            }
               
            if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
}

          const token =  jwt.sign(
                {id: admin._id, role: admin.role},
                process.env.JWT_SECRET,
                {expiresIn: process.env.JWT_EXPIRES_IN}
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 24 * 60 * 60 * 1000
            })

          return  res.status(200).json({
                message: 'Success',
                admin: {
                  id: admin._id,
                  name: admin.name,
                  email: admin.email,
                  role: admin.role
                }
                
            })

    }
    catch(error){
        console.error(error);
        
        return res.status(500).json({
            message: 'An error occurred,Try again later'
        })
    }
}

const logoutAdmin = async (req,res) =>{
    res.clearCookie('token',{
        httpOnly: true,
        secure: process.env.NODE_ENV == 'production',
        sameSite: 'strict',
        path: '/'
    })

    res.status(200).json({
        success: true,
        message:'Logged out successfully'
    })
}

const getCsrfToken = (req, res) => {
    const csrfToken = generateCsrfToken(req, res);

    res.status(200).json({
        success: true,
        csrfToken
    });
};

module.exports = {loginAdmin,logoutAdmin,getCsrfToken};