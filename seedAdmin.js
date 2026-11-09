const mongoose = require('mongoose');
const Admin = require('./model/adminModel');
const bcrypt = require('bcrypt');
require('dotenv').config();

const name = process.env.ADMIN_NAME;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

const seedAdmin = async () => {
    if (!name || !email || !password) {
        throw new Error('Admin credentials are missing from .env');
    }
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
        console.log('Admin already exists');
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = await Admin.create({
        name,
        email,
        password: hashedPassword,
        role: 'superadmin'
    });

    console.log('Admin created successfully:', newAdmin.email);
};

const runSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');

        await seedAdmin();

    } catch (error) {
        console.error('Error:', error.message);

    } finally {
        await mongoose.disconnect();
        console.log('MongoDB connection closed');
    }
};

runSeed();