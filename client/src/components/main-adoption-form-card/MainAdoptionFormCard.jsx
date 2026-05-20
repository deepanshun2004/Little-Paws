import { useState ,useEffect } from "react";
import { Check, X } from 'lucide-react';
import axios from 'axios';

import { apiUrl } from "@/lib/api";
const ApplicationDetails = ({ app }) => {
  const [showAllDetails, setShowAllDetails] = useState(false);

  const toggleDetails = () => setShowAllDetails(!showAllDetails);
//   const getApprovalStatus = (app) => {
//     if (app.status === 'approved') {
//         return "Approved";
//     } else if (app.status === 'rejected') {
//         return "Rejected";
//     } else {
//         return "Pending";
//     }
// };

const [status, setStatus] = useState(app.status);

    // Update status when `app.isApproved` changes
    useEffect(() => {
        if (app.status === 'approved') {
            setStatus("Approved");
        } else if (app.status === 'rejected') {
            setStatus("Rejected");
        } else {
            setStatus("Pending");
        }
    }, [app.status]);


const handleAccept = async (applicationId) => {
    try {
        const response = await axios.put(
            apiUrl(`/api/shelterAdmin/applications/${applicationId}`), 
            {}, // Request body (empty for this case)
            {
              headers: {
                  'Content-Type': 'application/json',
              },
              withCredentials: true, // Include cookies in the request
          }
        );

        console.log("Application approved:", response.data);
        alert("Application approved successfully!");
        // Optionally update your state or UI here
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with an error status
            console.error("Error approving application:", error.response.data.message);
            alert(`Error: ${error.response.data.message}`);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received:", error.request);
            alert("No response from server. Please try again later.");
        } else {
            // Something happened in setting up the request
            console.error("Error setting up request:", error.message);
            alert("An error occurred. Please try again.");
        }
    }
};
const handleReject = async (applicationId) => {
  try {
      const response = await axios.put(
          apiUrl(`/api/shelterAdmin/applications/reject/${applicationId}`), 
          {}, // Request body (empty for this case)
          {
              headers: {
                  'Content-Type': 'application/json',
              },
              withCredentials: true, // Include cookies in the request
          }
      );

      console.log("Application rejected:", response.data);
      alert("Application rejected successfully!");
      // Optionally update your state or UI here
  } catch (error) {
      if (error.response) {
          console.error("Error rejecting application:", error.response.data.message);
          alert(`Error: ${error.response.data.message}`);
      } else if (error.request) {
          console.error("No response received:", error.request);
          alert("No response from server. Please try again later.");
      } else {
          console.error("Error setting up request:", error.message);
          alert("An error occurred. Please try again.");
      }
  }
};




  return (
    <div className="mb-4 rounded shadow-sm">
      <h4 className="font-medium">Application no. {app._id}</h4>
      <p className="text-gray-600">Pet Name: {app.adoptionDetails.petName}</p>
      <p className="text-gray-600">Requested by: {app.personalInfo.fullName}</p>
      <p className="text-gray-600">Location: {app.location}</p>
      <p className="text-gray-600">Status: {status}</p>

      {!showAllDetails && (
        <button
          className="mt-2 text-blue-500 underline hover:text-blue-700"
          onClick={toggleDetails}
        >
          Show More
        </button>
      )}

      {showAllDetails && (
        <>
          <div className="mt-2">
            <h5 className="font-medium">Personal Information</h5>
            <p className="text-gray-600">Full Name: {app.personalInfo.fullName}</p>
            <p className="text-gray-600">Email: {app.personalInfo.email}</p>
            <p className="text-gray-600">Phone: {app.personalInfo.phone}</p>
            <p className="text-gray-600">Alternate Phone: {app.personalInfo.altPhone}</p>
            <p className="text-gray-600">Address: {app.personalInfo.address}</p>
            <p className="text-gray-600">Occupation: {app.personalInfo.occupation}</p>
            <p className="text-gray-600">Working Hours: {app.personalInfo.workingHours}</p>
          </div>

          <div className="mt-2">
            <h5 className="font-medium">Living Conditions</h5>
            <p className="text-gray-600">Residence Type: {app.livingConditions.residenceType}</p>
            <p className="text-gray-600">Ownership Status: {app.livingConditions.ownershipStatus}</p>
            <p className="text-gray-600">Has Yard: {app.livingConditions.hasYard ? "Yes" : "No"}</p>
            <p className="text-gray-600">Yard Fenced: {app.livingConditions.yardFenced ? "Yes" : "No"}</p>
            <p className="text-gray-600">Household Members: {app.livingConditions.householdMembers}</p>
            <p className="text-gray-600">Children Ages: {app.livingConditions.childrenAges || "None"}</p>
            <p className="text-gray-600">Landlord Contact: {app.livingConditions.landlordContact}</p>
            <p className="text-gray-600">Move Frequency: {app.livingConditions.moveFrequency}</p>
          </div>

          <div className="mt-2">
            <h5 className="font-medium">Pet Experience</h5>
            <p className="text-gray-600">Current Pets: {app.petExperience.currentPets}</p>
            <p className="text-gray-600">Previous Pets: {app.petExperience.previousPets}</p>
            <p className="text-gray-600">Vet Name: {app.petExperience.vetName}</p>
            <p className="text-gray-600">Vet Contact: {app.petExperience.vetContact}</p>
            <p className="text-gray-600">Pet Allergies: {app.petExperience.petAllergies}</p>
            <p className="text-gray-600">Training Experience: {app.petExperience.trainingExperience}</p>
          </div>

          <div className="mt-2">
            <h5 className="font-medium">Adoption Details</h5>
            <p className="text-gray-600">Pet Name: {app.adoptionDetails.petName}</p>
            <p className="text-gray-600">Reason to Adopt: {app.adoptionDetails.reasonToAdopt}</p>
            <p className="text-gray-600">Time with Pet: {app.adoptionDetails.timeWithPet}</p>
            <p className="text-gray-600">Exercise Plan: {app.adoptionDetails.exercisePlan}</p>
            <p className="text-gray-600">Emergency Plan: {app.adoptionDetails.emergencyPlan}</p>
            <p className="text-gray-600">Adjustment Plan: {app.adoptionDetails.adjustmentPlan}</p>
            <p className="text-gray-600">Pet Expenses: {app.adoptionDetails.petExpenses}</p>
            <p className="text-gray-600">Vacation Plan: {app.adoptionDetails.vacationPlan}</p>
          </div>

          <button
            className="mt-2 text-blue-500 underline hover:text-blue-700"
            onClick={toggleDetails}
          >
            Show Less
          </button>
        </>
      )}
      <div className="flex space-x-5 mt-4">
            <button 
            className="flex-1 py-2 rounded bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
            onClick={() => handleAccept(app._id)}
            >
            <Check 
              className="w-5 h-5"
              
            />
            </button>
            <button 
            className="flex-1 py-2 rounded bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
            onClick={() => handleReject(app._id)}
            >
            <X className="w-5 h-5" />
            </button>
        </div>
    </div>
  );
};

export default ApplicationDetails;