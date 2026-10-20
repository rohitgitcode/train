import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)

router.get('/me', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile fetched successfully',
    data: {
      user: req.user,
    },
  })
})

export default router