const {Router} = require('express');
const router = Router();
const Pet = require('../models/pets.model');
const { fetchPet, getAllPets } = require('../controllers/pet.controller');

//fetch all pets
router.get('/', getAllPets);

//fetch specific
router.get('/:petId', fetchPet);


module.exports = router;