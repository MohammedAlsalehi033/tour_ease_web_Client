'use client';

import React, { useState, useEffect } from 'react';
import { container } from '@/app/lib/diContainer';
import { TransformationProviderController } from '@/app/(controller)/rideSharing/transportationProviderContrroller';

// Vehicle type configurations
const vehicleConfigs = {
  car: { minSeats: 1, maxSeats: 7, showModel: true, label: 'Car' },
  van: { minSeats: 4, maxSeats: 15, showModel: true, label: 'Van' },
  bus: { minSeats: 10, maxSeats: 60, showModel: true, label: 'Bus' },
  motorcycle: { minSeats: 1, maxSeats: 1, showModel: true, label: 'Motorcycle' },
  bike: { minSeats: 1, maxSeats: 2, showModel: false, label: 'Bike' },
  other: { minSeats: 1, maxSeats: 20, showModel: false, label: 'Other' }
};

interface UpdateProviderFormProps {
  providerId: string;
  currentVehicleType: string;
  currentSeatsAvailable: number;
  onUpdate?: () => void;
}

// Parse the combined vehicle type string
function parseVehicleType(combinedType: string) {
  const plateMatch = combinedType.match(/\(Plate: ([^)]+)\)/);
  const plateNumber = plateMatch ? plateMatch[1] : '';
  
  let typeAndModel = combinedType.replace(/\s*\(Plate: [^)]+\)\s*/, '').trim();
  const parts = typeAndModel.split(' - ');
  
  const baseType = parts[0].toLowerCase();
  const vehicleModel = parts[1] || '';
  
  return { baseType, vehicleModel, plateNumber };
}

export default function UpdateProviderForm({
  providerId,
  currentVehicleType,
  currentSeatsAvailable,
  onUpdate
}: UpdateProviderFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const parsedData = parseVehicleType(currentVehicleType);
  
  const [formData, setFormData] = useState({
    vehicleType: parsedData.baseType in vehicleConfigs ? parsedData.baseType : 'car',
    vehicleModel: parsedData.vehicleModel,
    plateNumber: parsedData.plateNumber,
    seatsAvailable: currentSeatsAvailable,
  });

  const [licenseMedia, setLicenseMedia] = useState<File[]>([]);
  const [vehicleMedia, setVehicleMedia] = useState<File[]>([]);
  const [licensePreview, setLicensePreview] = useState<string[]>([]);
  const [vehiclePreview, setVehiclePreview] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Reset seats when vehicle type changes
    if (name === 'vehicleType') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        seatsAvailable: 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'seatsAvailable' ? parseInt(value) || 0 : value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'license' | 'vehicle') => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 5) {
      setError(`You can only upload up to 5 ${type} images`);
      return;
    }

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));

    if (type === 'license') {
      // Clean up old previews
      licensePreview.forEach(url => URL.revokeObjectURL(url));
      setLicenseMedia(files);
      setLicensePreview(previews);
    } else {
      // Clean up old previews
      vehiclePreview.forEach(url => URL.revokeObjectURL(url));
      setVehicleMedia(files);
      setVehiclePreview(previews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Validate that at least some media is uploaded
      if (licenseMedia.length === 0 && vehicleMedia.length === 0) {
        setError('Please upload at least one license or vehicle image');
        setIsSubmitting(false);
        return;
      }

      // Combine vehicle type with model and plate number
      let combinedVehicleType = formData.vehicleType;
      if (formData.vehicleModel) {
        combinedVehicleType += ` - ${formData.vehicleModel}`;
      }
      if (formData.plateNumber) {
        combinedVehicleType += ` (Plate: ${formData.plateNumber})`;
      }

      const controller = container.resolve(TransformationProviderController);
      
      await controller.updateTransformationProvider(
        providerId,
        formData.seatsAvailable,
        combinedVehicleType,
        vehicleMedia,
        licenseMedia
      );

      setSuccess(true);
      setIsEditing(false);
      
      // Clean up preview URLs
      licensePreview.forEach(url => URL.revokeObjectURL(url));
      vehiclePreview.forEach(url => URL.revokeObjectURL(url));
      setLicensePreview([]);
      setVehiclePreview([]);
      setLicenseMedia([]);
      setVehicleMedia([]);

      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }

      // Refresh the page after a short delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update provider information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    const parsedData = parseVehicleType(currentVehicleType);
    setFormData({
      vehicleType: parsedData.baseType in vehicleConfigs ? parsedData.baseType : 'car',
      vehicleModel: parsedData.vehicleModel,
      plateNumber: parsedData.plateNumber,
      seatsAvailable: currentSeatsAvailable,
    });
    
    // Clean up preview URLs
    licensePreview.forEach(url => URL.revokeObjectURL(url));
    vehiclePreview.forEach(url => URL.revokeObjectURL(url));
    setLicensePreview([]);
    setVehiclePreview([]);
    setLicenseMedia([]);
    setVehicleMedia([]);
    setError(null);
    setSuccess(false);
  };

  if (!isEditing) {
    return (
      <div className="mt-4">
        <button
          onClick={() => setIsEditing(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Update Vehicle Information
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
      <h3 className="font-display text-title-lg font-bold mb-4">Update Vehicle Information</h3>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200 font-medium">
            Vehicle information updated successfully! Your account status has been reset to pending for review.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Type */}
        <div>
          <label htmlFor="vehicleType" className="block text-body-md font-medium mb-2">
            Vehicle Type
          </label>
          <select
            id="vehicleType"
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
          >
            {Object.entries(vehicleConfigs).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formData.vehicleType === 'bike' 
              ? 'Bikes are not motorized vehicles'
              : `Allowed seats: ${vehicleConfigs[formData.vehicleType as keyof typeof vehicleConfigs].minSeats}-${vehicleConfigs[formData.vehicleType as keyof typeof vehicleConfigs].maxSeats}`}
          </p>
        </div>

        {/* Vehicle Model - Only for motorized vehicles */}
        {vehicleConfigs[formData.vehicleType as keyof typeof vehicleConfigs].showModel && (
          <div>
            <label htmlFor="vehicleModel" className="block text-body-md font-medium mb-2">
              Vehicle Model {formData.vehicleType !== 'other' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              id="vehicleModel"
              name="vehicleModel"
              value={formData.vehicleModel}
              onChange={handleInputChange}
              placeholder={`e.g., ${formData.vehicleType === 'car' ? 'Toyota Camry 2020' : formData.vehicleType === 'motorcycle' ? 'Honda CBR 500R' : formData.vehicleType === 'bus' ? 'Mercedes Sprinter' : 'Enter model'}`}
              required={formData.vehicleType !== 'other'}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
            />
          </div>
        )}

        {/* Plate Number */}
        <div>
          <label htmlFor="plateNumber" className="block text-body-md font-medium mb-2">
            License Plate Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="plateNumber"
            name="plateNumber"
            value={formData.plateNumber}
            onChange={handleInputChange}
            placeholder="e.g., ABC-1234"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
          />
        </div>

        {/* Seats Available */}
        <div>
          <label htmlFor="seatsAvailable" className="block text-body-md font-medium mb-2">
            Seats Available
          </label>
          <input
            type="number"
            id="seatsAvailable"
            name="seatsAvailable"
            value={formData.seatsAvailable}
            onChange={handleInputChange}
            min={vehicleConfigs[formData.vehicleType as keyof typeof vehicleConfigs].minSeats}
            max={vehicleConfigs[formData.vehicleType as keyof typeof vehicleConfigs].maxSeats}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            For {vehicleConfigs[formData.vehicleType as keyof typeof vehicleConfigs].label}: {vehicleConfigs[formData.vehicleType as keyof typeof vehicleConfigs].minSeats}-{vehicleConfigs[formData.vehicleType as keyof typeof vehicleConfigs].maxSeats} seats
          </p>
        </div>

        {/* License Media */}
        <div>
          <label htmlFor="licenseMedia" className="block text-body-md font-medium mb-2">
            License Images (up to 5)
          </label>
          <input
            type="file"
            id="licenseMedia"
            accept="image/*"
            multiple
            onChange={(e) => handleFileChange(e, 'license')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
          />
          {licensePreview.length > 0 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
              {licensePreview.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`License preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Media */}
        <div>
          <label htmlFor="vehicleMedia" className="block text-body-md font-medium mb-2">
            Vehicle Images (up to 5)
          </label>
          <input
            type="file"
            id="vehicleMedia"
            accept="image/*"
            multiple
            onChange={(e) => handleFileChange(e, 'vehicle')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
          />
          {vehiclePreview.length > 0 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
              {vehiclePreview.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Vehicle preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-body-sm">
            <strong>Note:</strong> Updating your vehicle information will reset your account status to "pending" for review. 
            You will need to wait for admin approval before you can accept new rides.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating...' : 'Update Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
}
