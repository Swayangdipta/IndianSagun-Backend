const router = require('express').Router()
const { isSignedIn, isAdmin, isAuthenticated } = require('../controllers/Auth.js')
const { getIssueById, getIssue, getIssues, getUserIssues, createIssue, updateIssueStatus } = require('../controllers/Issues.js')
const { getUserById } = require('../controllers/User.js')


router.param("issueId", getIssueById)
router.param("userId", getUserById)

router.get("/a/:issueId", getIssue)
router.get("/all/:userId", isSignedIn, isAdmin, getIssues)
router.get("/my/:userId", isSignedIn, isAuthenticated, getUserIssues)

router.post("/create/:userId", isSignedIn, createIssue)
router.put("/update/:issueId/:userId", isSignedIn, isAdmin, updateIssueStatus)

module.exports = router