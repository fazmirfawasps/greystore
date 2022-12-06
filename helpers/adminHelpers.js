var db=require('../config/connections')
var objectId=require('mongodb').ObjectID
module.exports={
    viewCustomers:()=>{
        return new Promise(async(resolve, reject) => {
            let customers=await db.get().collection('user').find().toArray()
            resolve(customers)
        })
    },
    unBlockCustomers:(cusId)=>{
        console.log("what afuck")
        return new Promise((resolve, reject) => {
            db.get().collection('user').updateOne({_id:objectId(cusId)},{
                $set:{ 
                    block:false
    
                }
            }).then((response)=>{
                resolve(response)
            })
        
        })
    },

    blockCustomers:(cusId)=>{
        console.log('block start working')
        return new Promise((resolve, reject) => {
            db.get().collection('user').updateOne({_id:objectId(cusId)},{
                $set:{
                    block:true
                }
            }).then((response)=>{
                resolve(response)
                console.log('mission passed')
            })
        })
    },

    chart:()=>{
      return  new Promise(async(resolve, reject) => {
            Chart = await db
        .get()
        .collection('order')
        .aggregate([
          {
            $group: {
              _id: "$payment",
              Total: {
                $count: {},
              },
            },
          },
        ])
        .toArray();
        console.log(Chart)
        resolve(Chart)
        })
    },
    getYearly: () => {
        return new Promise(async (resolve, reject) => {
          var graphDta = await db
            .get()
            .collection('order')
            .aggregate([
              {
                $project: {
                  day: {
                    $dayOfMonth: {
                      $dateFromString: {
                        dateString: "$orderDate",
                      },
                    },
                  },
                  month: {
                    $month: {
                      $dateFromString: {
                        dateString: "$orderDate",
                      },
                    },
                  },
                  year: {
                    $year: {
                      $dateFromString: {
                        dateString: "$orderDate",
                      },
                    },
                  },
                },
              },
              {
                $group: {
                  _id: {
                    // day: "$day",
                    month: "$month",
                    // year: "$year"
                  },
                  Total: {
                    $count: {},
                  },
                },
              },
            ])
            .toArray();
          resolve(graphDta);
        });
      },
      dailysale: () => {
        test =
          new Date().getDate() +
          "-" +
          (new Date().getMonth() + 1) +
          "-" +
          new Date().getFullYear();
        return new Promise(async (resolve, reject) => {
          let dailysale = await db
            .get()
            .collection('order')
            .aggregate([
              {
                $match: {
                  $and: [
                    {
                      paymentStatus: "Success",
                    },
                    {
                      orderDate: {
                        $eq: test,
                      },
                    },
                  ],
                },
              }
             

            ])
            .toArray();
          console.log(dailysale);
          resolve(dailysale);
        });
      },
      weeklySale: () => {
        console.log('ithlk keri')
        return new Promise(async (resolve, reject) => {
          let data = await db
            .get()
            .collection('order')
            .aggregate([
              {
                $match: {
                  paymentStatus: "Success",
                },
              },
    
              {
                $addFields: {
                  day: {
                    $dayOfMonth: {
                      $dateFromString: {
                        dateString: "$orderDate",
                      },
                    },
                  },
                  month: {
                    $month: {
                      $dateFromString: {
                        dateString: "$orderDate",
                      },
                    },
                  },
                  year: {
                    $year: {
                      $dateFromString: {
                        dateString: "$orderDate",
                      },
                    },
                  },
                },
              },
              {
                $addFields: {
                  date: {
                    $dateFromParts: {
                      year: "$year",
                      month: "$month",
                      day: "$day",
                      hour: 12,
                    },
                  },
                },
              },
              {
                $match: {
                  date: {
                    $gt: new Date(new Date() - 7 * 60 * 60 * 12 * 1000),
                  },
                },
              },
            ])
            .toArray();
            console.log(data)
          resolve(data);
        });
      },

      viewSingeleproduct:(orderid)=>{

        return new Promise(async(resolve, reject) => {
         let product=await db.get().collection('order').aggregate([
            {
             $match:{
              _id:objectId(orderid)
             }
          },
          {
            $unwind:'$products'
          },
          {
            $project: {
              user:1,
              product: "$products.product",
              
              quantity: "$products.quantity",
              totalprice:'$products.totalprice',
              SPstatus:"$products.Status",
              status:1
              
            },
          },
          {

            $lookup: {
              from: 'product',
              localField: "product",
              foreignField: "_id",
              as: "cartItems",
            },
          },
          
          {
            $project: {
              user:1,
              product: 1,
              status: 1,
              quantity: 1,
              totalprice:1,
              SPstatus:1,
              products: {
                $arrayElemAt: ["$cartItems", 0],
              },
            },
          },


        ]).toArray()
       console.log(product)
       resolve(product)
        })
  },
  fromTo: (dates) => {
    return new Promise(async (resolve, reject) => {
      if (dates.FromDate.trim().length === 0) {
        var from = new Date();
        from.setUTCHours(0, 0, 0, 0);
      } else {
        var from = new Date(dates.FromDate);
      }
      if (dates.ToDate.trim().length === 0) {
        var to = new Date();
        to.setUTCHours(0, 0, 0, 0);
      } else {
        var to = new Date(dates.ToDate);
      }
      let Data = await db
        .get()
        .collection('order')
        .aggregate([
          {
            $match: {
              paymentStatus: "Success",
            },
          },
          {
            $addFields: {
              date: {
                $dateFromString: {
                  dateString: "$orderDate",
                },
              },
            },
          },
          {
            $match: { date: { $gte: from, $lte: to } },
          },
          {
            $project: {
              _id: 1,
              user: 1,
              ToatalAmount: 1,
              date: 1,
              products: 1,
              orderDate: 1,
            },
          },
          {
            $unwind: "$products",
            // },{
            //   $match:{'products.status':'Delivered'}
            // },{
          },
          {
            $project: {
              product: "$products.product",
              name: "$products.name",
              quantity: "$products.quantity",
              Total: "$products.totalprice",
            },
          },
          {
            $group: {
              _id: "$product",
              quantity: { $sum: "$quantity" },
              total: { $sum: "$Total" },
            },
          },
          {
            $lookup: {
              from: 'product',
              localField: "_id",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $addFields: {
              products: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $project: {
              _id: 1,
              quantity: 1,
              total: 1,
              productName: "$products.name",
              brand: "$products.brand",
              category: "$products.category",
            },
          },
        ])
        .toArray();
        console.log(Data)
      resolve(Data);
    });
  },
  getSalesByMonth: (dateData) => {
    datamonth = parseInt(dateData.month);
    datayear = parseInt(dateData.year);
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection('order')
        .aggregate([
          {
            $match: {
              paymentStatus: "Success",
            },
          },
          {
            $addFields: {
              day: {
                $dayOfMonth: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
              month: {
                $month: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
              year: {
                $year: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
            },
          },
          {
            $match: { month: datamonth, year: datayear },
          },
          {
            $unwind: "$products",
          },
          {
            $group: {
              _id: "$orderDate",
              quantity: { $sum: "$products.quantity" },
              total: { $sum: "$TotalAmount" },
            },
          },
        ])
        .toArray();
      resolve(orders);
    });
  }
  ,
  getSalesByyear: (dateData) => {
    datayear = parseInt(dateData.yearly);
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection('order')
        .aggregate([
          {
            $match: {
              paymentStatus: "Success",
            },
          },
          {
            $addFields: {
              month: {
                $month: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
              year: {
                $year: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
            },
          },
          {
            $match: { year: datayear },
          },
          {
            $unwind: "$products",
          },
          {
            $group: {
              _id: "$month",
              quantity: { $sum: "$products.quantity" },
              total: { $sum: "$TotalAmount" },
            },
          },
        ])
        .toArray();
      resolve(orders);
    });
  },
  amount: () => {
    return new Promise((resolve, reject) => {
      Amount = db
        .get()
        .collection('order')
        .aggregate([
          {
            $group: {
              _id: "$payment",
              Total: {
                $sum: "$TotalAmount",
              },
            },
          },
        ])
        .toArray();
      resolve(Amount);
    });
  },
  categorychart: () => {
   
    return new Promise(async (resolve, reject) => {
      let categorychart = await db
        .get()
        .collection('order')
        .aggregate([
          {
            $match: {
              paymentStatus: "Success",
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              product: "$products.product",
              name: "$products.name",
              quantity: "$products.quantity",
              Total: "$products.totalprice",
            },
          },
          {
            $lookup: {
              from: 'product',
              localField: "product",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $addFields: {
              products: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $project: {
              _id: 1,
              quantity: 1,
              Total: 1,
              productName: "$products.name",
              brand: "$products.brand",
              category: "$products.category",
            },
          },
          {
            $group: { _id: "$category", total: { $sum: "$Total" } },
          },
        ])
        .toArray();
      resolve(categorychart);
    });
  },
}