const { Tag } = require('../models')

const getTags = async (req, res) => {
    try {
        const tags = await Tag.find({})
        res.status(200).json(tags)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const getTag = async (req, res) => {
    try {
        const { id } = req.params
        const tag = await Tag.findById(id)
        res.status(200).json(tag)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const createTag = async (req, res) => {
    try {
        const tag = await Tag.create(req.body)
        res.status(200).json(tag)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const updateTag = async (req, res) => {
    try {
        const { id } = req.params
        const tag = await Tag.findByIdAndUpdate(id, req.body)
        if (!tag) {
            return res.status(404).json({message: "Tag not found"})
        }
        const updatedTag = await Tag.findById(id)
        res.status(200).json(updatedTag)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const tag = await Tag.findByIdAndDelete(id)
        if (!tag) {
            return res.status(404).json({message: 'Tag not found'})
        }
        res.status(200).json({message: 'Tag deleted successfully'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    getTags,
    getTag,
    createTag,
    updateTag,
    deleteTag
}