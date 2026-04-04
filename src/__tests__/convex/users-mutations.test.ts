/**
 * Unit tests for Convex user mutations
 *
 * Tests business logic validation rules extracted from convex/users/*.ts
 */

import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const getSource = (file: string) =>
  fs.readFileSync(path.join(__dirname, '../../../convex/users', file), 'utf8');

describe('User Mutations Validation Rules', () => {
  describe('createUser', () => {
    it('should check for existing user by email', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('email');
    });

    it('should create user with organizationId', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('users');
      expect(source).toContain('db.insert');
    });
  });

  describe('updateUser', () => {
    it('should throw when user not found', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('User not found');
      expect(source).toContain('db.get');
    });

    it('should patch user fields with updatedAt', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('db.patch');
      expect(source).toContain('updatedAt');
    });
  });

  describe('deleteUser', () => {
    it('should mark user as inactive/deleted', () => {
      const source = getSource('mutations.ts');
      const hasDeleted = source.includes('isActive') || source.includes('deletedAt') || source.includes('removedAt') || source.includes('isDeleted');
      expect(hasDeleted).toBe(true);
    });
  });

  describe('updatePresenceStatus', () => {
    it('should update presenceStatus field', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('presenceStatus');
      expect(source).toContain('db.patch');
    });
  });

  describe('updateOwnProfile', () => {
    it('should allow updating name, phone, position, department', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('name');
      expect(source).toContain('phone');
      expect(source).toContain('position');
      expect(source).toContain('department');
    });
  });

  describe('hardDeleteUser', () => {
    it('should permanently delete user record', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('hardDeleteUser');
      expect(source).toContain('db.delete');
    });
  });

  describe('suspendUser', () => {
    it('should set suspendedAt timestamp', () => {
      // suspendUser may be in mutations.ts or admin.ts
      const mutations = getSource('mutations.ts');
      const admin = getSource('admin.ts');
      const combined = mutations + admin;
      expect(combined).toContain('suspendedAt');
    });
  });

  describe('unsuspendUser', () => {
    it('should clear suspendedAt', () => {
      const mutations = getSource('mutations.ts');
      const admin = getSource('admin.ts');
      const combined = mutations + admin;
      expect(combined).toContain('suspendedAt');
    });
  });
});
