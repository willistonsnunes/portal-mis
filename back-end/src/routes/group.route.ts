import { Router } from 'express'
import * as GroupController from '../controllers/group.controller.js'
import { requireAdminOrSuper } from '../middlewares/role.middleware.js'

const router = Router()

router.post('/groups', requireAdminOrSuper, GroupController.createGroup)
router.get('/groups', GroupController.listGroups)
router.get('/groups/:id', GroupController.getGroupById)
router.put('/groups/:id', requireAdminOrSuper, GroupController.updateGroup)
router.delete('/groups/:id', requireAdminOrSuper, GroupController.deactivateGroup)

export default router
