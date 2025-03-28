const reviewModel = require("../models/review-model")
const accountModel = require("../models/account-model")
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
    req.flash("notice", "Sorry, the review could not be added.")
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
  console.log("reviewData so far", reviewData)
  const vehicleData = (await invModel.getInventoryById(reviewData.inv_id))[0]
  dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  const date = reviewData.review_date.toLocaleString("en-US", dateOptions)
  res.render("./reviews/edit-review", {
    title: `Edit Review for ${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
    nav,
    errors: null,
    review_date: date,
    review_text: reviewData.review_text,
  })
}

module.exports = reviewCont