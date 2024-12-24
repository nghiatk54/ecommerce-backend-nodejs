'use strict'

const {
    BadRequestError,
    NotFoundError
} = require('../core/error.response')
const {cart} = require('../models/cart.model')
const {getProductById} = require('../models/repositories/product.repo')
/*
    Key features: Cart Service
    - add product to cart [user]
    - reduce product quantity [user]
    - increase product quantity by one [user]
    - get cart [user]
    - delete cart [user]
    - delete cart item [user]
*/
class CartService {
    // create cart for user
    static async createUserCart({userId, product}) {
        const query = {cart_userId: userId, cart_state: 'active'}
        const updateOrInsert = {
            $addToSet: {
                cart_products: product
            }
        }
        const options = {upsert: true, new: true}
        return await cart.findOneAndUpdate(query, updateOrInsert, options)
    }
    // update quantity for product in user cart
    static async updateUserCartQuantity({userId, product}){
        const {productId, quantity} = product;
        
        const query = {
            cart_userId: userId,
            'cart_products.productId': productId,
            cart_state: 'active'
        }
        const updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity
            }
        }
        const options = {upsert: true, new: true}
        return await cart.findOneAndUpdate(query, updateSet, options)
    }
    // add product to cart
    static async addToCart({userId, product = {}}) {
        // check cart is exists?
        const userCart = await cart.findOne({
            cart_userId: userId
        })
        if(!userCart) {
            // create cart for user
            return await CartService.createUserCart({userId, product})
        }
        if(userCart.cart_products.length == 0) {
            userCart.cart_products = [product]
            return await userCart.save()
        }
        return await CartService.updateUserCartQuantity({userId, product})
    }
    // update cart
    /*
        shop_order_ids: [
            {
                shopId,
                item_products: [
                    {
                        quantity,
                        price,
                        shopId,
                        old_quantity,
                        productId
                    }
                ],
                version
            }
        ]
    */
   static async addToCartV2({userId, shop_order_ids = {}}){
        const {productId, quantity, old_quantity} = shop_order_ids[0]?.item_products[0]
        const foundProduct = await getProductById({productId})
        if(!foundProduct) throw new NotFoundError('Product not found')
        if(foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId){
            throw new NotFoundError('Product do not belong to the shop')
        }
        if(quantity === 0){
            // deleted
        }
        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity
            }
        })
   }
    // delete user cart
    static async deleteUserCart({userId, productId}) {
        const query = {cart_userId: userId, cart_state: 'active'}
        const updateSet = {
            $pull: {
                cart_products: {
                    productId
                }
            }
        }
        const deleteCart = await cart.updateOne(query, updateSet)
        return deleteCart
    }
    // get list user cart
    static async getListUserCart({userId}) {
        return await cart.findOne({
            cart_userId: +userId
        }).lean()
    }     
}

module.exports = CartService