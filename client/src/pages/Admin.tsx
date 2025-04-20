import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeader, processWATFile, processSRTFile } from "@/lib/testUtils";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import PPTUploader from "@/components/admin/PPTUploader";

type ContentType = "tat" | "wat" | "srt";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [contentType, setContentType] = useState<ContentType>("tat");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [watWords, setWatWords] = useState("");
  const [srtScenarios, setSrtScenarios] = useState("");
  
  // Redirect to login if not authenticated or not an admin
  const { isAdmin } = useAuth();
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setLocation("/admin-login");
    }
  }, [isAuthenticated, isAdmin, setLocation]);
  
  // Content upload mutations
  const uploadTATMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      return apiRequest("POST", "/api/tat", {
        imageUrl,
        active: true
      }, true); // Use auth for admin endpoints
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tat'] });
      toast({
        title: "Success",
        description: "TAT image uploaded successfully",
      });
      setImageUrl("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload TAT image",
        variant: "destructive"
      });
    }
  });
  
  const uploadWATMutation = useMutation({
    mutationFn: async (words: string) => {
      const wordArray = words
        .split(/\r?\n/)
        .map(word => word.trim())
        .filter(word => word.length > 0)
        .map(word => ({ word, active: true }));
      
      return apiRequest("POST", "/api/wat", wordArray, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wat'] });
      toast({
        title: "Success",
        description: "WAT words uploaded successfully",
      });
      setWatWords("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload WAT words",
        variant: "destructive"
      });
    }
  });
  
  const uploadSRTMutation = useMutation({
    mutationFn: async (scenarios: string) => {
      const scenarioArray = scenarios
        .split(/\r?\n\r?\n/)
        .map(scenario => scenario.trim())
        .filter(scenario => scenario.length > 0)
        .map(scenario => ({ scenario, active: true }));
      
      return apiRequest("POST", "/api/srt", scenarioArray, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/srt'] });
      toast({
        title: "Success",
        description: "SRT scenarios uploaded successfully",
      });
      setSrtScenarios("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload SRT scenarios",
        variant: "destructive"
      });
    }
  });
  
  // File upload handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (contentType === "wat") {
        const words = processWATFile(content);
        setWatWords(words.map(item => item.word).join('\n'));
      } else if (contentType === "srt") {
        const scenarios = processSRTFile(content);
        setSrtScenarios(scenarios.map(item => item.scenario).join('\n\n'));
      }
    };
    
    reader.readAsText(file);
  };
  
  // Save content handler
  const handleSaveContent = () => {
    switch (contentType) {
      case "tat":
        if (imageUrl.trim()) {
          uploadTATMutation.mutate(imageUrl);
        } else {
          toast({
            title: "Error",
            description: "Please enter an image URL",
            variant: "destructive"
          });
        }
        break;
      case "wat":
        if (watWords.trim()) {
          uploadWATMutation.mutate(watWords);
        } else {
          toast({
            title: "Error",
            description: "Please enter words",
            variant: "destructive"
          });
        }
        break;
      case "srt":
        if (srtScenarios.trim()) {
          uploadSRTMutation.mutate(srtScenarios);
        } else {
          toast({
            title: "Error",
            description: "Please enter scenarios",
            variant: "destructive"
          });
        }
        break;
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardHeader className="p-4 border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-olive-green">Admin Dashboard</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Content Management</h3>
              <div className="bg-gray-100 bg-opacity-30 p-4 rounded-lg">
                <div className="mb-4">
                  <Label htmlFor="contentTestType">Select Test Type</Label>
                  <Select 
                    value={contentType}
                    onValueChange={(value) => setContentType(value as ContentType)}
                  >
                    <SelectTrigger className="w-full p-3 border border-gray-200 rounded-md">
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tat">Thematic Apperception Test (TAT)</SelectItem>
                      <SelectItem value="wat">Word Association Test (WAT)</SelectItem>
                      <SelectItem value="srt">Situation Reaction Test (SRT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* TAT Content Upload */}
                {contentType === "tat" && (
                  <div className="mb-4">
                    <PPTUploader />
                  </div>
                )}
                
                {/* WAT Content Upload */}
                {contentType === "wat" && (
                  <>
                    <div className="mb-4">
                      <Label className="block mb-2">Upload WAT Words (CSV or TXT)</Label>
                      <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg text-center">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".csv,.txt"
                          onChange={handleFileUpload}
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="cursor-pointer"
                        >
                          Click to select file
                        </Button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <Label htmlFor="watWordsManual">Or Add Words Manually (one per line)</Label>
                      <Textarea
                        id="watWordsManual"
                        value={watWords}
                        onChange={(e) => setWatWords(e.target.value)}
                        rows={6}
                        className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                        placeholder="Enter words, one per line..."
                      />
                    </div>
                  </>
                )}
                
                {/* SRT Content Upload */}
                {contentType === "srt" && (
                  <>
                    <div className="mb-4">
                      <Label className="block mb-2">Upload SRT Scenarios (CSV or TXT)</Label>
                      <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg text-center">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".csv,.txt"
                          onChange={handleFileUpload}
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="cursor-pointer"
                        >
                          Click to select file
                        </Button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <Label htmlFor="srtScenariosManual">Or Add Scenarios Manually (separate with blank lines)</Label>
                      <Textarea
                        id="srtScenariosManual"
                        value={srtScenarios}
                        onChange={(e) => setSrtScenarios(e.target.value)}
                        rows={8}
                        className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                        placeholder="Enter scenarios, separate with blank lines..."
                      />
                    </div>
                  </>
                )}
                
                <div className="mt-4">
                  <Button 
                    className="bg-olive-green hover:bg-olive-green/90 text-white font-medium py-2 px-4 rounded"
                    onClick={handleSaveContent}
                    disabled={uploadTATMutation.isPending || uploadWATMutation.isPending || uploadSRTMutation.isPending}
                  >
                    {(uploadTATMutation.isPending || uploadWATMutation.isPending || uploadSRTMutation.isPending) 
                      ? "Saving..." 
                      : "Save Content"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
