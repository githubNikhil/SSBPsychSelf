import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle } from "lucide-react";
import sub from '../../../attached_assets/submarine.jpg';

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  title: string;
  content: string;
}

export default function InstructionModal({
  isOpen,
  onClose,
  onStart,
  title,
  content
}: InstructionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      
      <div className="fixed inset-0 bg-neutral bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
        <img
          src={sub}
          alt="Jet Logo"
          className="absolute top-0 left-0 w-screen h-screen object-cover opacity-90" // Full-screen image
        />
        <Card className="max-w-md w-full mx-auto border-0 shadow-xl rounded-xl overflow-hidden z-20">
          <div className="h-1.5 bg-gradient-secondary w-full"></div>
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-primary text-center">{title}</CardTitle>
            <p className="text-center text-sm text-gray-500 mt-1">Instructions</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3 p-4 bg-light-accent rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
            </div>
            
            <div className="flex items-center mt-4 p-3 border border-light rounded-md">
              <Clock className="w-4 h-4 text-secondary mr-2" />
              <p className="text-xs text-gray-600">
                Please ensure you have enough time to complete this test without interruptions.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pt-4 pb-5 border-t">
            <Button variant="outline" onClick={onClose} className="border-gray-200 text-gray-700">
              Cancel
            </Button>
            <Button 
              className="bg-secondary hover:bg-secondary/90 text-grey"
              onClick={onStart}
            >
              Start Test
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>  
  );
}
