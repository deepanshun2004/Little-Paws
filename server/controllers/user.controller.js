const Pet = require('../models/pets.model');
const Shelter = require('../models/shelter.model')
const User = require('../models/User')
const { getFileUrls } = require('../helpers/upload')
const AdoptionForm = require('../models/adoptionForm.model')
const sendAdoptionApplication = require('../helpers/kafkaProducer')
const { createNotification } = require('../helpers/notifications');
const { sendStrayReportEmail, sendAdoptionEmail } = require('../utils/sendEmail');
const { emitToRole, emitToUser } = require('../socket');

const enrichUserApplication = async (application) => {
  const pet = application.pet ? await Pet.findById(application.pet) : null;
  const shelter = application.shelterId
    ? await Shelter.findById(application.shelterId)
    : pet?.shelter
    ? await Shelter.findById(pet.shelter)
    : await Shelter.findOne({ city: application.city });

  return {
    ...application,
    petDetails: pet,
    shelterDetails: shelter,
    shelterAdminId: shelter?.shelterAdmin || null,
    chatTargetUserId: shelter?.shelterAdmin || null,
  };
};

const enrichReportedPet = async (pet) => {
  const shelter = pet?.shelter ? await Shelter.findById(pet.shelter) : null;

  return {
    ...pet,
    shelterDetails: shelter,
    shelterAdminId: shelter?.shelterAdmin || null,
    chatTargetUserId: shelter?.shelterAdmin || null,
  };
};

  const reportStray =  async (req, res) => {
    try {
      const { name, type, breed, description, age, city, distanceFromChandigarhKm, shelterId, location, latitude, longitude } = req.body;
  
      
      if (!name || !type || !breed || !city || !location || !age || distanceFromChandigarhKm === undefined) {
        return res.status(400).json({ message: "All required fields must be filled" });
      }

      const parsedDistance = Number(distanceFromChandigarhKm);
      if (Number.isNaN(parsedDistance) || parsedDistance < 0) {
        return res.status(400).json({ message: "Distance from Chandigarh must be a valid number." });
      }

      const normalizedCity = String(city || location || "").trim();
      let shelter =
        (shelterId ? await Shelter.findById(shelterId) : null) ||
        (await Shelter.findOne({ city: normalizedCity })) ||
        (await Shelter.findOne({ city: "Chandigarh" }));
      if (!shelter) {
        return res.status(404).json({ message: "Shelter not found for the selected city" });
      }

      const pickupEligible = parsedDistance <= 40;
      const pickupMessage = pickupEligible
        ? "Pickup is available because your location is within 40 km of Chandigarh."
        : "Please bring the animal to the nearest center because your location is more than 40 km from Chandigarh.";
  
      
      const uploadedPictures = getFileUrls(req, req.files || []);
  
      
      const newPet = new Pet({
        name,
        type,
        breed,
        description,
        age,
        region: normalizedCity,
        reportLocation: location || normalizedCity,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        image: uploadedPictures[0] || null,
        category: type,
        distanceFromChandigarhKm: parsedDistance,
        pickupEligible: pickupEligible ? 1 : 0,
        pickupMessage,
        pictures: uploadedPictures,
        shelter: shelter._id, 
        foster: req.user.id, 
        source: "stray",
        reportStatus: "pending",
        reportSeenAt: null,
      });
  
      
      await newPet.save();

      await createNotification({
        userId: req.user.id,
        title: "Stray report submitted",
        message: `Your stray report #${newPet._id} is pending review.`,
        type: "stray",
        entityId: newPet._id,
      });
  
    
      sendStrayReportEmail(req.user.email, req.user.userName, type).catch(err => console.error("Stray report email failed:", err));

      emitToRole("shelterAdmin", "stray_reported", { pet: newPet });
      emitToRole("sellerAdmin", "stray_reported", { pet: newPet });

      res.status(201).json({
        message: "Stray animal reported successfully",
        pet: newPet,
        pickupEligible,
        pickupMessage,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error reporting stray animal", error: error.message });
    }
  }

const getReportedStrays = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const reportedPets = await Pet.find({ foster: userId });

    res.status(200).json({
      success: true,
      message: reportedPets.length
        ? "Reported stray animals retrieved successfully."
        : "No stray animal reports found for this user.",
      reports: await Promise.all(reportedPets.map(enrichReportedPet)),
    });
  } catch (error) {
    console.error("Error fetching stray reports:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stray reports.",
      error: error.message,
    });
  }
}

const getApplicationStatus = async (req, res) => {
  try {
    const { id: userId } = req.user; 

    
    const adoptionForms = await AdoptionForm.find({ user: userId });

    res.status(200).json({
      success: true,
      message: adoptionForms.length
        ? "Adoption applications retrieved successfully."
        : "No adoption applications found for this user.",
      applications: await Promise.all(adoptionForms.map(enrichUserApplication)),
    });
  } catch (error) {
    console.error("Error fetching adoption applications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching adoption applications.",
      error: error.message,
    });
  }
}

const deleteUserAdoption = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const adoption = await AdoptionForm.findById(req.params.id);

    if (!adoption) {
      return res.status(404).json({
        success: false,
        message: "Adoption request not found.",
      });
    }

    if (String(adoption.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own adoption requests.",
      });
    }

    await AdoptionForm.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Adoption request deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting adoption request:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting adoption request.",
      error: error.message,
    });
  }
};

const withdrawUserAdoption = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { reason } = req.body || {};
    const adoption = await AdoptionForm.findById(req.params.id);

    if (!adoption) {
      return res.status(404).json({
        success: false,
        message: "Adoption request not found.",
      });
    }

    if (String(adoption.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can withdraw only your own adoption requests.",
      });
    }

    if (adoption.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved adoption requests can be withdrawn.",
      });
    }

    adoption.status = "withdrawn";
    adoption.withdrawalReason = String(reason || "").trim() || null;
    await adoption.save();

    const [pet, directShelter, user] = await Promise.all([
      adoption.pet ? Pet.findById(adoption.pet) : null,
      adoption.shelterId ? Shelter.findById(adoption.shelterId) : null,
      User.findById(userId),
    ]);
    const shelter =
      directShelter ||
      (pet?.shelter ? await Shelter.findById(pet.shelter) : null) ||
      (adoption.city ? await Shelter.findOne({ city: adoption.city }) : null);

    if (shelter?.shelterAdmin) {
      const timestamp = new Date(adoption.updatedAt || Date.now()).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      await createNotification({
        userId: shelter.shelterAdmin,
        title: "Approved adoption request withdrawn",
        message: `An approved adoption request has been withdrawn by the user. User: ${
          user?.userName || "Unknown user"
        }. Pet: ${pet?.name || adoption.adoptionDetails?.petName || "Unknown pet"}. Date/Time: ${timestamp}.${
          adoption.withdrawalReason ? ` Reason: ${adoption.withdrawalReason}` : ""
        }`,
        type: "adoption",
        entityId: adoption._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Adoption request withdrawn successfully.",
      application: await enrichUserApplication(adoption),
    });
  } catch (error) {
    console.error("Error withdrawing adoption request:", error);
    res.status(500).json({
      success: false,
      message: "Error withdrawing adoption request.",
      error: error.message,
    });
  }
};

const deleteUserStrayReport = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const report = await Pet.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Stray report not found.",
      });
    }

    if (String(report.foster) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own stray reports.",
      });
    }

    await Pet.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Stray report deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting stray report:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting stray report.",
      error: error.message,
    });
  }
};

// const sendForm = async (req, res) => {
//   try {
//     const { petId } = req.params;
//     const { id: userId } = req.user; 
   
    
//     const { 
//       city, 
//       personalInfo, 
//       livingConditions, 
//       petExperience, 
//       adoptionDetails 
//     } = req.body;

   
//     const pet = await Pet.findById(petId);
//     if (!pet) {
//       return res.status(404).json({ success: false, message: "Pet not found" });
//     }


//     console.log(userId , petId);
    
//     const existingForm = await AdoptionForm.findOne({ user: userId, pet: petId });
//     console.log(existingForm);
//     if (existingForm) {
//       return res.status(400).json({ success: false, message: "You have already submitted an adoption form for this pet." });
//     }

    
//     const adoptionForm = new AdoptionForm({
//       user: userId,
//       pet: petId,
//       city,
//       personalInfo,
//       livingConditions,
//       petExperience,
//       adoptionDetails,
//     });

    
//     const savedForm = await adoptionForm.save();

    
//     res.status(201).json({
//       success: true,
//       message: "Adoption form submitted successfully.",
//       adoptionForm: savedForm,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Error submitting adoption form.", error: error.message });
//   }
// }
const sendForm = async (req, res) => {
  try {
    const petId = req.params.petId || req.body.petId;
    const { id: userId } = req.user; 
   
    const { 
      city, 
      personalInfo, 
      livingConditions, 
      petExperience, 
      adoptionDetails 
    } = req.body;

    if (!String(city || "").trim()) {
      return res.status(400).json({ success: false, message: "City is required." });
    }

   
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    console.log(userId, petId);

    
    const existingForm = await AdoptionForm.findOne({ user: userId, pet: petId });
    console.log(existingForm);
    if (existingForm) {
      return res.status(400).json({ success: false, message: "You have already submitted an adoption form for this pet." });
    }

   
    const adoptionForm = new AdoptionForm({
      user: userId,
      pet: petId,
      shelterId: pet.shelter || null,
      city,
      personalInfo,
      livingConditions,
      petExperience,
      adoptionDetails,
      shelterMessage: null,
    });

    
    const savedForm = await adoptionForm.save();

   
    await sendAdoptionApplication(savedForm);

    await createNotification({
      userId,
      title: "Adoption request submitted",
      message: `Your adoption request #${savedForm._id} is pending review.`,
      type: "adoption",
      entityId: savedForm._id,
    });

    sendAdoptionEmail(req.user.email, req.user.userName, pet.name).catch(err => console.error("Adoption email failed:", err));

    if (pet.shelter) {
      emitToRole("shelterAdmin", "adoption_requested", { adoptionForm: savedForm });
    }

    res.status(201).json({
      success: true,
      message: "Adoption form submitted successfully.",
      adoptionForm: savedForm,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error submitting adoption form.", error: error.message });
  }
};

const createAdoption = async (req, res) => sendForm(req, res);

const getShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find();
    res.status(200).json({
      success: true,
      shelters,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch shelters." });
  }
};

module.exports = {
  reportStray,
  getApplicationStatus,
  getReportedStrays,
  sendForm,
  createAdoption,
  getShelters,
  deleteUserAdoption,
  withdrawUserAdoption,
  deleteUserStrayReport,
};
