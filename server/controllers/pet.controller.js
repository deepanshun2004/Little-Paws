const Pet = require("../models/pets.model")
const Shelter = require("../models/shelter.model");

const getAllPets = async (req, res) => {
    try {
        const allPets = await Pet.find();
        const adoptablePets = allPets.filter((pet) => !pet.foster || pet.reportStatus === "approved");
        res.status(200).json(adoptablePets); 
    } catch (error) {
        console.error('Error fetching pets:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const fetchPet = async (req, res) => {
    const petId = req.params.petId;

    try {
        const animal = await Pet.findById(petId);
        if (!animal || (animal.foster && animal.reportStatus !== "approved")) {
            return res.status(404).json({ message: 'Pet not found' }); 
        }
        const shelter = animal.shelter ? await Shelter.findById(animal.shelter) : null;
        res.status(200).json({
          ...animal,
          shelterDetails: shelter,
          shelterAdminId: shelter?.shelterAdmin || null,
        });
    } catch (error) {
        console.error('Error fetching pet by ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {getAllPets , fetchPet}
