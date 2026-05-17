import { useState, useEffect } from "react";
import { Bell, BellOff, Check, X, Info, AlertTriangle, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { useNotifications } from "@/lib/notifications";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: number;
  title: string;
  content: string | null;
  type: string | null;
  category: string | null;
  isRead: boolean | null;
  createdAt: Date;
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { isSupported, isGranted, isDenied, requestPermission } = useNotifications();
  
  const { data: notifications, isLoading } = trpc.notification.getMyNotifications.useQuery(
    {},
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );
  
  const utils = trpc.useUtils();
  
  const markReadMutation = trpc.notification.markRead.useMutation({
    onSuccess: () => {
      utils.notification.getMyNotifications.invalidate();
    }
  });
  
  const markAllReadMutation = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      utils.notification.getMyNotifications.invalidate();
      toast.success("All notifications marked as read");
    }
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success("Notifications enabled! You'll receive alerts for important updates.");
    } else {
      toast.error("Notification permission denied. You can enable it in your browser settings.");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'reminder':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-slate-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate({ notificationId: notification.id });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => markAllReadMutation.mutate()}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        {/* Browser notification permission prompt */}
        {isSupported && !isGranted && !isDenied && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b">
            <div className="flex items-start gap-2">
              <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Enable browser notifications to get alerts for announcements, deadlines, and live classes.
                </p>
                <Button 
                  size="sm" 
                  className="mt-2 h-7 text-xs bg-blue-600 hover:bg-blue-700"
                  onClick={handleEnableNotifications}
                >
                  Enable Notifications
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {isDenied && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border-b">
            <div className="flex items-start gap-2">
              <BellOff className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Browser notifications are blocked. Enable them in your browser settings to receive alerts.
              </p>
            </div>
          </div>
        )}
        
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">
              Loading notifications...
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type || 'info')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium line-clamp-1 ${
                          !notification.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      {notification.content && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {notification.content}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Just now'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
