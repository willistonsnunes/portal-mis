import { Router } from 'express'
import * as GroupReportController from '../controllers/groupReport.controller.js'
import { requireAdminOrSuper } from '../middlewares/role.middleware.js'

const router = Router()

router.post('/reports-groups', requireAdminOrSuper, GroupReportController.createGroupReport)
router.get('/reports-groups', GroupReportController.listGroupReports)
router.get('/reports-groups/:groupId/:reportId', GroupReportController.getGroupReportById)
router.delete('/reports-groups/:groupId/:reportId', requireAdminOrSuper, GroupReportController.deleteGroupReport)

export default router
