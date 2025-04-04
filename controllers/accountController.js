const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const reviewModel = require("../models/review-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("failure", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "success",
      `Congratulations, ${account_firstname}, you\'re registered! Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("failure", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
 let nav = await utilities.getNav()
 const { account_email, account_password } = req.body
 const accountData = await accountModel.getAccountByEmail(account_email)
 if (!accountData) { // catches if email is not in database
  req.flash("notice", "Please check your credentials and try again.")
  res.status(400).render("account/login", {
   title: "Login",
   nav,
   errors: null,
   account_email,
  })
 return
 }
 try {
  if (await bcrypt.compare(account_password, accountData.account_password)) {
  delete accountData.account_password
  const screenName = accountData.account_firstname[0].toUpperCase() + accountData.account_lastname
  accountData.screenName = screenName
  const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
  if(process.env.NODE_ENV === 'development') {
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
  return res.redirect("/account/")
  } else { // handles when password doesn't match
    req.flash("failure", "Password is incorrect. Please try again.")
    res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
  })
  return
  }
 } catch (error) {
  return new Error('Access Forbidden')
 }
}

/* ****************************************
 *  Process logout
 * ************************************ */
async function accountLogout(req, res, next) {
 utilities.removeJWTToken(req, res)
 res.redirect("/")
}

/* ****************************************
*  Deliver management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  let main = await utilities.buildAccountMain(req, res, next)
  let userReviewData = await reviewModel.getReviewsByAccountId(res.locals.accountData.account_id)
  let reviews = await utilities.getSingleUserReviewHTML(userReviewData)
  res.render("account/management", {
    title: "Account Management",
    nav,
    main,
    reviews,
    errors: null,
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildAccountUpdate(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  res.render("account/update", {
    title: "Update Account",
    nav,
    accountData,
    errors: null,
  })
}

/* ****************************************
*  Process Account Details Update
* *************************************** */
async function updateAccountDetails(req, res) {
  let nav = await utilities.getNav()
  const main = await utilities.buildAccountMain(req, res)
  const { account_firstname, account_lastname, account_email, account_id } = req.body

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (updateResult) {
  let userReviewData = await reviewModel.getReviewsByAccountId(res.locals.accountData.account_id)
  let reviews = await utilities.getSingleUserReviewHTML(userReviewData)
    req.flash(
      "success",
      `${account_firstname}, your account has been updated.`
    )
    res.status(201).render("account/management", {
      title: "Account Management",
      nav,
      main,
      reviews,
      errors: null,
    })
  } else {
    req.flash("failure", "Sorry, the registration failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      accountData: {account_firstname,
        account_lastname,
        account_email,
        account_id},
      errors: null,
    })
  }
}

/* ****************************************
*  Process change password
* *************************************** */
async function changePassword(req, res) {
  let nav = await utilities.getNav()
  const main = await utilities.buildAccountMain(req, res)
  const { account_password, account_id} = req.body
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("failure", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
    })
  }
  const changePassResult = await accountModel.updatePassword(
    account_id,
    hashedPassword
  )

  if (changePassResult) {
  let userReviewData = await reviewModel.getReviewsByAccountId(res.locals.accountData.account_id)
  let reviews = await utilities.getSingleUserReviewHTML(userReviewData)
    req.flash(
      "success",
      `${res.locals.accountData.account_firstname}, your password has been changed.`
    )
    res.status(201).render("account/management", {
      title: "Account Management",
      nav,
      main,
      reviews,
      errors: null,
    })
  } else {
    req.flash("failure", "Sorry, the password change failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors,
    })
  }
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildAccountUpdate, updateAccountDetails, changePassword, accountLogout }