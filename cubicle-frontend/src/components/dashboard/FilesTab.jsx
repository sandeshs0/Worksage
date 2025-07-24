import React from "react";
import { Upload } from "lucide-react";

const FilesTab = ({ files = [] }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-600 font-medium">Files Shared with Client</h3>
        
        <label className="bg-[#007991] text-white px-3 py-2 rounded-md shadow flex items-center cursor-pointer">
          <Upload size={16} className="mr-2" />
          Upload File
          <input type="file" className="hidden" />
        </label>
      </div>

      {files.length === 0 ? (
        <div className="min-h-[200px] flex flex-col items-center justify-center">
          <div className="text-center">
            <img
              src="/img/empty-box.png"
              alt="Empty box"
              className="w-24 h-24 mx-auto mb-4 opacity-60"
              onError={(e) => {
                e.target.outerHTML = `<div class="w-24 h-24 mx-auto mb-4 flex items-center justify-center text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <path d="M13 2v7h7"></path>
                  </svg>
                </div>`;
              }}
            />
            <h3 className="text-lg text-gray-600 font-medium">No files yet</h3>
            <p className="text-gray-500 mt-1">Upload files to share with your client</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {files.map((file) => (
              <div key={file.id} className="text-center">
                <div className="bg-[#5e350e] w-20 h-24 mx-auto rounded-md flex items-center justify-center text-white font-bold mb-2">
                  <div className="flex flex-col items-center">
                    <span className="text-sm">PDF</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{file.size} kb</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t flex justify-end">
            <p className="text-sm text-gray-600">
              3.45 / 5 GB Used
              <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-1">
                <div className="bg-[#007991] h-1.5 rounded-full w-[70%]"></div>
              </div>
              <span className="text-xs text-right block mt-1">70% Storage Full</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesTab;