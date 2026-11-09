const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const mongoose = require ('mongoose')
const resourceRoutes = require('./routes/resourceRoutes')
const adminRoutes = require('./routes/adminRoutes')
const loginRoutes = require('./routes/authRoutes')
const adminPageRoutes = require('./routes/adminPageRoutes')


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/admin', adminPageRoutes);
app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname, 'views', 'index.html'))
})
app.use(express.static(path.join(__dirname,'views'),{
  index: false,
}));

app.use('/api/resources', resourceRoutes)
app.use('/api/admin', adminRoutes);
app.use('/api/auth', loginRoutes);

const PORT = process.env.PORT || 3000;


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
  });