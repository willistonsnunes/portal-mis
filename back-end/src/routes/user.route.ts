import { Router } from 'express'
import * as UserController from '../controllers/user.controller.js'
import { requireSelf } from '../middlewares/self-password.middleware.js'
import { requireAdminOrSuper } from '../middlewares/role.middleware.js'

const router = Router()

router.post('/users', requireAdminOrSuper, UserController.createUser)
router.get('/users', requireAdminOrSuper, UserController.listUsers)
router.get('/users/:id', requireAdminOrSuper, UserController.getUserById)
router.put('/users/:id', requireAdminOrSuper, UserController.updateUser)
router.delete('/users/:id', requireAdminOrSuper, UserController.deactivateUser)
router.patch('/users/:id/reset-password', requireSelf, UserController.resetPassword)

export default router
