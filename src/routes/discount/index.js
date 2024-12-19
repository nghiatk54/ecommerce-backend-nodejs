'use strict'

const express = require('express')
const router = express.Router()
const discountController = require('../../controllers/discount.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

// get amount a discount
router.post('/amount', asyncHandler(discountController.getDiscountAmount))
// get all discount code with products
router.get('/list_product_code', asyncHandler(discountController.getAllDiscountCodesWithProducts))
// authentication
router.use(authenticationV2)
// Create discount code
router.post('/', asyncHandler(discountController.createDiscountCode))
// Get all discount codes
router.get('/', asyncHandler(discountController.getAllDiscountCodes))

module.exports = router
