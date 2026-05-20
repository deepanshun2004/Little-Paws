import { Link } from "react-router-dom";

const PetCard = ({ pet }) => {
  const imageUrl = pet.pictures?.[0] || "https://placehold.co/600x400?text=Little+Paws";

  return (
    <div
      key={pet.name}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <Link to={`/pet/${pet._id}`} className="text-2xl font-bold">
        <div className="relative">
          <img
            src={imageUrl}
            alt={pet.name}
            className="text-xl w-full h-48 object-cover "
          />
          {/* <Heart className="absolute top-3 right-3 w-6 h-6 text-white hover:text-indigo-200 cursor-pointer" /> */}
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold text-indigo-900">{pet.name}</h2>
          <div className="text-sm text-indigo-600 font-medium">
            <span>{pet.type}</span> • <span>{pet.breed}</span> • <span>{pet.age} years</span>• <span>{pet.region} </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">{pet.distance}</div>
        </div>
      </Link>
    </div>
  );
};

export default PetCard;
