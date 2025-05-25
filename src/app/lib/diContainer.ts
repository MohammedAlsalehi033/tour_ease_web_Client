// src/lib/diContainer.ts
import { container } from 'tsyringe';

import { RideListingRepo } from '../(model)/rideSharing/RideListting/rideListtingRepo';
import { RideListingController } from '../(controller)/rideSharing/rideListingController';
import { RideRequestController } from '../(controller)/rideSharing/rideRequestController';
import { RideRequestRepo } from '../(model)/rideSharing/RideRequest/rideRequestRepo';
import { TransportationProviderRepo } from '../(model)/rideSharing/transformationProvider/transformationProvider';
import { TransformationProviderController } from '../(controller)/rideSharing/transportationProviderContrroller';
import { OfferRepo }  from '../(model)/rideSharing/offer/offerRepo';
import { OfferController } from '../(controller)/rideSharing/offerController';


container.registerSingleton(RideListingRepo)
container.registerSingleton(RideListingController)
container.registerSingleton(RideRequestRepo)
container.registerSingleton(RideRequestController)
container.registerSingleton(TransformationProviderController)   
container.registerSingleton(TransportationProviderRepo)
container.registerSingleton(OfferRepo)
container.registerSingleton(OfferController)

export { container };