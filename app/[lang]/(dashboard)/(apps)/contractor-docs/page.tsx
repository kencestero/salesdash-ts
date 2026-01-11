'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  FileUp,
  Loader2,
  File,
  Calendar,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface DocumentStatus {
  docType: string;
  label: string;
  uploaded: boolean;
  document: {
    id: string;
    fileName: string;
    uploadedAt: string;
    fileSize: number;
  } | null;
}

interface ApiResponse {
  documents: Array<{
    id: string;
    docType: string;
    fileName: string;
    uploadedAt: string;
    fileSize: number;
    mimeType: string;
  }>;
  status: DocumentStatus[];
  allUploaded: boolean;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ContractorDocsPage() {
  const [status, setStatus] = useState<DocumentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [allUploaded, setAllUploaded] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/contractor-docs');
      if (res.ok) {
        const data: ApiResponse = await res.json();
        setStatus(data.status);
        setAllUploaded(data.allUploaded);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (file: File, docType: string) => {
    setUploading(docType);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);

    try {
      const res = await fetch('/api/contractor-docs/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`${docType === 'W9' ? 'W-9' : 'Contractor Agreement'} uploaded successfully`);
        fetchDocuments();
      } else {
        toast.error(data.error || 'Failed to upload document');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Contractor Documents</h1>
        <p className="text-muted-foreground">
          Upload your W-9 and Contractor Agreement to complete your profile.
        </p>
      </div>

      {/* Status Banner */}
      <Card className={`mb-6 ${allUploaded ? 'border-green-500/50 bg-green-500/5' : 'border-orange-500/50 bg-orange-500/5'}`}>
        <CardContent className="flex items-center gap-4 py-4">
          {allUploaded ? (
            <>
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-medium text-green-600">All Documents Uploaded</p>
                <p className="text-sm text-muted-foreground">
                  Your contractor documents are complete.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <div>
                <p className="font-medium text-orange-600">Documents Required</p>
                <p className="text-sm text-muted-foreground">
                  Please upload all required documents to receive leads.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Document Upload Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {status.map((doc) => (
          <DocumentUploadCard
            key={doc.docType}
            docType={doc.docType}
            label={doc.label}
            uploaded={doc.uploaded}
            document={doc.document}
            uploading={uploading === doc.docType}
            onUpload={(file) => handleUpload(file, doc.docType)}
          />
        ))}
      </div>

      {/* Info Card */}
      <Card className="mt-6 bg-muted/30">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Accepted file types: PDF, JPEG, PNG</li>
                <li>Maximum file size: 10MB</li>
                <li>Documents are securely stored and only accessible by administrators</li>
                <li>You can re-upload documents at any time to update them</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DocumentUploadCardProps {
  docType: string;
  label: string;
  uploaded: boolean;
  document: DocumentStatus['document'];
  uploading: boolean;
  onUpload: (file: File) => void;
}

function DocumentUploadCard({
  docType,
  label,
  uploaded,
  document,
  uploading,
  onUpload,
}: DocumentUploadCardProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    disabled: uploading,
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        toast.error('File is too large. Maximum 10MB allowed.');
      } else if (error?.code === 'file-invalid-type') {
        toast.error('Invalid file type. Only PDF, JPEG, and PNG allowed.');
      } else {
        toast.error('File rejected. Please try again.');
      }
    },
  });

  return (
    <Card className={uploaded ? 'border-green-500/30' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{label}</CardTitle>
          <Badge color={uploaded ? 'success' : 'secondary'}>
            {uploaded ? 'Uploaded' : 'Not Uploaded'}
          </Badge>
        </div>
        <CardDescription>
          {docType === 'W9'
            ? 'Required for tax reporting and payroll'
            : 'Required to receive leads and sell under Remotive Logistics'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Document Info */}
        {document && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <File className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{document.fileName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{formatFileSize(document.fileSize)}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(document.uploadedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : isDragActive ? (
            <div className="flex flex-col items-center gap-2">
              <FileUp className="w-8 h-8 text-primary" />
              <p className="text-sm font-medium">Drop file here</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {uploaded ? 'Upload New Version' : 'Upload Document'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag & drop or click to browse
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
