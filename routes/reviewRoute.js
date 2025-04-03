// Needed Resources
const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const util = require("../utilities")
const reviewValidate = require("../utilities/review-validation")

// Route to create new review
router.post("/",
    util.checkLogin,
    reviewValidate.reviewRules(),
    reviewValidate.checkReviewData,
    util.handleErrors(reviewController.createReview)
)

// Route to edit a review form
router.get("/edit/:review_id",
    util.checkLogin,
    util.handleErrors(reviewController.buildEditReview)
)

// Route to process a review update
router.post("/update",
    util.checkLogin,
    reviewValidate.reviewUpdateRules(),
    reviewValidate.checkReviewUpdateData,
    util.handleErrors(reviewController.updateReview)
)

// Route to deliver confirm delete view
router.get("/delete/:review_id",
    util.checkLogin,
    util.handleErrors(reviewController.buildDeleteReview)
)

// Route to process deleting a review
router.post("/delete",
    util.checkLogin,
    util.handleErrors(reviewController.deleteReview)
)

module.exports = router;