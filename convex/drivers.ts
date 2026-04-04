/**
 * Driver Management System - Entry Point
 *
 * Re-exports all driver-related queries and mutations from submodules.
 * This file serves as the public API for api.drivers.*
 */

// Core queries
export {
  getAvailableDrivers,
  getDriverById,
  getDriverByUserId,
  getDriverSchedule,
  isDriverAvailable,
  isDriverOnLeave,
  getAlternativeDrivers,
  getOrgDriverSchedules,
  getFilteredDrivers,
} from './drivers/queries';

// Request queries
export {
  getDriverRequests,
  getMyRequests,
  getCompletedTrips,
  hasPassengerRated,
  getFavoriteDrivers,
  getScheduleETA,
  getDriverStats,
  getCurrentShift,
} from './drivers/requests_queries';

// Calendar queries
export {
  checkCalendarAccess,
  getCalendarAccessList,
  getDriverCalendarForViewer,
} from './drivers/calendar_queries';

// Request mutations
export {
  requestDriver,
  respondToDriverRequest,
  updateDriverRequest,
  cancelDriverRequest,
  deleteDriverRequest,
  reassignDriverRequest,
} from './drivers/requests_mutations';

// Calendar mutations
export {
  grantCalendarAccess,
  revokeCalendarAccess,
  requestCalendarAccess,
} from './drivers/calendar_mutations';

// Driver operations (trip operations, ratings, ETA, notes)
export {
  blockTimeSlot,
  updateTripStatus,
  submitDriverFeedback,
  blockTimeOff,
  calculateRoute,
  submitPassengerRating,
  addDriverNotes,
  markDriverArrived,
  markPassengerPickedUp,
  updateETA,
} from './drivers/driver_operations';

// Shift management
export {
  startShift,
  endShift,
  pauseShift,
  resumeShift,
  updateShiftTripCount,
  getShiftHistory,
  getShiftStatistics,
} from './drivers/shifts_mutations';

// Recurring trips
export {
  createRecurringTrip,
  getRecurringTrips,
  toggleRecurringTrip,
  deleteRecurringTrip,
  generateRecurringRequests,
} from './drivers/recurring_trips';

// Driver registration & favorites
export {
  registerAsDriver,
  updateDriverAvailability,
  addFavoriteDriver,
  removeFavoriteDriver,
} from './drivers/driver_registration';
