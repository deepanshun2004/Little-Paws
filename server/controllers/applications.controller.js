const Applications = require("../models/adoptionForm.model");
const User = require("../models/User");
const Pet = require("../models/pets.model");
const Shelter = require("../models/shelter.model");
const { createNotification } = require("../helpers/notifications");

const enrichApplication = async (application) => {
  const [user, pet] = await Promise.all([
    application.user ? User.findById(application.user) : null,
    application.pet ? Pet.findById(application.pet) : null,
  ]);
  const shelter = application.shelterId
    ? await Shelter.findById(application.shelterId)
    : pet?.shelter
    ? await Shelter.findById(pet.shelter)
    : await Shelter.findOne({ city: application.city });

  return {
    ...application,
    user,
    petDetails: pet,
    shelterDetails: shelter,
  };
};

const enrichReport = async (report) => {
  const [reporter, shelter] = await Promise.all([
    report.foster ? User.findById(report.foster) : null,
    report.shelter ? Shelter.findById(report.shelter) : null,
  ]);

  return {
    ...report,
    reporter,
    shelterDetails: shelter,
  };
};

const viewApplications = async (req, res) => {
  try {
    const { id: shelterAdminId } = req.user;
    const shelterAdmin = await User.findById(shelterAdminId);

    if (!shelterAdmin) {
      return res.status(404).json({ success: false, message: "Shelter admin not found." });
    }

    const adminCity = shelterAdmin.city;

    if (!adminCity) {
      return res
        .status(400)
        .json({ success: false, message: "City is not associated with this admin." });
    }

    const shelters = await Shelter.find({ shelterAdmin: shelterAdminId });
    const shelterIds = shelters.map((shelter) => Number(shelter._id));
    const applications = await Applications.find({});
    const filteredApplications = [];

    for (const application of applications) {
      const pet = application.pet ? await Pet.findById(application.pet) : null;
      if (
        application.city === adminCity ||
        (pet?.shelter && shelterIds.includes(Number(pet.shelter)))
      ) {
        filteredApplications.push(application);
      }
    }
    const populatedApplications = await Promise.all(filteredApplications.map(enrichApplication));

    res.status(200).json({
      success: true,
      message: `Applications for city: ${adminCity}`,
      applications: populatedApplications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const viewShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find();

    res.status(200).json({
      success: true,
      shelters,
    });
  } catch (error) {
    console.error("Error fetching shelters:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const acceptApplication = async (req, res) => {
  const applicationId = req.params.appId;

  try {
    const { shelterId } = req.body;
    const updatedApplication = await Applications.findByIdAndUpdate(
      applicationId,
      { status: "approved" },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    if (shelterId && updatedApplication.pet) {
      await Pet.findByIdAndUpdate(updatedApplication.pet, { shelter: shelterId }, { new: true });
    }

    if (updatedApplication.user) {
      await createNotification({
        userId: updatedApplication.user,
        title: "Adoption request approved",
        message: `Your adoption application #${updatedApplication._id} has been approved.`,
        type: "adoption",
        entityId: updatedApplication._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Application approved!",
      application: await enrichApplication(updatedApplication),
    });
  } catch (error) {
    console.error("Error approving application:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const rejectApplication = async (req, res) => {
  const applicationId = req.params.appId;

  try {
    const updatedApplication = await Applications.findByIdAndUpdate(
      applicationId,
      { status: "rejected" },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    if (updatedApplication.user) {
      await createNotification({
        userId: updatedApplication.user,
        title: "Adoption request rejected",
        message: `Your adoption application #${updatedApplication._id} has been rejected.`,
        type: "adoption",
        entityId: updatedApplication._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Application has been rejected!",
      application: await enrichApplication(updatedApplication),
    });
  } catch (error) {
    console.error("Error rejecting application:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const viewReportedStrays = async (req, res) => {
  try {
    const { id: shelterAdminId } = req.user;
    const shelters = await Shelter.find({ shelterAdmin: shelterAdminId });
    const shelterIds = shelters.map((shelter) => Number(shelter._id));
    const reports = await Pet.find();
    const reportedPets = reports.filter(
      (pet) => pet.foster && (!pet.shelter || shelterIds.includes(Number(pet.shelter)))
    );

    res.status(200).json({
      success: true,
      reports: await Promise.all(reportedPets.map(enrichReport)),
    });
  } catch (error) {
    console.error("Error fetching reported strays:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { shelterId, status } = req.body;
    const existingReport = await Pet.findById(req.params.reportId);

    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    const nextStatus = ["approved", "rejected"].includes(status) ? status : "approved";
    const pickupMessage = existingReport.pickupEligible
      ? "Our team will reach your location soon."
      : "Please bring the animal to the allotted shelter center.";
    const updatedReport = await Pet.findByIdAndUpdate(
      req.params.reportId,
      {
        reportStatus: nextStatus,
        reportSeenAt: new Date(),
        pickupMessage: nextStatus === "approved" ? pickupMessage : "Report rejected by shelter admin.",
        ...(shelterId ? { shelter: shelterId } : {}),
      },
      { new: true }
    );

    if (updatedReport.foster) {
      await createNotification({
        userId: updatedReport.foster,
        title: `Stray report ${nextStatus}`,
        message: `Your stray report #${updatedReport._id} has been ${nextStatus}.`,
        type: "stray",
        entityId: updatedReport._id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Report ${nextStatus}.`,
      report: await enrichReport(updatedReport),
    });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  viewApplications,
  viewShelters,
  acceptApplication,
  rejectApplication,
  viewReportedStrays,
  updateReportStatus,
};
