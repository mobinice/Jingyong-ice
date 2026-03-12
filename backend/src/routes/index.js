import express from 'express'
import bomRoutes from './bom.routes.js'
import salesOrderRoutes from './salesOrder.routes.js'
import purcmentRoutes from './purcment.routes.js'
import attributeGroupRoutes from './attributeGroup.routes.js'
import partNumberRoutes from './partNumber.routes.js'

const router = express.Router()

router.use('/bom', bomRoutes)
router.use('/salesOrder', salesOrderRoutes)
router.use('/purcment', purcmentRoutes)
router.use('/attributeGroup', attributeGroupRoutes)
router.use('/part-numbers', partNumberRoutes)

export default router
