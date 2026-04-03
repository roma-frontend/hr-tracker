/**
 * Driver Management System - Modular Structure
 *
 * Core queries exported. Remaining functions stay in parent drivers.ts file.
 */

// Re-export queries
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

// Re-export request queries
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

// Re-export calendar queries
export {
  checkCalendarAccess,
  getCalendarAccessList,
  getDriverCalendarForViewer,
} from './calendar-queries';

// Re-export request mutations
export {
  requestDriver,
  respondToDriverRequest,
  updateDriverRequest,
  cancelDriverRequest,
  deleteDriverRequest,
  reassignDriverRequest,
} from './requests-mutations';

// Re-export calendar mutations
export {
  grantCalendarAccess,
  revokeCalendarAccess,
  requestCalendarAccess,
} from './calendar-mutations';
