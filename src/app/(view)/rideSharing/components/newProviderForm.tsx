"use client";
import "reflect-metadata";

import React, { useState } from 'react';
import { container } from '@/app/lib/diContainer';
import { TransformationProviderController } from '@/app/(controller)/rideSharing/transportationProviderContrroller';
import { useSession } from "next-auth/react";

const TransportationProviderForm = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [formData, setFormData] = useState({
    seatsAvailable: '',
    vehicleType: 'car',
    licenseMedia: [],
    vehicleMedia: []
  });
  
  const [formResult, setFormResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: Array.from(files)
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const transformationProviderController = container.resolve(TransformationProviderController);
      const transformationProviderModel = {
        userId: userId,
        role: "transportationProvider",
        vehicleType: formData.vehicleType,
        seatsAvailable: formData.seatsAvailable
      };

      console.log("Form Data:", transformationProviderModel);
      await transformationProviderController.createTransformationProvider(
        transformationProviderModel,
        formData.vehicleMedia,
        formData.licenseMedia
      );
      
      setSubmitStatus('success');
      setFormResult({ 
        message: "Registration successful!",
        details: transformationProviderModel
      });

      location.reload();
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus('error');
      setFormResult({
        error: "Registration failed. Please try again.",
        details: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-col items-center justify-start pt-12 bg-light-background dark:bg-dark-background">
      
      
      <div className="max-w-3xl w-full px-6 mt-16">
        <div className="card bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-title-lg font-medium mb-4 text-light-on-surface dark:text-dark-on-surface">Register as Transportation Provider</h2>
          <p className="mb-6 text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">Please fill out the form below with your vehicle details.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Type */}
            <div>
              <label className="block text-title-md mb-2 text-light-on-surface dark:text-dark-on-surface" htmlFor="vehicleType">Vehicle Type</label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                className="input w-full p-3 border border-light-outline dark:border-dark-outline rounded-md bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="bus">Bus</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            {/* Seats Available */}
            <div>
              <label className="block text-title-md mb-2 text-light-on-surface dark:text-dark-on-surface" htmlFor="seatsAvailable">Seats Available</label>
              <input
                type="number"
                id="seatsAvailable"
                name="seatsAvailable"
                value={formData.seatsAvailable}
                onChange={handleInputChange}
                placeholder="Number of available seats"
                className="input w-full p-3 border border-light-outline dark:border-dark-outline rounded-md bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                max="8"
                required
              />
            </div>
            
            <div className="divider border-t border-light-outline dark:border-dark-outline my-4"></div>
            
            {/* License Media */}
            <div>
              <label className="block text-title-md mb-2 text-light-on-surface dark:text-dark-on-surface" htmlFor="licenseMedia">License Documents</label>
              <p className="text-body-sm mb-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">Upload images of your driver's license, vehicle registration, etc.</p>
              <div className="border-2 border-dashed border-light-outline dark:border-dark-outline rounded-lg p-4 hover:border-primary transition-colors">
                <input
                  type="file"
                  id="licenseMedia"
                  name="licenseMedia"
                  onChange={handleFileChange}
                  className="block w-full text-body-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90 transition-colors"
                  accept="image/*"
                  
                  required
                />
                {formData.licenseMedia.length > 0 && (
                  <div className="mt-2 text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    {formData.licenseMedia.length} file(s) selected
                  </div>
                )}
              </div>
            </div>
            
            {/* Vehicle Media */}
            <div>
              <label className="block text-title-md mb-2 text-light-on-surface dark:text-dark-on-surface" htmlFor="vehicleMedia">Vehicle Photos</label>
              <p className="text-body-sm mb-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">Upload photos of your vehicle (interior and exterior)</p>
              <div className="border-2 border-dashed border-light-outline dark:border-dark-outline rounded-lg p-4 hover:border-primary transition-colors">
                <input
                  type="file"
                  id="vehicleMedia"
                  name="vehicleMedia"
                  onChange={handleFileChange}
                  className="block w-full text-body-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90 transition-colors"
                  accept="image/*"
                  
                  required
                />
                {formData.vehicleMedia.length > 0 && (
                  <div className="mt-2 text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    {formData.vehicleMedia.length} file(s) selected
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="btn-primary relative py-3 px-6 rounded-full bg-primary text-white font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Register Vehicle'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Status notification */}
        {submitStatus && (
          <div className={`mb-6 p-4 rounded-lg ${submitStatus === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'}`}>
            <div className="flex items-center">
              {submitStatus === 'success' ? (
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <p className="font-medium">
                {submitStatus === 'success'
                  ? 'Registration successful! Your vehicle has been registered.'
                  : 'Registration failed. Please check your information and try again.'}
              </p>
            </div>
          </div>
        )}
        
   
      </div>
    </div>
  );
};

export default TransportationProviderForm;