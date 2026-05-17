// Browser Push Notification Service

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'Notification' in window;
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Browser notifications are not supported');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission was denied');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  isPermissionGranted(): boolean {
    return this.permission === 'granted';
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  async show(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isSupported) {
      console.warn('Browser notifications are not supported');
      return null;
    }

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('Notification permission not granted');
        return null;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge,
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction,
        silent: options.silent,
      });

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        // Handle click based on notification data
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  // Convenience methods for different notification types
  async showAnnouncement(title: string, body: string, announcementId?: number) {
    return this.show({
      title: `📢 ${title}`,
      body,
      tag: `announcement-${announcementId || Date.now()}`,
      data: { type: 'announcement', id: announcementId, url: '/student/notifications' },
      requireInteraction: true,
    });
  }

  async showAssignmentDeadline(title: string, dueDate: string, assignmentId?: number) {
    return this.show({
      title: `📝 Assignment Due Soon`,
      body: `${title} is due on ${dueDate}`,
      tag: `assignment-${assignmentId || Date.now()}`,
      data: { type: 'assignment', id: assignmentId, url: '/student/assignments' },
      requireInteraction: true,
    });
  }

  async showLiveClassReminder(title: string, startTime: string, classId?: number) {
    return this.show({
      title: `🎥 Live Class Starting Soon`,
      body: `${title} starts at ${startTime}`,
      tag: `liveclass-${classId || Date.now()}`,
      data: { type: 'liveclass', id: classId, url: '/student/live-classes' },
      requireInteraction: true,
    });
  }

  async showQuizAvailable(title: string, quizId?: number) {
    return this.show({
      title: `📋 New Quiz Available`,
      body: `${title} is now available to take`,
      tag: `quiz-${quizId || Date.now()}`,
      data: { type: 'quiz', id: quizId, url: `/student/quiz/${quizId}` },
    });
  }

  async showAchievement(title: string, description: string) {
    return this.show({
      title: `🏆 Achievement Unlocked!`,
      body: `${title}: ${description}`,
      tag: `achievement-${Date.now()}`,
      data: { type: 'achievement', url: '/student/achievements' },
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// React hook for notifications
import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : 'default'
  );
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await notificationService.requestPermission();
    setPermission(notificationService.getPermissionStatus());
    return granted;
  }, []);

  const showNotification = useCallback(async (options: NotificationOptions) => {
    return notificationService.show(options);
  }, []);

  return {
    isSupported,
    permission,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    requestPermission,
    showNotification,
    showAnnouncement: notificationService.showAnnouncement.bind(notificationService),
    showAssignmentDeadline: notificationService.showAssignmentDeadline.bind(notificationService),
    showLiveClassReminder: notificationService.showLiveClassReminder.bind(notificationService),
    showQuizAvailable: notificationService.showQuizAvailable.bind(notificationService),
    showAchievement: notificationService.showAchievement.bind(notificationService),
  };
}
