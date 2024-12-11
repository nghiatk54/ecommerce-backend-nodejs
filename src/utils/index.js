'use strict'

const _ = require('lodash')

const getInfoData = ({fileds = [], object = {}}) => {
    return _.pick(object, fileds)
}

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 1]))
}

const unGetSelectData = (unSelect = []) => {
    return Object.fromEntries(unSelect.map(el => [el, 0]))
}
// Remove underfined object
const removeUnderfinedObject = (obj) => {
    Object.keys(obj).forEach(key => {
        if (obj[key] == null) {
            delete obj[key]
        }
    })
    return obj
}
// update nested object
const updateNestedObjectParser = (obj) => {
    if (obj == null || typeof obj !== 'object') {
        return {}
    }
    const final = {}
    Object.keys(obj).forEach(key1 => {
        if (typeof obj[key1] === 'object' && !Array.isArray(obj[key1])) {
            const response = updateNestedObjectParser(obj[key1])
            Object.keys(response).forEach(key2 => {
                final[`${key1}.${key2}`] = response[key2]
            })
        } else {
            final[key1] = obj[key1]
        }
    })
    return final
}

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUnderfinedObject,
    updateNestedObjectParser
}