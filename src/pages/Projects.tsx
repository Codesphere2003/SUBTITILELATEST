import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Music, Play, Download, Trash2, FileIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  filename: string;
  size: number;
  uploadedAt: string;
}

const Projects = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchFiles = async () => {
    console.log('📂 Fetching files from backend...');
    try {
      const res = await fetch('http://localhost:3001/api/files');
      console.log('📥 Files fetch response status:', res.status);
      
      if (!res.ok) throw new Error('Failed to fetch files');
      
      const data = await res.json();
      console.log('✅ Files loaded:', data.files?.length || 0, 'files');
      setFiles(data.files || []);
    } catch (error) {
      console.error('❌ Error fetching files:', error);
      console.error('⚠️  Make sure backend server is running: cd backend && npm start');
      toast({
        title: "Failed to load files",
        description: "Make sure the backend server is running on port 3001",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (filename: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/files/${filename}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete file');
      
      toast({
        title: "File deleted",
        description: `${filename} has been removed`,
      });
      
      fetchFiles();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete the file",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (filename: string) => {
    window.open(`http://localhost:3001/api/files/${filename}/download`, '_blank');
  };

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '')) return 'video';
    if (['mp3', 'wav', 'aac', 'flac', 'm4a'].includes(ext || '')) return 'audio';
    return 'file';
  };

  const getFileIcon = (filename: string) => {
    const type = getFileType(filename);
    if (type === 'video') return <Video className="w-10 h-10 text-primary" />;
    if (type === 'audio') return <Music className="w-10 h-10 text-accent" />;
    return <FileIcon className="w-10 h-10 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };


  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                
                <h1 className="text-5xl md:text-6xl font-black text-foreground mb-4 tracking-tight text-premium text-glow font-poppins">
                  My Projects
                </h1>
                <p className="text-lg text-muted-foreground font-montserrat">
                  Manage all your uploaded files and projects
                </p>
              </div>
              <Link to="/upload">
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <Play className="w-5 h-5" />
                  New Upload
                </Button>
              </Link>
            </div>

            {loading ? (
              <Card className="border-border bg-card shadow-xl">
                <CardContent className="py-20 text-center">
                  <p className="text-muted-foreground font-montserrat">Loading files...</p>
                </CardContent>
              </Card>
            ) : files.length === 0 ? (
              <Card className="border-border bg-card shadow-xl">
                <CardContent className="py-20 text-center">
                  <Video className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
                  <h3 className="text-2xl font-bold text-foreground mb-2 font-poppins">No projects yet</h3>
                  <p className="text-muted-foreground mb-6 font-montserrat">
                    Upload your first video or audio file to get started
                  </p>
                  <Link to="/upload">
                    <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                      <Play className="w-5 h-5" />
                      Upload Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {files.map((file) => (
                  <Card key={file.filename} className="border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex-shrink-0 p-3 bg-secondary rounded-lg">
                            {getFileIcon(file.filename)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl font-bold font-poppins truncate mb-2">
                              {file.filename}
                            </CardTitle>
                            <CardDescription className="font-montserrat">
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span>{formatFileSize(file.size)}</span>
                                <span>•</span>
                                <span>Uploaded {new Date(file.uploadedAt).toLocaleDateString()}</span>
                              </div>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Ready</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-3">
                        {(getFileType(file.filename) === 'video' || getFileType(file.filename) === 'audio') && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="gap-2 hover:scale-105 transition-all duration-300"
                            onClick={() => navigate(`/media/${encodeURIComponent(file.filename)}`)}
                          >
                            <Play className="w-4 h-4" />
                            Play & Transcribe
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 hover:scale-105 transition-all duration-300"
                          onClick={() => handleDownload(file.filename)}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 hover:scale-105 transition-all duration-300 ml-auto"
                          onClick={() => handleDelete(file.filename)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Projects;
