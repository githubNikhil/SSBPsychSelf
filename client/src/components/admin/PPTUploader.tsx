import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageUploader() {
  const [files, setFiles] = useState<FileList | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/tat/images', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Basic ${btoa(`${localStorage.getItem('email')}:${localStorage.getItem('password')}`)}`,
        }
      });

      if (!response.ok) throw new Error('Upload failed');

      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });

      setFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload images",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload TAT Images</CardTitle>
        <CardDescription>
          Upload images (JPG/JPEG/PNG) for the TAT test.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="image-upload" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {files && files.length > 0 ? (
                  <div className="flex items-center space-x-2">
                    <File className="h-6 w-6 text-blue-500" />
                    <span className="font-medium text-gray-700">{files.length} files selected</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, JPEG, or PNG
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                className="hidden"
                multiple
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => setFiles(e.target.files)}
              />
            </label>
          </div>
          {files && files.length > 0 && (
            <Button onClick={handleUpload}>
              Upload Images
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
