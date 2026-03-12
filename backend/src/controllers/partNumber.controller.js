import * as partNumberService from '../services/partNumber.service.js'

/**
 * GET /api/part-numbers/attr-groups
 * Returns all attribute group definitions with dictionary options.
 */
export const getAttrGroups = async (req, res) => {
  try {
    const data = await partNumberService.getAttrGroups()
    res.json({ success: true, data, message: 'Attribute groups retrieved successfully' })
  } catch (error) {
    console.error('Error in partNumber.controller.getAttrGroups:', error)
    res.status(500).json({ success: false, error: error.message, message: 'Failed to retrieve attribute groups' })
  }
}

/**
 * POST /api/part-numbers/serial/next
 * Body: { attrGroup: string }
 * Returns next serial number (atomic).
 */
export const getNextSerial = async (req, res) => {
  try {
    const { attrGroup } = req.body
    if (!attrGroup || typeof attrGroup !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid attrGroup', message: 'attrGroup is required' })
    }
    const data = await partNumberService.getNextSerial(attrGroup.trim())
    res.json({ success: true, data, message: 'Serial number generated successfully' })
  } catch (error) {
    console.error('Error in partNumber.controller.getNextSerial:', error)
    res.status(500).json({ success: false, error: error.message, message: 'Failed to generate serial number' })
  }
}

/**
 * POST /api/part-numbers
 * Body: { partNo, attrGroup, values, factories, extra, partSpec, createdBy }
 * Records the created part number (log only for now).
 */
export const createPartNumber = async (req, res) => {
  try {
    const { partNo, attrGroup, values, factories, extra, partSpec, createdBy } = req.body
    if (!partNo || !attrGroup) {
      return res.status(400).json({ success: false, error: 'Missing required fields', message: 'partNo and attrGroup are required' })
    }
    const data = await partNumberService.createPartNumber({ partNo, attrGroup, values, factories, extra, partSpec, createdBy })
    res.json({ success: true, data, message: 'Part number created successfully' })
  } catch (error) {
    console.error('Error in partNumber.controller.createPartNumber:', error)
    res.status(500).json({ success: false, error: error.message, message: 'Failed to create part number' })
  }
}

/**
 * GET /api/part-numbers/bom-list
 * Query: keyword?
 */
export const getBOMList = async (req, res) => {
  try {
    const keyword = req.query.keyword || ''
    const data = await partNumberService.getBOMList(keyword)
    res.json({ success: true, data, message: 'BOM list retrieved successfully' })
  } catch (error) {
    console.error('Error in partNumber.controller.getBOMList:', error)
    res.status(500).json({ success: false, error: error.message, message: 'Failed to retrieve BOM list' })
  }
}

export default { getAttrGroups, getNextSerial, createPartNumber, getBOMList }
