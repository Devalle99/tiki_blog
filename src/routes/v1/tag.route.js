const express = require('express')
const tagController = require('../../controllers/tag.controller')

const router = express.Router()

router.get('/', tagController.getTags)

router.get('/:id', tagController.getTag)

router.post('/', tagController.createTag)

router.put('/:id', tagController.updateTag)

router.delete('/:id', tagController.deleteTag)

module.exports = router