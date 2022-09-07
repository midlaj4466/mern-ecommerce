var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { reject, resolve } = require('promise')
var objectId = require('mongodb').ObjectID
const { response } = require('express')

module.exports = {
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admins = await db.get().collection(collection.ADMINS_COLLECTION).findOne({ Email: adminData.Email })
            if (admins) {
                bcrypt.compare(adminData.Password, admins.Password).then((status) => {
                    if (status) {
                        console.log('login success');
                        response.admins = admins
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Login failed")
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('email incorrect');
                resolve({ status: false })
            }
        })
    },
    getOrderProducts: () => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).find({}).toArray(this.userId)
            console.log(orderItems);
            resolve(orderItems)

        })


    },
    getUserDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            let userDetails = await db.get().collection(collection.USER_COLLECTION).find({
                "_id": objectId(userId)
            }).toArray()
            if (userDetails) {
                console.log(userDetails);
                resolve(userDetails)
            } else {
                console.log("No user!!");
            }


        })
    },
    getUserOrders: (_id) => {
        return new Promise(async (resolve, reject) => {
            console.log(_id);
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(_id) }).toArray()
            console.log(orders);
            resolve(orders)
        })
    },
    getUserOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            console.log(orderItems);
            resolve(orderItems)
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let userDetails = await db.get().collection(collection.USER_COLLECTION).find({}).toArray(this.userId)
            console.log(userDetails);
            resolve(userDetails)

        })


    },
    resetPassword: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION)
                .updateOne({ _id: objectId(userId) }, {
                    $set: {
                        Password: "$2b$10$WdTc918FZw0O6jeba7doA.LxMjQh/7u4E8HyxXxFqLV4d2DWwUxwy"
                    }
                }).then((response) => {
                    resolve()
                })
        })
    }
}