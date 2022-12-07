var db=require('../config/connections')
var objectId=require('mongodb').ObjectID
module.exports={

 
   findcart:(uid)=>{
    console.log('messi innale goal adichu')
    console.log(uid)
    return new Promise(async(resolve, reject) => {
        let cart=await db.get().collection('cart').findOne({
            user:objectId(uid)
        })
        console.log(cart)
        resolve(cart.products)
    })
   },

   createOrder:(order,product)=>{
    return new Promise((resolve, reject) => {
        order.PaymentStatus = order.payment === 'COD' ? 'Success' : 'Pending';
        orderDetails = {
            user: objectId(order.userid),
            Name: order.name,
            Mobile:order.phone,
            email:order.email,
            products:product,
            TotalAmount:order.total,
            payment:order.payment,
            paymentStatus:order.PaymentStatus,
            DeliveryAddress:{
                address:order.address,
                city:order.city,
                pin:order.pincode
            },
            message:order.message,
            status:"Order Placed",
            orderDate:new Date().getDate()+"-"+(new Date().getMonth()+1)+"-"+new Date().getFullYear(),
            orderTime:new Date().getHours()+":"+new Date().getMinutes(),
            time:new Date().getTime()
        }
        db.get().collection('order').insertOne(orderDetails).then((Id)=>{
                console.log('bayern vs psg')
                console.log(Id)
                resolve(Id)

            
         
        })

    })
   },
   vieworder:(userId)=>{
    return new Promise(async(resolve, reject) => {
        console.log('kerii')
      let order= await db.get().collection('order').aggregate([{$match:{$and:[{user:objectId(userId)},{status:'Order Placed'}]}},
        {$unwind:'$products'},
        {
            $project:{
                Mobile:1,
                payment:1,
                status:1,
                product:'$products.product',
                quantity:'$products.quantity',
                totalprice:'$products.totalprice',

                orderDate:1,
                time:1
            }},{
                $lookup:{
                    from:'product',
                    localField:"product",
                    foreignField:"_id",
                    as:'cartItems'
                }
            },{
                $project:{
                    Mobile:1,
                    payment:1,
                    status:1,
                    orderDate:1,
                    totalprice:1,
                    time:1,
                    products:{$arrayElemAt:["$cartItems",0]}
                }
            },
            {
                $sort:{
                    time:-1
                }
            }

    ]).toArray()
       resolve(order)
    })
  
},
orderhistory:(userId)=>{
    return new Promise(async(resolve, reject) => {
        order= await db.get().collection('order').aggregate([{$match:{user:objectId(userId)}},
         {$unwind:'$products'},{
             $project:{
                 Mobile:1,
                 payment:1,
                 status:1,
                 product:'$products.product',
                 quantity:'$products.quantity',
                 orderDate:1,
                 time:1
             }},{
                 $lookup:{
                     from:'product',
                     localField:"product",
                     foreignField:"_id",
                     as:'cartItems'
                 }
             },{
                 $project:{
                     Mobile:1,
                     payment:1,
                     status:1,
                     orderDate:1,
                     time:1,
                     products:{$arrayElemAt:["$cartItems",0]}
                 }
             },
             {
                 $sort:{
                     time:-1
                 }
             }
     ]).toArray()
        console.log(order);
        resolve(order)
     })
},

cancelorder:(id)=>{
    return new Promise((resolve, reject) => {
        db.get().collection('order').updateOne({_id:objectId(id)},{
            $set:{
                status:"Order Cancelled"
            }
        }).then(()=>{
            resolve()
        })
    })
}
,
ordercancel:(orderId,proId)=>{
    return new Promise((resolve, reject) => {
        db.get()
          .collection("order")
          .updateOne(
            { _id: objectId(orderId), "products.product": objectId(proId) },
            {
              $set: {
                "products.$.Status": "Order Cancelled",
              },
            }
          )
          .then(() => {
            resolve();
          });
      });
},

  setStatus: (orderId) => {
    return new Promise((resolve, reject) => {
        console.log('mnutd vs fc bar')
      db.get()
        .collection('order')
        .updateOne(
          {
            _id: objectId(orderId),
          },
          {
            $set: {
              paymentStatus: "Success",
            },
          }
        )
        .then((response) => {
            console.log(response)
          resolve();
        });
    });
  },


adminorderlist:()=>{
    return new Promise(async(resolve,reject)=>{
       let order=await db.get().collection('order').find().toArray()
        resolve(order)
    })
},

order:(id)=>{

return new Promise(async(resolve, reject) => {
  let order = await db.get().collection('order').find({user:objectId(id)}).toArray()
  resolve(order)
  
})

},

changeStatus:(id,stat)=>{

    return new Promise((resolve, reject) => {
        db.get().collection('order').updateOne({_id:objectId(id)},{
            $set:{
                status:stat
            }
        }).then(()=>{
            resolve()
        })
    })
}
,
statuschange:(details)=>{
    return new Promise((resolve, reject) => {
        db.get()
          .collection('order')
          .updateOne(
            {
              _id: objectId(details.order),
              "products.product": objectId(details.product),
            },
            {
              $set: {
                "products.$.Status": details.action,
              },
            }
          )
          .then(() => {
            resolve();
          });
      });

},

removeOrder:()=>{
    return new Promise((resolve, reject) => {
        db.get().collection('order').remove({paymentStatus:"Pending"}).then((response)=>{
            console.log(response)
            resolve()
        })
    })
},
removeCart:(userid)=>{
    return new Promise((resolve, reject) => {
        db.get().collection('cart').deleteOne({user:objectId(userid)}).then(()=>{
           resolve()
        })

    })
}


}