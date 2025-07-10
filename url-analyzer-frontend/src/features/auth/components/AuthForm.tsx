import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

import { useAuthSubmit } from '@/features/auth/hooks/useAuthSubmit';

const authSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const { isLoading, error, authenticate } = useAuthSubmit();

  const onSubmit = (data: AuthFormData) => {
    authenticate(data.apiKey);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          type="password"
          placeholder="Enter your API key"
          {...register('apiKey')}
          disabled={isLoading}
        />
        {errors.apiKey && (
          <p className="text-sm text-destructive">{errors.apiKey.message}</p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Authenticating...' : 'Authenticate'}
      </Button>
    </form>
  );
}