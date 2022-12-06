var db=require('../config/connections')
var objectId=require('mongodb').ObjectID
module.exports={

    addBanner:(banner)=>{
        return new Promise((resolve, reject) => {
            console.log('wahy')
            db.get().collection('banner').insertOne(banner)
            resolve('done')
        })
    },


    getBanner:()=>{


        return new Promise(async(resolve, reject) => {
      let banner = await db.get().collection('banner').find().toArray()
      resolve(banner)
        })
    },

    editBanner:()=>{

        return new Promise((resolve, reject) => {
            db.get().collection('banner').updateOne({

            },{
                
            })
        })
    },
    changeBannerStatus: (data) => {
        return new Promise((resolve, reject) => {
            console.log(data.Active)
          if (data.Active === "Active") {
            db.get()
              .collection('banner')
              .updateOne({ _id: objectId(data.Banner) }, { $set: { status: true } })
              .then(() => {
                resolve();
              });
          } else {
            db.get()
              .collection('banner')
              .updateOne(
                { _id: objectId(data.Banner) },
                { $set: { status: false } }
              )
              .then(() => {
                resolve();
              });
          }
        });
      },
      deleteBanner: (BannerId) => {
        return new Promise((resolve, reject) => {
          db.get()
            .collection('banner')
            .deleteOne({ _id: objectId(BannerId) })
            .then(() => {
              resolve();
            });
        });
      },

}