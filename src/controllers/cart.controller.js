'use strict'

const CartService = require('../services/cart.service')
const {SuccessResponse} = require('../core/success.response')

class CartController {
    // add to cart
    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new cart success!',
            metadata: await CartService.addToCart(req.body)
        }).send(res)
    }
    // update cart
    updateCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update cart success!',
            metadata: await CartService.addToCartV2(req.body)
        }).send(res)
    }
    // delete cart
    deleteCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Deleted cart success!',
            metadata: await CartService.deleteUserCart(req.body)
        }).send(res)
    }
    // get list user cart
    getListUserCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list user cart success!',
            metadata: await CartService.getListUserCart(req.query)
        }).send(res)
    }


}

module.exports = new CartController()