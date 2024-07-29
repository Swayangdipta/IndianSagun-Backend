const Issue = require("../models/Issues.js")
const _ = require('lodash')

exports.getIssueById = async (req,res,next,id) => {
    try {
        const issue = await Issue.findById(id).populate('submitted_by', '_id name email contact')

        if(!issue || issue.errors){
            return res.status(404).json({errors: ["Nothing found."]})
        }

        req.issue = issue
        next()
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
}

exports.createIssue = async (req,res) => {
    try {
        const issue = new Issue(req.body)

        const createdIssue = await issue.save()

        if(!createdIssue || createdIssue.errors){
            return res.status(400).json({errors: ["Faild to create issue."], body: createdIssue})
        }

        return res.status(200).json({success: true, errors: [], data: createdIssue})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
}

exports.updateIssueStatus = async (req,res) => {
    try {
        let issue = req.issue

        issue = _.extend(issue,req.body)

        const updatedIssue = await issue.save()

        if(!updatedIssue || updatedIssue.errors){
            return res.status(400).json({errors: ["Faild to update status."], body: updatedIssue})
        }

        return res.status(200).json({success: true, errors: [], data: updatedIssue})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
}

exports.getIssue = (req,res) => {
    if(!req.issue){
        return res.status(400).json({errors: ["Faild to get issue details"]})
      }
    
      return res.status(200).json({success: true, errors: [], data: req.issue})
}

exports.getIssues = async (req,res) => {
    try {
        const page = req.body.page
        const limit = req.body.limit || 20
        const offset = (page - 1) * limit

        const issues = await Issue.find().skip(offset).limit(limit).populate('submitted_by', '_id name email contact')

        if(!issues || issues.errors || issues.length === 0){
            return res.status(404).json({errors: ["Nothing found."]})
        }

      return res.status(200).json({success: true, errors: [], data: issues})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
}

exports.getUserIssues = async (req,res) => {
    try {
        const issues = await Issue.find({submitted_by: req.profile._id})
        
        if(!issues || issues.errors || issues.length === 0){
            return res.status(404).json({errors: ["Nothing found."]})
        }

      return res.status(200).json({success: true, errors: [], data: issues})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
}