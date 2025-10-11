"use client";

import { useState } from "react";
import { uploadRecipeImage, verifyAuth } from "@/lib/api-client";

export default function AuthTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const testVerifyAuth = async () => {
    setLoading(true);
    try {
      const response = await verifyAuth();
      setResult({ type: "verify", success: true, data: response });
    } catch (error) {
      setResult({ type: "verify", success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testFileUpload = async () => {
    if (!selectedFile) {
      setResult({ type: "upload", success: false, error: "No file selected" });
      return;
    }

    setLoading(true);
    try {
      const response = await uploadRecipeImage(selectedFile, "test-recipe");
      setResult({ type: "upload", success: true, data: response });
    } catch (error) {
      setResult({ type: "upload", success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const clearToken = () => {
    localStorage.removeItem("admin_token");
    setResult({ type: "clear", success: true, message: "Token cleared" });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Authentication Test Page
      </h1>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Token Verification</h2>
          <button
            onClick={testVerifyAuth}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Test Auth Verification"}
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">File Upload Test</h2>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            <button
              onClick={testFileUpload}
              disabled={loading || !selectedFile}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Test File Upload"}
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Token Management</h2>
          <button
            onClick={clearToken}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Clear Auth Token
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Test Result:</h3>
          <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>
            1. First, login at{" "}
            <a href="/admin/login" className="underline">
              /admin/login
            </a>
          </li>
          <li>2. Come back to this page to test authenticated requests</li>
          <li>3. Try clearing the token to see authentication failures</li>
        </ol>
      </div>
    </div>
  );
}
