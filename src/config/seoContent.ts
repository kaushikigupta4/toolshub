
export interface ToolSEOContent {
  id: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  shortDescription: string;
  longContent: string;
  faqs: { question: string; answer: string }[];
}

export const toolSEOData: Record<string, ToolSEOContent> = {
  'merge': {
    id: 'merge',
    title: 'Merge PDF Online - Combine Multiple PDF Files Free | ToolsHub.io',
    metaDescription: 'Easily merge PDF files online for free. Combine multiple documents into one polished PDF in seconds. No installation required. Fast, secure, and easy.',
    keywords: ['merge pdf', 'combine pdf files', 'pdf merger online', 'free pdf tools'],
    h1: 'Merge PDF Files Online',
    shortDescription: 'The simplest way to combine multiple PDF documents into a single file.',
    longContent: `
      <h2>Why Merge PDF Files?</h2>
      <p>Managing multiple digital documents can be a nightmare. Whether you are organizing tax receipts, academic research, or business reports, merging your PDFs into a single file makes sharing and storage significantly more efficient.</p>
      
      <h2>How to use our PDF Merger</h2>
      <ol>
        <li>Select or drag and drop multiple PDF files into the upload box.</li>
        <li>Arrange the order of files if necessary.</li>
        <li>Click "Merge Now" to combine them.</li>
        <li>Download your new, unified PDF document.</li>
      </ol>

      <h2>Key Benefits of ToolsHub.io PDF Merger</h2>
      <ul>
        <li><strong>Completely Free:</strong> No hidden costs or subscriptions.</li>
        <li><strong>Privacy First:</strong> Your files are processed securely using Adobe PDF Services and are not stored permanently.</li>
        <li><strong>Cross-Platform:</strong> Works on Windows, Mac, Linux, and mobile browsers.</li>
      </ul>
    `,
    faqs: [
      { question: 'Is there a limit to how many PDFs I can merge?', answer: 'You can merge up to 20 files at once for optimal performance.' },
      { question: 'Is it safe to upload my documents?', answer: 'Yes, we use industry-standard encryption and processed files are automatically deleted after a short period.' }
    ]
  },
  'compress': {
    id: 'compress',
    title: 'Compress PDF Online - Reduce PDF File Size Free | ToolsHub.io',
    metaDescription: 'Shrink your PDF files without losing quality. Our online PDF compressor makes large files easy to email and share. Free, fast, and secure.',
    keywords: ['compress pdf', 'reduce pdf size', 'online pdf compressor', 'shrink pdf file'],
    h1: 'Compress PDF Documents',
    shortDescription: 'Reduce the file size of your PDF documents while maintaining professional quality.',
    longContent: `
      <h2>Optimize Your PDF Storage</h2>
      <p>High-quality PDFs often result in massive file sizes that are difficult to email or upload to web portals. ToolsHub.io provides a smart compression algorithm that identifies data that can be reduced without compromising the visual integrity of your text and images.</p>
      
      <h2>Why choose ToolsHub.io for Compression?</h2>
      <p>Unlike many other tools that simply lower the resolution of your images, we use advanced optimization techniques to ensure your reports, portfolios, and eBooks remain crisp and readable.</p>
    `,
    faqs: [
      { question: 'Will I lose quality?', answer: 'We offer different compression levels to balance size and quality perfectly.' }
    ]
  },
  'jsonFormat': {
    id: 'jsonFormat',
    title: 'JSON Formatter & Validator - Beautify or Minify JSON | ToolsHub.io',
    metaDescription: 'Best online JSON formatter and validator. Beautify, minify, and debug JSON data instantly. Perfect for developers working with APIs and configuration.',
    keywords: ['json formatter', 'beautify json', 'json validator online', 'minify json', 'json tool'],
    h1: 'JSON Formatter & Validator',
    shortDescription: 'Make your JSON data readable and valid in one click.',
    longContent: `
      <h2>Master Your Data Structure</h2>
      <p>JSON (JavaScript Object Notation) is the backbone of modern web communication. However, raw JSON stringified blocks can be impossible for humans to read. Our JSON Tool provides both beautification (pretty-print) and minification (size reduction) capabilities.</p>
      
      <h2>Features for Developers</h2>
      <ul>
        <li><strong>One-Click Beautify:</strong> Adds proper indentation and line breaks to nested objects.</li>
        <li><strong>Fast Minification:</strong> Removes unnecessary whitespace to save bandwidth in production.</li>
        <li><strong>Syntax Checking:</strong> Instantly alerts you if your JSON is improperly constructed.</li>
      </ul>
    `,
    faqs: [
      { question: 'Is my data sent to a server?', answer: 'No, our JSON formatting happens entirely in your browser for maximum privacy and speed.' }
    ]
  },
  'regexTester': {
    id: 'regexTester',
    title: 'Online Regex Tester & Debugger - Test Regular Expressions | ToolsHub.io',
    metaDescription: 'Powerful online regex tester and debugger. Test your regular expressions in real-time with live matching and flag support. Free developer tool.',
    keywords: ['regex tester', 'regular expression debugger', 'online regex match', 'test regex patterns'],
    h1: 'Online Regex Tester',
    shortDescription: 'The ultimate tool for testing and debugging regular expressions with live feedback.',
    longContent: `
      <h2>Debug Regular Expressions Like a Pro</h2>
      <p>Regular expressions are incredibly powerful but famously difficult to get right. Our Regex Tester provides a real-time environment to iterate on your patterns before placing them in your code.</p>
      
      <h3>How to Use the Regex Tester</h3>
      <ol>
        <li>Enter your pattern (without the surrounding slashes).</li>
        <li>Set your flags (like 'g' for global or 'i' for case-insensitive).</li>
        <li>Paste your test string.</li>
        <li>Watch as matches are instantly highlighted and listed below.</li>
      </ol>
    `,
    faqs: [
      { question: 'Which engine does this use?', answer: 'It uses the standard JavaScript RegExp engine found in modern browsers.' }
    ]
  },
  'split': {
    id: 'split',
    title: 'Split PDF Online - Extract Pages from PDF Free | ToolsHub.io',
    metaDescription: 'Split PDF files into individual pages or extract specific page ranges easily. Free online PDF splitter with instant processing and secure handling.',
    keywords: ['split pdf', 'extract pdf pages', 'pdf splitter online', 'separate pdf pages'],
    h1: 'Split PDF into Individual Pages',
    shortDescription: 'Easily separate your PDF documents into multiple files or extract exact pages.',
    longContent: `
      <h2>Efficient Document Separation</h2>
      <p>Sometimes a single PDF contains multiple reports or sections that need to be filed separately. Our Split PDF tool allows you to take any document and break it down into exactly what you need.</p>
      <h3>Two Ways to Split</h3>
      <ul>
        <li><strong>Fixed Ranges:</strong> Split the document into files of a specific page count.</li>
        <li><strong>Custom Extraction:</strong> Select specific pages (e.g., 1, 3, 5-10) to create a new targeted document.</li>
      </ul>
    `,
    faqs: [
      { question: 'Can I split password-protected PDFs?', answer: 'For security reasons, you must remove the password before splitting the file.' }
    ]
  },
  'wordToPdf': {
    id: 'wordToPdf',
    title: 'Word to PDF Converter - DOCX to PDF Online Free | ToolsHub.io',
    metaDescription: 'Convert Microsoft Word documents (DOCX/DOC) to PDF online for free. Maintain formatting and layout with our high-quality conversion tool.',
    keywords: ['word to pdf', 'convert docx to pdf', 'word converter online', 'free docx to pdf'],
    h1: 'Convert Word to PDF Online',
    shortDescription: 'Transform your Word documents into professional, shareable PDF files.',
    longContent: `
      <h2>Professional Document Conversion</h2>
      <p>Microsoft Word documents can look different depending on the version of Office or the operating system used to view them. Converting to PDF ensures your formatting, fonts, and layout remain identical for every recipient.</p>
      <h3>Why use ToolsHub.io for Word Conversion?</h3>
      <p>Our converter preserves high-resolution images, active hyperlinks, and complex tables found in your original Word files. It's the standard for professional document distribution.</p>
    `,
    faqs: [
      { question: 'Does it support old .doc files?', answer: 'Yes, we support both the legacy .doc format and the modern .docx format.' }
    ]
  },
  'jpgToPdf': {
    id: 'jpgToPdf',
    title: 'JPG to PDF Converter - Convert Images to PDF Online | ToolsHub.io',
    metaDescription: 'Convert JPG, PNG, and WebP images to PDF online for free. Combine multiple photos into a single PDF document in seconds.',
    keywords: ['jpg to pdf', 'convert image to pdf', 'photo to pdf', 'online image converter'],
    h1: 'Convert Images to PDF',
    shortDescription: 'Turn your photos and scans into organized PDF documents instantly.',
    longContent: `
      <h2>Create Portfolios and Document Scans</h2>
      <p>If you have multiple photos of a physical document or a collection of portfolio pieces, merging them into a PDF is the best way to share them officially. Our tool handles JPG, PNG, and even modern WebP images with ease.</p>
    `,
    faqs: [
      { question: 'Can I reorder my images?', answer: 'Yes, once uploaded, you can drag and drop your images to set the perfect order before converting.' }
    ]
  }
};
