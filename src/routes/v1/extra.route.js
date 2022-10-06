const express = require('express');
const auth = require('../../middlewares/auth');
const extraController = require('../../controllers/extra.controller');

const router = express.Router();

router
    .route('/')
    .post(extraController.createExtra)
    .get(extraController.getExtraList);

router
    .route('/search')
    .post(extraController.searchExtraList);

router
    .route('/sendEmail')
    .post(auth('manageUsers'), extraController.sendEmail);

router
    .route('/testMail')
    .post(auth('manageUsers'), extraController.testEmail);

router
    .route('/:id')
    .get(extraController.getExtraItem)
    .put(auth('manageUsers'), extraController.updateExtra)
    .delete(auth('manageUsers'), extraController.deleteExtra);

module.exports = router;
