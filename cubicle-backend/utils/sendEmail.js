const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    console.log("Inside sendmail util: ")
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'product.tutorme@gmail.com',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: can be used for styled emails
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
