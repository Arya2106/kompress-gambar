import React, { useState, useRef } from "react";
import { Upload, X, Check, Loader, FileImage } from "lucide-react";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Pilih file dulu!");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload gagal");

      const data = await response.json();
      console.log("Response dari server:", data);
      setResult(data); // ini akan berisi {filename, message, saved_path}
    } catch (error) {
      console.error("Gagal upload:", error);
      alert("Gagal upload gambar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 font-sans">
      <div className="max-w-2xl mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 transform hover:scale-110 transition-transform duration-300">
            <FileImage className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Image Upload</h1>
          <p className="text-gray-600 text-lg">Upload gambar Anda dengan mudah dan cepat</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-100 hover:shadow-3xl transition-all duration-500">
          <form onSubmit={handleSubmit}>
            {/* Drop Zone */}
            <div
              className={`relative border-[3px] border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${dragActive
                  ? 'border-blue-500 bg-blue-50 scale-105'
                  : file
                    ? 'border-green-400 bg-green-50'
                    : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
              />

              {!file ? (
                <div className="space-y-4">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${dragActive ? 'bg-blue-500 scale-110' : 'bg-blue-100 group-hover:bg-blue-200'
                    }`}>
                    <Upload className={`w-8 h-8 transition-colors duration-300 ${dragActive ? 'text-white' : 'text-blue-600'
                      }`} />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-700 mb-2">
                      {dragActive ? 'Lepaskan file di sini' : 'Drag & drop gambar atau klik untuk browse'}
                    </p>
                    <p className="text-gray-500">PNG, JPG, GIF hingga 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-green-700 mb-2">File terpilih</p>
                    <p className="text-gray-600 font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            {preview && (
              <div className="mt-8 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-lg">
                  <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-4 right-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || isUploading}
              className={`w-full mt-8 py-4 px-8 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${!file || isUploading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                }`}
            >
              {isUploading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  <span>Mengupload...</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  <span>Upload Gambar</span>
                </>
              )}
            </button>
          </form>

          {/* Upload Result */}
          {result && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-2xl animate-fadeIn">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <p className="text-green-800 font-semibold text-lg">{result.message}</p>
              </div>
              {result.filename && (
                <div className="mt-4">
                  <p className="text-sm text-green-700 mb-3 font-medium">Hasil upload:</p>
                  <div className="rounded-xl overflow-hidden shadow-md">
                    <img
                      src={`http://localhost:8000/compressed/${result.filename}`}
                      alt="Hasil upload"
                      className="w-full h-48 object-cover"
                      onError={(e) => e.target.src = preview}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Powered by modern React & Tailwind CSS</p>
        </div>
      </div>

      {/* Inline Tailwind Animation */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
