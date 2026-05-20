const AdoptionForm = require("../models/adoptionForm.model");
const Pet = require("../models/pets.model");
const Shelter = require("../models/shelter.model");
const User = require("../models/User");
const { createNotification } = require("../helpers/notifications");
const { emitToUser } = require("../socket");

async function getManagedShelters(userId) {
  return Shelter.find({ shelterAdmin: userId });
}

async function getManagedShelterIds(userId) {
  const shelters = await getManagedShelters(userId);
  return shelters.map((shelter) => String(shelter._id));
}

async function resolveAdoptionShelterId(adoption) {
  if (adoption?.shelterId) {
    return String(adoption.shelterId);
  }

  if (!adoption?.pet) {
    return null;
  }

  const pet = await Pet.findById(adoption.pet);
  if (!pet?.shelter) {
    return null;
  }

  adoption.shelterId = pet.shelter;
  await adoption.save();
  return String(pet.shelter);
}

async function enrichAdoption(adoption) {
  const [user, pet, shelter] = await Promise.all([
    adoption.user ? User.findById(adoption.user) : null,
    adoption.pet ? Pet.findById(adoption.pet) : null,
    adoption.shelterId ? Shelter.findById(adoption.shelterId) : null,
  ]);

  return {
    ...adoption,
    user,
    pet,
    shelter,
  };
}

async function enrichReport(report) {
  const [reporter, shelter] = await Promise.all([
    report.foster ? User.findById(report.foster) : null,
    report.shelter ? Shelter.findById(report.shelter) : null,
  ]);

  return {
    ...report,
    reporter,
    shelter,
  };
}

const getShelterAdoptions = async (req, res) => {
  try {
    const shelterIds = await getManagedShelterIds(req.user.id);
    if (!shelterIds.length) {
      return res.status(404).json({ success: false, message: "Shelter not found." });
    }

    const adoptions = await AdoptionForm.find({});
    const visibleAdoptions = [];

    for (const adoption of adoptions) {
      const shelterId = await resolveAdoptionShelterId(adoption);
      if (shelterId && shelterIds.includes(String(shelterId))) {
        visibleAdoptions.push(adoption);
      }
    }

    const enriched = await Promise.all(
      visibleAdoptions
        .sort((a, b) => new Date(b.submissionDate || b.createdAt || 0) - new Date(a.submissionDate || a.createdAt || 0))
        .map(enrichAdoption)
    );
    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to fetch adoption requests" });
  }
};

const updateAdoptionStatus = async (req, res) => {
  try {
    const shelterIds = await getManagedShelterIds(req.user.id);
    const { status, shelterMessage } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid adoption status." });
    }

    const adoption = await AdoptionForm.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({ success: false, message: "Adoption request not found." });
    }
    const adoptionShelterId = await resolveAdoptionShelterId(adoption);
    if (!adoptionShelterId || !shelterIds.includes(String(adoptionShelterId))) {
      return res.status(403).json({ success: false, message: "You can manage only your shelter requests." });
    }
    if (adoption.status === "withdrawn") {
      return res.status(400).json({ success: false, message: "Withdrawn adoption requests cannot be updated further." });
    }

    adoption.status = status;
    adoption.shelterMessage = shelterMessage || adoption.shelterMessage || null;
    await adoption.save();

    await createNotification({
      userId: adoption.user,
      type: "adoption",
      title: `Adoption request ${status}`,
      message: adoption.shelterMessage || `Your adoption request is now ${status}.`,
      entityId: adoption._id,
    });

    const enrichedAdoption = await enrichAdoption(adoption);
    emitToUser(adoption.user, "adoption_updated", { adoption: enrichedAdoption });

    res.status(200).json({ success: true, data: enrichedAdoption });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to update adoption request" });
  }
};

const deleteAdoption = async (req, res) => {
  try {
    const shelterIds = await getManagedShelterIds(req.user.id);
    const adoption = await AdoptionForm.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({ success: false, message: "Adoption request not found." });
    }
    const adoptionShelterId = await resolveAdoptionShelterId(adoption);
    if (!adoptionShelterId || !shelterIds.includes(String(adoptionShelterId))) {
      return res.status(403).json({ success: false, message: "You can delete only your shelter requests." });
    }

    await AdoptionForm.findByIdAndDelete(req.params.id);

    await createNotification({
      userId: adoption.user,
      type: "adoption",
      title: "Adoption request removed",
      message: "Your adoption request has been removed by the shelter.",
      entityId: adoption._id,
    });

    res.status(200).json({ success: true, message: "Adoption request deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to delete adoption request" });
  }
};

const getShelterReports = async (req, res) => {
  try {
    const shelterIds = await getManagedShelterIds(req.user.id);
    const reports = await Pet.find({});
    const filteredReports = reports.filter(
      (report) =>
        report.source === "stray" &&
        report.foster &&
        report.shelter &&
        shelterIds.includes(String(report.shelter))
    );
    res.status(200).json({
      success: true,
      data: await Promise.all(filteredReports.map(enrichReport)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to fetch stray reports" });
  }
};

const updateShelterReportStatus = async (req, res) => {
  try {
    const shelterIds = await getManagedShelterIds(req.user.id);
    const { status, reason } = req.body;
    if (!["pending", "in_progress", "resolved", "unable_to_process"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid stray report status." });
    }

    const report = await Pet.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found." });
    }
    if (!report.shelter || !shelterIds.includes(String(report.shelter))) {
      return res.status(403).json({ success: false, message: "You can manage only your shelter reports." });
    }

    report.reportStatus = status;
    report.reportSeenAt = new Date();
    report.reportIssueReason =
      status === "unable_to_process" ? String(reason || "").trim() || null : null;
    await report.save();

    await createNotification({
      userId: report.foster,
      type: "stray",
      title: `Stray report ${status.replace("_", " ")}`,
      message:
        status === "unable_to_process"
          ? `Your stray report cannot be processed by the shelter.${
              report.reportIssueReason ? ` Reason: ${report.reportIssueReason}.` : ""
            }`
          : `Your stray report for ${report.name} is now ${status.replace("_", " ")}.`,
      entityId: report._id,
    });

    const enrichedReport = await enrichReport(report);
    emitToUser(report.foster, "stray_updated", { report: enrichedReport });

    res.status(200).json({ success: true, data: enrichedReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to update stray report" });
  }
};

const deleteShelterReport = async (req, res) => {
  try {
    const shelterIds = await getManagedShelterIds(req.user.id);
    const report = await Pet.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found." });
    }
    if (!report.shelter || !shelterIds.includes(String(report.shelter))) {
      return res.status(403).json({ success: false, message: "You can delete only your shelter reports." });
    }

    await Pet.findByIdAndDelete(req.params.id);

    if (report.foster) {
      await createNotification({
        userId: report.foster,
        type: "stray",
        title: "Stray report removed",
        message: "Your stray report has been removed by shelter.",
        entityId: report._id,
      });
    }

    res.status(200).json({ success: true, message: "Stray report deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to delete stray report" });
  }
};

module.exports = {
  getShelterAdoptions,
  updateAdoptionStatus,
  deleteAdoption,
  getShelterReports,
  updateShelterReportStatus,
  deleteShelterReport,
};
