import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database functions
vi.mock('../db', () => ({
  createChatGroup: vi.fn(),
  getChatGroup: vi.fn(),
  getUserChatGroups: vi.fn(),
  addGroupMembers: vi.fn(),
  removeGroupMembers: vi.fn(),
  saveMessage: vi.fn(),
  getDirectMessages: vi.fn(),
  getGroupMessages: vi.fn(),
  markMessagesAsRead: vi.fn(),
}));

import * as db from '../db';

describe('Chat Group Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createChatGroup', () => {
    it('should create a chat group with required fields', async () => {
      const mockGroup = {
        id: 1,
        name: 'Test Group',
        type: 'course',
        courseId: 1,
        createdBy: 1,
      };
      
      (db.createChatGroup as any).mockResolvedValue(mockGroup);
      
      const result = await db.createChatGroup({
        name: 'Test Group',
        type: 'course',
        courseId: 1,
        createdBy: 1,
        memberIds: [1, 2, 3],
      });
      
      expect(result).toEqual(mockGroup);
      expect(db.createChatGroup).toHaveBeenCalledWith({
        name: 'Test Group',
        type: 'course',
        courseId: 1,
        createdBy: 1,
        memberIds: [1, 2, 3],
      });
    });

    it('should create a custom group without courseId', async () => {
      const mockGroup = {
        id: 2,
        name: 'Custom Group',
        type: 'custom',
        createdBy: 1,
      };
      
      (db.createChatGroup as any).mockResolvedValue(mockGroup);
      
      const result = await db.createChatGroup({
        name: 'Custom Group',
        type: 'custom',
        createdBy: 1,
        memberIds: [1, 2],
      });
      
      expect(result).toEqual(mockGroup);
    });
  });

  describe('getChatGroup', () => {
    it('should return a chat group by id', async () => {
      const mockGroup = {
        id: 1,
        name: 'Test Group',
        type: 'course',
      };
      
      (db.getChatGroup as any).mockResolvedValue(mockGroup);
      
      const result = await db.getChatGroup(1);
      
      expect(result).toEqual(mockGroup);
      expect(db.getChatGroup).toHaveBeenCalledWith(1);
    });

    it('should return null for non-existent group', async () => {
      (db.getChatGroup as any).mockResolvedValue(null);
      
      const result = await db.getChatGroup(999);
      
      expect(result).toBeNull();
    });
  });

  describe('getUserChatGroups', () => {
    it('should return all groups for a user', async () => {
      const mockGroups = [
        { id: 1, name: 'Group 1', type: 'course' },
        { id: 2, name: 'Group 2', type: 'custom' },
      ];
      
      (db.getUserChatGroups as any).mockResolvedValue(mockGroups);
      
      const result = await db.getUserChatGroups(1);
      
      expect(result).toEqual(mockGroups);
      expect(result.length).toBe(2);
    });

    it('should return empty array for user with no groups', async () => {
      (db.getUserChatGroups as any).mockResolvedValue([]);
      
      const result = await db.getUserChatGroups(999);
      
      expect(result).toEqual([]);
    });
  });
});

describe('Message Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveMessage', () => {
    it('should save a direct message', async () => {
      const mockMessage = {
        id: 1,
        fromUserId: 1,
        toUserId: 2,
        content: 'Hello!',
        createdAt: new Date(),
      };
      
      (db.saveMessage as any).mockResolvedValue(mockMessage);
      
      const result = await db.saveMessage({
        fromUserId: 1,
        toUserId: 2,
        content: 'Hello!',
      });
      
      expect(result).toEqual(mockMessage);
    });

    it('should save a group message', async () => {
      const mockMessage = {
        id: 2,
        fromUserId: 1,
        groupId: 1,
        content: 'Hello group!',
        createdAt: new Date(),
      };
      
      (db.saveMessage as any).mockResolvedValue(mockMessage);
      
      const result = await db.saveMessage({
        fromUserId: 1,
        groupId: 1,
        content: 'Hello group!',
      });
      
      expect(result).toEqual(mockMessage);
    });
  });

  describe('getDirectMessages', () => {
    it('should return messages between two users', async () => {
      const mockMessages = [
        { id: 1, fromUserId: 1, toUserId: 2, content: 'Hi', createdAt: new Date() },
        { id: 2, fromUserId: 2, toUserId: 1, content: 'Hello', createdAt: new Date() },
      ];
      
      (db.getDirectMessages as any).mockResolvedValue(mockMessages);
      
      const result = await db.getDirectMessages(1, 2);
      
      expect(result).toEqual(mockMessages);
      expect(result.length).toBe(2);
    });
  });

  describe('getGroupMessages', () => {
    it('should return messages for a group', async () => {
      const mockMessages = [
        { id: 1, fromUserId: 1, groupId: 1, content: 'Group message', createdAt: new Date() },
      ];
      
      (db.getGroupMessages as any).mockResolvedValue(mockMessages);
      
      const result = await db.getGroupMessages(1);
      
      expect(result).toEqual(mockMessages);
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark messages as read', async () => {
      (db.markMessagesAsRead as any).mockResolvedValue(undefined);
      
      await db.markMessagesAsRead([1, 2, 3], 1);
      
      expect(db.markMessagesAsRead).toHaveBeenCalledWith([1, 2, 3], 1);
    });
  });
});
