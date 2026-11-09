const express = require('express');
const {
    getAllResources,
    getOneResource,
    createResource,
    deleteResource
} = require ('../controller/resourcesController')
const router = express.Router();

router.get('/', getAllResources);
router.get('/:id',getOneResource);
router.post('/',createResource);
router.delete('/:id',deleteResource)

module.exports = router;