// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const util = require("../utilities")
const regValidate = require("../utilities/account-validation")

// Route to build login page
router.get("/login", util.handleErrors(accountController.buildLogin));

// Route to process login attempt
router.post("/login", 
    regValidate.loginRules(),
    regValidate.checkLogData,
    (req, res) => {res.status(200).send('login process')})

// Route to build registration page
router.get("/register", util.handleErrors(accountController.buildRegister))

// Route to register new account
router.post("/register", 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    util.handleErrors(accountController.registerAccount))

module.exports = router;