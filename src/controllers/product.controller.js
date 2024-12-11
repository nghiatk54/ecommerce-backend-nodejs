'use strict'

const ProductService = require('../services/product.service')
const ProductServiceV2 = require('../services/product.service.xxx')
const { SuccessResponse } = require('../core/success.response')

class ProductController {
    createProduct = async (req, res, next) => {
        // new SuccessResponse({
        //     message: 'Create new product success',
        //     metadata: await ProductService.createProduct(req.body.product_type, {
        //         ...req.body,
        //         product_shop: req.user.userId
        //     } )
        // }).send(res)

        new SuccessResponse({
            message: 'Create new product success',
            metadata: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            } )
        }).send(res)
    }
    // Update product
    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update product success',
            metadata: await ProductServiceV2.updateProduct(req.body.product_type, req.params.productId, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }


    // Query draft product
    /**
     * @desc Get all drafts for shop
     * @param {String} product_shop
     * @param {Number} limit
     * @param {Number} skip
     * @return {JSON}
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Draft success',
            metadata: await ProductServiceV2.findAllDraftsForShop({product_shop: req.user.userId})
        }).send(res)
    }
    // Query published product
    /**
     * @desc Get all published for shop
     * @param {String} product_shop
     * @param {Number} limit
     * @param {Number} skip
     * @return {JSON}
     */
    getAllPublishedForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Published success',
            metadata: await ProductServiceV2.findAllPublishedForShop({product_shop: req.user.userId})
        }).send(res)
    }
    // Publish product
    /**
     * @desc Publish product by shop
     * @param {String} product_id
     * @param {String} product_shop
     * @return {JSON}
     */
    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Publish product success',
            metadata: await ProductServiceV2.publishProductByShop({product_shop: req.user.userId, product_id: req.params.id})
        }).send(res)
    }
    // Un publish product
    /**
     * @desc Un publish product by shop
     * @param {String} product_id
     * @param {String} product_shop
     * @return {JSON}
     */
    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Un publish product success',
            metadata: await ProductServiceV2.unPublishProductByShop({product_shop: req.user.userId, product_id: req.params.id})
        }).send(res)
    }
    // Query search product by user
    /**
     * @desc Get list search product by user
     * @param {String} keySearch
     * @return {JSON}
     */
    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list search product success',
            metadata: await ProductServiceV2.searchProductByUser(req.params)
        }).send(res)
    }
    // Query find all products
    /**
     * @desc Get list products
     * @param {Number} limit
     * @param {Number} page
     * @param {String} sort
     * @param {String} filter
     * @return {JSON}
     */
    getAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list products success',
            metadata: await ProductServiceV2.findAllProducts(req.query)
        }).send(res)
    }
    // Query find product
    /**
     * @desc Get product by id
     * @param {String} product_id
     * @return {JSON}
     */
    getProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get product success',
            metadata: await ProductServiceV2.findProduct({
                product_id: req.params.product_id
            })
        }).send(res)
    }
}

module.exports = new ProductController()
