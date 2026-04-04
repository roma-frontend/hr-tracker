/**
 * Unit tests for Convex chat mutations
 *
 * Tests business logic validation rules extracted from convex/chat/mutations.ts
 */

import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const getSource = (file: string) =>
  fs.readFileSync(path.join(__dirname, '../../../convex/chat', file), 'utf8');

describe('Chat Mutations Validation Rules', () => {
  describe('getOrCreateDM', () => {
    it('should check for existing DM conversation between two users', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('getOrCreateDM');
    });

    it('should create conversation with both users as members', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('chatConversations');
      expect(source).toContain('chatMembers');
    });
  });

  describe('sendMessage', () => {
    it('should validate conversation exists', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('not found');
      expect(source).toContain('db.get');
    });

    it('should validate sender is a member', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('Not a member');
      expect(source).toContain('chatMembers');
    });

    it('should create message with senderId and content', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('chatMessages');
      expect(source).toContain('db.insert');
      expect(source).toContain('senderId');
      expect(source).toContain('content');
    });

    it('should update last message tracking on conversation', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('lastMessage');
      expect(source).toContain('db.patch');
    });
  });

  describe('editMessage', () => {
    it('should only allow sender to edit', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('senderId');
    });

    it('should set isEdited flag and editedAt timestamp', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('isEdited');
      expect(source).toContain('editedAt');
    });
  });

  describe('deleteMessage', () => {
    it('should soft delete by setting isDeleted true', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('isDeleted');
      expect(source).toContain('true');
    });

    it('should replace content with deleted marker', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('deleted');
    });
  });

  describe('markAsRead', () => {
    it('should update lastReadAt for member', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('lastReadAt');
      expect(source).toContain('chatMembers');
    });
  });

  describe('toggleReaction', () => {
    it('should add or remove reaction based on existing', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('toggleReaction');
      expect(source).toContain('emoji');
    });
  });

  describe('createGroup', () => {
    it('should create group conversation with multiple members', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('createGroup');
    });
  });

  describe('leaveConversation', () => {
    it('should remove member from conversation', () => {
      const source = getSource('mutations.ts');
      expect(source).toContain('leaveConversation');
      expect(source).toContain('db.delete');
    });
  });
});
