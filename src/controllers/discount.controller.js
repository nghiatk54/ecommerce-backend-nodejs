'use strict'

const DiscountService = require("../services/discount.service")
const { SuccessResponse } = require("../core/success.response")

class DiscountController {
    // Create discount code
    createDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Code Generator',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res)
    }
    // Get all discount codes
    getAllDiscountCodes = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Code Found',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res)
    }
    // Get discount amount
    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Discount Amount Found',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body
            })
        }).send(res)
    }
    // Get all discount codes with products
    getAllDiscountCodesWithProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Discount Code Found',
            metadata: await DiscountService.getAllDiscountCodesWithProducts({
                ...req.query
            })
        }).send(res)
    }
}

module.exports = new DiscountController()