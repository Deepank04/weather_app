const express = require('express');
const app = express();


const path = require('path');
require("dotenv").config();



const apiKey = process.env.OPENAI_API_KEY;

app.set("view engine","ejs");

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));

app.get('/',(req,res)=>{
  res.render("test");
})

const cookieParser = require('cookie-parser');

app.use(cookieParser());

const visitorroute = require('./route/visitor');
const wheatherroute = require('./route/wheather');

app.use('/visit',visitorroute);
app.use('/wheather',wheatherroute);






const getWeather = require("./utensil/wheatherApi");

const port = process.env.PORT || 3000;

app.listen(port,(req,res)=>{
  console.log(`server is runing on ${port}`);
})