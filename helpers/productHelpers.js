var db = require('../config/connections')
var objectId = require('mongodb').ObjectID
module.exports = {
    addproducts: function (products, callback) {

        db.get().collection("product").insertOne(products).then((data) => {
            console.log('is it worked')
            console.log(data)
            console.log("worked")
            callback(data.insertedId)
        })
    },
    getallproducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection('product').find().toArray()
            resolve(products)

        })
    },
    deleteproduct: (proId) => {
        console.log("working")
        return new Promise((resolve, reject) => {
            db.get().collection("product").remove({ _id: objectId(proId) }).then((response) => {
                resolve(response)
            })

        })

    },
    editproduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            console.log(proDetails)
            console.log(proId)
            if (proDetails.imageFile.length > 0) {

                db.get().collection('product').updateMany({ _id: objectId(proId) }, {
                    $set: {
                        name: proDetails.name,
                        price: proDetails.price,
                        description: proDetails.description,
                        brand: proDetails.brand,
                        category: proDetails.category,
                        offerprice: proDetails.offerprice,
                        imageFile: proDetails.imageFile

                    }
                }).then((response) => {
                    console.log('HELOO')
                    console.log(response)
                    resolve(response)

                })
            }
            else {
                db.get().collection('product').updateMany({ _id: objectId(proId) }, {
                    $set: {
                        name: proDetails.name,
                        price: proDetails.price,
                        description: proDetails.description,
                        brand: proDetails.brand,
                        category: proDetails.category,
                        offerprice: proDetails.offerprice,

                    }
                }).then((response) => {
                    console.log('HELOO')
                    console.log(response)
                    resolve(response)

                })
            }

        })
    }
    ,
    getproductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection('product').findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })

        })

    }


}