import salesOrderService from '../services/salesOrder.service.js'

export const getAll = async (req, res) => {
  try {
    const data = await salesOrderService.getAll()
    res.json({
      success: true,
      data: data,
      message: 'SalesOrder records retrieved successfully'
    })
  } catch (error) {
    console.error('Error in salesOrder.controller.getAll:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve SalesOrder records'
    })
  }
}

export const getByKey = async (req, res) => {
  try {
    const { soNr, soItNr } = req.params

    if (!soNr || !soItNr) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        message: 'soNr and soItNr are required'
      })
    }

    const data = await salesOrderService.getByKey(soNr, soItNr)
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `SalesOrder record with soNr ${soNr} and soItNr ${soItNr} not found`
      })
    }

    res.json({
      success: true,
      data: data,
      message: 'SalesOrder record retrieved successfully'
    })
  } catch (error) {
    console.error('Error in salesOrder.controller.getByKey:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve SalesOrder record'
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

    const data = await salesOrderService.create(req.body)
    res.status(201).json({
      success: true,
      data: data,
      message: 'SalesOrder record created successfully'
    })
  } catch (error) {
    console.error('Error in salesOrder.controller.create:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create SalesOrder record'
    })
  }
}

export const update = async (req, res) => {
  try {
    const { soNr, soItNr } = req.params

    if (!soNr || !soItNr) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        message: 'soNr and soItNr are required'
      })
    }

    const data = await salesOrderService.update(soNr, soItNr, req.body)
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `SalesOrder record with soNr ${soNr} and soItNr ${soItNr} not found`
      })
    }

    res.json({
      success: true,
      data: data,
      message: 'SalesOrder record updated successfully'
    })
  } catch (error) {
    console.error('Error in salesOrder.controller.update:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to update SalesOrder record'
    })
  }
}

export const remove = async (req, res) => {
  try {
    const { soNr, soItNr } = req.params

    if (!soNr || !soItNr) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        message: 'soNr and soItNr are required'
      })
    }

    const deleted = await salesOrderService.remove(soNr, soItNr)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `SalesOrder record with soNr ${soNr} and soItNr ${soItNr} not found`
      })
    }

    res.json({
      success: true,
      message: 'SalesOrder record deleted successfully'
    })
  } catch (error) {
    console.error('Error in salesOrder.controller.remove:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to delete SalesOrder record'
    })
  }
}

export default {
  getAll,
  getByKey,
  create,
  update,
  remove
}
