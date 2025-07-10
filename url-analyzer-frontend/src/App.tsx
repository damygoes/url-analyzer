import { Button } from '@/components/ui/button';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-svh flex-col items-center justify-center gap-8">
      <div className="w-full flex flex-col items-center justify-center text-center">
        <p>Welcome to</p>
        <h1> URL ANALYZER</h1>
      </div>
      <Button>Click me</Button>
    </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    
  );
}

export default App;
