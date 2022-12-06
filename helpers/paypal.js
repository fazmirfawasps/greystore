var paypal = require("paypal-rest-sdk");
var db = require("../config/connections");

require('dotenv').config()

var objectID = require("mongodb").ObjectId;

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:process.env.payPal_client_id,
  client_secret:process.env.payPal_client_secret
});

module.exports = {
  items: (userid) => {
    return new Promise(async (resolve, reject) => {
      let proid1 = await db
        .get()
        .collection('cart')
        .aggregate([
          {
            $match: {
              user: objectID(userid),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: 'product',
              localField: "products.product",
              foreignField: "_id",
              as: "orderitem",
            },
          },
          {
            $project: {
              proid: "$products.product",
              time: "$products.time",
              orderlist: {
                $arrayElemAt: ["$orderitem", 0],
              },
              quantity: "$products.quantity",
            },
          },
          {
            $project: {
              _id: 0,
              proid: 1,
              time: 1,
              orderlist: 1,
              quantity: 1,
            },
          },
          {
            $project: {
              name: "$orderlist.name",
              total: "$orderlist.offerprice",
              quantity: 1,
            },
          },
          {
            $addFields: {
              price: {
                $toInt: ["$total"],
              },
            },
          },
          {
            $project: {
              name: "$name",
              sku: "item",
              price: {
                $round: [
                  {
                    $multiply: ["$price", 0.012],
                  },
                  0,
                ],
              },
              currency: "USD",
              quantity: "$quantity",
            },
          },
        ])
        .toArray();

      console.log(proid1);

      resolve(proid1);
    });
  },
  createorder: (items, total) => {
    return new Promise((resolve, reject) => {
      var create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:4000/users/verifyPaypal",
          cancel_url: "http://localhost:4000/cancel",
        },
        transactions: [
          {
            item_list: {
              items: items,
            },
            amount: {
              currency: "USD",
              total: total,
            },
            description: "This is the payment description.",
          },
        ],
      };
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          console.log("Create Payment Response");
          console.log(payment);
          resolve(payment);
        }
      });
    });
  },
  verify: (payerId, paymentId, total) => {
    console.log('ITHLK VANNU')
    return new Promise((resolve, reject) => {
      const execute_payment_json = {
        payer_id: payerId,
        transactions: [
          {
            amount: {
              currency: "USD",
              total: total,
            },
          },
        ],
      };

      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        function (error, payment) {
          if (error) {
            console.log(error.response);
            throw error;
          } else {
            console.log(JSON.stringify(payment));
            resolve();
          }
        }
      );
    });
  },
};
