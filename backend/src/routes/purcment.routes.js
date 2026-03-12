import express from 'express'
import purcmentController from '../controllers/purcment.controller.js'

const router = express.Router()

router.get('/', purcmentController.getAll)
router.get('/query', purcmentController.query)
router.get('/:BSART/:EBELN/:EBELP', purcmentController.getByKey)
router.post('/', purcmentController.create)
router.put('/:BSART/:EBELN/:EBELP', purcmentController.update)
router.delete('/:BSART/:EBELN/:EBELP', purcmentController.remove)

export default router
