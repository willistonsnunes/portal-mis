import { Router } from 'express'
import * as TenantController from '../controllers/tenant.controller.js'
import { requireAdminOrSuper, requireSuperAdmin } from '../middlewares/role.middleware.js'

const router = Router()

router.post('/tenants', requireSuperAdmin, TenantController.createTenant)
router.get('/tenants', requireAdminOrSuper, TenantController.listTenants)
router.get('/tenants/:id', requireAdminOrSuper, TenantController.getTenantById)
router.put('/tenants/:id', requireAdminOrSuper, TenantController.updateTenant)
router.delete('/tenants/:id', requireSuperAdmin, TenantController.deactivateTenant)

export default router
