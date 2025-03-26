const reviewModel = require("../models/review-model")
const accountModel = require("../models/account-model")
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

module.exports = reviewCont