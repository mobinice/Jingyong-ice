import purcmentService from '../services/purcment.service.js'

export const getAll = async (req, res) => {
  try {
    const data = await purcmentService.getAll()
    res.json({
      success: true,
      data: data,
      message: 'Purcment records retrieved successfully'
    })
  } catch (error) {
    console.error('Error in purcment.controller.getAll:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve Purcment records'
    })
  }
}

export const getByKey = async (req, res) => {
  try {
    const { BSART, EBELN, EBELP } = req.params

    if (BSART === undefined || EBELN === undefined || EBELP === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        message: 'BSART, EBELN and EBELP are required'
      })
    }

    const data = await purcmentService.getByKey(BSART, EBELN, EBELP)
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Purcment record with BSART ${BSART}, EBELN ${EBELN}, EBELP ${EBELP} not found`
      })
    }

    res.json({
      success: true,
      data: data,
      message: 'Purcment record retrieved successfully'
    })
  } catch (error) {
    console.error('Error in purcment.controller.getByKey:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve Purcment record'
    })
  }
}

export const query = async (req, res) => {
  try {
    const filters = {
      BSART: req.query.BSART,
      EBELN: req.query.EBELN,
      EINDT_from: req.query.EINDT_from,
      EINDT_to: req.query.EINDT_to,
      LIFNR: req.query.LIFNR,
      MATNR: req.query.MATNR
    }
    const data = await purcmentService.query(filters)
    res.json({
      success: true,
      data: data,
      message: 'Purcment records queried successfully'
    })
  } catch (error) {
    console.error('Error in purcment.controller.query:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to query Purcment records'
    })
  }
}

export const create = async (req, res) => {
  try {
    const { BSART, EBELN, EBELP } = req.body

    if (!BSART || !EBELN || EBELP === undefined || EBELP === null || EBELP === '') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'BSART, EBELN and EBELP are required fields'
      })
    }

    const data = await purcmentService.create(req.body)
    res.status(201).json({
      success: true,
      data: data,
      message: 'Purcment record created successfully'
    })
  } catch (error) {
    console.error('Error in purcment.controller.create:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create Purcment record'
    })
  }
}

export const update = async (req, res) => {
  try {
    const { BSART, EBELN, EBELP } = req.params

    if (BSART === undefined || EBELN === undefined || EBELP === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        message: 'BSART, EBELN and EBELP are required'
      })
    }

    const data = await purcmentService.update(BSART, EBELN, EBELP, req.body)
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Purcment record with BSART ${BSART}, EBELN ${EBELN}, EBELP ${EBELP} not found`
      })
    }

    res.json({
      success: true,
      data: data,
      message: 'Purcment record updated successfully'
    })
  } catch (error) {
    console.error('Error in purcment.controller.update:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to update Purcment record'
    })
  }
}

export const remove = async (req, res) => {
  try {
    const { BSART, EBELN, EBELP } = req.params

    if (BSART === undefined || EBELN === undefined || EBELP === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        message: 'BSART, EBELN and EBELP are required'
      })
    }

    const deleted = await purcmentService.remove(BSART, EBELN, EBELP)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Purcment record with BSART ${BSART}, EBELN ${EBELN}, EBELP ${EBELP} not found`
      })
    }

    res.json({
      success: true,
      message: 'Purcment record deleted successfully'
    })
  } catch (error) {
    console.error('Error in purcment.controller.remove:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to delete Purcment record'
    })
  }
}

export default {
  getAll,
  getByKey,
  query,
  create,
  update,
  remove
}
