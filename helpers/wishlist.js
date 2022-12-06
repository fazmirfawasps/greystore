const { ObjectId } = require('mongodb')
var db=require('../config/connections')
module.exports={
    addtowishlist: (userId, productId) => {
        let wishItem = {
          product: ObjectId(productId),
          Time: new Date(),
        };
        return new Promise(async (resolve, reject) => {
          let userWishlist = await db
            .get()
            .collection('wishlist')
            .findOne({ user: ObjectId(userId) });
          console.log(userWishlist);
          if (userWishlist) {
            let productExist = userWishlist.products.findIndex(
              (products) => products.product == productId
            );
            if (productExist == -1) {
              db.get()
                .collection('wishlist')
                .updateOne(
                  { user: ObjectId(userId) },
                  { $push: { products: wishItem } }
                )
                .then(() => {
                  resolve();
                });
            } else {
              db.get()
                .collection('wishlist')
                .updateOne(
                  { user: ObjectId(userId) },
                  {
                    $pull: { products: { product: ObjectId(productId) } },
                  }
                )
                .then(() => {
                  resolve();
                });
            }
          } else {
            let whislist = {
              user: ObjectId(userId),
              products: [wishItem],
            };
            db.get()
              .collection('wishlist')
              .insertOne(whislist)
              .then(() => {
                resolve();
              });
          }
        });
      },
      getwishlist: (userId) => {
        return new Promise(async (resolve, reject) => {
          let wishlist = await db
            .get()
            .collection('wishlist')
            .aggregate([
              {
                $match: { user: ObjectId(userId) },
              },
              {
                $unwind: "$products",
              },
              {
                $lookup: {
                  from: 'product',
                  localField: "products.product",
                  foreignField: "_id",
                  as: "Product",
                },
              },
              {
                $project: {
                  _id: 0,
                  user: 1,
                  time: "$products.Time",
                  products: { $arrayElemAt: ["$Product", 0] },
                },
              },
              {
                $sort: { time: -1 },
              },
            ])
            .toArray();
          resolve(wishlist);
        });
      },

      deleteWishlist: (userId, proid) => {
        return new Promise((resolve, reject) => {
          db.get()
            .collection('wishlist')
            .updateOne(
              { user: ObjectId(userId) },
              {
                $pull: { products: { product: ObjectId(proid) } },
              }
            )
            .then(() => {
              resolve();
            });
        });
      },
}