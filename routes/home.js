var express = require('express');
const { route } = require('.');
var router = express.Router();
var md_security = require("../middlewares/security")
var publications = require("../models/publications");
const users = require('../models/users');
const multer = require('multer');
const mongoose = require('mongoose')
const userModel = require('../models/users')
const questionModel = require('../models/question')



const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now().toString() + 'pp.png')
    }
})
const upload = multer({ storage: storage })
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.session.user) {
        res.redirect("/")
    }
    userModel.findOne({ _id: req.session.user._id })
        .then(user => {
            user.userpicture = req.file.filename
            user.save()
                .then(updated => {
                    console.log(updated)
                    res.redirect('/home/profile')
                })
                .catch(err => {
                    res.redirect('/home')
                })
        })
})

router.get('/', md_security.checkDisConnectedUser, async (req, res) => {
    if (!req.session.user) {
        res.redirect('/')
    }
    var publicationsData = await questionModel.find().populate('user').sort({ datetime: -1 })
    console.log(publicationsData)
    if (req.query.error)
        res.render('home', { error: "Text is required", publicationsData: publicationsData });
    else {
        res.render("home", { publicationsData: publicationsData })
    }
})

router.get('/profile', md_security.checkDisConnectedUser, async (req, res) => {
    console.log(req.session.user)
    var publicationsData = await publications.find().populate('user').sort({ datetime: -1 })

    if (req.query.error)
        res.render('profile', { error: "Text is required", publicationsData: publicationsData });
    else {
        res.render("profile", { publicationsData: publicationsData })
    }
})

router.get('/upload', md_security.checkDisConnectedUser, async (req, res) => {
    var publicationsData = await publications.find().populate('user').sort({ datetime: -1 })

    if (req.query.error)
        res.render('upload', { error: "Text is required", publicationsData: publicationsData });
    else {
        res.render("upload", { publicationsData: publicationsData })
    }
})

router.post('/askquestion', async (req, res) => {
    var postData = req.body;
    console.log(req.body)
    if (postData.question && postData.category && postData.subject) {
        //2 - INSERT PUBLICATION
        console.log(req.session.user)
        var question = new questionModel({
            question: postData.question,
            category: postData.category,
            subject: postData.subject,
            user: [{
                user: req.session.user
            }]
        })
        await question.save()
            .then(saved => {
                console.log(saved)
            })
        res.redirect("/home")
    } else {
        res.redirect("/home?error=1")
    }
})
router.post('upload')
module.exports = router;