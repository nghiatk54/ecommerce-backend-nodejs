'use strict'

const { BadRequestError, ForbiddenError } = require('../core/error.response')
const { product, clothing, electronic, furniture } = require('../models/product.model')
const { findAllDraftsForShop,
    publishProductByShop,
    findAllPublishedForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById
} = require('../models/repositories/product.repo')
const { removeUnderfinedObject, updateNestedObjectParser } = require('../utils')

// define Factory class to create product
class ProductFactory {
    /*
        type: 'Clothing'
        payload
    */
    static productRegistry = {}
    // register product type
    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef
    }
    // create product
    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) throw new BadRequestError(`Invalid product type ${type}`)
        return new productClass(payload).createProduct()
    }
    // update product
    static async updateProduct(type, productId, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if(!productClass) throw new BadRequestError(`Invalid product type ${type}`)
        return new productClass(payload).updateProduct(productId)
    }
    // publish product
    static async publishProductByShop({product_shop, product_id}) {
        return await publishProductByShop({product_shop, product_id})
    }
    // un publish product
    static async unPublishProductByShop({product_shop, product_id}) {
        return await unPublishProductByShop({product_shop, product_id})
    }
    // query draft product
    static async findAllDraftsForShop({product_shop, limit = 50, skip = 0}){
        const query = { product_shop, isDraft: true};
        return await findAllDraftsForShop({query, limit, skip})
    }
    // query published product
    static async findAllPublishedForShop({product_shop, limit = 50, skip = 0}){
        const query = { product_shop, isPublished: true};
        return await findAllPublishedForShop({query, limit, skip})
    }
    // Query list search product
    static async searchProductByUser({keySearch = ''}){
        return await searchProductByUser({keySearch})
    }
    // Query find all products
    static async findAllProducts({limit = 50, sort = 'ctime', page = 1, filter = {isPublished: true}}){
        return await findAllProducts({
            limit, sort, page, filter,
            select: ['product_name', 'product_price', 'product_thumb']
        })
    }
    // Query find product
    static async findProduct({product_id}){
        return await findProduct({product_id, unSelect: ['__v']})
    }

}
// define base product class
class Product {
    constructor({
        product_name, product_thumb, product_description, product_price, product_quantity, product_type, product_shop, product_attributes
    }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }
    // create new product
    async createProduct(productId) {
        return await product.create({
            ...this,
            _id: productId
        })
    }
    // Update product
    async updateProduct(productId, bodyUpdate) {
        return await updateProductById({productId, bodyUpdate, model: product})
    }
}
// define sub-class for different product types Clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newClothing) throw new BadRequestError("Create new Clothing error")
        const newProduct = await super.createProduct(newClothing._id)
        if (!newProduct) throw new BadRequestError("Create new Product error")
        return newProduct
    }
    async updateProduct(productId) {
        // 1. Remove attr has null and underfined
        const objectParams = removeUnderfinedObject(this)
        // 2. Check placeholder update
        if(objectParams.product_attributes){
            // Update child
            await updateProductById({productId,
                 bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
                 model: clothing})
        }
        const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams))
        return updateProduct
    }
}
// define sub-class for different product types Electronic
class Electronic extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newElectronic) throw new BadRequestError("Create new Electronic error")
        const newProduct = await super.createProduct(newElectronic._id)
        if (!newProduct) throw new BadRequestError("Create new Product error")
        return newProduct
    }
}
// define sub-class for different product types Furniture
class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newFurniture) throw new BadRequestError("Create new Furniture error")
        const newProduct = await super.createProduct(newFurniture._id)
        if (!newProduct) throw new BadRequestError("Create new Product error")
        return newProduct
    }
}
// register product types
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Electronic', Electronic)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory