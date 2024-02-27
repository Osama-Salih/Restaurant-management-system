const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const ApiError = require('../utils/ApiError');

exports.uploadSingleFile = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `uploads/${folderName}`, // specify the folder in Cloudinary
      allowed_formats: ['jpeg', 'png'],
    },
  });

  const multerFilter = (req, file, cb) => {
    if (file.mimetype.split('/')[0].startsWith('image')) {
      cb(null, true);
    } else {
      cb(new ApiError('Only images are allowed', 400), false);
    }
  };

  const upload = multer({ storage: storage, fileFilter: multerFilter });
  return upload;
};
