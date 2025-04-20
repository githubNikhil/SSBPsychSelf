import { useState, ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeader } from "@/lib/testUtils";
import { Loader2, Upload, File, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PPTUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [extractedImages, setExtractedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if file is a PPT or PPTX
      if (!selectedFile.type.includes('powerpoint')) {
        toast({
          title: "Invalid file type",
          description: "Please select a PowerPoint file (.ppt or .pptx)",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PowerPoint file to upload",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('ppt', file);
      
      const response = await apiRequest('POST', '/api/upload/ppt', formData, getAuthHeader());
      const data = await response.json();
      
      if (response.ok) {
        setUploadStatus('success');
        setExtractedImages(data.images);
        toast({
          title: "Upload successful",
          description: data.message,
        });
      } else {
        setUploadStatus('error');
        toast({
          title: "Upload failed",
          description: data.message || "An error occurred during upload",
          variant: "destructive"
        });
      }
    } catch (error) {
      setUploadStatus('error');
      toast({
        title: "Upload failed",
        description: "An error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setUploadStatus('idle');
    setExtractedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload TAT PowerPoint</CardTitle>
        <CardDescription>
          Upload a PowerPoint file containing TAT images. The images will be extracted and used in the TAT test.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="ppt-upload" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <div className="flex items-center space-x-2">
                    <File className="h-6 w-6 text-blue-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-200">{file.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PPT or PPTX (MAX. 10MB)
                    </p>
                  </>
                )}
              </div>
              <input
                id="ppt-upload"
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={handleFileChange}
              />
            </label>
          </div>
          
          {uploadStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-400 font-medium">
                  Successfully extracted {extractedImages.length} images
                </span>
              </div>
              {extractedImages.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {extractedImages.slice(0, 3).map((img, index) => (
                    <div key={index} className="relative h-20 rounded overflow-hidden">
                      <img 
                        src={img} 
                        alt={`Extracted image ${index + 1}`} 
                        className="w-full h-full object-contain bg-gray-100 dark:bg-gray-800"
                      />
                    </div>
                  ))}
                  {extractedImages.length > 3 && (
                    <div className="flex items-center justify-center h-20 bg-gray-100 dark:bg-gray-800 rounded">
                      <span className="text-gray-500 dark:text-gray-400">+{extractedImages.length - 3} more</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {uploadStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-400 font-medium">
                  Upload failed. Please try again.
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetForm} disabled={uploading}>
          Reset
        </Button>
        <Button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}