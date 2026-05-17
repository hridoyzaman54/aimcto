import ParentDashboardLayout from "@/components/ParentDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { UserPlus, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ParentLinkChild() {
  const [studentUid, setStudentUid] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkResult, setLinkResult] = useState<{ success: boolean; message: string } | null>(null);

  const linkMutation = trpc.parentStudent.verifyAndLink.useMutation({
    onSuccess: (result) => {
      setLinkResult(result);
      if (result.success) {
        toast.success("Child linked successfully!");
        setStudentUid("");
      } else {
        toast.error(result.message);
      }
      setIsLinking(false);
    },
    onError: (error) => {
      toast.error(`Failed to link: ${error.message}`);
      setIsLinking(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentUid.trim()) {
      toast.error("Please enter a Student UID");
      return;
    }
    setIsLinking(true);
    setLinkResult(null);
    linkMutation.mutate({ studentUid: studentUid.trim() });
  };

  return (
    <ParentDashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Link Your Child
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Connect your account to your child's student profile
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">How to find your child's Student UID</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            Your child's Student UID is a unique identifier that starts with "STU-" followed by 8 characters.
            You can find it on their student ID card, enrollment confirmation, or ask the school administration.
          </AlertDescription>
        </Alert>

        {/* Link Form */}
        <Card className="bg-white dark:bg-slate-800 border-emerald-100 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Enter Student UID
            </CardTitle>
            <CardDescription>
              Enter your child's unique student identifier to link their account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentUid">Student UID</Label>
                <Input
                  id="studentUid"
                  placeholder="STU-XXXXXXXX"
                  value={studentUid}
                  onChange={(e) => setStudentUid(e.target.value.toUpperCase())}
                  className="font-mono text-lg"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Example: STU-A1B2C3D4
                </p>
              </div>

              {linkResult && (
                <Alert className={linkResult.success 
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }>
                  {linkResult.success ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <AlertTitle className={linkResult.success 
                    ? "text-emerald-800 dark:text-emerald-300"
                    : "text-red-800 dark:text-red-300"
                  }>
                    {linkResult.success ? "Success!" : "Unable to Link"}
                  </AlertTitle>
                  <AlertDescription className={linkResult.success 
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-red-700 dark:text-red-400"
                  }>
                    {linkResult.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isLinking || !studentUid.trim()}
              >
                {isLinking ? "Verifying..." : "Link Child Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>
              <strong>Can't find the Student UID?</strong> Contact the school administration 
              or check your child's enrollment documents.
            </p>
            <p>
              <strong>Getting an error?</strong> Make sure you're entering the correct UID 
              and that your child's account has been created in the system.
            </p>
            <p>
              <strong>Multiple children?</strong> You can link multiple children to your 
              parent account. Just repeat this process for each child.
            </p>
          </CardContent>
        </Card>
      </div>
    </ParentDashboardLayout>
  );
}
