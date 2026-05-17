import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [error, setError] = useState("");

  const { refresh } = useAuth();
  
  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: async (data) => {
      if (data.success) {
        // Refresh auth state to pick up the new cookie
        await refresh();
        // Redirect based on role
        if (data.user?.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/student";
        }
      } else {
        setError(data.error || "Signup failed");
      }
    },
    onError: (err) => {
      setError(err.message || "Signup failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    signupMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      password: formData.password,
      adminCode: formData.adminCode || undefined,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-8 border border-stone-200 dark:border-stone-700">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <h1 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-100 cursor-pointer hover:text-primary transition-colors">
                AIM Centre 360
              </h1>
            </Link>
            <p className="text-stone-500 dark:text-stone-400 mt-2">Create your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-11"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-11"
              />
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-11"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="h-11"
              />
            </div>

            {/* Admin Code (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="adminCode">Admin Registration Code (Optional)</Label>
              <div className="relative">
                <Input
                  id="adminCode"
                  type={showAdminCode ? "text" : "password"}
                  placeholder="Enter admin code if you have one"
                  value={formData.adminCode}
                  onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminCode(!showAdminCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showAdminCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-stone-400">Leave empty to register as a student</p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
