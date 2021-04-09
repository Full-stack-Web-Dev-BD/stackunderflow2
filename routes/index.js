var express = require('express');
var router = express.Router();
var md_security = require("../middlewares/security")
var cars = require('../models/cars');
const users = require('../models/users');
const bcrypt = require("bcrypt");

router.get('/test', async function (req, res) {
    var data = await users.find()
    console.log(data)
    res.send(data)
})

router.get('/selectone', async function (req, res) {
    var data = await cars.findOne({ "company": "test" })
    if (data != null) {
        console.log(data)
        res.send(data);
    } else
        res.send("No data found !");
})

router.get('/insert', async (req, res) => {
    var user = new users({ username: "Test", userpassword: "123456", usermail: "test@ynov.com", userpicture: "default.png" });
    var data = await user.save()
    res.send(data)
})

router.get("/crypt", (req, res) => {
    //METHODE 1 : Call-Back function
    /*bcrypt.hash("123456", 2, function(err, hashResult) {
        console.log(hashResult)
        res.send(hashResult)
    });*/
    //METHODE 2 : async functions
    var hashResult = bcrypt.hashSync("123456", 2);
    res.send(hashResult)
})

router.get("/compar", (req, res) => {
    //METHODE 1 : Call back functions
    /*bcrypt.compare("12345saldhjhsdk6", "$2b$04$HRRKSn1QvOkie6yXw7H7r.EAaaJJkAXS1vyoN2bhM93qfDaNX2QW.", function(err, result) {
        console.log(result)
        res.send(result)
    })*/
    //METHODE 2 : Async functions
    var result = bcrypt.compareSync("123456", "$2b$04$HRRKSn1QvOkie6yXw7H7r.EAaaJJkAXS1vyoN2bhM93qfDaNX2QW.")
    res.send(result);
})

router.get('/', md_security.checkConnectedUser, (req, res) => {
    res.render('index')
})

router.post('/login', async (req, res) => {
    //Handle login
    var postInfos = req.body;
    //GET DATA FROM DATABASE
    var userData = await users.findOne({ usermail: postInfos.mail });
    //console.log(userData)
    if (userData != null) {
        //CHECK PASSWORD
        var comparResult = bcrypt.compareSync(postInfos.password, userData.userpassword);
        if (comparResult) {
            //CREATE SESSION
            req.session.user = userData;
            res.redirect("/home");
        } else
            res.render("index", { 'error': "Password Error" });
    } else {
        res.render("index", { 'error': "This account dose not exists" });
    }
})

router.get('/logout', (req, res) => {
    //Handle logout
    //DELETE ALL SESSIONS
    req.session.destroy();
    res.redirect("/");
})

router.all('/register', md_security.checkConnectedUser, (req, res) => {
    if (req.query.error) {
        var msg = "";
        switch (req.query.error) {
            case "1":
                msg = "All fields are required";
                break;
            case "2":
                msg = "Email Already exists";
                break;
            case "3":
                msg = "Password confirmation error";
                break;
        }
        res.render('register', { errorMsg: msg })
    } else
        res.render('register')
})

router.post("/createaccount", async (req, res) => {
    //0 - GET POST DATA
    var postData = req.body;
    //1 - CHECK REQUIRED FIELDS
    if (postData.name != "" && postData.email != "" && postData.password != "") {
        //2 - CHECK IF EMAIL ALREADY EISTS
        var userData = await users.findOne({ usermail: postData.email });
        if (userData == null) {
            //3 - CHECK PASSWORD CONFIRMATION
            if (postData.password == postData.confirm) {
                //4 - INSERT USER INTO DATABASE
                var cpassword = bcrypt.hashSync(postData.password, 3)
                var user = new users({
                    username: postData.name,
                    usermail: postData.email,
                    userpassword: cpassword,
                    userpicture: "default.png",
                })
                var createdUser = await user.save()
                //5 - SHOW CONFIRMATION PAGE
                res.render("accountconfirm", { user: createdUser })
            } else {
                res.redirect("/register?error=3")
            }
        } else {
            res.redirect("/register?error=2")
        }
    } else
        res.redirect("/register?error=1")
})

module.exports = router;