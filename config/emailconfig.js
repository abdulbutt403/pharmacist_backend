const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

var transporter = nodemailer.createTransport
({
    service : 'gmail',
    auth :
    {
        user : 'arrowestates403@gmail.com',
        pass : 'hzrpveisghbfnlts'
    }
});

module.exports = transporter;