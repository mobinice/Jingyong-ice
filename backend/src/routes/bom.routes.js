import express from 'express'
import bomController from '../controllers/bom.controller.js'

const router = express.Router()

router.get('/query', bomController.query)
router.get('/', bomController.getAll)
router.get('/:id', bomController.getById)
router.post('/', bomController.create)
router.put('/:id', bomController.update)
router.delete('/:id', bomController.remove)

export default router
