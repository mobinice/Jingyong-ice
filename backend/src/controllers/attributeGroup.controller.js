import attributeGroupService from '../services/attributeGroup.service.js'

export const createRule = async (req, res) => {
  try {
    const data = req.body
    if (!data.code) return res.status(400).json({ success: false, error: 'code is required' })
    const result = await attributeGroupService.createRule(data)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Error in attributeGroup.controller.createRule:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

export const updateRule = async (req, res) => {
  try {
    const { code } = req.params
    const result = await attributeGroupService.updateRule(code, req.body)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Error in attributeGroup.controller.updateRule:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

export const deleteRule = async (req, res) => {
  try {
    const { code } = req.params
    const result = await attributeGroupService.deleteRule(code)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Error in attributeGroup.controller.deleteRule:', error)
    const status = error.message.includes('Cannot delete') ? 400 : 500
    res.status(status).json({ success: false, error: error.message })
  }
}

export const createDictionaryCode = async (req, res) => {
  try {
    const data = req.body
    if (!data.code) return res.status(400).json({ success: false, error: 'code is required' })
    const result = await attributeGroupService.createDictionaryCode(data)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Error in attributeGroup.controller.createDictionaryCode:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

export const updateDictionaryCode = async (req, res) => {
  try {
    const { code } = req.params
    const result = await attributeGroupService.updateDictionaryCode(code, req.body)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Error in attributeGroup.controller.updateDictionaryCode:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

export const deleteDictionaryCode = async (req, res) => {
  try {
    const { code } = req.params
    const result = await attributeGroupService.deleteDictionaryCode(code)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Error in attributeGroup.controller.deleteDictionaryCode:', error)
    const status = error.message.includes('Cannot delete') ? 400 : 500
    res.status(status).json({ success: false, error: error.message })
  }
}

export const createOptionValue = async (req, res) => {
  try {
    const { code } = req.params
    const result = await attributeGroupService.createOptionValue(code, req.body)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Error in attributeGroup.controller.createOptionValue:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

export const updateOptionValue = async (req, res) => {
  try {
    const { code, value } = req.params
    const result = await attributeGroupService.updateOptionValue(code, decodeURIComponent(value), req.body)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Error in attributeGroup.controller.updateOptionValue:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

export const deleteOptionValue = async (req, res) => {
  try {
    const { code, value } = req.params
    const result = await attributeGroupService.deleteOptionValue(code, decodeURIComponent(value))
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Error in attributeGroup.controller.deleteOptionValue:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

export const getRulesList = async (req, res) => {
  try {
    const keyword = req.query.keyword || ''
    const data = await attributeGroupService.getRulesList(keyword)
    res.json({
      success: true,
      data: data,
      message: 'Attribute group rules retrieved successfully'
    })
  } catch (error) {
    console.error('Error in attributeGroup.controller.getRulesList:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve attribute group rules'
    })
  }
}

export const getRuleByCode = async (req, res) => {
  try {
    const { code } = req.params
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid code',
        message: 'Code is required'
      })
    }

    const data = await attributeGroupService.getRuleByCode(code)
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Attribute group rule with code ${code} not found`
      })
    }

    res.json({
      success: true,
      data: data,
      message: 'Attribute group rule retrieved successfully'
    })
  } catch (error) {
    console.error('Error in attributeGroup.controller.getRuleByCode:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve attribute group rule'
    })
  }
}

export const getDictionaryList = async (req, res) => {
  try {
    const lang = req.query.lang || 'zh-TW'
    const data = await attributeGroupService.getDictionaryList(lang)
    res.json({
      success: true,
      data: data,
      message: 'Attribute dictionary list retrieved successfully'
    })
  } catch (error) {
    console.error('Error in attributeGroup.controller.getDictionaryList:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve attribute dictionary list'
    })
  }
}

export const getDictionaryByCode = async (req, res) => {
  try {
    const { code } = req.params
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid code',
        message: 'Code is required'
      })
    }

    const data = await attributeGroupService.getDictionaryByCode(code)
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Attribute dictionary with code ${code} not found`
      })
    }

    res.json({
      success: true,
      data: data,
      message: 'Attribute dictionary retrieved successfully'
    })
  } catch (error) {
    console.error('Error in attributeGroup.controller.getDictionaryByCode:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve attribute dictionary'
    })
  }
}

export default {
  getRulesList,
  getRuleByCode,
  getDictionaryList,
  getDictionaryByCode,
  createRule,
  updateRule,
  deleteRule,
  createDictionaryCode,
  updateDictionaryCode,
  deleteDictionaryCode,
  createOptionValue,
  updateOptionValue,
  deleteOptionValue
}
