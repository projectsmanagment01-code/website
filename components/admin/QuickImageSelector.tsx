import React, { useState } from "react";
import {
  Search,
  Image as ImageIcon,
  Plus,
  Link as LinkIcon,
} from "lucide-react";

interface QuickImageSelectorProps {
  onImageSelect: (imageUrl: string) => void;
  onClose: () => void;
  currentImages?: string[];
  title?: string;
}

export const QuickImageSelector: React.FC<QuickImageSelectorProps> = ({
  onImageSelect,
  onClose,
  currentImages = [],
  title = "Select Image",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // This could be enhanced to load from a dedicated images API
      const response = await fetch("/api/upload/list?category=recipes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const files = await response.json();
        setImages(files.map((f: any) => f.url));
      }
    } catch (error) {
      console.error("Failed to load images:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter((img) =>
    img.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="col-span-full flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              filteredImages.map((imageUrl) => {
                const isSelected = currentImages.includes(imageUrl);
                return (
                  <div
                    key={imageUrl}
                    className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => onImageSelect(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      alt="Recipe image"
                      className="w-full h-20 object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                          ✓
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {filteredImages.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? `No images found matching "${searchTerm}"`
                : "No images available"}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
