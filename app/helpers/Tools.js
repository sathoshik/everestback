var multer = require('multer');
var SystemDirectory = require('../config/constants/SystemDirectory.json');
var path = require('path');

module.exports = {
	imageUploader: function(){

		//ZKH - Setting the upload location and filename
		var imageStorage =   multer.diskStorage({
			destination: function (req, file, callback) {
				//ZKH - NOTE: Make sure there is an upload directory at the root of the project
				callback(null,  '.' + SystemDirectory['uploadImages']);
			},
			filename: function (req, file, callback) {
				callback(null, file.fieldname + '-' + Date.now() + '.' + path.extname(file.originalname));
			}
		});

		//ZKH - Function for uploading multipart-form data 
		var imageUploader = multer({ storage : imageStorage}).any();
		
		return imageUploader;
	}
}

