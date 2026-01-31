const express = require('express')
const { register, login, requestToAdmin } = require('../controllers/user.controller')
const validate = require('../middlewares/validate.middleware')
const { registerSchema, loginSchema } = require('../validators/user.validator')

const router = express.Router()

router.post('/register',validate(registerSchema), register)
router.post('/login',validate(loginSchema), login)

router.post('/sumbit', requestToAdmin)
module.exports = router