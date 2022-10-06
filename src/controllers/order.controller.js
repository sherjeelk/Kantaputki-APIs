const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const { emailService } = require('../services');
const { tokenService } = require('../services');
const _ = require('lodash');
const moment = require('moment');

const createOrder = catchAsync(async (req, res) => {
    console.log('Create order', req.body);
    const order = await Order.create(req.body);
    res.status(httpStatus.CREATED).send(order);
});

const getOrders = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'type']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await Order.paginate(filter, options);
    res.send(result);
});

const searchOrders = catchAsync(async (req, res) => {
    const keyword = req.body.search;
    const searchKey = req.body.searchKey;
    const result = await Order.find({[searchKey]: { "$regex": keyword, "$options": "i"}});
    res.send(result);
});

const myOrders = catchAsync(async (req, res) => {
    const user = await tokenService.getUser(req);
    console.log('UserId', user);
    const result = await Order.find({user: user});
    res.send(result);
});

const getOrder = catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
    }
    res.send(order);
});

const updateOrder = catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
    }
    Object.assign(order, req.body);
    await order.save();
    res.send(order);
});

const cancelOrder = catchAsync(async (req, res) => {
    const order = await Order.findById(req.query.id);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    order.status = 'CANCELLED';
    await order.save();
    const serviceMan = await User.findById(order.serviceMan);
    console.log('Service', serviceMan);
    for (const slot of serviceMan.slots){
        if (moment(slot.date).isSame(moment(order.date), 'day') && order.time === slot.from){
            console.log('Slot About to release', slot);
            slot.available = true;
            delete slot.booking
            delete slot.name;
            console.log('Slot Released', slot.date);
            break;
        }
    }
    serviceMan.markModified('slots');
    const save = await serviceMan.save();
    await emailService.sendEmail(order.email, 'Order Cancelled', 'Hi, your order is cancelled successfully! We will process your refund accordingly. Order id #'+ order._id);
    await emailService.sendEmail(serviceMan.email, 'Booking Cancelled', 'Hi, we regret ot inform you that a booking is cancelled by customer, please check the app for more details! Order id #'+ order._id);
    // await emailService.sendEmail('markus@pianto.io', 'Booking Cancelled (ADMIN)', 'Hi, we regret ot inform you that a booking in cancelled by customer, please check the dashboard for more details! Order id #'+ order._id);
    res.send(order);
});



const placeOrder = catchAsync(async (req, res) => {
    const body = req.body;
    body.status = 'PENDING';
    const order = await Order.create(body);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
    }
    // Block slots
    const user = await User.findById(order.serviceMan);
    for (const slot of user.slots){
        if (moment(slot.date).isSame(moment(order.date), 'day') && order.time === slot.from){
            console.log('Slot blocked', slot.date);
            slot.available = false;
            slot.booking = {
                id: order._id,
                name: order.name
            };
            slot.name = order.name;
            break;
        }
    }
    console.log('Slots after', user.slots);
    user.markModified('slots');
    await user.save();
    await emailService.sendNewOrderEmail(order);
    res.send(order);

});

const placeExtOrder = catchAsync(async (req, res) => {
    const body = req.body;
    body.status = 'PENDING';
    body.date = new Date();
    const order = await Order.findById(req.query.id);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    order.extended = true;
    order.additional = body;
    await order.save();
    res.send(order);
});

const updateExtOrder = catchAsync(async (req, res) => {
    const status = req.body.status === 1 ?  'PAYMENT_CONFIRMED' : 'PAYMENT_FAILED';
    const order = await Order.findById(req.body.id);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    order.additional.status = status;
    await order.save();
    if (req.body.status === 1) {
        // send email of order
        await emailService.sendEmail(order.email, 'Order Extended Successfully', 'Hi, your order is confirmed successfully! Order id #'+ order._id);
    } else {
        await emailService.sendEmail(order.email, 'Extended Order Failed', 'Hi, payment for your order is failed! Please try again. Order id #'+ order._id);
    }
    res.send(order);
});



const confirmOrder = catchAsync(async (req, res) => {
    const status = req.body.status === 1 ?  'PAYMENT_CONFIRMED' : 'PAYMENT_FAILED';
    const order = await Order.findById(req.body.id);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
    }
    order.status = status;
    await order.save();
    if (req.body.status === 1) {
        // send email of order
        await emailService.sendEmail(order.email, 'Order Confirmed', 'Hi, your order is confirmed successfully! Order id #'+ order._id);
    } else {
        await emailService.sendEmail(order.email, 'Order Failed', 'Hi, payment for your order is failed! Please try again. Order id #'+ order._id);
    }
    res.send(order);
});

const getOrderByDate = catchAsync(async (req, res) => {
    const less = req.query.lte;
    const higher = req.query.gte;
    const user = req.query.user;
    const result = await Order.find({date: {$gte: higher, $lt: less}, serviceMan: user});
    res.send(result);
});

const changeOrderStatus = catchAsync(async (req, res) => {
    const status = req.body.status;
    const questions = req.body.questions;
    const id = req.body.id;
    const order = await Order.findById(id);

    if (status === 'COMPLETED'){
        order.questions = questions;
        await emailService.sendEmail(order.email, 'Order Completed', `Hi, your order is now completed, please rate your experience by clicking on this link <a href="https://tilaus.kantaputki.fi/post-review/${order._id}">Review Experience</a>! Order id # ${order._id}`);
    } else if (status === 'REJECTED') {
        const user = await User.findById(order.serviceMan);
        for (const slot of user.slots){
            if (moment(slot.date).isSame(moment(order.date), 'day') && order.time === slot.from){
                slot.available = true;
                delete slot.booking;
                delete slot.name;
                break;
            }
        }
        await user.save();
        // await emailService.sendEmail(order.email, 'Order Completed', `Hi, your order is now completed, please rate your experience by clicking on this link <a href="http://tilaus.pianto.io/post-review/${order._id}">Review Experience</a>! Order id # ${order._id}`);

    } else if (status === 'CANCELLED_BY_SERVICE'){
        const user = await User.findById(order.serviceMan);
        for (const slot of user.slots){
            if (moment(slot.date).isSame(moment(order.date), 'day') && order.time === slot.from){
                slot.available = true;
                delete slot.booking;
                delete slot.name;
                break;
            }
        }
        await user.save();
      //  await emailService.sendEmail(order.email, 'Order Completed', `Hi, your order is now completed, please rate your experience by clicking on this link <a href="http://tilaus.pianto.io/post-review/${order._id}">Review Experience</a>! Order id # ${order._id}`);
    } else if (status === 'BOOKING_CONFIRMED'){
        await emailService.sendEmail(order.email, 'Order Confirmed', `Hi, your order is now confirmed by the technician, You are all set.`);
    }

    order.status = status;
    await order.save();
    res.send({status: 1, msg: "Order updated successfully!", order});
});


const deleteOrder = catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
    }
    await Order.remove();
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    placeOrder,
    confirmOrder,
    createOrder,
    myOrders,
    getOrders,
    cancelOrder,
    searchOrders,
    getOrder,
    updateOrder,
    placeExtOrder,
    updateExtOrder,
    changeOrderStatus,
    deleteOrder,
    getOrderByDate
};
