import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'lucide-react';
import { AuthForm } from '../components/AuthForm';

export function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Link className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">URL Analyzer</CardTitle>
          <CardDescription className="text-center">
            Enter your API key to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm />
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Don't have an API key?</p>
            <p>Contact your administrator to get one.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
