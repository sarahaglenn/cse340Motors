const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const reviewCont = {}

/* ***************************
 *  Process creation of review
 * ************************** */
reviewCont.createReview = async function (req, res, next) {
  let nav = await utilities.getNav
  const { account_id, inv_id, review_text } = req.body
  const createReviewResult = await reviewModel.createReview(account_id, inv_id, review_text)

  if (createReviewResult) {
    res.status(201).redirect(`/inv/detail/${inv_id}`)
  } else {
    req.flash("failure", "Sorry, the review could not be added.")
    res.status(501)
  }
}
/* ***************************
 *  Build edit review view
 * ************************** */
reviewCont.buildEditReview = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id)
  let nav = await utilities.getNav()
  const reviewData = (await reviewModel.getReviewById(review_id))[0]
  const vehicleData = (await invModel.getInventoryById(reviewData.inv_id))[0]
  dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  const date = reviewData.review_date.toLocaleString("en-US", dateOptions)
  const carDetails = `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`
  if (reviewData.account_id == res.locals.accountData.account_id) {
    res.render("./reviews/edit-review", {
      title: `Edit Review for ${carDetails}`,
      nav,
      errors: null,
      carDetails,
      review_id,
      review_date: date,
      review_text: reviewData.review_text,
    })
  }
  else {
      req.flash("notice", "To edit this review, please login as the author.")
      return res.redirect("/account/login")
  }
}

/* ****************************************
*  Process Review Update
* *************************************** */
reviewCont.updateReview = async function (req, res) {
  let nav = await utilities.getNav()
  const { review_id, review_text} = req.body
  account_id = res.locals.accountData.account_id
  const reviewData = await reviewModel.getReviewsByAccountId(account_id)
  reviews = await utilities.getSingleUserReviewHTML(reviewData)
  const main = await utilities.buildAccountMain(req, res)

  const updateResult = await reviewModel.updateReview(
    review_id,
    review_text
  )
  if (updateResult) {
    req.flash(
      "success",
      `Your review has been updated.`
    )
    res.status(201).render("account/management", {
      title: "Account Management",
      nav,
      main,
      reviews,
      errors: null,
    })
  } else {
    req.flash("failure", "Sorry, the review could not be updated.")
    res.status(501).render("account/management", {
      title: "Account Management",
      nav,
      main,
      reviews,
      errors: null,
    })
  }
}

/* ***************************
 *  Build delete review view
 * ************************** */
reviewCont.buildDeleteReview = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id)
  let nav = await utilities.getNav()
  const reviewData = (await reviewModel.getReviewById(review_id))[0]
  console.log("reviewData", reviewData)
  const vehicleData = (await invModel.getInventoryById(reviewData.inv_id))[0]
  dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  const date = reviewData.review_date.toLocaleString("en-US", dateOptions)
  const carDetails = `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`
  if (reviewData.account_id == res.locals.accountData.account_id) {
    res.render("./reviews/delete-review", {
      title: `Confirm Delete Review for ${carDetails}`,
      nav,
      errors: null,
      carDetails,
      review_id,
      review_date: date,
      review_text: reviewData.review_text,
    })
  }
  else {
      req.flash("notice", "To delete this review, please login as the author.")
      return res.redirect("/account/login")
  }
}

/* ****************************************
*  Process deleting review
* *************************************** */
reviewCont.deleteReview = async function (req, res) {
  let nav = await utilities.getNav()
  const review_id= parseInt(req.body.review_id)
  const { carDetails } = req.body

  const deleteResult = await reviewModel.deleteReview(review_id)

  if (deleteResult) {
    req.flash(
      "success",
      `The review was successfully deleted.`
    )
    res.redirect("/account/")
  } else {
    req.flash("failure", "Sorry, the review could not be deleted.")
    res.status(501).render("review/delete", {
      title: `Delete ${carDetails}`,
      nav,
      errors: null,

    })
  }
}

module.exports = reviewCont