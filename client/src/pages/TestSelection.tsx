import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import InstructionModal from "@/components/InstructionModal";
import { TEST_DURATIONS } from "@/lib/testUtils";
import { Brain, MessageSquare, Sparkles, ListChecks, Layers } from "lucide-react";
import Jet_logo from '../../../attached_assets/image_1745054612098.png';

export default function TestSelection() {
  const [, setLocation] = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    title: "",
    content: "",
    testType: ""
  });

  const showInstructions = (testType: string, title: string, content: string) => {
    setModalInfo({ testType, title, content });
    setModalOpen(true);
  };

  const handleStartTest = () => {
    setModalOpen(false);

    switch (modalInfo.testType) {
      case 'tat':
        setLocation("/tat-test");
        break;
      case 'wat':
        setLocation("/wat-test");
        break;
      case 'srt':
        setLocation("/srt-test");
        break;
      case 'full':
        setLocation("/tat-test?mode=full");
        break;
      default:
        break;
    }
  };

  return (
    <Layout>
      
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Test Selection</h1>
          <p className="text-slate-600">Choose a specific assessment or select the full test battery</p>
        </div>

        <Card className="bg-white rounded-xl shadow-lg overflow-hidden border-0 mb-8">
          
          <div className="h-1 bg-gradient-primary"></div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className="border border-light rounded-lg p-5 hover:border-accent transition-all duration-200 cursor-pointer flex flex-col h-full"
                onClick={() => showInstructions(
                  'tat',
                  'Thematic Apperception Test',
                  `You will be shown 11 images and 1 blank slide. Each image will be displayed for 30 seconds, followed by a 4-minute gap. Total test duration is ${TEST_DURATIONS.TAT.TOTAL_TIME / 60} minutes.`
                )}
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-light-accent flex items-center justify-center mr-3">
                    <Brain size={20} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-primary">TAT</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Thematic Apperception Test</p>
                <p className="text-xs text-gray-500 mt-auto">Duration: {TEST_DURATIONS.TAT.TOTAL_TIME / 60} minutes</p>
              </div>

              <div 
                className="border border-light rounded-lg p-5 hover:border-accent transition-all duration-200 cursor-pointer flex flex-col h-full"
                onClick={() => showInstructions(
                  'wat',
                  'Word Association Test',
                  `You will be shown 60 words, one at a time. Each word will be displayed for 15 seconds. Total test duration is ${TEST_DURATIONS.WAT.TOTAL_TIME / 60} minutes.`
                )}
              >
                <div className="flex items-center mb-3">
                  
                  <div className="w-10 h-10 rounded-full bg-light-accent flex items-center justify-center mr-3 z-20">
                    <MessageSquare size={20} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-primary">WAT</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Word Association Test</p>
                <p className="text-xs text-gray-500 mt-auto">Duration: {TEST_DURATIONS.WAT.TOTAL_TIME / 60} minutes</p>
              </div>

              <div 
                className="border border-light rounded-lg p-5 hover:border-accent transition-all duration-200 cursor-pointer flex flex-col h-full"
                onClick={() => showInstructions(
                  'srt',
                  'Situation Reaction Test',
                  `You will be shown 60 situations, one at a time. Each situation will be displayed for 30 seconds. Total test duration is ${TEST_DURATIONS.SRT.TOTAL_TIME / 60} minutes.`
                )}
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-light-accent flex items-center justify-center mr-3">
                    <Sparkles size={20} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-primary">SRT</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Situation Reaction Test</p>
                <p className="text-xs text-gray-500 mt-auto">Duration: {TEST_DURATIONS.SRT.TOTAL_TIME / 60} minutes</p>
              </div>

              <div 
                className="border border-light rounded-lg p-5 hover:border-accent transition-all duration-200 cursor-pointer flex flex-col h-full"
                onClick={() => setLocation("/sdt-selection")}
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-light-accent flex items-center justify-center mr-3">
                    <ListChecks size={20} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-primary">SDT</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Self Description Test</p>
                <p className="text-xs text-gray-500 mt-auto">Duration: 15 minutes</p>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-light">
              <div 
                className="flex flex-col sm:flex-row items-center justify-between p-5 bg-light-accent rounded-lg cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                onClick={() => showInstructions(
                  'full',
                  'Full Length Psychological Test',
                  'You will take all 4 tests (TAT, WAT, SRT, SDT) one after another without breaks. Total test duration is approximately 2 hours.'
                )}
              >
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="w-12 h-12 flex items-center justify-center mr-4">
                    <img 
                      src={Jet_logo} 
                      alt="Jet Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">Full Length Psych</h3>
                    <p className="text-sm text-gray-600">Complete test battery</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 px-3 py-1 bg-white rounded-full">
                  Duration: ~120 minutes
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button 
                variant="ghost"
                className="text-gray-600 hover:text-primary"
                onClick={() => setLocation("/")}
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <InstructionModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStart={handleStartTest}
        title={modalInfo.title}
        content={modalInfo.content}
      />
    </Layout>
  );
}