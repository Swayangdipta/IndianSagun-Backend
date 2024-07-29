const axios = require('axios').default
const {config} = require('../config/config.js');
const {resetEmailTemplate, verifyEmailTemplate} = require("../utils/EmailTemplates.js")

const API_KEY = config.BREVO_API_KEY;
const apiUrl = 'https://api.brevo.com/v3/smtp/email';

exports.sendMail = async (req,res,data) => {
    let content = await resetEmailTemplate(data)

    const emailData = {
    sender: {
        name: 'Indian Sagun',
        email: 'indiansagun2024@gmail.com',
    },
    to: [
        {
        email: data.recipientMail,
        name: data.recipientName,
        },
    ],
    subject: data.subject,
    htmlContent: content
    };

    try {
        const response = await axios.post(apiUrl, emailData, {
            headers: {
                'accept': 'application/json',
                'api-key': API_KEY,
                'content-type': 'application/json',
            },
        })
        
        if(!response || response.errors){
            console.log("Response: ", response);
            return res.status(500).json({errors: ["Something went wrong"], body: response })
        }
        
        return res.status(200).json({success: ["Reset link sent to email."], errors: []})        
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
}

exports.sendEmailVerification = async (data) => {
    let content = await verifyEmailTemplate(data)

    const emailData = {
    sender: {
        name: 'Indian Sagun',
        email: 'indiansagun2024@gmail.com',
    },
    to: [
        {
        email: data.recipientMail,
        name: data.recipientName,
        },
    ],
    subject: data.subject,
    htmlContent: content
    };

    try {
        const response = await axios.post(apiUrl, emailData, {
            headers: {
                'accept': 'application/json',
                'api-key': API_KEY,
                'content-type': 'application/json',
            },
        })
        
        if(!response || response.errors){
            return {errors: ["Something went wrong"], body: response }
        }
        
        return {success: ["Verification link sent to email."], errors: []}       
    } catch (error) {
        return {errors: ["Something went wrong"], body: error }
    }
}