const express = require ('express');
const router = express.Router();
const {protect} = require('../middlewares/authMiddleware');
const { doubleCsrfProtection } = require('../middlewares/csrfMiddleware');

const  {
    getDashboardStats,
    getAllResources,
    getOneResource,
    UpdateResourceStatus,
    deleteResource,
    getCountryStats
} = require('../controller/adminController')

router.use(protect);
router.use(doubleCsrfProtection);




 router.get('/dashboard', getDashboardStats)
 router.get('/countries', getCountryStats)

 router.get('/', getAllResources);
 router.get('/:id', getOneResource);
 
 router.patch('/:id/:status',UpdateResourceStatus);
 router.delete('/:id',deleteResource);

 module.exports = router;