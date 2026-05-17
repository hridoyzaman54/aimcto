import { useState } from "react";
import DocumentViewer, { useDocumentViewer } from "@/components/DocumentViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Upload, Link as LinkIcon, Eye } from "lucide-react";

// Sample documents for testing
const sampleDocuments = [
  {
    name: "Sample PDF Document",
    url: "https://raw.githubusercontent.com/nicholasadamou/stockmine/master/docs/sample.pdf",
    type: "pdf" as const,
  },
  {
    name: "PDF.js Sample",
    url: "/sample.pdf",
    type: "pdf" as const,
  },
];

export default function DocumentViewerDemo() {
  const { isOpen, url, fileName, fileType, openDocument, closeDocument } =
    useDocumentViewer();
  const [customUrl, setCustomUrl] = useState("");
  const [customFileName, setCustomFileName] = useState("");
  const [customFileType, setCustomFileType] = useState<
    "pdf" | "doc" | "docx" | "pptx" | "epub" | "txt"
  >("pdf");

  const handleOpenCustom = () => {
    if (customUrl) {
      openDocument(
        customUrl,
        customFileName || "Custom Document",
        customFileType
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Premium Document Viewer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            View PDF, DOC, DOCX, PPTX, and e-books directly in your browser with
            our premium, responsive document viewer.
          </p>
        </div>

        {/* Sample Documents */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Sample Documents
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {sampleDocuments.map((doc, index) => (
              <button
                key={index}
                onClick={() => openDocument(doc.url, doc.name, doc.type)}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {doc.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                    {doc.type}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom URL Input */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Open Custom Document
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Document URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/document.pdf"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="filename">File Name (optional)</Label>
                <Input
                  id="filename"
                  type="text"
                  placeholder="My Document"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="filetype">File Type</Label>
                <Select
                  value={customFileType}
                  onValueChange={(value: any) => setCustomFileType(value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                    <SelectItem value="docx">DOCX</SelectItem>
                    <SelectItem value="pptx">PPTX</SelectItem>
                    <SelectItem value="epub">EPUB</SelectItem>
                    <SelectItem value="txt">TXT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleOpenCustom}
              disabled={!customUrl}
              className="w-full sm:w-auto"
            >
              <Eye className="h-4 w-4 mr-2" />
              Open Document
            </Button>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Responsive Design",
              description: "Works perfectly on mobile, tablet, and desktop",
            },
            {
              title: "Zoom & Pan",
              description: "Pinch-to-zoom on mobile, scroll wheel on desktop",
            },
            {
              title: "Dark Mode",
              description: "Toggle between light and dark themes",
            },
            {
              title: "Fullscreen",
              description: "Immersive fullscreen viewing experience",
            },
            {
              title: "Page Navigation",
              description: "Easy navigation with thumbnails and page numbers",
            },
            {
              title: "Download & Print",
              description: "Download or print documents directly",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        url={url}
        fileName={fileName}
        fileType={fileType}
        isOpen={isOpen}
        onClose={closeDocument}
      />
    </div>
  );
}
