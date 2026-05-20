const express = require("express");
const { verifyShelterAdmin } = require("../middlewares/auth.middleware");
const { upload } = require("../helpers/upload");
const {
  addPet,
  updatePet,
  deletePet,
  getShelterPets,
} = require("../controllers/shelterPetController");
const {
  getShelterAdoptions,
  updateAdoptionStatus,
  deleteAdoption,
  getShelterReports,
  updateShelterReportStatus,
  deleteShelterReport,
} = require("../controllers/shelterWorkflowController");

const router = express.Router();

router.get("/pets", verifyShelterAdmin, getShelterPets);
router.post("/pets", verifyShelterAdmin, upload.single("image"), addPet);
router.put("/pets/:id", verifyShelterAdmin, upload.single("image"), updatePet);
router.delete("/pets/:id", verifyShelterAdmin, deletePet);

router.get("/adoptions", verifyShelterAdmin, getShelterAdoptions);
router.put("/adoptions/:id", verifyShelterAdmin, updateAdoptionStatus);
router.delete("/adoptions/:id", verifyShelterAdmin, deleteAdoption);

router.get("/reports", verifyShelterAdmin, getShelterReports);
router.get("/stray", verifyShelterAdmin, getShelterReports);
router.put("/reports/:id", verifyShelterAdmin, updateShelterReportStatus);
router.put("/stray/:id", verifyShelterAdmin, updateShelterReportStatus);
router.delete("/reports/:id", verifyShelterAdmin, deleteShelterReport);
router.delete("/stray/:id", verifyShelterAdmin, deleteShelterReport);

module.exports = router;
