const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model
      + ' details"><img src="' + vehicle.inv_thumbnail
      +'" alt="'+ vehicle.inv_make + ' ' + vehicle.inv_model
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View '
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$'
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the vehicle details view HTML
* ************************************ */
Util.buildVehicleDetail = async function(data){
  let main
  if(data.length > 0){
    vehicle = data[0]
    main = '<div id="inv-details-display">'
    main += `<img src="${vehicle.inv_image}" alt="${vehicle.inv_color} ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
    <div class="vehicleDetails">`
    main += `<h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>`
    main += `<p><strong>Price:</strong> <span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span></p>`
    main += `<p><strong>Description:</strong> ${vehicle.inv_description}</p>`
    main += `<p><strong>Color:</strong> ${vehicle.inv_color}</p>`
    main += `<p><strong>Miles:</strong> ${vehicle.inv_miles.toLocaleString()}</p></div></div>`
  } else {
    main += '<p class="notice">Sorry, that vehicle could not be found.</p>'
  }
  return main;
}

/* **************************************
* Build the vehicle reviews view HTML
* ************************************ */
Util.buildVehicleReviews = async function(reviewData){
  let reviews = ""
  if(reviewData.length > 0){
    reviewData.rows.sort((b, a) => a.review_date - b.review_date)
    for (const review of reviewData.rows) {
      const screenName = await accountModel.getScreenNameById(review.account_id)
      reviews += `<ul id="vehicleReviews">
        <li> <strong>${screenName}</strong> wrote on ${review.review_date}
        <hr>
        <p>${review.review_text}</p></li></ul>`
    }
  } else {
    reviews += `<p id="firstReview">Be the first to leave a review! </p>`
  }
  return reviews;
}

/* ****************************************
 * Function to build list of vehicle 
 * classifications
 **************************************** */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
      '<label>Choose a classification</label><select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += `<option value="${row.classification_id}"`
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }

Util.buildAccountMain = async function (req, res) {
  let main = `<div class="mainContainer">`
  main += `<h2>Welcome, ${res.locals.accountData.account_firstname}</h2>`
  main += "<p>You're logged in.</p>"
  main += `<a href="/account/update/${res.locals.accountData.account_id}">Update Account Information</a>`
  if (res.locals.accountData.account_type == 'Employee'
    ||res.locals.accountData.account_type == 'Admin'
  ) {
    main += `<h3>Inventory Management</h3>
    <p><a href="/inv">Manage Inventory</a></p></div>`
  }
  return main
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to get user data from jwt
**************************************** */
Util.getUserData = (req, res, next) => {
  if(!req.cookies.jwt) {
    return next();
  }
jwt.verify(
  req.cookies.jwt,
  process.env.ACCESS_TOKEN_SECRET,
  function (err, accountData) {
  res.locals.accountData = accountData
  next()
   })
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
* Middleware remove jwt cookie
**************************************** */
Util.removeJWTToken = (req, res) => {
 if (req.cookies.jwt) {
  res.clearCookie("jwt")
  res.locals.loggedin = 0
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 /* ****************************************
 *  Middleware to check account type
 * ************************************ */
 Util.checkAccountType = (req, res, next) => {
  Util.checkLogin(req, res, () => {
    if (res.locals.accountData.account_type == 'Employee'
        || res.locals.accountData.account_type == 'Admin')
    {
      next()
    } else {
      req.flash("notice", "Please log in with employee credentials to access employee features.")
      return res.redirect("/account/login")
    }
  })
}

module.exports = Util