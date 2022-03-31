const multer = require('multer');
const fs = require('fs');

module.exports = {
    uploader: (directory,fileNamePrefix) => {
        let defaultDirectory = './public';
        const storage = multer.diskStorage({
            destination: (req,file,cb) => {
                const pathDir = directory ? defaultDirectory + directory : defaultDirectory
                if(fs.existsSync(pathDir)){
                    console.log(`directory ${pathDir} exist`);
                    cb(null,pathDir);
                } else {
                    fs.mkdir(pathDir,{recursive:true}, (err) => {
                        cb(err,pathDir)
                    })
                    console.log(`success create directory ${pathDir} ✔`);
                }
            },
            filename: (req,file,cb) => {
                console.log('isi data file ==>', file)
                let ext = file.originalname.split('.');
                console.log('extention =>',ext);
                let fileName = fileNamePrefix+Date.now()+'.'+ext[ext.length - 1];
                console.log('new file name', fileName)
                cb(null,fileName);
            }
        });

        const fileFilter = (req,file,cb) => {
            const extFilter = /\.(jpg|png|gif|webp)/
            if(file.originalname.toLowerCase().match(extFilter)) {
               return cb(null,true);
            }else{
                return cb(new Error('Your file type are denied'), false);
            }
        }
        return multer({storage,fileFilter});
    }
}

