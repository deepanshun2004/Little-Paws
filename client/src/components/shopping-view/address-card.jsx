import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";
import { CheckCircle2 } from "lucide-react";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) {
    const isSelected = selectedId === addressInfo?._id;
    return ( 
        <Card onClick={
          setCurrentSelectedAddress
            ? () => setCurrentSelectedAddress(addressInfo)
            : null
        } className={`${setCurrentSelectedAddress ? "cursor-pointer transition-colors hover:border-slate-900" : ""} ${
          isSelected ? "border-2 border-slate-900 bg-slate-50" : ""
        }`}>
        <CardContent className="grid p-4 gap-4">
        {setCurrentSelectedAddress ? (
          <div className="flex items-center justify-between">
            <Label className="font-semibold text-slate-900">Delivery Address</Label>
            {isSelected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Selected
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-500">Click to select</span>
            )}
          </div>
        ) : null}
        <Label>Address: {addressInfo?.address}</Label>
        <Label>City: {addressInfo?.city}</Label>
        <Label>pincode: {addressInfo?.pincode}</Label>
        <Label>Phone: {addressInfo?.phone}</Label>
        <Label>Notes: {addressInfo?.notes}</Label>
        </CardContent>
        <CardFooter className="p-3 flex justify-between">
        <Button type="button" onClick={(event) => {
          event.stopPropagation();
          handleEditAddress(addressInfo);
        }}>Edit</Button>
        <Button type="button" onClick={(event) => {
          event.stopPropagation();
          handleDeleteAddress(addressInfo);
        }}>Delete</Button>
      </CardFooter>
        </Card>
     );
}

export default AddressCard;
