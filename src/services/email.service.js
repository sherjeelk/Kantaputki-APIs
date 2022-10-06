const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
    transport
        .verify()
        .then(() => logger.info('Connected to email server'))
        .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}


/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
    const msg = {from: config.email.from, to, subject, text};
    console.log('Email should go', msg);
    await transport.sendMail(msg);
};

/**
 * Send new Order email
 * @param {string} to
 * @param order
 * @returns {Promise}
 */
const sendNewOrderEmail = async (order) => {
    const orderHtml = `<!DOCTYPE html><html lang="en"><head><style>.table-service,td,th{border:1px solid black;padding:5px;}.table-service{border-collapse:collapse;width:100%;text-align:left;} th{height:40px;}.container{width:50%;margin:30px auto;padding:25px;}.user-details td{border:none;padding:3px;}.card{box-shadow:0 4px 8px 0 rgba(0,0,0,0.2);transition:0.3s;}@media(max-width:600px){.container{width:90%;}}</style></head><body><div class="container card"><div style="text-align: center;"><img src="https://api.kantaputki.fi/static/uploads/images/kantaputkilogo.png"width="50%"></div><h2>New order received</h2><hr><table class="user-details"><tr><td>User name</td><td>${order.name}</td></tr><tr><td>Phone number</td><td><a href="tel: ${order.phone}">${order.phone}</a></td></tr><tr><td>Order Id</td><td>${order._id}</td></tr><tr><td>Email</td><td><a href="mailto: ${order.email}">${order.email}</a></td></tr><tr><td>Date</td><td>${order.date.split('T')[0]}</td></tr><tr><td>Time</td><td>${order.time}</td></tr><tr><td>Service man name</td><td>${order.serviceMan}</td></tr><tr><td>Service man ID</td><td>${order.serviceMan}</td></tr><tr><td>Total</td><td>&euro;${order.total}</td></tr></table><table style="margin-top: 20px"class="table-service"><tr><th>Service Name</th><th>Price</th></tr>${productGenerator(order)}</table></div></body></html>`;
    const customerEmail = `<!DOCTYPE html><html lang="fi"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>kantaputki email template</title><style>.container{margin:45px auto;width:80%;min-width:50%;padding:10px;background-color:white}h1{color:#23496D;padding-left:12px;font-size:26px;font-weight:800}h3{color:black;font-size:22px;font-weight:600;text-align:left}p{color:#A69E98;font-size:16px;padding-left:10px;font-weight:400}.button{background-color:#37AD05;color:white;padding:15px 32px;text-align:center;font-size:16px;margin:4px 2px;cursor:pointer;width:70%;border-radius:12px;font-weight:700;outline:none;border:none}.border{width:50%;margin-left:auto;margin-right:auto;border-bottom:1px solid black;margin-top:15px}.img_padding{padding:20px 40px}.para_padding{padding:20px 52px}@media only screen and (max-width: 600px){h1{font-size:16px}.button{font-size:13px;width:89%}.display{display:none}h3{color:black;font-size:16px;font-weight:600;text-align:center}}@media only screen and (min-width: 600px){.mobileview{display:none}}</style></head><body style="background-color: #EAF0F6; font-family: sans-serif;"><div class="container"><table cellpadding="0" cellspacing="0" width="100%"><tr align="center"><td> <img src="https://api.kantaputki.fi/static/uploads/images/kantaputkilogo.png" width="50%"></td></tr><tr><td style="min-width:50%; margin-top: 15px;"><img src="https://api.kantaputki.fi/static/uploads/images/Timage1.png" width="100%"></td></tr><tr><td><h1> Kiitos tilauksestasi! Nyt voit rentoutua.</h1><p> Olemme vastaanottaneet tilauksesi ja alamme tehdä siihen liittyviä toimenpiteitä pian. Jos tilaat laajempaa kokonaisuutta on myyjämme vielä teihin yhteydessä.</p></td></tr><tr align="center"><td> <a href="https://www.kantaputki.fi/yhteystiedot/"> <button class="button">Jäikö jokin mietityttämään? Ota meihin tarivttaessa yhteyttä!</button> </a></td></tr><tr><td><hr style="width: 50%; margin-top:15px; margin-left: auto; margin-right: auto; min-width: 30%;"></td></tr><tr align="center"><td><h1>Tutustu blogikirjoituksiimme!</h1></td></tr><tr><table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;" class="display"><tr><td class="img_padding"> <img src="https://api.kantaputki.fi/static/uploads/images/5501.png" width="100%"></td><td class="img_padding"> <img src="https://api.kantaputki.fi/static/uploads/images/5502.png" width="100%"></td></tr><tr><td class="para_padding"><h3 style="padding-left: 25px;">Autoa huolletaan<br> paremmin kuin kotia –<br> näitä virheitä<br> omakotiasuja tekee</h3></td><td class="para_padding"><h3 style="padding-left: 25px;"> Hybridi päivän sana,<br> mitä tarkoittaa<br> hybridilämmitys?</h3></td></tr></table><table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;" class="mobileview"><tr><td style="padding:12px 24px;"> <img src="https://api.kantaputki.fi/static/uploads/images/5501.png" width="100%"></td></tr><tr><td style="text-align: center; padding:12px 24px;"><h3>Autoa huolletaan<br> paremmin kuin kotia –<br> näitä virheitä<br> omakotiasuja tekee</h3></td></tr><tr><td style="padding:12px 24px;"> <img src="https://api.kantaputki.fi/static/uploads/images/5502.png" width="100%"></td></tr><tr><td style="text-align: center; padding:12px 24px;"><h3> Hybridi päivän sana,<br> mitä tarkoittaa<br> hybridilämmitys?</h3></td></tr></table></tr><tr ><hr style="margin-top: 15px;"></tr><tr><table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;"><tr align="center"><td> <a href="https://www.kantaputki.fi/blogi/"><button class="button">Blogiin tästä</button> </a></td></tr></table></tr><tr align="center"><table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;"><tr align="center"><td><p style="margin-top: 45px;"> Onko sinulla kysyttävää? Ota meihin yhteyttä: huolto@kantaputki.fi</p></td></tr></table></tr></table></div><table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;"><tr align="center"><td><p> Kantaputki Oy, Parolantie 68, Hämeenlinna, Kanta-Häme 13100, Suomi, 0400877015</p></td></tr></table></body></html>`;
    // const msg = {from: config.email.from, to: 'huolto@kantaputki.fi', subject: "Order Received", html: orderHtml};
    const msg = {from: config.email.from, to: 'jai@litcode.io', subject: "Order Received", html: orderHtml};
    const customerMsg = {from: config.email.from, to: order.email, subject: "Order Received", html: customerEmail};
    console.log('Email should go', msg);
    await transport.sendMail(msg);
    await transport.sendMail(customerMsg);
};


/**
 * Send new Order Test email
 * @param {string} to
 * @param order
 * @returns {Promise}
 */
const sendNewOrderTestEmail = async (to, order) => {
    const orderHtml = `<!DOCTYPE html><html lang="en"><head><style>.table-service,td,th{border:1px solid black;padding:5px;}.table-service{border-collapse:collapse;width:100%;text-align:left;} th{height:40px;}.container{width:50%;margin:30px auto;padding:25px;}.user-details td{border:none;padding:3px;}.card{box-shadow:0 4px 8px 0 rgba(0,0,0,0.2);transition:0.3s;}@media(max-width:600px){.container{width:90%;}}</style></head><body><div class="container card"><div style="text-align: center;"><img src="https://api.kantaputki.fi/static/uploads/images/kantaputkilogo.png"width="50%"></div><h2>New order received</h2><hr><table class="user-details"><tr><td>User name</td><td>${order.name}</td></tr><tr><td>Phone number</td><td><a href="tel: ${order.phone}">${order.phone}</a></td></tr><tr><td>Order Id</td><td>${order._id}</td></tr><tr><td>Email</td><td><a href="mailto: ${order.email}">${order.email}</a></td></tr><tr><td>Date</td><td>${order.date.split('T')[0]}</td></tr><tr><td>Time</td><td>${order.time}</td></tr><tr><td>Service man name</td><td>${order.serviceMan}</td></tr><tr><td>Service man ID</td><td>${order.serviceMan}</td></tr><tr><td>Total</td><td>&euro;${order.total}</td></tr></table><table style="margin-top: 20px"class="table-service"><tr><th>Service Name</th><th>Price</th></tr>${productGenerator(order)}</table></div></body></html>`;
    const customerEmail = `<!DOCTYPE html><html lang="fi"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>kantaputki email template</title><style>.container{margin:45px auto;width:80%;min-width:50%;padding:10px;background-color:white}h1{color:#23496D;padding-left:12px;font-size:26px;font-weight:800}h3{color:black;font-size:22px;font-weight:600;text-align:left}p{color:#A69E98;font-size:16px;padding-left:10px;font-weight:400}.button{background-color:#37AD05;color:white;padding:15px 32px;text-align:center;font-size:16px;margin:4px 2px;cursor:pointer;width:70%;border-radius:12px;font-weight:700;outline:none;border:none}.border{width:50%;margin-left:auto;margin-right:auto;border-bottom:1px solid black;margin-top:15px}.img_padding{padding:20px 40px}.para_padding{padding:20px 52px}@media only screen and (max-width: 600px){h1{font-size:16px}.button{font-size:13px;width:89%}.display{display:none}h3{color:black;font-size:16px;font-weight:600;text-align:center}}@media only screen and (min-width: 600px){.mobileview{display:none}}</style></head><body style="background-color: #EAF0F6; font-family: sans-serif;"><div class="container"><table cellpadding="0" cellspacing="0" width="100%"><tr align="center"><td> <img src="https://api.kantaputki.fi/static/uploads/images/kantaputkilogo.png" width="50%"></td></tr><tr><td style="min-width:50%; margin-top: 15px;"><img src="https://api.kantaputki.fi/static/uploads/images/Timage1.png" width="100%"></td></tr><tr><td><h1> Kiitos tilauksestasi! Nyt voit rentoutua.</h1><p> Olemme vastaanottaneet tilauksesi ja alamme tehdä siihen liittyviä toimenpiteitä pian. Jos tilaat laajempaa kokonaisuutta on myyjämme vielä teihin yhteydessä.</p></td></tr><tr align="center"><td> <a href="https://www.kantaputki.fi/yhteystiedot/"> <button class="button">Jäikö jokin mietityttämään? Ota meihin tarivttaessa yhteyttä!</button> </a></td></tr><tr><td><hr style="width: 50%; margin-top:15px; margin-left: auto; margin-right: auto; min-width: 30%;"></td></tr><tr align="center"><td><h1>Tutustu blogikirjoituksiimme!</h1></td></tr><tr><table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;" class="display"><tr><td class="img_padding"> <img src="https://api.kantaputki.fi/static/uploads/images/5501.png" width="100%"></td><td class="img_padding"> <img src="https://api.kantaputki.fi/static/uploads/images/5502.png" width="100%"></td></tr><tr><td class="para_padding"><h3 style="padding-left: 25px;">Autoa huolletaan<br> paremmin kuin kotia –<br> näitä virheitä<br> omakotiasuja tekee</h3></td><td class="para_padding"><h3 style="padding-left: 25px;"> Hybridi päivän sana,<br> mitä tarkoittaa<br> hybridilämmitys?</h3></td></tr></table><table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;" class="mobileview"><tr><td style="padding:12px 24px;"> <img src="https://api.kantaputki.fi/static/uploads/images/5501.png" width="100%"></td></tr><tr><td style="text-align: center; padding:12px 24px;"><h3>Autoa huolletaan<br> paremmin kuin kotia –<br> näitä virheitä<br> omakotiasuja tekee</h3></td></tr><tr><td style="padding:12px 24px;"> <img src="https://api.kantaputki.fi/static/uploads/images/5502.png" width="100%"></td></tr><tr><td style="text-align: center; padding:12px 24px;"><h3> Hybridi päivän sana,<br> mitä tarkoittaa<br> hybridilämmitys?</h3></td></tr></table></tr><tr ><hr style="margin-top: 15px;"></tr><tr><table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;"><tr align="center"><td> <a href="https://www.kantaputki.fi/blogi/"><button class="button">Blogiin tästä</button> </a></td></tr></table></tr><tr align="center"><table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;"><tr align="center"><td><p style="margin-top: 45px;"> Onko sinulla kysyttävää? Ota meihin yhteyttä: huolto@kantaputki.fi</p></td></tr></table></tr></table></div><table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;"><tr align="center"><td><p> Kantaputki Oy, Parolantie 68, Hämeenlinna, Kanta-Häme 13100, Suomi, 0400877015</p></td></tr></table></body></html>`;
    const msg = {from: config.email.from, to, subject: "Order Received", html: orderHtml};
    const customerMsg = {from: config.email.from, to, subject: "Order Received", html: customerEmail};
    console.log('Email should go', msg);
    await transport.sendMail(msg);
    await transport.sendMail(customerMsg);
};

/**
 * Send welcome email
 * @param {string} to
 * @param {string} link which user will use to reset pass
 * @returns {Promise}
 */
const sendWelcomeEmail = async (to, link) => {
    const subject = 'Welcome To Kantaputki';
    // replace this url with the link to the reset password page of your front-end app
    const resetPasswordUrl = `https://tilaus.kantaputki.fi/reset-password?token=${link}`;
    const text = link.length > 0 ? `Dear user,
  Welcome to Kantaputki, you can click this link ${resetPasswordUrl} to generate your password` :
        'Welcome to Kantaputki, we welcome you.';
    await sendEmail(to, subject, text);
};

const productGenerator = (order) => {
    let html = '';
    for (const service of order.service){
        html = `<tr>
            <td>${service.name}</td>
            <td>&euro;${service.price}</td>
        </tr>` + html;
    }

    return html;
}

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
    const subject = 'Reset password';
    // replace this url with the link to the reset password page of your front-end app
    const resetPasswordUrl = `https://tilaus.kantaputki.fi/reset-password?token=${token}`;
    const text = `Dear user,
  To reset your password, click on this link: ${resetPasswordUrl}
  If you did not request any password resets, then ignore this email.`;
    await sendEmail(to, subject, text);
};

module.exports = {
    transport,
    sendEmail,
    sendWelcomeEmail,
    sendNewOrderEmail,
    sendResetPasswordEmail,
};
