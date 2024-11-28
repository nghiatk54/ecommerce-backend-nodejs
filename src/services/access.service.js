'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    static signUp = async ({name, email, password}) => {
        try {
            // step 1: check email exists?
            const holderShop = await shopModel.findOne({email}).lean()
            if (holderShop) {
                return {
                    code: 'xxxx',
                    message: 'Shop already registered!'
                }
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

                if(!keyStore) {
                    return {
                        code: 'xxxx',
                        message: 'KeyStore error'
                    }
                }

                // Created token pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
                console.log(`Created Token Success::`, tokens)
                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({fileds: ['_id', 'name', 'email'], object: newShop}),
                        tokens
                    }
                }
            }

            return {
                code: 200,
                metadata: null
            }
        } catch (error) {
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    }
}

module.exports = AccessService;