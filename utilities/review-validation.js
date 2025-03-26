const utilities = require(".")
const { body, validationResult } = require("express-validator")
const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const validate = {}

/*  **********************************
  *  Review Data Validation Rules
  * ********************************* */
validate.reviewRules = () => {
   return [
    // review text is required and must be a string of at least 3 characters
    body("review_text")
       .trim()
       .escape()
       .isLength({ min: 3 })
       .withMessage("Please include a review."),

     // account_id is required and must be integer
     body("account_id")
       .trim()
       .escape()
       .notEmpty()
       .isInt()
       .withMessage("Account id not found, please contact admin."),

     // inv_id is required and must be integer
     body("inv_id")
       .trim()
       .escape()
       .notEmpty()
       .bail()
       .isInt()
       .withMessage("Inventory id not found, please contact admin."),
    ]
}

/* ******************************
 * Check review data and return errors or continue to add review
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { review_text, account_id, inv_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const data = await invModel.getInventoryById(inv_id)
    console.log("data", data)
    const main = await utilities.buildVehicleDetail(data)
    const reviewData = await reviewModel.getReviewsByInvId(inv_id)
    const reviews = await utilities.buildVehicleReviews(reviewData)
    const year = data[0].inv_year
    const make = data[0].inv_make
    const model = data[0].inv_model
    const pageTitle = `${year} ${make} ${model}`
    console.log("errors", errors)
    res.render(`inventory/detail`, {
        title: pageTitle,
        nav,
        main,
        reviews,
        inventory_id: inv_id,
        errors,
    })
    return
  }
  next()
}

module.exports = validate