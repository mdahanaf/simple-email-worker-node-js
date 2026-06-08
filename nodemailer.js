import nodemailer from "nodemailer";

const gamilPassword = "ihrbcoidlanodmjz";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'iammdahanaf@gmail.com',
        pass: gamilPassword
    }
});

const sendMail = async (to, subject, msg) => {
    const mailOptions = {
        from: "iammdahanaf@gmail.com",
        to,
        subject,
        text: msg
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
}

export default sendMail;