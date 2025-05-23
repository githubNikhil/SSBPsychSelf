import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TestTimer from "@/components/TestTimer";
import TestCompletion from "@/components/TestComponents/TestCompletion";
import { TEST_DURATIONS, calculateProgress } from "@/lib/testUtils";
import { SRTContent } from "@shared/schema";
import vikrant from '../../../../attached_assets/vikrant.jpg';

export default function SRT() {
  const [, setLocation] = useLocation();
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [isTestComplete, setIsTestComplete] = useState(false);
  
  // Fetch SRT scenarios
  const { data: scenarios = [], isLoading, error } = useQuery<SRTContent[]>({
    queryKey: ['/api/srt'],
  });
  
  // Timer completion handler - moves to next scenario
  const handleTimerComplete = useCallback(() => {
    if (currentScenarioIndex < Math.min(scenarios.length, TEST_DURATIONS.SRT.TOTAL_SCENARIOS) - 1) {
      setCurrentScenarioIndex(prevIndex => prevIndex + 1);
    } else {
      setIsTestComplete(true);
    }
  }, [currentScenarioIndex, scenarios.length]);
  
  // Calculate progress percentage
  const progressPercentage = calculateProgress(
    currentScenarioIndex + 1, 
    Math.min(scenarios.length, TEST_DURATIONS.SRT.TOTAL_SCENARIOS)
  );
  
  // Current scenario
  const currentScenario = scenarios[currentScenarioIndex];
  
  if (isTestComplete) {
    return <TestCompletion testName="Situation Reaction Test" />;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <img
        src={vikrant}
        alt="Jet Logo"
        className="absolute top-0 left-0 w-screen h-screen object-cover opacity-70" // Full-screen image
      />
      <div className="max-w-lg mx-auto z-10">
        <Card>
          <CardHeader className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
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
    </div>
  );
}
