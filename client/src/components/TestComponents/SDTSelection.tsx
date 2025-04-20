import { Link, useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SDTSelection() {
  const [, setLocation] = useLocation();

  const handleStudentSelection = () => {
    setLocation("/sdt-test?type=student");
  };

  const handleProfessionalSelection = () => {
    setLocation("/sdt-test?type=professional");
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-olive-green text-center">Self Description Test</h3>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="text-center mb-8">
            <h4 className="text-xl font-medium mb-6">What describes you best?</h4>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Button 
                className="bg-light-blue hover:bg-light-blue/90 text-gray-800 font-medium py-3 px-8 rounded-lg w-full sm:max-w-xs"
                onClick={handleStudentSelection}
              >
                Student
              </Button>
              <Button 
                className="bg-light-blue hover:bg-light-blue/90 text-gray-800 font-medium py-3 px-8 rounded-lg w-full sm:max-w-xs"
                onClick={handleProfessionalSelection}
              >
                Working Professional
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <Button 
            variant="secondary"
            className="w-full"
            onClick={() => setLocation("/test-selection")}
          >
            Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
