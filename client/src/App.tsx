import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Counter } from '../../server/src/schema';

function App() {
  const [counter, setCounter] = useState<Counter>({
    id: 1,
    value: 0,
    created_at: new Date(),
    updated_at: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Try to initialize with backend, fallback to local state
  const initializeCounter = useCallback(async () => {
    try {
      setIsInitializing(true);
      const counters = await trpc.getCounters.query();
      
      if (counters.length > 0) {
        setCounter(counters[0]);
        setBackendConnected(true);
      } else {
        // Create a new counter if none exists
        const newCounter = await trpc.createCounter.mutate({ value: 0 });
        setCounter(newCounter);
        setBackendConnected(true);
      }
    } catch (error) {
      console.warn('Backend not available, using local counter:', error);
      setBackendConnected(false);
      // Keep the default local counter state
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    initializeCounter();
  }, [initializeCounter]);

  const handleIncrement = async () => {
    setIsLoading(true);
    
    if (backendConnected) {
      try {
        const updatedCounter = await trpc.incrementCounter.mutate({ id: counter.id });
        setCounter(updatedCounter);
      } catch (error) {
        console.warn('Backend operation failed, using local increment:', error);
        setBackendConnected(false);
        setCounter((prev: Counter) => ({
          ...prev,
          value: prev.value + 1,
          updated_at: new Date()
        }));
      }
    } else {
      // Local increment
      setCounter((prev: Counter) => ({
        ...prev,
        value: prev.value + 1,
        updated_at: new Date()
      }));
    }
    
    setIsLoading(false);
  };

  const handleDecrement = async () => {
    setIsLoading(true);
    
    if (backendConnected) {
      try {
        const updatedCounter = await trpc.decrementCounter.mutate({ id: counter.id });
        setCounter(updatedCounter);
      } catch (error) {
        console.warn('Backend operation failed, using local decrement:', error);
        setBackendConnected(false);
        setCounter((prev: Counter) => ({
          ...prev,
          value: prev.value - 1,
          updated_at: new Date()
        }));
      }
    } else {
      // Local decrement
      setCounter((prev: Counter) => ({
        ...prev,
        value: prev.value - 1,
        updated_at: new Date()
      }));
    }
    
    setIsLoading(false);
  };

  const handleReset = async () => {
    setIsLoading(true);
    
    if (backendConnected) {
      try {
        const updatedCounter = await trpc.resetCounter.mutate({ 
          id: counter.id, 
          value: 0 
        });
        setCounter(updatedCounter);
      } catch (error) {
        console.warn('Backend operation failed, using local reset:', error);
        setBackendConnected(false);
        setCounter((prev: Counter) => ({
          ...prev,
          value: 0,
          updated_at: new Date()
        }));
      }
    } else {
      // Local reset
      setCounter((prev: Counter) => ({
        ...prev,
        value: 0,
        updated_at: new Date()
      }));
    }
    
    setIsLoading(false);
  };

  const retryBackendConnection = async () => {
    await initializeCounter();
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing counter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-light text-gray-800">
            Counter
          </CardTitle>
          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-xs text-gray-500">
              {backendConnected ? 'Connected' : 'Local Mode'}
            </span>
            {!backendConnected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={retryBackendConnection}
                className="text-xs p-1 h-auto text-blue-600 hover:text-blue-800"
              >
                Retry
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {/* Counter Display */}
          <div className="py-8">
            <div className="text-6xl font-light text-gray-900 mb-2 counter-display">
              {counter.value}
            </div>
            <div className="text-sm text-gray-500">
              Current Value
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleDecrement}
                disabled={isLoading}
                className="flex-1 text-lg font-light counter-button"
              >
                −
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleIncrement}
                disabled={isLoading}
                className="flex-1 text-lg font-light counter-button"
              >
                +
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isLoading}
              className="w-full text-gray-600 font-light counter-button"
            >
              Reset to 0
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center pt-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <span className="ml-2 text-sm text-gray-500">Updating...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;