const express= require('express');
const mongoose=require('mongoose');
require('dotenv').config();
const morgan =require('morgan');
const bodyParser=require("body-parser");
const cookieParser=require('cookie-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const expressValidator = require('express-validator');
const app=express();

// db
mongoose.connect("mongodb://localhost/yagamikira",{ useNewUrlParser: true , useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(()=>console.log("DB connected"))
.catch(()=>console.log("something went wrong"))

// middlewares 
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());

// routes middleware
app.use("/api",authRoutes);
app.use("/api",userRoutes);
app.use("/api",categoryRoutes);
app.use("/api",productRoutes);

const port=process.env.PORT || 8000

app.listen(port,()=>{
    console.log("app is runing");
})