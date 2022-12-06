var multer = require('multer');

var storage = multer.diskStorage({
  
  destination: function (req, file, cb) {
    cb(null, './public/img')
  },
  filename: function (req, file, cb) {
    var ext=file.originalname.substr(file.originalname.lastIndexOf('.'));
    cb(null, 'prodctimg'+Date.now()+ext)
  }
});
upload= multer({ storage: storage })

module.exports=upload