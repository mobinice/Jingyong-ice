import express from 'express'
import salesOrderController from '../controllers/salesOrder.controller.js'

const router = express.Router()

router.get('/', salesOrderController.getAll)
router.get('/:soNr/:soItNr', salesOrderController.getByKey)
router.post('/', salesOrderController.create)
router.put('/:soNr/:soItNr', salesOrderController.update)
router.delete('/:soNr/:soItNr', salesOrderController.remove)

export default router
