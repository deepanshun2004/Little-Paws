const {Router} = require('express');
const Pet = require('../models/pets.model');
const { upload } = require('../helpers/upload');
const { verifyUser } = require('../middlewares/auth.middleware');
const { reportStray,
        getApplicationStatus,
        getReportedStrays,
        sendForm,
        getShelters,
        deleteUserAdoption,
        withdrawUserAdoption,
        deleteUserStrayReport } = require('../controllers/user.controller');
const router = Router();

router.get('/shelters', getShelters);
router.post('/report-stray', verifyUser, upload.array("pictures", 5), reportStray);
  
router.post('/adopt/:petId', verifyUser, sendForm);

router.get('/adoption-status' , verifyUser , getApplicationStatus )
router.get('/reported-strays', verifyUser, getReportedStrays)
router.put('/adoption-status/:id/withdraw', verifyUser, withdrawUserAdoption)
router.delete('/adoption-status/:id', verifyUser, deleteUserAdoption)
router.delete('/reported-strays/:id', verifyUser, deleteUserStrayReport)
  

module.exports = router;
