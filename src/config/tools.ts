import { 
  FileText, 
  Scissors, 
  Layers, 
  Minimize2, 
  Image as ImageIcon, 
  FileType, 
  AlignLeft, 
  CaseUpper, 
  Eraser, 
  Sparkles,
  Crop,
  Maximize,
  RefreshCcw,
  LucideIcon,
  Lock,
  QrCode,
  Binary,
  Link as LinkIcon,
  Shield,
  Code,
  Parentheses,
  AlignJustify,
  Hash,
  Table,
  FileJson,
  Stamp
} from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  accept?: string;
  outExt?: string;
  isText?: boolean;
  isImage?: boolean;
  isUtility?: boolean;
}

export interface Category {
  title: string;
  description: string;
  tools: Tool[];
}

export const categories: Category[] = [
  {
    title: 'PDF & Documents',
    description: 'Professional PDF tools to merge, split, compress and convert.',
    tools: [
      { id: 'pdfToWord', name: 'PDF to Word', description: 'Convert PDF to editable DOCX', icon: FileText, color: 'indigo', accept: '.pdf', outExt: 'docx' },
      { id: 'pdfToExcel', name: 'PDF to Excel', description: 'Convert PDF tables to Excel', icon: Table, color: 'emerald', accept: '.pdf', outExt: 'xlsx' },
      { id: 'wordToPdf', name: 'Word to PDF', description: 'Make DOCX files into PDF', icon: FileType, color: 'blue', accept: '.docx', outExt: 'pdf' },
      { id: 'merge', name: 'Merge PDF', description: 'Combine multiple PDFs into one', icon: Layers, color: 'violet', accept: '.pdf', outExt: 'pdf' },
      { id: 'split', name: 'Split PDF', description: 'Extract pages from your PDF', icon: Scissors, color: 'purple', accept: '.pdf', outExt: 'pdf' },
      { id: 'compress', name: 'Compress PDF', description: 'Reduce PDF file size', icon: Minimize2, color: 'fuchsia', accept: '.pdf', outExt: 'pdf' },
      { id: 'excelToPdf', name: 'Excel to PDF', description: 'Convert spreadsheets to PDF', icon: Table, color: 'emerald', accept: '.xlsx,.xls', outExt: 'pdf' },
      { id: 'pdfWatermark', name: 'Watermark PDF', description: 'Add watermark to your PDF', icon: Stamp, color: 'rose', accept: '.pdf', outExt: 'pdf' },
      { id: 'pdfPageNumbers', name: 'Page Numbers', description: 'Add page numbers to PDF', icon: Hash, color: 'blue', accept: '.pdf', outExt: 'pdf' },
    ]
  },
  {
    title: 'Image Studio',
    description: 'Optimize and transform your images with ease.',
    tools: [
      { id: 'jpgToPdf', name: 'JPG to PDF', description: 'Convert images to a PDF doc', icon: ImageIcon, color: 'sky', accept: '.jpg,.jpeg,.png', outExt: 'pdf' },
      { id: 'pdfToImg', name: 'PDF to JPG', description: 'Extract images from PDF', icon: ImageIcon, color: 'cyan', accept: '.pdf', outExt: 'jpg' },
      { id: 'imgEdit', name: 'Crop & Rotate', description: 'Basic image editing', icon: Crop, color: 'blue', accept: '.jpg,.jpeg,.png,.webp', outExt: 'jpg', isImage: true },
      { id: 'imgConvert', name: 'Convert', description: 'Convert between JPG, PNG, and WebP', icon: RefreshCcw, color: 'blue', accept: '.jpg,.jpeg,.png,.webp', outExt: 'png', isImage: true },
      { id: 'imgCompress', name: 'Compress', description: 'Lower image file size', icon: Minimize2, color: 'blue', accept: '.jpg,.jpeg,.png,.webp', outExt: 'jpg', isImage: true },
      { id: 'imgResize', name: 'Resize', description: 'Change image dimensions', icon: Maximize, color: 'blue', accept: '.jpg,.jpeg,.png,.webp', outExt: 'jpg', isImage: true },
    ]
  },
  {
    title: 'Utility Tools',
    description: 'Quick wins for daily developer and office tasks.',
    tools: [
      { id: 'passGen', name: 'Passwords', description: 'Generate secure random passwords', icon: Lock, color: 'rose', isUtility: true },
      { id: 'qrGen', name: 'QR codes', description: 'Generate QR codes from text or URL', icon: QrCode, color: 'amber', isUtility: true },
      { id: 'csvToJson', name: 'CSV to JSON', description: 'Convert CSV data to JSON objects', icon: FileJson, color: 'indigo', isUtility: true },
      { id: 'base64', name: 'Base64', description: 'Encode or decode Base64 strings', icon: Binary, color: 'slate', isUtility: true },
      { id: 'urlEnc', name: 'URL Encoder', description: 'Safely encode/decode URL strings', icon: LinkIcon, color: 'cyan', isUtility: true },
    ]
  },
  {
    title: 'Dev Tools',
    description: 'Essential utilities for developers and power users.',
    tools: [
      { id: 'jsonFormat', name: 'JSON Tool', description: 'Beautify or minify JSON strings', icon: FileType, color: 'indigo', isUtility: true },
      { id: 'regexTester', name: 'Regex Tester', description: 'Test and debug regular expressions', icon: Sparkles, color: 'violet', isUtility: true },
      { id: 'jwtDecoder', name: 'JWT Decoder', description: 'Decode and inspect JWT tokens', icon: Shield, color: 'blue', isUtility: true },
      { id: 'bracesFixer', name: 'Braces Fixer', description: 'Fix unmatched JS/JSON/HTML braces', icon: Parentheses, color: 'emerald', isUtility: true },
      { id: 'pythonFixer', name: 'Python Align', description: 'Fix Python indentation issues', icon: AlignJustify, color: 'amber', isUtility: true },
      { id: 'codeFormatter', name: 'General Format', description: 'Beautify JS, HTML, or CSS code', icon: Code, color: 'purple', isUtility: true },
    ]
  },
  {
    title: 'Smart Text AI',
    description: 'Powerful text utilities for cleaning and formatting.',
    tools: [
      { id: 'wordCounter', name: 'Word Counter', description: 'Count words and characters', icon: AlignLeft, color: 'emerald', isText: true },
      { id: 'caseConverter', name: 'Case Converter', description: 'Change text case instantly', icon: CaseUpper, color: 'emerald', isText: true },
      { id: 'spaceRemover', name: 'Remove Spaces', description: 'Clean up extra whitespace', icon: Minimize2, color: 'emerald', isText: true },
      { id: 'textCleaner', name: 'Text Cleaner', description: 'Remove weird characters', icon: Sparkles, color: 'emerald', isText: true },
      { id: 'formatRemover', name: 'Format Remover', description: 'Clear HTML and formatting', icon: Eraser, color: 'emerald', isText: true },
    ]
  }
];

export const allTools = categories.flatMap(c => c.tools);
