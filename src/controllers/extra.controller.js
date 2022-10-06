const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Extra = require('../models/extra.model');
const { emailService } = require('../services');

const createExtra = catchAsync(async (req, res) => {
    const extra = await Extra.create(req.body);
    res.status(httpStatus.CREATED).send(extra);
});

const getExtraList = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'type']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await Extra.paginate(filter, options);
    res.send(result);
});

const searchExtraList = catchAsync(async (req, res) => {
    const body = req.body;
    const query = [];
    if (body){
        if (body.length > 0){
            for (const  item of body){
                const search = {};
                const key = Object.keys(item)[0];
                search[key] = {$regex: item[key], $options: "i" };
                query.push(search);
            }
        }
    }
    const extras = query.length === 0 ? await Extra.find() : await Extra.find({$and: query});
    if (!extras) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Extra with this query not found');
    }
    res.send(extras);
});

const getExtraItem = catchAsync(async (req, res) => {
    const extra = await Extra.findById(req.params.id);
    if (!extra) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
    }
    res.send(extra);
});

const updateExtra = catchAsync(async (req, res) => {
    const extra = await Extra.findById(req.params.id);
    if (!extra) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Charge not found');
    }
    Object.assign(extra, req.body);
    await extra.save();
    res.send(extra);
});

const deleteExtra = catchAsync(async (req, res) => {
    const extra = await Extra.findById(req.params.id);
    if (!extra) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Charge not found');
    }
    await extra.remove();
    res.status(httpStatus.NO_CONTENT).send();
});

const sendEmail = catchAsync(async (req, res) => {
    const email = req.body.email;
    const subject = req.body.subject;
    const text = req.body.text;
    const html = req.body.html;
    await emailService.sendEmail(email, subject, text);
    res.send({status: 1, msg: 'Email sent successfully!'});
});

const testEmail = catchAsync(async (req, res) => {
    const email = req.body.email;
    const order = req.body.order;
    await emailService.sendNewOrderEmail(email, order);
    res.send({status: 1, msg: 'Email sent successfully!'});
});

module.exports = {
    createExtra,
    getExtraList,
    getExtraItem,
    updateExtra,
    deleteExtra,
    sendEmail,
    testEmail,
    searchExtraList
};
