var db=require('../config/connections')
var objectId=require('mongodb').ObjectID
var bcrypt=require('bcrypt')
var Razorpay=require('razorpay');
const { resolve } = require('path');

require('dotenv').config()
var instance = new Razorpay({
  key_id: process.env.razor_pay_key_id,
  key_secret: process.env.razor_pay_key_secret,

});
var referrel = require('referral-codes')

module.exports={
    userDetails:(userData)=>{
       return new Promise( async(resolve, reject) => {
        console.log('pettu')
        console.log(userData.email)
        
      userData.password = await bcrypt.hash(userData.password, 10)
      db.get().collection('user').findOne({email:userData.email}).then((response)=>{
        if(response){
          console.log(response);
           
          resolve(response)
        }
        else{
          db.get().collection('user').findOne({phone:userData.phone}).then(async(response)=>{
            if(response){
              console.log('mobile no working ')
               console.log(response)
               resolve(response)
              
            }
            else{
              userData.block=false
              userData.Address=[]
              if(userData.referralCode){
                 let user=await db.get().collection('user').findOne({referralCode:userData.referralCode})
                   if(user){
                    console.log(user)
                    userData.referralCode = referrel
                    .generate({
                      prefix: userData.name,
                    })[0]
                    .replaceAll(" ", "");
                    db.get().collection('user').insertOne(userData).then((data)=>{
                      console.log(data);
                      wallet = {
                        user: data.insertedId,
                        Total: 100,
                        History: [
                          {
                            RefferdFrom: user._id,
                            user: user.name,
                            credited: 100,
                          },
                        ],
                      };
                      console.log('pettu')
                      db.get().collection('wallet').insertOne(wallet)
                      db.get().collection('wallet').updateOne(
                        { user: user._id },
                        {
                          $inc: { Total: 150 },
                          $push: {
                            History: {
                              RefferdTo: data.insertedId,
                              name: userData.name,
                              credited: 150,
                              Time: new Date(),
                            },
                          },
                        }
                      )
                      resolve(data)


                    })
                   }
                   else{
                    reject()
                   }

              }

              else{
                userData.referralCode = referrel
                .generate({
                  prefix: userData.name,
                })[0]
                .replaceAll(" ", "");
                db.get().collection('user').insertOne(userData).then((response)=>{
                  console.log(response)
                  wallet = {
                    user: response.insertedId,
                    Total: 0,
                    History: [],
                  };
                  db.get().collection('wallet').insertOne(wallet)
                
                  resolve(response)
                })

              }

         

            }
          })
          

        }
      })
     
       })  
     
    },
    doLogin:(userData)=>{
      return new Promise(async(resolve, reject) => {
        
        console.log('not workde')
        let response={}

      let user= await db.get().collection('user').findOne({ email: userData.email})
      console.log(user)
      if(user){
        if(user.block===false){
          bcrypt.compare(userData.password,user.password).then((status)=>{
            if (status) {
              console.log("sucess");
              response.user = user
              response.status = true
              resolve(response)
          }
          else {
              console.log("failed");
              resolve({ status: false })
          }

          })
        }
        else{
          response.block=true;
          resolve(response);
      }
        
      }
      else {
        console.log("failed at bcrypt");
        resolve({ status: false })
    }

      })
    },


    dootp:(userNum)=>{
     
      return new Promise((resolve,reject)=>{
        let response = {}
          db.get().collection('user').findOne({phone:userNum}).then((response)=>{
              if(response){
                  
                  console.log(response);
                  resolve(response)
              }
              else{
                 console.log(response)
                  resolve()
              }
          })
      })
  },
  phoneCheck:(data)=>{
    return new Promise((resolve, reject) => {
      console.log('this is working')
      db.get().collection('user').findOne({phone:data.phone}).then((response)=>{
        resolve(response)
      })
    })
  },

  guset:(guestid)=>{
    console.log('guset lk keriii')
   new Promise((resolve, reject) => {
    db.get().collection('user').insertOne(guestid).then((response)=>{
      resolve(response)
    })
   })


  },

  generteRazorpay: (orderId, total) => {
    console.log(orderId + "_______________________________");
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log("erris" + err);
        } else {
          console.log(order);
          resolve(order);
        }
      });
    });
  },

  verifyOrder: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      const hmac = crypto
        .createHmac("sha256", "ayHoB27K6MW0MP34vfIPdA0Q")
        .update(
          details["payment[razorpay_order_id]"] +
            "|" +
            details["payment[razorpay_payment_id]"]
        )
        .digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },

  addAddress:(user)=>{
    let uster=
    {
      _id: objectId(),
      name:user.name,
      address:user.address,
      city:user.city,
      pincode:user.pincode,
      email:user.email,
      phone:user.phone
    }
    return new Promise((resolve, reject) => {
      db.get()
      .collection('user')
      .updateOne(
        {
          _id: objectId(user.userid),
        },
        {
          $push: {
            Address: uster,
          },
        }
      ).then((response)=>{
        resolve(response)
      })
    

    })
  },
  findAddress:(user)=>{
    return new Promise(async(resolve, reject) => {
      let detail= await db.get().collection('user').findOne({_id:objectId(user)})
      resolve(detail.Address)
      
    })
  },
  findaAddress: (userid, addresid) => {
    return new Promise(async (resolve, reject) => {
      Address = await db
        .get()
        .collection('user')
        .aggregate([
          {
            $match: {
              _id: objectId(userid),
            },
          },
          {
            $unwind: "$Address",
          },
          {
            $match: {
              "Address._id": objectId(addresid),
            },
          },
          {
            $project: {
              _id:"$Address._id",
              name: "$Address.name",
              phone: "$Address.phone",
              email: "$Address.email",
              address: "$Address.address",
              city: "$Address.city",
              pincode: "$Address.pincode",
              country:"$Address.country"
            },
          },
        ])
        .toArray();
      resolve(Address[0]);
    });
  }
  ,
changeDefault:(userid,address,addresid)=>{
  console.log(userid)
  console.log(addresid)
  console.log('default address')
  console.log(address)
 return new Promise(async(resolve, reject) => {
  db.get().collection('user').updateOne({ _id: objectId(userid) },
 { $pull: { Address: {_id:objectId(addresid)} }}
).then(async()=>{
   await db.get().collection('user').updateOne(
    { _id:objectId(userid) },
    {
      $push: {
         Address: {
            $each: [address],
            $position: 0
         }
      }
    })
    resolve()

});


    
    
 

 })
},
updateAddres: (userId, data) => {
  return new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection('user')
      .updateOne(
        { _id: objectId(userId), "Address._id": objectId(data._id) },
        {
          $set: {
            "Address.$.name": data.name,
            "Address.$.phone": data.phone,
            "Address.$.email": data.email,
            "Address.$.address": data.address,
            "Address.$.city": data.city,
            "Address.$.pincode": data.pincode,
            "Address.$.country":data.country
          },
        }
      ).then(()=>{
        resolve()
      })
  });
},
}