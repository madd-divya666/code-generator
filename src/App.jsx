import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import vscDarkPlus from "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus";
import prism from "react-syntax-highlighter/dist/esm/styles/prism/prism";
import { Copy, Sparkles, Code2, Sun, Moon, Eye } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { GoogleGenAI } from "@google/genai";

const LANGUAGES = [
  { value: "html", label: "HTML" },
  { value: "html+css", label: "HTML + CSS" },
  { value: "html+tailwind", label: "HTML + Tailwind CSS" },
  { value: "html+js+tailwind", label: "HTML + JS + Tailwind CSS" },
  { value: "html+bootstrap", label: "HTML + Bootstrap" },
];

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("html");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      document.documentElement.classList.toggle("dark", !prev);
      return !prev;
    });
  };

  const togglePreview = () => setPreviewMode((prev) => !prev);
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const extractCode = (text) => {
    const match = text.match(/```(?:\w+)?\n?([\s\S]*?)```/);
    return match ? match[1].trim() : text.trim();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
You are an experienced programmer with expertise in web development and UI/UX design. You create modern, animated, and fully responsive UI components. You are highly skilled in HTML, CSS, Tailwind CSS, Bootstrap, JavaScript, React, Next.js, Vue.js, Angular, and more.

Now, generate a UI component for: ${prompt}
Framework to use: ${language}

Requirements:
- The code must be clean, well-structured, and easy to understand.
- Optimize for SEO where applicable.
- Focus on creating a modern, animated, and responsive UI design.
- Include high-quality hover effects, shadows, animations, colors, and typography.
- Return ONLY the code, formatted properly in *Markdown fenced code blocks*.
- Do NOT include explanations, text, comments, or anything else besides the code.
- And give the whole code in a single HTML file.`,
      });

      setGeneratedCode(extractCode(response.text));
      toast.success("Code generated successfully!");
    } catch (err) {
      console.error("Error generating code:", err);
      setGeneratedCode("// Failed to get response from AI.");
      toast.error("Failed to get response from AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    toast.success("Code copied to clipboard");
  };

  const renderPreview = () => {
    if (!generatedCode) return null;
    return (
      <iframe
        title="preview"
        className="w-full h-[400px] rounded-lg border border-gray-300 dark:border-gray-600"
        srcDoc={generatedCode}
      />
    );
  };

  // ✅ Fix: determine highlight language properly
  const getHighlightLanguage = (lang) => {
    if (lang.includes("js")) return "javascript";
    if (lang.includes("css") || lang.includes("tailwind")) return "css";
    return "html";
  };

  return (
    <div
      className={`min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors`}
    >
      <Toaster position="top-right" />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Code2 className="w-12 h-12 text-blue-500" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Code Generator
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Generate front-end code
        </p>
        <button
          onClick={toggleDarkMode}
          className="mt-4 px-4 py-2 rounded-lg border border-gray-400 dark:border-gray-600 flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Front-End Type
            </label>
            <select
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Describe what you want to build
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[200px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A responsive navbar using Tailwind CSS..."
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Code
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Generated Code</h2>
            <div className="flex gap-2">
              {generatedCode && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
              )}

              {generatedCode && (
                <button
                  onClick={togglePreview}
                  className="flex items-center gap-1 px-3 py-1 border border-gray-500 text-gray-500 rounded-lg hover:bg-gray-500 hover:text-white transition"
                >
                  <Eye className="w-4 h-4" />
                  {previewMode ? "Code View" : "Preview"}
                </button>
              )}

              {/* Fullscreen Preview */}
              {generatedCode && (
                <button
                  onClick={() => {
                    const newWindow = window.open("", "_blank");
                    newWindow.document.open();
                    newWindow.document.write(`
                      <!DOCTYPE html>
                      <html lang="en">
                      <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <title>Full Screen Preview</title>
                      </head>
                      <body>
                        ${generatedCode}
                      </body>
                      </html>
                    `);
                    newWindow.document.close();
                  }}
                  className="flex items-center justify-center w-8 h-8 border border-green-500 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition text-lg font-bold"
                  title="Open Fullscreen Preview"
                >
                  /
                </button>
              )}
            </div>
          </div>

          {generatedCode ? (
            previewMode ? (
              renderPreview()
            ) : (
              <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                <SyntaxHighlighter
                  language={getHighlightLanguage(language)}
                  style={darkMode ? vscDarkPlus : prism}
                  customStyle={{
                    margin: 0,
                    padding: "1.5rem",
                    background: darkMode ? "#1e1e1e" : "#f5f5f5",
                    fontSize: "0.9rem",
                  }}
                  showLineNumbers
                >
                  {generatedCode}
                </SyntaxHighlighter>
              </div>
            )
          ) : (
            <div className="h-[400px] flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <p className="text-gray-400 dark:text-gray-300 text-center">
                Your generated code will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
