import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Camera, Loader2, Save, User, Upload, Check } from "lucide-react";

// Pre-made avatars - fun cartoon style avatars
const PRESET_AVATARS = [
  { id: 'avatar1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4', name: 'Felix' },
  { id: 'avatar2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede', name: 'Aneka' },
  { id: 'avatar3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo&backgroundColor=d1d4f9', name: 'Milo' },
  { id: 'avatar4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna&backgroundColor=ffd5dc', name: 'Luna' },
  { id: 'avatar5', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max&backgroundColor=ffdfbf', name: 'Max' },
  { id: 'avatar6', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&backgroundColor=c1f4c5', name: 'Zoe' },
  { id: 'avatar7', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy&backgroundColor=b6e3f4', name: 'Happy' },
  { id: 'avatar8', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool&backgroundColor=c0aede', name: 'Cool' },
  { id: 'avatar9', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot1&backgroundColor=d1d4f9', name: 'Robot' },
  { id: 'avatar10', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot2&backgroundColor=ffd5dc', name: 'Bot' },
  { id: 'avatar11', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Teacher&backgroundColor=ffdfbf', name: 'Teacher' },
  { id: 'avatar12', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Student&backgroundColor=c1f4c5', name: 'Student' },
];

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: profile, isLoading, refetch } = trpc.user.getProfile.useQuery();
  const updateProfileMutation = trpc.user.updateProfile.useMutation();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    grade: "",
    address: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
        grade: profile.grade || "",
        address: profile.address || "",
        avatarUrl: profile.avatarUrl || "",
      });
    }
  }, [profile]);

  const handleAvatarClick = () => {
    if (isEditing) {
      setIsAvatarDialogOpen(true);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, avatarUrl: base64 }));
      setIsAvatarDialogOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectAvatar = (avatarUrl: string) => {
    setFormData(prev => ({ ...prev, avatarUrl }));
    setIsAvatarDialogOpen(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      await updateProfileMutation.mutateAsync({
        name: formData.name || undefined,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        grade: formData.grade || undefined,
        address: formData.address || undefined,
        avatarUrl: formData.avatarUrl || undefined,
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      refetch();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="mb-4 -ml-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 text-white">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div 
                onClick={handleAvatarClick}
                className={`w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden ${isEditing ? 'cursor-pointer hover:bg-white/30 transition-colors ring-4 ring-white/30' : ''}`}
              >
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white/80" />
                )}
              </div>
              {isEditing && (
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg cursor-pointer" onClick={handleAvatarClick}>
                  <Camera className="w-4 h-4 text-stone-600" />
                </div>
              )}
            </div>
            
            {/* Name & Role */}
            <div>
              <h1 className="text-2xl font-bold">{profile?.name || "Student"}</h1>
              <p className="text-white/80 capitalize">{profile?.role}</p>
              {profile?.studentUid && (
                <p className="text-xs text-white/60 mt-1">Student ID: {profile.studentUid}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                className="h-11"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
                className="h-11 bg-stone-50 dark:bg-stone-900"
              />
              <p className="text-xs text-stone-400">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
                className="h-11"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                disabled={!isEditing}
                className="h-11"
              />
            </div>

            {/* Grade */}
            <div className="space-y-2">
              <Label htmlFor="grade">Grade / Class</Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                disabled={!isEditing}
                placeholder="e.g., Grade 10, HSC 1st Year"
                className="h-11"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                disabled={!isEditing}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    if (profile) {
                      setFormData({
                        name: profile.name || "",
                        phone: profile.phone || "",
                        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
                        grade: profile.grade || "",
                        address: profile.address || "",
                        avatarUrl: profile.avatarUrl || "",
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="w-full">
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Selection Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose Your Avatar</DialogTitle>
            <DialogDescription>
              Select a pre-made avatar or upload your own photo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Upload Option */}
            <div>
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Your Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or choose an avatar</span>
              </div>
            </div>

            {/* Pre-made Avatars Grid */}
            <div className="grid grid-cols-4 gap-3">
              {PRESET_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleSelectAvatar(avatar.url)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                    formData.avatarUrl === avatar.url 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-stone-200 dark:border-stone-700 hover:border-primary/50'
                  }`}
                >
                  <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                  {formData.avatarUrl === avatar.url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
