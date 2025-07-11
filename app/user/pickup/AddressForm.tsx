"use client";
import { useState } from "react";
import Button from "@/components/common/Button";
import { Select, TextInput } from "flowbite-react";
import { City, CityAreas } from "@/components/Types/address.type";

const cityAreas:CityAreas = {
  Cairo: ['Nasr City', 'Heliopolis', 'Maadi'],
  Giza: ['Dokki', 'Mohandessin', '6th October']
};

export default function AddressForm({ onNext }: { onNext: () => void }) {
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | ''>('');
  const [selectedArea, setSelectedArea] = useState<string>('');

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value as City);
    setSelectedArea('');
  };

const availableAreas = selectedCity ? cityAreas[selectedCity] : [];

  return (
    <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
      <Button
        width="150px"
        height="40px"
        onClick={() => setShowAddressFields(true)}
      >
        Add new address
      </Button>

      {showAddressFields && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onNext();
          }}
          className="space-y-4 mt-4"
        >
          <label className="block text-sm font-medium">Select your city</label>
          <Select value={selectedCity} onChange={handleCityChange}>
            <option disabled value="">-- Select City --</option>
            <option value="Cairo">Cairo</option>
            <option value="Giza">Giza</option>
          </Select>

          <label className="block text-sm font-medium">Select your area</label>
          <Select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            disabled={!selectedCity}
          >
            <option disabled value="">-- Select Area --</option>
            {availableAreas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </Select>
          <label className="block text-sm font-medium">Street address</label>
            <TextInput placeholder="e.g. El-Central street"/>
          <label className="block text-sm font-medium">Nearest Land Mark (optional)</label>
            <TextInput placeholder="e.g. El-Asdekaa Market"/>
            <div className="flex gap-2">
            <div className="buldNo">
                 <label className="block text-sm font-medium">Building Number/Name</label>
                      <TextInput type="tel"/>
            </div>
            <div className="Floor">
                 <label className="block text-sm font-medium">Floor Number</label>
                      <TextInput type="number"/>
            </div>

            </div>
            <div className="flex gap-2">
            <div className="buldNo">
                 <label className="block text-sm font-medium">Appartment Number</label>
                      <TextInput type="tel"/>
            </div>
            <div className="Floor">
                 <label className="block text-sm font-medium">Additional note</label>
                      <TextInput placeholder="e.g. Don't ring the bell"/>
            </div>

            </div>
          <div className="flex justify-between">
            <Button disabled width="120px" height="40px" type="submit">
              Save Address
            </Button>
            <Button
              width="120px"
              height="40px"
              onClick={() => setShowAddressFields(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="flex justify-between mt-4">

      </div>
    </div>
  );
}
