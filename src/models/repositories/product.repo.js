'use strict'

const { product, electronic, clothing, furniture } = require("../../models/product.model")
const { Types } = require('mongoose')
const { getSelectData, unGetSelectData } = require('../../utils')

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
// Query find all products
const findAllProducts = async ({limit, sort, page, filter, select}) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1}
    const products = await product.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean()
    return products
}
// Query find product
const findProduct = async ({product_id, unSelect}) => {
    return await product.findById(product_id)
        .select(unGetSelectData(unSelect))
}
// Update product
const updateProductById = async ({
    productId,
    bodyUpdate,
    model,
    isNew = true
}) => {
    return await model.findByIdAndUpdate(productId, bodyUpdate, {
        new: isNew
    })
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
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById
}