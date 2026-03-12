import bomService from '../services/bom.service.js'

export const getAll = async (req, res) => {
  try {
    const data = await bomService.getAll()
    res.json({
      success: true,
      data: data,
      message: 'BOM records retrieved successfully'
    })
  } catch (error) {
    console.error('Error in bom.controller.getAll:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve BOM records'
    })
  }
}

export const getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format',
        message: 'ID must be a valid integer'
      })
    }

    const data = await bomService.getById(id)
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `BOM record with id ${id} not found`
      })
    }

    res.json({
      success: true,
      data: data,
      message: 'BOM record retrieved successfully'
    })
  } catch (error) {
    console.error('Error in bom.controller.getById:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve BOM record'
    })
  }
}

export const create = async (req, res) => {
  try {
    const { soNr, soItNr } = req.body

    if (!soNr || !soItNr) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'soNr and soItNr are required fields'
      })
    }

    const data = await bomService.create(req.body)
    res.status(201).json({
      success: true,
      data: data,
      message: 'BOM record created successfully'
    })
  } catch (error) {
    console.error('Error in bom.controller.create:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create BOM record'
    })
  }
}

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format',
        message: 'ID must be a valid integer'
      })
    }

    const { soNr, soItNr } = req.body
    if (!soNr || !soItNr) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'soNr and soItNr are required fields'
      })
    }

    const data = await bomService.update(id, req.body)
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `BOM record with id ${id} not found`
      })
    }

    res.json({
      success: true,
      data: data,
      message: 'BOM record updated successfully'
    })
  } catch (error) {
    console.error('Error in bom.controller.update:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to update BOM record'
    })
  }
}

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format',
        message: 'ID must be a valid integer'
      })
    }

    const deleted = await bomService.remove(id)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `BOM record with id ${id} not found`
      })
    }

    res.json({
      success: true,
      message: 'BOM record deleted successfully'
    })
  } catch (error) {
    console.error('Error in bom.controller.remove:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to delete BOM record'
    })
  }
}

export const query = async (req, res) => {
  try {
    const filters = {
      prodNr: req.query.prodNr || null,
      soNr: req.query.soNr || null,
      custProdNr: req.query.custProdNr || null,
      matnr: req.query.matnr || null,
      custMatnr: req.query.custMatnr || null,
      prodName: req.query.prodName || null
    }
    
    // 移除空值
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === '') {
        delete filters[key]
      }
    })
    
    const data = await bomService.query(filters)
    res.json({
      success: true,
      data: data,
      message: 'BOM records queried successfully'
    })
  } catch (error) {
    console.error('Error in bom.controller.query:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to query BOM records'
    })
  }
}

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  query
}
