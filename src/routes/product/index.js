'use strict'

const express = require('express')
const router = express.Router()
const productController = require('../../controllers/product.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authentication, authenticationV2 } = require('../../auth/authUtils')

router.get('/search/:keySearch', asyncHandler(productController.getListSearchProduct))
// authentication
router.use(authenticationV2)
// Create product
router.post('/', asyncHandler(productController.createProduct))
// Publish product
router.put('/publish/:id', asyncHandler(productController.publishProductByShop))
// Un publish product
router.put('/un-publish/:id', asyncHandler(productController.unPublishProductByShop))
// Query draft product
router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop))
// Query published product
router.get('/published/all', asyncHandler(productController.getAllPublishedForShop))

module.exports = router