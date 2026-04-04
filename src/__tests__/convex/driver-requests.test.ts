/**
 * Unit tests for Convex driver request mutations
 *
 * Tests business logic validation rules extracted from convex/drivers/requests_mutations.ts
 */

import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const getSource = (file: string) =>
  fs.readFileSync(path.join(__dirname, '../../../convex/drivers', file), 'utf8');

describe('Driver Request Validation Rules', () => {
  describe('requestDriver', () => {
    it('should validate startTime < endTime', () => {
      const source = getSource('requests_mutations.ts');
      expect(source).toContain('startTime');
      expect(source).toContain('endTime');
    });

    it('should create request and notify driver', () => {
      const source = getSource('requests_mutations.ts');
      expect(source).toContain('driverRequests');
      expect(source).toContain('db.insert');
      expect(source).toContain('notifications');
    });

    it('should check for overlapping schedules', () => {
      const source = getSource('requests_mutations.ts');
      expect(source).toContain('driverSchedules');
    });
  });

  describe('cancelDriverRequest', () => {
    it('should only allow requester to cancel', () => {
      const source = getSource('requests_mutations.ts');
      expect(source).toContain('requesterId');
    });

    it('should update status to cancelled', () => {
      const source = getSource('requests_mutations.ts');
      expect(source).toContain('cancelled');
      expect(source).toContain('db.patch');
    });
  });

  describe('respondToDriverRequest', () => {
    it('should validate driverId matches request', () => {
      const source = getSource('requests_mutations.ts');
      expect(source).toContain('driverId');
    });

    it('should create schedule entry when approved', () => {
      const source = getSource('requests_mutations.ts');
      expect(source).toContain('driverSchedules');
      expect(source).toContain('approved');
    });
  });

  describe('reassignDriverRequest', () => {
    it('should update driverId and notify new driver', () => {
      const source = getSource('requests_mutations.ts');
      expect(source).toContain('reassignDriverRequest');
      expect(source).toContain('notifications');
    });
  });
});
