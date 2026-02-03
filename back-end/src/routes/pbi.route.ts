import { Router } from 'express'
import {
  listReportsController,
  generateEmbedController,
  getTenantWorkspacesController
} from '../controllers/pbi.controller.js'
import { requireAdminOrSuper } from '../middlewares/role.middleware.js'

const router = Router()

router.get('/pbi/reports', requireAdminOrSuper, listReportsController)
router.get('/pbi/workspaces', requireAdminOrSuper, getTenantWorkspacesController)
router.get('/pbi/reports/:id/embed-token', generateEmbedController)

export default router
