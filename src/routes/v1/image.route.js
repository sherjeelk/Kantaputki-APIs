const express = require('express');
const auth = require('../../middlewares/auth');
const imageController = require('../../controllers/image.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('manageUsers'), imageController.upload)
    .get(auth('manageUsers'), imageController.getListFiles);

router
    .route('/download')
    .post(imageController.download);

// Not ready yet
router
    .route('/:name')
    .delete(imageController.deleteFile);


module.exports = router;
