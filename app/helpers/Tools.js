var multer = require('multer');

module.exports = {
	imageUploader: function(){

		//ZKH - Setting the upload location and filename
		var imageStorage =   multer.diskStorage({
			destination: function (req, file, callback) {
				//ZKH - NOTE: Make sure there is an upload directory at the root of the project
				callback(null,  './uploads'); 
			},
			filename: function (req, file, callback) {
				callback(null, file.fieldname + '-' + Date.now());
			}
		});

		//ZKH - Function for uploading multipart-form data 
		var imageUploader = multer({ storage : imageStorage}).single('userPhoto');
		
		return imageUploader;
	}
}

