const mongoose = require('mongoose')

const issueSchema = new mongoose.Schema({
    issue_type: {
        type: String,
        required: true
    },
    issue_status: {
        type: String,
        default: 'Submitted'
    },
    submitted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    issue_details: {
        type: String,
        required: true
    }
},{timestamps: true})

module.exports = mongoose.model("Issue",issueSchema)