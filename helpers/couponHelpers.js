var db=require('../config/connections')
var objectId=require('mongodb').ObjectID


module.exports={

addCoupon:(coupon)=>{
     return new Promise((resolve, reject) => {
        db.get().collection('coupon').insertOne(coupon).then((response)=>{
     resolve(response)

        })
     })
},
findCoupon:()=>{

return new Promise(async(resolve, reject) => {
    let coupons=await db.get().collection('coupon').find().toArray()
    resolve(coupons)
    reject('WHAT A FUCK')

})


},
findacoupon:(coupon)=>{

   return new Promise((resolve, reject) => {
      db.get().collection('coupon').findOne({name:coupon}).then((response)=>{
     console.log(response);
     if(response)
     resolve(response)
     else
     reject('not a coupon')

      })
   })


},
deleteCoupon:(id)=>{

   return new Promise((resolve, reject) => {
      db.get().collection("coupon").remove({_id:objectId(id)}).then((response)=>{
         resolve (response)
      })
   })
},

update:(coupon)=>{

   return new Promise((resolve, reject) => {
      db.get().collection('coupon').updateMany({_id:objectId(coupon.id)},{
         $set:{
             name:coupon.name,
             expiryDate:coupon.expiryDate,
             maxAmount:coupon.maxAmount,
             minAmount:coupon.minAmount,
             percentage:coupon.percentage

         }
     })
     resolve()
   })
}


}