const { reject, resolve } = require('promise')
var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectID
module.exports = {
    addProduct: (product, callback) => {
        db.get().collection('product').insertOne(product).then((data) => {
            callback(data.ops[0]._id)
            console.log(data);
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })

    },
    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            console.log(prodId);
            console.log(objectId(prodId));
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({ _id: objectId(prodId) }).then((response) => {
                //console.log(response);
                resolve(response)
            })
        })
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {
                        Name: proDetails.Name,
                        Description: proDetails.Description,
                        Price: proDetails.Price,
                        Category: proDetails.Category,

                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    shipProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {
                        status: "SHIPPED☑️",
                        shipped: true,
                        order: true
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    deliveredProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {
                        status: "DELIVERED✅",
                        shipped: false,
                        delivered: true
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    deleteUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION)
                .removeOne({ _id: objectId(userId) }).then((response) => {
                    resolve(response)
                })
        })
    }
}