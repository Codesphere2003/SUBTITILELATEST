import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload as UploadIcon, File, Video, Music, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['video/', 'audio/'];
    const isValid = validTypes.some(type => file.type.startsWith(type));
    
    if (!isValid) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video or audio file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setUploadComplete(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.log('❌ No file selected');
      return;
    }

    console.log('📤 Starting upload for:', selectedFile.name);
    console.log('📊 File details:', {
      name: selectedFile.name,
      size: formatFileSize(selectedFile.size),
      type: selectedFile.type
    });

    setIsUploading(true);
    setUploadComplete(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('📡 Sending file to backend...');
      const res = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Upload response status:', res.status);

      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        console.log('❌ Upload failed with error:', err);
        throw new Error((err as any).error || `Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      console.log('✅ Upload successful:', data);

      setUploadComplete(true);
      toast({
        title: "Upload successful!",
        description: `${data.originalname || selectedFile.name} saved to uploads.`,
      });
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('⚠️  Make sure backend server is running: cd backend && npm start');
      toast({
        title: "Upload failed",
        description: error?.message || "An error occurred while uploading.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const event = { target: { files: [file] } } as any;
      handleFileSelect(event);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getFileIcon = () => {
    if (!selectedFile) return <File className="w-12 h-12" />;
    if (selectedFile.type.startsWith('video/')) return <Video className="w-12 h-12 text-primary" />;
    if (selectedFile.type.startsWith('audio/')) return <Music className="w-12 h-12 text-accent" />;
    return <File className="w-12 h-12" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              
              <h1 className="text-5xl md:text-6xl font-black text-foreground mb-4 tracking-tight text-premium text-glow font-poppins">
                Upload
              </h1>
              <p className="text-lg text-muted-foreground font-montserrat">
                Upload your video or audio files to get started with AI-powered localization
              </p>
            </div>

            <Card className="border-border bg-card shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold font-poppins">Upload Your Media</CardTitle>
                <CardDescription className="font-montserrat">
                  Supports video and audio files up to 10MB
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-secondary/20 transition-all duration-300"
                  >
                    <UploadIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold text-foreground mb-2 font-poppins">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground font-montserrat">
                      Video or Audio • Max 10MB
                    </p>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*,audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="border border-border rounded-lg p-6 bg-secondary/30">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getFileIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-foreground truncate font-poppins">
                            {selectedFile.name}
                          </h3>
                          <p className="text-sm text-muted-foreground font-montserrat">
                            {formatFileSize(selectedFile.size)} • {selectedFile.type}
                          </p>
                        </div>
                        {uploadComplete && (
                          <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading || uploadComplete}
                        className="flex-1 gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                      >
                        {isUploading ? (
                          <>Processing...</>
                        ) : uploadComplete ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            Uploaded
                          </>
                        ) : (
                          <>
                            <UploadIcon className="w-5 h-5" />
                            Upload File
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedFile(null);
                          setUploadComplete(false);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="hover:scale-105 transition-all duration-300"
                      >
                        Clear
                      </Button>
                    </div>

                    {uploadComplete && (
                      <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <p className="text-sm text-green-500 font-montserrat font-semibold">
                          File uploaded successfully! View it in My Projects.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
                  <div className="text-center">
                    <Video className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-semibold text-foreground font-poppins">Video Files</p>
                    <p className="text-xs text-muted-foreground font-montserrat">MP4, MOV, AVI, MKV</p>
                  </div>
                  <div className="text-center">
                    <Music className="w-8 h-8 mx-auto mb-2 text-accent" />
                    <p className="text-sm font-semibold text-foreground font-poppins">Audio Files</p>
                    <p className="text-xs text-muted-foreground font-montserrat">MP3, WAV, AAC, FLAC, OGG</p>
                  </div>
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground font-poppins">Max Size</p>
                    <p className="text-xs text-muted-foreground font-montserrat">10MB per file</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Upload;
