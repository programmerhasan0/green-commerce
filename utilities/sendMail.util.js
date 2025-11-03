// Email send method --> Brevo HTTP
const Brevo = require("@getbrevo/brevo");

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);
const sendForgetPasswordMail = (email, token) => {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Password reset - Green Commerce";
    sendSmtpEmail.htmlContent = `
        <h3>Hello</h3>
        <p>Please <a href='${process.env.CLIENT_URL}/reset/${token}'>Click here</a> to reset your account password</p>
        <p>This link is valid only of 5 minutes.</p>
        <br />
        <br />
        <br />
        <p>Thank You</p>
        <p>Md Habibul Hasan</p>
        <p>programmerhasan0@gmail.com</p>`;

    sendSmtpEmail.sender = {
        name: "Green Commerce",
        email: "programmerhasan0@gmail.com",
    };
    sendSmtpEmail.to = [{ email: email }];
    return apiInstance.sendTransacEmail(sendSmtpEmail);
};

const sendWelcomeEmail = email => {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Green Commerce - Welcome";
    sendSmtpEmail.htmlContent = `<h1>Thanks for Creating an account in green commerce</h1>`;
    sendSmtpEmail.sender = {
        name: "Green Commerce",
        email: "programmerhasan0@gmail.com",
    };
    sendSmtpEmail.to = [{ email }];
    return apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports.sendForgetPasswordMail = sendForgetPasswordMail;
module.exports.sendWelcomeEmail = sendWelcomeEmail;
