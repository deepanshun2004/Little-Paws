const Pet = require("../models/pets.model");
const Shelter = require("../models/shelter.model");
const { getFileUrl, deleteImageByUrl } = require("../helpers/upload");

async function getManagedShelters(userId) {
  return Shelter.find({ shelterAdmin: userId });
}

async function getManagedShelterIds(userId) {
  const shelters = await getManagedShelters(userId);
  return shelters.map((shelter) => String(shelter._id));
}

async function getPreferredShelter(user) {
  const shelters = await getManagedShelters(user.id);
  if (!shelters.length) {
    return null;
  }

  const cityMatch = shelters.find(
    (shelter) =>
      shelter.city &&
      user.city &&
      String(shelter.city).trim().toLowerCase() === String(user.city).trim().toLowerCase()
  );

  return cityMatch || shelters[0];
}

const addPet = async (req, res) => {
  try {
    const shelter = await getPreferredShelter(req.user);
    if (!shelter) {
      return res.status(404).json({ success: false, message: "Shelter not found for admin." });
    }

    const { name, breed, age, gender, description, category, healthStatus } = req.body;
    if (!name || !breed || !age || !gender || !category) {
      return res.status(400).json({ success: false, message: "Missing required pet fields." });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Pet image is required." });
    }

    const image = getFileUrl(req, req.file);

    const pet = new Pet({
      pictures: image ? [image] : [],
      image,
      name,
      type: category,
      category,
      breed,
      gender,
      description,
      age: Number(age),
      healthStatus: healthStatus || "Healthy",
      region: req.user.city || "Unknown",
      reportLocation: null,
      distanceFromChandigarhKm: 0,
      pickupEligible: 0,
      pickupMessage: null,
      foster: null,
      shelter: shelter._id,
      source: "shelter",
      reportStatus: "approved",
      reportSeenAt: null,
    });

    await pet.save();
    res.status(201).json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to add pet" });
  }
};

const updatePet = async (req, res) => {
  try {
    const shelterIds = await getManagedShelterIds(req.user.id);
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found." });
    }
    if (!pet.shelter || !shelterIds.includes(String(pet.shelter))) {
      return res.status(403).json({ success: false, message: "You can update only your shelter pets." });
    }

    const updates = { ...req.body };
    if (updates.age !== undefined) {
      updates.age = Number(updates.age);
    }
    if (updates.category) {
      updates.type = updates.category;
    }
    updates.source = "shelter";
    updates.pickupEligible = 0;
    updates.distanceFromChandigarhKm = 0;

    if (req.file) {
      if (pet.image) {
        await deleteImageByUrl(pet.image);
      }
      const image = getFileUrl(req, req.file);
      updates.image = image;
      updates.pictures = [image];
    }

    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ success: true, data: updatedPet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to update pet" });
  }
};

const deletePet = async (req, res) => {
  try {
    const shelterIds = await getManagedShelterIds(req.user.id);
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found." });
    }
    if (!pet.shelter || !shelterIds.includes(String(pet.shelter))) {
      return res.status(403).json({ success: false, message: "You can delete only your shelter pets." });
    }

    await Pet.findByIdAndDelete(req.params.id);
    if (pet.image) {
      await deleteImageByUrl(pet.image);
    }
    res.status(200).json({ success: true, message: "Pet removed successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to delete pet" });
  }
};

const getShelterPets = async (req, res) => {
  try {
    const shelterIds = await getManagedShelterIds(req.user.id);
    const pets = (await Pet.find({ source: "shelter" })).filter(
      (pet) => pet.shelter && shelterIds.includes(String(pet.shelter))
    );
    res.status(200).json({ success: true, data: pets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch pets" });
  }
};

module.exports = {
  addPet,
  updatePet,
  deletePet,
  getShelterPets,
};
