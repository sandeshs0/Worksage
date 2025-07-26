import { useState, useRef } from 'react';
import { X, RotateCw, RotateCcw, Check, Upload, Loader, Trash2 } from 'lucide-react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { toast } from 'sonner';

const ProfilePictureModal = ({ isOpen, onClose, onSave }) => {
  const [image, setImage] = useState('');
  const [cropData, setCropData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const cropperRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error("Image size exceeds 5MB limit", {
          description: "Please select a smaller image file"
        });
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Only JPG, JPEG, PNG, and WebP files are allowed"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRotateRight = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotate(90);
    }
  };
  
  const handleRotateLeft = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotate(-90);
    }
  };
  
  const handleCrop = () => {
    setIsLoading(true);
    if (typeof cropperRef.current?.cropper !== "undefined") {
      const cropper = cropperRef.current.cropper;
      cropper.getCroppedCanvas().toBlob(async (blob) => {
        setCropData(URL.createObjectURL(blob));
        try {
          await onSave(blob);
          toast.success("Profile picture updated successfully");
          
          onClose();
        } catch (error) {
          console.error("Failed to save profile picture:", error);
          toast.error("Failed to update profile picture", {
            description: error.message || "Please try again"
          });
        } finally {
          setIsLoading(false);
        }
      }, 'image/jpeg');
    }
  };
  
  const handleClear = () => {
    setImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-auto overflow-hidden transform transition-all">
          {/* Header */}
          <div className="border-b border-gray-200 p-4 flex justify-between items-center">
            <h3 className="font-medium text-xl text-gray-800">Update Profile Picture</h3>
            <button
              className="rounded-full p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-600"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {!image ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-md p-12 text-center cursor-pointer hover:border-[#18cb96] transition-colors"
                onClick={triggerFileInput}
              >
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  ref={fileInputRef}
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900">Click to upload</p>
                <p className="mt-1 text-xs text-gray-500">
                  JPG, JPEG, PNG, or WebP (MAX. 5MB)
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-center">
                  <Cropper
                    ref={cropperRef}
                    style={{ height: 400, width: '100%' }}
                    initialAspectRatio={1}
                    aspectRatio={1}
                    src={image}
                    viewMode={1}
                    guides={true}
                    minCropBoxHeight={100}
                    minCropBoxWidth={100}
                    background={false}
                    responsive={true}
                    autoCropArea={1}
                    checkOrientation={false}
                  />
                </div>
                
                <div className="flex justify-center space-x-4 mt-4">
                  <button 
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                    onClick={handleRotateLeft}
                    disabled={isLoading}
                    title="Rotate left"
                  >
                    <RotateCcw size={20} />
                  </button>
                  <button 
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                    onClick={handleRotateRight}
                    disabled={isLoading}
                    title="Rotate right"
                  >
                    <RotateCw size={20} />
                  </button>
                  <button 
                    className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"
                    onClick={handleClear}
                    disabled={isLoading}
                    title="Clear image"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            
            {image && (
              <button
                className="px-4 py-2 bg-[#18cb96] text-white rounded-md hover:bg-[#14a085] flex items-center"
                onClick={handleCrop}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Save
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;