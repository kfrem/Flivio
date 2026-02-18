import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Copy, UserPlus, Users, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TrialAccount {
  username: string;
  password: string;
  createdAt: string;
}

export default function Admin() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lastCreated, setLastCreated] = useState<TrialAccount | null>(null);

  const createTrialMutation = useMutation({
    mutationFn: async (username: string) => {
      // Generate random password
      const password = generatePassword();
      
      const res = await apiRequest("POST", "/api/auth/register", {
        username,
        password,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create trial account");
      }
      
      return { username, password, createdAt: new Date().toISOString() };
    },
    onSuccess: (data) => {
      setLastCreated(data);
      setUsername("");
      toast({
        title: "Trial account created!",
        description: `Username: ${data.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const generateUsername = () => {
    const prefix = "trial_";
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  };

  const handleQuickCreate = () => {
    const newUsername = generateUsername();
    setUsername(newUsername);
    createTrialMutation.mutate(newUsername);
  };

  const handleCustomCreate = () => {
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }
    createTrialMutation.mutate(username);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const copyCredentials = () => {
    if (!lastCreated) return;
    const text = `Restaurant-IQ Trial Account

Username: ${lastCreated.username}
Password: ${lastCreated.password}

Login at: ${window.location.origin}/login

This account is pre-configured with an empty restaurant ready for your data.`;
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Credentials copied!",
      description: "Full login details copied to clipboard",
    });
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Create trial accounts for potential customers</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Create */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Quick Create Trial
            </CardTitle>
            <CardDescription>
              Generate a trial account with automatic username
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Username will be auto-generated (e.g., trial_123456)
              </p>
              <p className="text-sm text-muted-foreground">
                Password will be random and secure (12 characters)
              </p>
            </div>
            <Button
              onClick={handleQuickCreate}
              disabled={createTrialMutation.isPending}
              className="w-full"
            >
              {createTrialMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Trial Account
            </Button>
          </CardContent>
        </Card>

        {/* Custom Create */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Custom Trial Account
            </CardTitle>
            <CardDescription>
              Create account with custom username
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-username">Username</Label>
              <Input
                id="custom-username"
                placeholder="company_name or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={createTrialMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Password will be auto-generated
              </p>
            </div>
            <Button
              onClick={handleCustomCreate}
              disabled={createTrialMutation.isPending || !username.trim()}
              className="w-full"
              variant="outline"
            >
              {createTrialMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Custom Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Last Created Account */}
      {lastCreated && (
        <Card className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              Trial Account Created Successfully
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-500">
              Share these credentials with your customer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="flex gap-2">
                <Input value={lastCreated.username} readOnly className="font-mono" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(lastCreated.username, "Username")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex gap-2">
                <Input
                  value={lastCreated.password}
                  type={showPassword ? "text" : "password"}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(lastCreated.password, "Password")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Login URL */}
            <div className="space-y-2">
              <Label>Login URL</Label>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/login`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(`${window.location.origin}/login`, "Login URL")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Copy All */}
            <Button onClick={copyCredentials} className="w-full" size="lg">
              <Copy className="mr-2 h-4 w-4" />
              Copy All Credentials
            </Button>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>Note:</strong> This account has an empty restaurant profile. The customer
                can add their own data through the "Add Data" or "Import Data" pages.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Trial Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 shrink-0">
                1
              </Badge>
              <div>
                <strong>Create Account:</strong> Use Quick Create or enter a custom username above
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 shrink-0">
                2
              </Badge>
              <div>
                <strong>Copy Credentials:</strong> Click "Copy All Credentials" to get formatted
                login details
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 shrink-0">
                3
              </Badge>
              <div>
                <strong>Share with Customer:</strong> Send credentials via email or secure message
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 shrink-0">
                4
              </Badge>
              <div>
                <strong>Customer Onboards:</strong> They log in and add their restaurant data
                through CSV import or manual entry
              </div>
            </div>
          </div>

          <Alert className="mt-4">
            <AlertDescription>
              <strong>Security Note:</strong> All passwords are hashed using bcrypt. Store the
              original password securely when sharing with customers, as it cannot be retrieved
              later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
