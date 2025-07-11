import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateURL } from '@/features/urls/hooks/useURLs';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const urlSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL')
    .regex(/^https?:\/\//, 'URL must start with http:// or https://'),
});

type URLFormData = z.infer<typeof urlSchema>;

interface AddURLDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddURLDialog({ open, onOpenChange }: AddURLDialogProps) {
  const [error, setError] = useState<string>('');
  const createURL = useCreateURL();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<URLFormData>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: '',
    },
  });

  const onSubmit = async (data: URLFormData) => {
    setError('');

    try {
      await createURL.mutateAsync(data);
      reset();
      toast('URL added successfully!');
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add URL');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setError('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add URL for Analysis</DialogTitle>
          <DialogDescription>
            Enter a website URL to analyze its structure and content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                {...register('url')}
                disabled={createURL.isPending}
              />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url.message}</p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createURL.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createURL.isPending}
              isLoading={createURL.isPending}
            >
              {createURL.isPending ? 'Adding...' : 'Add URL'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
