import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import flag_heli from '../../../../attached_assets/Flag_heli.jpg';

interface TestCompletionProps {
  testName: string;
}

export default function TestCompletion({ testName }: TestCompletionProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
    <img
      src={flag_heli}
      alt="Jet Logo"
      className="absolute top-0 left-0 w-screen h-screen object-cover opacity-95" // Full-screen image
    />
      <div className="max-w-lg mx-auto z-20">
      <Card className="p-8 text-center">
        <CardContent className="pt-6 pb-4 flex flex-col items-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-olive-green mb-4">Test Completed</h2>
          <p className="mb-6 text-gray-500">
            You have successfully completed the {testName}.
          </p>
          <div className="space-y-4">
            <Link href="/">
              <Button 
                className="bg-olive-green hover:bg-olive-green/90 text-white font-medium py-3 px-6 rounded-lg w-full"
              >
                Return to Home
              </Button>
            </Link>
            <Link href="/test-selection">
              <Button 
                variant="outline"
                className="w-full"
              >
                Take Another Test
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>  
  );
}
