import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { refresh } = useAuth();
  
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      if (data.success) {
        // Refresh auth state to pick up the new cookie
        await refresh();
        // Redirect based on role with full page reload
        const role = data.user?.role;
        if (role === "admin") {
          window.location.href = "/admin";
        } else if (role === "parent") {
          window.location.href = "/parent";
        } else {
          window.location.href = "/student";
        }
      } else {
        setError(data.error || "Login failed");
      }
    },
    onError: (err) => {
      setError(err.message || "Login failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    loginMutation.mutate({
      email: loginMethod === "email" ? formData.email : undefined,
      phone: loginMethod === "phone" ? formData.phone : undefined,
      password: formData.password,
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
            <p className="text-stone-500 dark:text-stone-400 mt-2">Welcome back!</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Login Method Toggle */}
          <div className="flex mb-6 bg-stone-100 dark:bg-stone-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginMethod === "email"
                  ? "bg-white dark:bg-stone-600 shadow text-stone-800 dark:text-stone-100"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-700"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginMethod === "phone"
                  ? "bg-white dark:bg-stone-600 shadow text-stone-800 dark:text-stone-100"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-700"
              }`}
            >
              Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email or Phone */}
            {loginMethod === "email" ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
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
            ) : (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging In...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>

          {/* Signup Link */}
          <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
