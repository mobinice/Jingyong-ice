import express from 'express'
import * as partNumberController from '../controllers/partNumber.controller.js'

const router = express.Router()

router.get('/attr-groups', partNumberController.getAttrGroups)
router.get('/bom-list', partNumberController.getBOMList)
router.post('/serial/next', partNumberController.getNextSerial)
router.post('/', partNumberController.createPartNumber)

export default router
