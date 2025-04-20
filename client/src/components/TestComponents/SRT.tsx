
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TestTimer from "@/components/TestTimer";
import TestCompletion from "@/components/TestComponents/TestCompletion";
import { TEST_DURATIONS, calculateProgress } from "@/lib/testUtils";
import { SRTContent } from "@shared/schema";

export default function SRT() {
  const [, setLocation] = useLocation();
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [resetTimer, setResetTimer] = useState(0);
  
  const { data: scenarios = [], isLoading, error } = useQuery<SRTContent[]>({
    queryKey: ['/api/srt'],
  });
  
  const handleTimerComplete = useCallback(() => {
    if (currentScenarioIndex < Math.min(scenarios.length, TEST_DURATIONS.SRT.TOTAL_SCENARIOS) - 1) {
      setCurrentScenarioIndex(prevIndex => prevIndex + 1);
      setResetTimer(prev => prev + 1); // Force timer reset
    } else {
      setIsTestComplete(true);
    }
  }, [currentScenarioIndex, scenarios.length]);
  
  const progressPercentage = calculateProgress(
    currentScenarioIndex + 1, 
    Math.min(scenarios.length, TEST_DURATIONS.SRT.TOTAL_SCENARIOS)
  );
  
  const currentScenario = scenarios[currentScenarioIndex];
  
  if (isTestComplete) {
    return <TestCompletion testName="Situation Reaction Test" />;
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-olive-green">Situation Reaction Test</h3>
            <div className="text-sm text-gray-500">
              <span>
                {currentScenarioIndex + 1} of {Math.min(scenarios.length, TEST_DURATIONS.SRT.TOTAL_SCENARIOS)}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
            <div 
              className="bg-olive-green h-2 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <TestTimer 
              key={resetTimer}
              initialTime={TEST_DURATIONS.SRT.DISPLAY_TIME} 
              onTimeComplete={handleTimerComplete}
              labelText="Time remaining for current situation"
            />
          </div>
          
          <div className="mb-6">
            <div className="p-4 rounded-lg bg-gray-200">
              {isLoading ? (
                <div className="text-center">Loading scenarios...</div>
              ) : error ? (
                <div className="text-center text-red-500">Error loading scenarios</div>
              ) : currentScenario ? (
                <p className="text-gray-800">{currentScenario.scenario}</p>
              ) : (
                <div className="text-center text-gray-500">No scenarios available</div>
              )}
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">
              The next situation will appear automatically
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <Button 
            variant="secondary"
            className="w-full"
            onClick={() => setLocation("/test-selection")}
          >
            Exit Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
