import { useRef, useState } from "react"
import { UploadCloud, X, FileText, Loader2 } from "lucide-react"
import { extractTextFromPDF } from "../../utils/pdfExtractor"

export default function SyllabusInputPanel({ syllabusText, onChange }) {

  const [extracting,      setExtracting]      = useState(false)
  const [extractError,    setExtractError]     = useState(null)
  const [extractSuccess,  setExtractSuccess]   = useState(false)
  const [uploadedFileName,setUploadedFileName] = useState(null)
  const [isDragOver,      setIsDragOver]       = useState(false)

  const fileInputRef = useRef(null)

  // ── Core extraction handler ──────────────────────────────────
  const handleFile = async (file) => {
    if (!file) return

    if (file.type !== "application/pdf") {
      setExtractError("Only PDF files are supported.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setExtractError("File size must be under 10MB.")
      return
    }

    setExtracting(true)
    setExtractError(null)
    setExtractSuccess(false)
    setUploadedFileName(file.name)

    try {
      const text = await extractTextFromPDF(file)
      onChange(text)           // ← pastes extracted text into textarea
      setExtractSuccess(true)
    } catch (err) {
      setExtractError(err.message)
      setUploadedFileName(null)
    } finally {
      setExtracting(false)
    }
  }

  // ── Input change (click to upload) ──────────────────────────
  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""        // reset so same file can be re-uploaded
  }

  // ── Drag and drop ────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  // ── Clear uploaded file ──────────────────────────────────────
  const handleClear = () => {
    onChange("")
    setUploadedFileName(null)
    setExtractSuccess(false)
    setExtractError(null)
  }

  const charCount = syllabusText?.length || 0
  const isTooShort = charCount > 0 && charCount < 100

  return (
    <div className="space-y-3">

      {/* Section heading */}
      <div>
        <label className="text-sm font-medium text-gray-800">
          Course Syllabus
        </label>
        <p className="text-xs text-gray-500 mt-0.5">
          Upload a PDF to extract text automatically, or paste directly.
          You can edit the text before generating.
        </p>
      </div>

      {/* Upload zone */}
      <div
        onClick={() => !extracting && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-4
          flex flex-col items-center justify-center gap-2
          cursor-pointer transition-colors duration-150
          ${isDragOver
            ? "border-purple-400 bg-purple-50"
            : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"}
          ${extracting ? "pointer-events-none opacity-70" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Extracting state */}
        {extracting ? (
          <>
            <Loader2
              size={22}
              className="text-purple-500 animate-spin"
            />
            <p className="text-sm text-purple-600 font-medium">
              Extracting text from PDF...
            </p>
            <p className="text-xs text-gray-400">
              This usually takes a few seconds
            </p>
          </>

        ) : extractSuccess && uploadedFileName ? (
          // Success state
          <>
            <FileText size={22} className="text-green-500" />
            <p className="text-sm text-green-600 font-medium">
              Text extracted from PDF
            </p>
            <p className="text-xs text-gray-400">
              {uploadedFileName}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClear() }}
              className="absolute top-2 right-2 text-gray-400
                         hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </>

        ) : (
          // Default idle state
          <>
            <UploadCloud size={22} className="text-gray-400" />
            <p className="text-sm text-gray-600">
              <span className="text-purple-600 font-medium">
                Click to upload
              </span>
              {" "}or drag and drop
            </p>
            <p className="text-xs text-gray-400">
              PDF only · Max 10MB
            </p>
          </>
        )}
      </div>

      {/* Extraction error */}
      {extractError && (
        <div className="flex items-start gap-2 text-xs text-red-600
                        bg-red-50 border border-red-100 rounded-lg p-3">
          <X size={13} className="mt-0.5 flex-shrink-0" />
          <span>{extractError}</span>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">
          or paste manually
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Textarea — always visible, always editable */}
      <div className="relative">
        <textarea
          rows={10}
          value={syllabusText}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            "Paste your course syllabus here...\n\n" +
            "Include:\n" +
            "• Unit titles and topics\n" +
            "• Learning content and subtopics\n" +
            "• Any existing objectives\n\n" +
            "More detail = better outcome generation."
          }
          className={`
            w-full rounded-xl border text-sm p-3
            placeholder:text-gray-300 resize-none
            focus:outline-none focus:ring-2 focus:ring-purple-200
            transition-colors duration-150
            ${isTooShort
              ? "border-amber-300 focus:ring-amber-200"
              : "border-gray-200"}
          `}
        />

        {/* Clear textarea button */}
        {syllabusText?.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 text-gray-300
                       hover:text-gray-500 transition-colors"
            title="Clear text"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Character count + warning */}
      <div className="flex items-center justify-between">
        {isTooShort ? (
          <p className="text-xs text-amber-600">
            Add more detail for better results (minimum 100 characters)
          </p>
        ) : (
          <span />
        )}
        <p className={`text-xs ml-auto ${
          isTooShort ? "text-amber-500" : "text-gray-400"
        }`}>
          {charCount} characters
        </p>
      </div>

    </div>
  )
}
