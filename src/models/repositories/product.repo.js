'use strict'

const { product, electronic, clothing, furniture } = require("../../models/product.model")
const { Types } = require('mongoose')

// Query draft product
const findAllDraftsForShop = async ({query, limit, skip}) => {
    return await queryProduct({query, limit, skip})
}
// Query published product
const findAllPublishedForShop = async ({query, limit, skip}) => {
    return await queryProduct({query, limit, skip})
}
// Query search product by user
const searchProductByUser = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch)
    const results = await product.find({
        isDraft: false,
        $text: {
            $search: regexSearch
        }
    }, {
        score: {$meta: 'textScore'}
    })
    .sort({score: {$meta: 'textScore'}})
    .lean()
    return results
}
// Publish product
const publishProductByShop = async ({product_shop, product_id}) => {
    const foundProduct = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if(!foundProduct) return null
    foundProduct.isDraft = false
    foundProduct.isPublished = true
    const { modifiedCount } = await foundProduct.updateOne(foundProduct)
    return modifiedCount
}
// Un publish product
const unPublishProductByShop = async ({product_shop, product_id}) => {
    const foundProduct = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if(!foundProduct) return null
    foundProduct.isDraft = true
    foundProduct.isPublished = false
    const { modifiedCount } = await foundProduct.updateOne(foundProduct)
    return modifiedCount
}
// Query product
const queryProduct = async ({query, limit, skip}) => {
    return await product.find(query)
        .populate('product_shop', 'name email -_id')
        .sort({updateAt: -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}

module.exports = {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishedForShop,
    unPublishProductByShop,
    searchProductByUser
}