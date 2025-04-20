// Utility functions for test timing and management

// Constants for test durations
export const TEST_DURATIONS = {
  TAT: {
    DISPLAY_TIME: 30, // 30 seconds per image
    GAP_TIME: 240, // 4 minutes gap
    TOTAL_IMAGES: 12, // 11 images + 1 blank slide
    TOTAL_TIME: 66 * 60, // 66 minutes in seconds
  },
  WAT: {
    DISPLAY_TIME: 15, // 15 seconds per word
    TOTAL_WORDS: 60,
    TOTAL_TIME: 15 * 60, // 15 minutes in seconds
  },
  SRT: {
    DISPLAY_TIME: 30, // 30 seconds per scenario
    TOTAL_SCENARIOS: 60,
    TOTAL_TIME: 30 * 60, // 30 minutes in seconds
  },
  SDT: {
    TOTAL_TIME: 15 * 60, // 15 minutes in seconds
  }
};

// Format seconds to MM:SS
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Calculate progress percentage
export const calculateProgress = (current: number, total: number): number => {
  return (current / total) * 100;
};

// Generate a blank TAT slide
export const generateBlankSlide = () => {
  return { id: -1, imageUrl: '', active: true };
};

// Get auth header for API requests
export const getAuthHeader = (): Record<string, string> => {
  try {
    const authString = localStorage.getItem("auth");
    if (!authString) return {};
    
    const auth = JSON.parse(authString);
    if (!auth.username || !auth.password) return {};
    
    const base64Credentials = btoa(`${auth.username}:${auth.password}`);
    return { 'Authorization': `Basic ${base64Credentials}` };
  } catch (error) {
    return {};
  }
};

// Process file contents for WAT words
export const processWATFile = (content: string): Array<{ word: string, active: boolean }> => {
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(word => ({ word, active: true }));
};

// Process file contents for SRT scenarios
export const processSRTFile = (content: string): Array<{ scenario: string, active: boolean }> => {
  return content
    .split(/\r?\n\r?\n/) // Split by empty lines
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .map(scenario => ({ scenario, active: true }));
};
