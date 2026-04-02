/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as aiChat from "../aiChat.js";
import type * as aiChatMutations from "../aiChatMutations.js";
import type * as aiEvaluator from "../aiEvaluator.js";
import type * as aiSiteEditor from "../aiSiteEditor.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as automation from "../automation.js";
import type * as automationActions from "../automationActions.js";
import type * as automationMutations from "../automationMutations.js";
import type * as automationTest from "../automationTest.js";
import type * as birthdays from "../birthdays.js";
import type * as chat from "../chat.js";
import type * as chatAction from "../chatAction.js";
import type * as conflicts from "../conflicts.js";
import type * as corporate from "../corporate.js";
import type * as driverAI from "../driverAI.js";
import type * as drivers from "../drivers.js";
import type * as employeeNotes from "../employeeNotes.js";
import type * as employeeProfiles from "../employeeProfiles.js";
import type * as events from "../events.js";
import type * as faceRecognition from "../faceRecognition.js";
import type * as http from "../http.js";
import type * as leaves from "../leaves.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_date from "../lib/date.js";
import type * as messenger from "../messenger.js";
import type * as migrations from "../migrations.js";
import type * as notifications from "../notifications.js";
import type * as organizationJoinRequests from "../organizationJoinRequests.js";
import type * as organizationRequests from "../organizationRequests.js";
import type * as organizations from "../organizations.js";
import type * as pagination from "../pagination.js";
import type * as productivity from "../productivity.js";
import type * as scripts_createTestAutomationData from "../scripts/createTestAutomationData.js";
import type * as scripts_createTestTicket from "../scripts/createTestTicket.js";
import type * as security from "../security.js";
import type * as settings from "../settings.js";
import type * as sharepointSync from "../sharepointSync.js";
import type * as sla from "../sla.js";
import type * as subscriptions from "../subscriptions.js";
import type * as subscriptions_admin from "../subscriptions_admin.js";
import type * as superadmin from "../superadmin.js";
import type * as supervisorRatings from "../supervisorRatings.js";
import type * as tasks from "../tasks.js";
import type * as tickets from "../tickets.js";
import type * as timeTracking from "../timeTracking.js";
import type * as updateSuperadminPlan from "../updateSuperadminPlan.js";
import type * as userPreferences from "../userPreferences.js";
import type * as userStats from "../userStats.js";
import type * as users from "../users.js";
import type * as users_index from "../users/index.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  aiChat: typeof aiChat;
  aiChatMutations: typeof aiChatMutations;
  aiEvaluator: typeof aiEvaluator;
  aiSiteEditor: typeof aiSiteEditor;
  analytics: typeof analytics;
  auth: typeof auth;
  automation: typeof automation;
  automationActions: typeof automationActions;
  automationMutations: typeof automationMutations;
  automationTest: typeof automationTest;
  birthdays: typeof birthdays;
  chat: typeof chat;
  chatAction: typeof chatAction;
  conflicts: typeof conflicts;
  corporate: typeof corporate;
  driverAI: typeof driverAI;
  drivers: typeof drivers;
  employeeNotes: typeof employeeNotes;
  employeeProfiles: typeof employeeProfiles;
  events: typeof events;
  faceRecognition: typeof faceRecognition;
  http: typeof http;
  leaves: typeof leaves;
  "lib/auth": typeof lib_auth;
  "lib/date": typeof lib_date;
  messenger: typeof messenger;
  migrations: typeof migrations;
  notifications: typeof notifications;
  organizationJoinRequests: typeof organizationJoinRequests;
  organizationRequests: typeof organizationRequests;
  organizations: typeof organizations;
  pagination: typeof pagination;
  productivity: typeof productivity;
  "scripts/createTestAutomationData": typeof scripts_createTestAutomationData;
  "scripts/createTestTicket": typeof scripts_createTestTicket;
  security: typeof security;
  settings: typeof settings;
  sharepointSync: typeof sharepointSync;
  sla: typeof sla;
  subscriptions: typeof subscriptions;
  subscriptions_admin: typeof subscriptions_admin;
  superadmin: typeof superadmin;
  supervisorRatings: typeof supervisorRatings;
  tasks: typeof tasks;
  tickets: typeof tickets;
  timeTracking: typeof timeTracking;
  updateSuperadminPlan: typeof updateSuperadminPlan;
  userPreferences: typeof userPreferences;
  userStats: typeof userStats;
  users: typeof users;
  "users/index": typeof users_index;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
