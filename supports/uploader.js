const multer = require(`multer`);
const fs = require(`fs`);


module.exports = {
    uploader: (directory, fileNamePrefix) => {
        // mendefine lokasi penyimpanan file
        let defaultDir = './public';

        // diskStorage = untuk menyimpan file kedalam defaultDirectory yang dituju
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                // penentuan alamat directory
                const pathDir = directory ? defaultDir + directory : defaultDir

                // melakukan pengecekan pathDir
                if (fs.existsSync(pathDir)) {
                    // jika pathDir ada, maka directory tersebut akan digunakan untuk menyimpan file
                    console.log(`Directory ${pathDir} exist`)
                    cb(null, pathDir);
                } else {
                    //jika pathDir tidak ada, maka directory akan dibuat
                    fs.mkdir(pathDir, { recursive: true }, (err) => cb(err, pathDir));
                    console.log(`Success create directory ${pathDir} `)
                }
            },
            filename: (req, file, cb) => {
                console.log(`isi data file`, file)
                // membaca tipe data
                let ext = file.originalname.split('.');
                console.log(`extention`, ext)

                // buat nama file yang baru
                let fileName = fileNamePrefix + Date.now() + '.' + ext[ext.length - 1];
                console.log(`new file name`, fileName)

                //eksekusi nama file baru
                cb(null, fileName);
            }
        });

        // membuat fungsi untuk filter tipe data

        const fileFilter=(req,file,cb)=>{

            // extention file yang diperbolehkan untuk disimpan (regex)
            const extFilter = /\.(jpg|png|gif|webp)/

            if(!file.originalname.toLowerCase().match(extFilter)){
                return cb(new Error("Your file type are denied"), false)
            }
            cb(null,true)
        }

        return multer({storage, fileFilter});
    }
}