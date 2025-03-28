// Needed Resources
const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const util = require("../utilities")
const reviewValidate = require("../utilities/review-validation")

// Route to create new review
router.post("/",
    reviewValidate.reviewRules(),
    reviewValidate.checkReviewData,
    util.handleErrors(reviewController.createReview)
)

// Route to edit a review form
router.get("/edit/:review_id",
    util.handleErrors(reviewController.buildEditReview)
)


module.exports = router;