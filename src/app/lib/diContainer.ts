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
import { BookingController } from '../(controller)/rideSharing/bookingController';
import { BookingRepo } from '../(model)/rideSharing/booking/bookingRepo';


container.registerSingleton(RideListingRepo)
container.registerSingleton(RideListingController)
container.registerSingleton(RideRequestRepo)
container.registerSingleton(RideRequestController)
container.registerSingleton(TransformationProviderController)   
container.registerSingleton(TransportationProviderRepo)
container.registerSingleton(OfferRepo)
container.registerSingleton(OfferController)
container.registerSingleton(BookingRepo)
container.registerSingleton(BookingController)

export { container };