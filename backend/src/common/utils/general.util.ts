export function generatePin(): string {
  const pin = Math.floor(1000 + Math.random() * 9000);
  return pin.toString();
}

export function createHtmlContent(rideResponse, driverToNotify, userToNotify) {
  return `
        <h3>Ride Information</h3>
        <ul>
          <li><strong>Ride ID:</strong> ${rideResponse.id}</li>
          <li><strong>Pickup Location:</strong> ${rideResponse.pickup_location}</li>
          <li><strong>Destination Location:</strong> ${rideResponse.destination_location}</li>
          <li><strong>Scheduled Time:</strong> ${rideResponse.scheduled_time}</li>
          <li><strong>Status:</strong> ${rideResponse.status}</li>
          <li><strong>Driver:</strong> ${driverToNotify.name}</li>
          <li><strong>User:</strong> ${userToNotify.name}</li>
          <li><strong>Price:</strong> $${rideResponse.offer.price}</li>
          <li><strong>PIN:</strong> ${rideResponse.pin}</li>
        </ul>
      `;
}

export function createTextContent(rideResponse, driverToNotify, userToNotify) {
  return `Your ride has been confirmed. Details:
      Ride ID: ${rideResponse.id} - 
      Pickup Location: ${rideResponse.pickup_location} - 
      Destination Location: ${rideResponse.destination_location} - 
      Scheduled Time: ${rideResponse.scheduled_time} - 
      Status: ${rideResponse.status} -
      Driver: ${driverToNotify.name} -
      User: ${userToNotify.name} -
      Price: ${rideResponse.offer.price} -
      PIN: ${rideResponse.pin}`;
}
