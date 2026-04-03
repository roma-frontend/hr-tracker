/**
 * Driver Management System - Modular Structure
 *
 * This module re-exports all driver-related functions from submodules.
 * The monolithic drivers.ts file has been split into logical modules.
 */

// Base queries
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
} from './queries';

// Request queries
export {
  getDriverRequests,
  getMyRequests,
  getCompletedTrips,
  hasPassengerRated,
  getRecurringTrips,
  getFavoriteDrivers,
  getScheduleETA,
  getDriverStats,
  getCurrentShift,
  getShiftHistory,
  getShiftStatistics,
} from './requests-queries';

// Calendar queries
export {
  checkCalendarAccess,
  getCalendarAccessList,
  getDriverCalendarForViewer,
} from './calendar-queries';

// Request mutations
export {
  requestDriver,
  respondToDriverRequest,
  updateDriverRequest,
  cancelDriverRequest,
  deleteDriverRequest,
  reassignDriverRequest,
} from './requests-mutations';

// Calendar mutations
export {
  grantCalendarAccess,
  revokeCalendarAccess,
  requestCalendarAccess,
} from './calendar-mutations';

// Management mutations
export {
  registerAsDriver,
  updateDriverAvailability,
  blockTimeSlot,
  blockTimeOff,
  calculateRoute,
} from './management-mutations';

// Trip execution mutations
export {
  updateTripStatus,
  submitDriverFeedback,
  submitPassengerRating,
  addDriverNotes,
  markDriverArrived,
  markPassengerPickedUp,
  updateETA,
} from './trip-execution';

// Recurring trips
export {
  createRecurringTrip,
  toggleRecurringTrip,
  deleteRecurringTrip,
  generateRecurringRequests,
  addFavoriteDriver,
  removeFavoriteDriver,
} from './recurring-trips';

// Shift mutations
export {
  startShift,
  endShift,
  pauseShift,
  resumeShift,
  updateShiftTripCount,
} from './shifts-mutations';
