'use strict'

const { 
    BadRequestError,
    NotFoundError
 } = require("../core/error.response")
const { discount } = require("../models/discount.model")
const { 
    findAllDiscountCodesUnSelect,
    findAllDiscountCodesSelect,
    checkDiscountExists
 } = require("../models/repositories/discount.repo")
const { findAllProducts } = require("../models/repositories/product.repo")
const { convertToObjectIdMongodb } = require("../utils")

/*
    Discount Services
    1 - Generator Discount Code [Shop | Admin]
    2 - Get discount amount [User]
    3 - Get all discount code [User | Shop]
    4 - Verify discount code [User]
    5 - Delete discount code [Admin | Shop]
    6 - Cancel discount code [User]
*/

class DiscountService {
    // Create discount code
    static async createDiscountCode(payload) {
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids,
            applies_to, name, description, type,
            value, max_value, max_uses, uses_count,
            users_used,max_uses_per_user
        } = payload
        // Validate
        if(new Date() >= new Date(start_date)) {
            throw new BadRequestError('Discount code is not expired')
        }
        if(new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError("Start date must be less than end date")
        }
        // Create index for discount code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean()

        if(foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount code is already used!')
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used || [],
            discount_max_uses_per_user: max_uses_per_user,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_shopId: convertToObjectIdMongodb(shopId),
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids,
        })

        return newDiscount
    }
    // Update discount code
    static async updateDiscountCode(payload) {

    }
    // Get all discount code available with products
    static async getAllDiscountCodesWithProducts({
        code, shopId, userId, limit, page
    }) {
        // Create index for discount code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean()
        
        if(!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError('Discount code not exists!')
        }
        let products = []
        const { discount_applies_to, discount_product_ids } = foundDiscount
        if(discount_applies_to === 'all') {
            // get all products
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
        if(discount_applies_to === 'specific') {
            // get the product ids
            products = await findAllProducts({
                filter: {
                    _id: {$in: discount_product_ids},
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        return products

    }
    // Get all discount code of Shop
    static async getAllDiscountCodesByShop(
        {
            limit, page, shopId
        }
    ) {
        const discounts = await findAllDiscountCodesUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        })
        return discounts
    }
    // Apply discount code
    static async getDiscountAmount({
        codeId, userId, shopId, products
    }){
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            }
        })
        if(!foundDiscount) {
            throw new NotFoundError('Discount code not exists!')
        }
        const {
            discount_is_active,
            discount_max_uses,
            discount_start_date,
            discount_end_date,
            discount_min_order_value,
            discount_max_uses_per_user,
            discount_users_used,
            discount_type,
            discount_value
        } = foundDiscount
        if(!discount_is_active) throw new NotFoundError("Discount expired!")
        if(!discount_max_uses) throw new NotFoundError("Discount are out!")
        // if(new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
        //     throw new NotFoundError("Discount expired!")
        // }
        // Set total order value
        let totalOrderValue = 0
        if(discount_min_order_value > 0) {
            totalOrderValue = products.reduce((acc, product) => {
                return acc + product.quantity * product.price
            }, 0)
            if(totalOrderValue < discount_min_order_value) throw new NotFoundError(`Discount requires minimum order value of ${discount_min_order_value}!`)
        }
        if(discount_max_uses_per_user > 0){
            const userUsedDiscount = discount_users_used.find(user => user.userId === userId)
            if(userUsedDiscount) {
                // .....
            }
        }
        const amount = discount_type === 'fixed_amount' ? discount_value : (totalOrderValue * discount_value / 100)
        return {
            totalOrderValue,
            discount: amount,
            totalPrice: totalOrderValue - amount > 0 ? totalOrderValue - amount : 0
        }

    }
    // Delete discount code
    static async deleteDiscountCode({
        shopId, codeId
    }) {
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId)
        })
        return deleted
    }
    // Cancel discount code
    static async cancelDiscountCode({
        codeId, userId, shopId
    }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })
        if(!foundDiscount) throw new NotFoundError('Discount code not exists!')
        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        })
        return result
    }
}

module.exports = DiscountService