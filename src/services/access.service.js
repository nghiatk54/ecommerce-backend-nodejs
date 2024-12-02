'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, ConflictRequestError, AuthFailureError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    static logout = async(keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log(`Deleted Key::`, delKey)
        return delKey
    }

    /* 
        1. Check email in dbs
        2. Match password
        3. Create access token and refresh token, save dbs
        4. Generate tokens
        5. Get data return login
    */
    static login = async({ email, password, refreshToken = null }) => {
        // step 1: check email in dbs
        const foundShop = await findByEmail({ email})
        if (!foundShop) throw new BadRequestError('Shop not registered!')
        
        // step 2: match password
        const match = bcrypt.compare(password, foundShop.password)
        if (!match) throw new AuthFailureError('Authentication error!')
        
        // step 3: create token pair
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        // step 4: generate tokens
        const { _id: userId } = foundShop
        const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            userId,
            refreshToken: tokens.refreshToken,
            privateKey, publicKey
        })
        return {
            shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: foundShop}),
            tokens
        }

    }



    static signUp = async ({ name, email, password }) => {
        // step 1: check email exists?
        const holderShop = await shopModel.findOne({ email }).lean()
        if (holderShop) {
            throw new BadRequestError('Error: Shop already registered!')
        }

        // step 2: create new shop
        const passwordHash = await bcrypt.hash(password, 10)
        const newShop = await shopModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })

        if (newShop) {
            // create public and private key
            const privateKey = crypto.randomBytes(64).toString('hex')
            const publicKey = crypto.randomBytes(64).toString('hex')

            console.log({ privateKey, publicKey }) // save collection KeyStore

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })

            if (!keyStore) {
                throw new BadRequestError('KeyStore error')
            }

            // Created token pair
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
            console.log(`Created Token Success::`, tokens)
            return {
                code: 201,
                metadata: {
                    shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: newShop }),
                    tokens
                }
            }
        }

        return {
            code: 200,
            metadata: null
        }
    }
}

module.exports = AccessService;