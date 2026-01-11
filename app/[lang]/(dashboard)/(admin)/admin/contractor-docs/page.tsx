'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Loader2,
  ExternalLink,
  Filter,
  Users,
  File,
} from 'lucide-react';

interface ContractorDoc {
  id: string;
  userId: string;
  docType: string;
  fileName: string;
  uploadedAt: string;
  fileSize: number;
  mimeType: string;
  driveFileId: string | null;
  driveUrl: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    repCode: string | null;
  };
}

interface Stats {
  total: number;
  byType: {
    W9: number;
    CONTRACTOR_AGREEMENT: number;
  };
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

export default function AdminContractorDocsPage() {
  const [documents, setDocuments] = useState<ContractorDoc[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [filterDocType, setFilterDocType] = useState<string>('all');

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterDocType !== 'all') {
        params.append('docType', filterDocType);
      }

      const res = await fetch(`/api/admin/contractor-docs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
        setStats(data.stats);
      } else if (res.status === 403) {
        toast.error('Admin access required');
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [filterDocType]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDownload = async (docId: string, fileName: string) => {
    setDownloading(docId);
    try {
      const res = await fetch(`/api/admin/contractor-docs/${docId}/download`);
      const data = await res.json();

      if (res.ok && data.downloadUrl) {
        // Open download URL in new tab
        window.open(data.downloadUrl, '_blank');
        toast.success('Download started');
      } else {
        toast.error(data.error || 'Failed to get download URL');
      }
    } catch (error) {
      toast.error('Failed to download document');
    } finally {
      setDownloading(null);
    }
  };

  const getDocTypeLabel = (docType: string) => {
    switch (docType) {
      case 'W9':
        return 'W-9';
      case 'CONTRACTOR_AGREEMENT':
        return 'Agreement';
      default:
        return docType;
    }
  };

  const getUserDisplayName = (user: ContractorDoc['user']) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || user.email || 'Unknown User';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Contractor Documents</h1>
        <p className="text-muted-foreground">
          View and download contractor documents uploaded by sales reps.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <File className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.byType.W9}</p>
                <p className="text-sm text-muted-foreground">W-9 Forms</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.byType.CONTRACTOR_AGREEMENT}</p>
                <p className="text-sm text-muted-foreground">Agreements</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Document Type:</span>
              <Select value={filterDocType} onValueChange={setFilterDocType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  <SelectItem value="W9">W-9 Forms</SelectItem>
                  <SelectItem value="CONTRACTOR_AGREEMENT">Agreements</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No documents found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rep</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getUserDisplayName(doc.user)}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.user.repCode || doc.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm truncate max-w-[200px]" title={doc.fileName}>
                        {doc.fileName}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge color={doc.docType === 'W9' ? 'success' : 'info'}>
                        {getDocTypeLabel(doc.docType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatFileSize(doc.fileSize)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(doc.uploadedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {doc.driveUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.driveUrl!, '_blank')}
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc.id, doc.fileName)}
                          disabled={downloading === doc.id || !doc.driveFileId}
                        >
                          {downloading === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
