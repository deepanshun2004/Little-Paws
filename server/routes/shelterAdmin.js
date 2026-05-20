const {Router} = require('express');

const {
  viewApplications,
  viewShelters,
  acceptApplication,
  rejectApplication,
  viewReportedStrays,
  updateReportStatus,
} = require("../controllers/applications.controller");
const { verifyShelterAdmin } = require('../middlewares/auth.middleware');


const router = Router();
router.get('/applications' , verifyShelterAdmin,viewApplications)
router.get("/shelters", verifyShelterAdmin, viewShelters);

router.put('/applications/:appId', verifyShelterAdmin , acceptApplication);

router.put('/applications/reject/:appId', verifyShelterAdmin , rejectApplication);
router.get('/reports', verifyShelterAdmin, viewReportedStrays);
router.put('/reports/:reportId', verifyShelterAdmin, updateReportStatus);

module.exports = router;
