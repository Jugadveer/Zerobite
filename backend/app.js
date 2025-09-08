const express=require('express');
const mongoose=require('mongoose');
const path=require('path');
const app=express();

const methodOverride = require('method-override');

app.set("views",path.join(__dirname,"/views"));
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.get("/",(req,res)=>{
    res.redirect("/zerobite");
})

app.get("/zerobite",(req,res)=>{
    res.render("index.ejs");
})

app.get("/zerobite/donations",(req,res)=>{
    res.render("donations.ejs");
})

app.get("/zerobite/donate",(req,res)=>{
    res.render("donate.ejs");
})

app.get("/zerobite/rewards",(req,res)=>{
    res.render("rewards.ejs");
})
app.get("/zerobite/volunteer",(req,res)=>{
    res.render("volunteer.ejs");
})
app.get("/zerobite/analytics",(req,res)=>{
    res.render("analytics.ejs");
})
app.listen(8080,()=>{
    console.log("Server is running on port 8080");
})
