import { Router } from 'express'
import * as UserGroupController from '../controllers/userGroup.controller.js'
import { requireAdminOrSuper } from '../middlewares/role.middleware.js'

const router = Router()

router.post('/users-groups', requireAdminOrSuper, UserGroupController.createUserGroup)
router.get('/users-groups', UserGroupController.listUserGroups)
router.get('/users-groups/:userId/:groupId', UserGroupController.getUserGroupById)
router.delete('/users-groups/:userId/:groupId', requireAdminOrSuper, UserGroupController.deleteUserGroup)

export default router
