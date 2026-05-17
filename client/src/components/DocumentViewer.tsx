import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Sun,
  Moon,
  Menu,
  Grid3X3,
  List,
  Search,
  BookOpen,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { cn } from "@/lib/utils";

// Set up PDF.js worker - copy worker to public folder for local serving
// This avoids Chrome blocking external scripts
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

interface DocumentViewerProps {
  url: string;
  fileName?: string;
  fileType?: "pdf" | "doc" | "docx" | "pptx" | "epub" | "txt";
  onClose?: () => void;
  isOpen?: boolean;
}

type ViewMode = "single" | "continuous" | "grid";

export default function DocumentViewer({
  url,
  fileName = "Document",
  fileType = "pdf",
  onClose,
  isOpen = true,
}: DocumentViewerProps) {
  // State management
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showControls, setShowControls] = useState<boolean>(true);
  const [docxContent, setDocxContent] = useState<string>("");
  const [pptxSlides, setPptxSlides] = useState<string[]>([]);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive scale based on container width
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // Handle responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (viewerRef.current) {
        const width = viewerRef.current.clientWidth;
        setContainerWidth(width);
        // Auto-fit to width on mobile
        if (window.innerWidth < 768) {
          setScale(Math.min(1, (width - 32) / 612)); // 612 is standard PDF width
        }
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isOpen]);

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isFullscreen) {
          setShowControls(false);
        }
      }, 3000);
    };

    if (isFullscreen) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchstart", handleMouseMove);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchstart", handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isFullscreen]);

  // PDF document loaded
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading document:", error);
    setError("Failed to load document. Please try again.");
    setIsLoading(false);
  };

  // Load DOCX content
  useEffect(() => {
    if (fileType === "docx" || fileType === "doc") {
      setIsLoading(true);
      import("mammoth").then((mammoth) => {
        fetch(url)
          .then((response) => response.arrayBuffer())
          .then((arrayBuffer) => {
            mammoth.default
              .convertToHtml({ arrayBuffer })
              .then((result) => {
                setDocxContent(result.value);
                setIsLoading(false);
              })
              .catch((err) => {
                setError("Failed to load document");
                setIsLoading(false);
              });
          });
      });
    }
  }, [url, fileType]);

  // Navigation
  const goToPrevPage = () => setPageNumber((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(numPages, prev + 1));
  const goToPage = (page: number) => setPageNumber(Math.max(1, Math.min(numPages, page)));

  // Zoom controls
  const zoomIn = () => setScale((prev) => Math.min(3, prev + 0.25));
  const zoomOut = () => setScale((prev) => Math.max(0.25, prev - 0.25));
  const resetZoom = () => setScale(1);

  // Rotation
  const rotate = () => setRotation((prev) => (prev + 90) % 360);

  // Download
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  };

  // Print
  const handlePrint = () => {
    const printWindow = window.open(url, "_blank");
    printWindow?.print();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowLeft":
          goToPrevPage();
          break;
        case "ArrowRight":
          goToNextPage();
          break;
        case "Escape":
          if (isFullscreen) {
            document.exitFullscreen();
          } else {
            onClose?.();
          }
          break;
        case "+":
        case "=":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomIn();
          }
          break;
        case "-":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomOut();
          }
          break;
        case "0":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetZoom();
          }
          break;
        case "f":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFullscreen, numPages, pageNumber]);

  // Touch gestures for mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [pinchStart, setPinchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setPinchStart(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStart) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleDiff = (dist - pinchStart) / 200;
      setScale((prev) => Math.max(0.25, Math.min(3, prev + scaleDiff)));
      setPinchStart(dist);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStart.x;
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          goToPrevPage();
        } else {
          goToNextPage();
        }
      }
    }
    setTouchStart(null);
    setPinchStart(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-50 flex flex-col",
          isDarkMode ? "bg-gray-900" : "bg-gray-100",
          isFullscreen && "bg-black"
        )}
      >
        {/* Header Controls */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: showControls ? 0 : -100 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-b z-10",
            isDarkMode
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-200 text-gray-900",
            "shadow-lg"
          )}
        >
          {/* Left: File info & thumbnails toggle */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowThumbnails(!showThumbnails)}
              className="hidden sm:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-5 w-5 flex-shrink-0 text-primary" />
              <span className="font-medium truncate max-w-[100px] sm:max-w-[200px] md:max-w-none">
                {fileName}
              </span>
            </div>
          </div>

          {/* Center: Page navigation */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="flex items-center gap-1 sm:gap-2 text-sm">
              <Input
                type="number"
                value={pageNumber}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className={cn(
                  "w-12 sm:w-16 h-8 text-center",
                  isDarkMode && "bg-gray-700 border-gray-600"
                )}
                min={1}
                max={numPages}
              />
              <span className="text-muted-foreground whitespace-nowrap">
                / {numPages || "?"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Zoom controls - hidden on very small screens */}
            <div className="hidden md:flex items-center gap-1 border-r pr-2 mr-2">
              <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm w-14 text-center">{Math.round(scale * 100)}%</span>
              <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* View mode toggle */}
            <div className="hidden lg:flex items-center gap-1 border-r pr-2 mr-2">
              <Button
                variant={viewMode === "single" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("single")}
                className="h-8 w-8"
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "continuous" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("continuous")}
                className="h-8 w-8"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Action buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={rotate}
              className="hidden sm:flex h-8 w-8"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="h-8 w-8"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="hidden sm:flex h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrint}
              className="hidden sm:flex h-8 w-8"
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.header>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Thumbnails sidebar */}
          <AnimatePresence>
            {showThumbnails && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className={cn(
                  "hidden sm:flex flex-col border-r overflow-y-auto",
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                )}
              >
                <div className="p-2 space-y-2">
                  {Array.from({ length: numPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => goToPage(i + 1)}
                      className={cn(
                        "w-full p-2 rounded-lg transition-all",
                        pageNumber === i + 1
                          ? "ring-2 ring-primary bg-primary/10"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-muted-foreground">
                        {i + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Document viewer */}
          <div
            ref={viewerRef}
            className={cn(
              "flex-1 overflow-auto p-2 sm:p-4",
              isDarkMode ? "bg-gray-900" : "bg-gray-100"
            )}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className={cn("text-lg", isDarkMode && "text-white")}>
                  Loading document...
                </p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <FileText className="h-16 w-16 text-red-500" />
                <p className="text-lg text-red-500">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            )}

            {/* PDF Viewer */}
            {fileType === "pdf" && !error && (
              <div
                className={cn(
                  "flex justify-center",
                  viewMode === "grid" && "flex-wrap gap-4",
                  viewMode === "continuous" && "flex-col items-center gap-4"
                )}
              >
                <Document
                  file={url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={null}
                  className={cn(
                    viewMode === "grid" && "contents",
                    viewMode === "continuous" && "contents"
                  )}
                >
                  {viewMode === "single" ? (
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      rotate={rotation}
                      className={cn(
                        "shadow-2xl rounded-lg overflow-hidden",
                        isDarkMode && "shadow-black/50"
                      )}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  ) : viewMode === "continuous" ? (
                    Array.from({ length: numPages }, (_, i) => (
                      <Page
                        key={i + 1}
                        pageNumber={i + 1}
                        scale={scale}
                        rotate={rotation}
                        className={cn(
                          "shadow-xl rounded-lg overflow-hidden mb-4",
                          isDarkMode && "shadow-black/50"
                        )}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    ))
                  ) : (
                    Array.from({ length: numPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => {
                          setPageNumber(i + 1);
                          setViewMode("single");
                        }}
                        className="hover:ring-2 hover:ring-primary rounded-lg transition-all"
                      >
                        <Page
                          pageNumber={i + 1}
                          scale={0.3}
                          rotate={rotation}
                          className="shadow-lg rounded-lg overflow-hidden"
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </button>
                    ))
                  )}
                </Document>
              </div>
            )}

            {/* DOCX/DOC Viewer */}
            {(fileType === "docx" || fileType === "doc") && !isLoading && !error && (
              <div
                className={cn(
                  "max-w-4xl mx-auto p-4 sm:p-8 rounded-lg shadow-xl",
                  isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                )}
                style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
              >
                <div
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: docxContent }}
                />
              </div>
            )}

            {/* TXT Viewer */}
            {fileType === "txt" && (
              <div
                className={cn(
                  "max-w-4xl mx-auto p-4 sm:p-8 rounded-lg shadow-xl font-mono whitespace-pre-wrap",
                  isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                )}
                style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
              >
                {/* Text content would be loaded here */}
              </div>
            )}
          </div>
        </div>

        {/* Mobile bottom controls */}
        <motion.footer
          initial={{ y: 100 }}
          animate={{ y: showControls ? 0 : 100 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "sm:hidden flex items-center justify-around px-4 py-3 border-t",
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          )}
        >
          <Button variant="ghost" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={rotate}>
            <RotateCw className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownload}>
            <Download className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-5 w-5" />
          </Button>
        </motion.footer>

        {/* Zoom slider for mobile - hidden by default */}
      </motion.div>
    </AnimatePresence>
  );
}

// Export a hook for easy usage
export function useDocumentViewer() {
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    url: string;
    fileName: string;
    fileType: DocumentViewerProps["fileType"];
  }>({
    isOpen: false,
    url: "",
    fileName: "",
    fileType: "pdf",
  });

  const openDocument = (
    url: string,
    fileName: string,
    fileType: DocumentViewerProps["fileType"] = "pdf"
  ) => {
    setViewerState({ isOpen: true, url, fileName, fileType });
  };

  const closeDocument = () => {
    setViewerState((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    ...viewerState,
    openDocument,
    closeDocument,
  };
}
