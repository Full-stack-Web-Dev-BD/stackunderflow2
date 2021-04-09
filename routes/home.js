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
    userModel.findOne({ _id: req.session.user._id }, { new: true })
        .then(user => {
            user.userpicture = req.file.filename
            user.save()
                .then(updated => {
                    console.log(updated)
                    res.redirect('/logout')
                })
                .catch(err => {
                    res.redirect('/logout')
                })
        })
})

router.get('/', md_security.checkDisConnectedUser, async (req, res) => {
    if (!req.session.user) {
        res.redirect('/')
    }
    questionModel.find()
        .then(questions => {
            console.log(questions)
            res.render('home', { error: "Text is required", publicationsData: questions });
        })
        .catch(err => {
            res.render("home", { publicationsData: questions })
        })
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

router.post('/getcategoryquestion', md_security.checkDisConnectedUser, async (req, res) => {
    if (!req.session.user) {
        res.redirect('/')
    }
    res.redirect(`/home/getcategoryquestion/${req.body.category}`)
})


router.get('/getcategoryquestion/:category', md_security.checkDisConnectedUser, async (req, res) => {
    if (!req.session.user) {
        res.redirect('/')
    }
    console.log(req.params.category)
    questionModel.find({ category: req.params.category })
        .then(questions => {
            console.log(questions)
            res.render('categoryquestion', { publicationsData: { category: req.params.category, questions: questions } });
        })
        .catch(err => {
            res.send('Error')
        })
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
    if (!req.session.user) {
        return res.redirect('/')

    }
    if (postData.question && postData.category && postData.subject) {
        //2 - INSERT PUBLICATION
        console.log(req.session.user)
        var question = new questionModel({
            question: postData.question,
            category: postData.category,
            subject: postData.subject,
            user: [req.session.user
            ]
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

router.post('/ansquestion/:id', async (req, res) => {
    const _id = req.params.id
    var postData = req.body;
    if (!req.session.user) {
        return res.redirect('/')

    }
    if (postData.answer) {
        //2 - INSERT PUBLICATION
        questionModel.findOne({ _id: _id })
            .then(question => {
                question.answers.push({
                    user: req.session.user,
                    answer: postData.answer
                })
                question.save()
                    .then((updated) => {
                        console.log(updated)
                        res.redirect(`/home/getcategoryquestion/${postData.category}`)
                    })
            })
            .catch((error) => {
                res.redirect("/")
            })
    } else {
        res.redirect("/")
    }
})
router.post('upload')
module.exports = router;