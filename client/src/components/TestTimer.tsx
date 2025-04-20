import { useState, useEffect, useCallback } from "react";
import { formatTime } from "@/lib/testUtils";

interface TestTimerProps {
  initialTime: number;
  onTimeComplete?: () => void;
  isPaused?: boolean;
  isCountdown?: boolean;
  className?: string;
  showLabel?: boolean;
  labelText?: string;
  defaultVisible?: boolean;
}

// Load timer visibility preference from localStorage
const TIMER_VISIBILITY_KEY = 'timer_visibility';
const getStoredTimerVisibility = () => {
  const stored = localStorage.getItem(TIMER_VISIBILITY_KEY);
  return stored === null ? true : stored === 'true';
};

export default function TestTimer({
  initialTime,
  onTimeComplete,
  isPaused = false,
  isCountdown = true,
  className = "",
  showLabel = true,
  labelText,
  defaultVisible
}: TestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isVisible, setIsVisible] = useState(defaultVisible ?? getStoredTimerVisibility());

  const toggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    localStorage.setItem(TIMER_VISIBILITY_KEY, String(newVisibility));
  };

  // Reset timer if initialTime changes
  useEffect(() => {
    setTimeRemaining(initialTime);
  }, [initialTime]);

  const tick = useCallback(() => {
    setTimeRemaining(prev => {
      if (isCountdown) {
        const newTime = prev - 1;
        if (newTime <= 0) {
          if (onTimeComplete) onTimeComplete();
          return 0;
        }
        return newTime;
      } else {
        return prev + 1;
      }
    });
  }, [isCountdown, onTimeComplete]);

  useEffect(() => {
    if (isPaused) return;
    
    const timerInterval = setInterval(tick, 1000);
    return () => clearInterval(timerInterval);
  }, [isPaused, tick]);

  return (
    <div className="text-center">
      <button 
        onClick={toggleVisibility}
        className="mb-2 px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        {isVisible ? 'Hide Timer' : 'Show Timer'}
      </button>
      {isVisible && (
        <>
          <div className={`text-2xl font-bold text-olive-green ${className}`}>
            {formatTime(timeRemaining)}
          </div>
          {showLabel && (
            <div className="text-sm text-gray-500">
              {labelText || (isCountdown ? 'Time remaining' : 'Time elapsed')}
            </div>
          )}
        </>
      )}
    </div>
  );
}
