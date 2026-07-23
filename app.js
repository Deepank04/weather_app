const express = require('express');
const app = express();


const path = require('path');
require("dotenv").config();



const apiKey = process.env.OPENAI_API_KEY;

app.set("view engine","ejs");

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));



const cookieParser = require('cookie-parser');

app.use(cookieParser());
const flash = require("connect-flash");
const session = require("express-session");

// ===============================
// SESSION
// ===============================

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365
        }
    })
);


// ===============================
// FLASH
// ===============================

app.use(flash());


// ===============================
// FLASH VARIABLES FOR EJS
// ===============================

app.use((req, res, next) => {

    res.locals.success = req.flash("success");

    res.locals.error = req.flash("error");

    next();

});


const visitorroute = require('./route/visitor');

app.use('/',visitorroute);


const getWeather = require("./utensil/wheatherApi");

const port = process.env.PORT || 3000;

app.listen(port,(req,res)=>{
  console.log(`server is runing on ${port}`);
})