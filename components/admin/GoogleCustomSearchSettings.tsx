import React, { useState } from "react";

export interface GoogleCustomSearchConfig {
  cx: string;
  apiKey: string;
}

interface GoogleCustomSearchSettingsProps {
  initialConfig?: GoogleCustomSearchConfig;
  onSave: (config: GoogleCustomSearchConfig) => void;
}

const GoogleCustomSearchSettings: React.FC<GoogleCustomSearchSettingsProps> = ({ initialConfig, onSave }) => {
  const [cx, setCx] = useState(initialConfig?.cx || "");
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({ cx, apiKey });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700">Google Custom Search CX</label>
        <input
          type="text"
          value={cx}
          onChange={e => setCx(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Search Engine ID (cx)"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Google API Key</label>
        <input
          type="text"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Google API Key"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700"
      >
        Save Settings
      </button>
    </form>
  );
};

export default GoogleCustomSearchSettings;

import React, { useState } from "react";


export interface GoogleCustomSearchConfig {
  cx: string;
  apiKey: string;
}


interface GoogleCustomSearchSettingsProps {
  initialConfig?: GoogleCustomSearchConfig;
  onSave: (config: GoogleCustomSearchConfig) => void;
}



const GoogleCustomSearchSettings: React.FC<GoogleCustomSearchSettingsProps> = ({ initialConfig, onSave }) => {
  const [cx, setCx] = useState(initialConfig?.cx || "");
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({ cx, apiKey });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700">Google Custom Search CX</label>
        <input
          type="text"
          value={cx}
          onChange={e => setCx(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Search Engine ID (cx)"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Google API Key</label>
        <input
          type="text"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Google API Key"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700"
      >
        Save Settings
      </button>
    </form>
  );
};

export default GoogleCustomSearchSettings;
