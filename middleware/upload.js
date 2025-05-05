const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/products')
    },
    filename: function(req,file,cb){
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const fileFilter = (req,file,cb)=>{
    const allowedtypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if(allowedtypes.includes(file.mimetype)){
        cb(null,true);
    }
    else{
        cb(new Error('Invalid file type'), false);
    }
};
const upload = multer({storage, fileFilter});

module.exports = upload;