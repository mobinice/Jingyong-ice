import express from 'express'
import attributeGroupController from '../controllers/attributeGroup.controller.js'

const router = express.Router()

router.get('/rules', attributeGroupController.getRulesList)
router.get('/rules/:code', attributeGroupController.getRuleByCode)
router.post('/rules', attributeGroupController.createRule)
router.put('/rules/:code', attributeGroupController.updateRule)
router.delete('/rules/:code', attributeGroupController.deleteRule)

router.get('/dictionary', attributeGroupController.getDictionaryList)
router.get('/dictionary/:code', attributeGroupController.getDictionaryByCode)
router.post('/dictionary', attributeGroupController.createDictionaryCode)
router.put('/dictionary/:code', attributeGroupController.updateDictionaryCode)
router.delete('/dictionary/:code', attributeGroupController.deleteDictionaryCode)

router.post('/dictionary/:code/values', attributeGroupController.createOptionValue)
router.put('/dictionary/:code/values/:value', attributeGroupController.updateOptionValue)
router.delete('/dictionary/:code/values/:value', attributeGroupController.deleteOptionValue)

export default router
