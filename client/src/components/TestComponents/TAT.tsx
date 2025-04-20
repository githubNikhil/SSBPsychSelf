import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TestTimer from "@/components/TestTimer";
import TestCompletion from "@/components/TestComponents/TestCompletion";
import { TEST_DURATIONS, calculateProgress, generateBlankSlide } from "@/lib/testUtils";
import { TATContent } from "@shared/schema";

export default function TAT() {
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImage, setShowImage] = useState(true);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [displayTime, setDisplayTime] = useState(TEST_DURATIONS.TAT.DISPLAY_TIME);

  // Fetch random TAT image set
  const { data: images = [], isLoading, error } = useQuery<string[]>({
    queryKey: ['/api/tat/random-set'],
  });

  // Add blank slide at the end
  const allImages = [...images.slice(0, 11), generateBlankSlide()];

  // Timer completion handler - toggles between image display and gap
  const handleTimerComplete = useCallback(() => {
    if (showImage) {
      // Image time completed, start gap timer
      setShowImage(false);
      setDisplayTime(TEST_DURATIONS.TAT.GAP_TIME);
    } else {
      // Gap time completed, show next image or complete test
      if (currentImageIndex < allImages.length - 1) {
        setCurrentImageIndex(prevIndex => prevIndex + 1);
        setShowImage(true);
        setDisplayTime(TEST_DURATIONS.TAT.DISPLAY_TIME);
      } else {
        setIsTestComplete(true);
      }
    }
  }, [showImage, currentImageIndex, allImages.length]);

  // Calculate progress percentage
  const progressPercentage = calculateProgress(currentImageIndex + 1, TEST_DURATIONS.TAT.TOTAL_IMAGES);

  // Current image
  const currentImage = allImages[currentImageIndex];

  if (isTestComplete) {
    return <TestCompletion testName="Thematic Apperception Test" />;
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-olive-green">Thematic Apperception Test</h3>
            <div className="text-sm text-gray-500">
              <span>{currentImageIndex + 1} of {TEST_DURATIONS.TAT.TOTAL_IMAGES}</span>
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
              initialTime={displayTime} 
              onTimeComplete={handleTimerComplete}
              labelText={showImage ? "Time remaining for current image" : "Time until next image"}
            />
          </div>

          <div className="flex items-center justify-center mb-6 rounded-lg overflow-hidden bg-gray-200 h-80">
            {isLoading ? (
              <div className="text-center">Loading images...</div>
            ) : error ? (
              <div className="text-center text-red-500">Error loading images</div>
            ) : showImage && currentImage ? (
              currentImageIndex === TEST_DURATIONS.TAT.TOTAL_IMAGES - 1 ? (
                <div className="flex items-center justify-center w-full h-full text-lg font-medium text-gray-600">
                  Blank Slide
                </div>
              ) : (
                currentImage.imageUrl ? (
                  <img 
                    src={currentImage.imageUrl} 
                    alt={`TAT image ${currentImageIndex + 1}`} 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-lg font-medium text-gray-600">
                    Image {currentImageIndex + 1}
                  </div>
                )
              )
            ) : (
              <div className="flex items-center justify-center w-full h-full text-lg font-medium text-gray-600">
                Please wait for the next image...
              </div>
            )}
          </div>

          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">
              {showImage 
                ? "The timer will start a 4-minute gap after this image" 
                : "The next image will appear automatically after the gap"}
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