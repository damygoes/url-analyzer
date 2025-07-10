import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icon } from '@/components/ui/icon/Icon';
import { Input } from '@/components/ui/input';
import { useAuthSubmit } from '@/features/auth/hooks/useAuthSubmit';
import { useNavigate } from 'react-router-dom';

const authSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthForm() {
  const navigate = useNavigate();
  const { isLoading, authenticate } = useAuthSubmit();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      apiKey: '',
    },
  });

  const onSubmit = async (data: AuthFormData) => {
    const success = await authenticate(data.apiKey);

    if (success) {
      form.reset();
      navigate('/dashboard');
    } else {
      form.setError('apiKey', {
        type: 'manual',
        message: 'Invalid API key. Please check and try again.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your API key"
                    isLoading={isLoading}
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-neutral"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide API key' : 'Show API key'}
                  >
                    <Icon
                      name={showPassword ? 'invisible' : 'visible'}
                      size="lg"
                    />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          icon="key"
          iconPosition="before"
          isLoading={isLoading}
        >
          {isLoading ? 'Authenticating...' : 'Authenticate'}
        </Button>
      </form>
    </Form>
  );
}
