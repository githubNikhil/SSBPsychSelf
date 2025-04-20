import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TestTimer from "@/components/TestTimer";
import TestCompletion from "@/components/TestComponents/TestCompletion";
import { TEST_DURATIONS, calculateProgress } from "@/lib/testUtils";
import { StudentSDTQuestion, ProfessionalSDTQuestion } from "@shared/schema";
import Jet_main from '../../../../attached_assets/Jet_main.png';

export default function SDT() {
  const [, setLocation] = useLocation();
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  // Get the user type from the URL
  const [location] = useLocation();
  const userType = new URLSearchParams(location.split("?")[1]).get("type") || "student";
  const isStudent = userType === "student";
  
  // Fetch SDT questions based on user type
  const { data: questions = [], isLoading, error } = useQuery<(StudentSDTQuestion | ProfessionalSDTQuestion)[]>({
    queryKey: [`/api/sdt/${userType}`],
  });
  
  // Timer completion handler - completes the test
  const handleTimerComplete = useCallback(() => {
    setIsTestComplete(true);
  }, []);
  
  // Handle answer changes
  const handleAnswerChange = (id: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Calculate time progress
  const timeProgress = 100; // Start at 100% and decrease
  
  if (isTestComplete) {
    return <TestCompletion testName="Self Description Test" />;
  }

  return (
  <div className="relative min-h-screen flex items-center justify-center">
    <img
      src={Jet_main}
      alt="Jet Logo"
      className="absolute top-0 left-0 w-screen h-screen object-cover opacity-70" // Full-screen image
    />
    <div className="max-w-lg mx-auto z-10">
      <Card>
        <CardHeader className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between ">
            <h3 className="text-2xl font-semibold text-olive-green">Self Description Test</h3>
            <div className="text-sm text-gray-500">
              <span>{isStudent ? "Student" : "Working Professional"}</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
            <div 
              className="bg-olive-green h-2 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${timeProgress}%` }}
            ></div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 bg-white">
          <div className="text-center mb-6">
            <TestTimer 
              initialTime={TEST_DURATIONS.SDT.TOTAL_TIME} 
              onTimeComplete={handleTimerComplete}
              // labelText="Time remaining to complete all questions"
            />
          </div>
          
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center p-4">Loading questions...</div>
            ) : error ? (
              <div className="text-center p-4 text-red-500">Error loading questions</div>
            ) : questions.length === 0 ? (
              <div className="text-center p-4 text-gray-500">No questions available</div>
            ) : (
              <div className="space-y-4 p-4 bg-gray-200 bg-opacity-50 rounded-lg">
                {questions.map((question, index) => (
                  <div key={question.id} >
                    <h4 className="font-medium mb-2">{index + 1}. {question.question}</h4>
                    {/* <Textarea 
                      className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                      rows={3}
                      placeholder="Type your answer here..."
                      value={answers[question.id] || ""}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    /> */}
                  </div>
                ))}
              </div>
            )}
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
