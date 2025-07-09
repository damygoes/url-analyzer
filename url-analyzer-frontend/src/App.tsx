import { Button } from '@/components/ui/button';

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8">
      <div className="w-full flex flex-col items-center justify-center text-center">
        <p>Welcome to</p>
        <h1> URL ANALYZER</h1>
      </div>
      <Button>Click me</Button>
    </div>
  );
}

export default App;
