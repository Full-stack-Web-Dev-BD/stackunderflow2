module.exports = {
    //CHECK IF USER IS CONNECTED
    checkConnectedUser: (req, res, next) => {
        if (req.session.user) {
            res.redirect("/home")
        } else {
            next()
        }
    },
    //CHECK IF USER IS NOT CONNECTED
    checkDisConnectedUser: (req, res, next) => {
        if (!req.session.user) {
            res.redirect("/")
        } else {
            next()
        }
    }
}