import { X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from "react-redux";
import { RootState } from '../../../store/appStore';

interface AvatarModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (avatarId: number) => void;
  maxAvatars?: number;
  avatarsPerRow?: number;
}

const AvatarModal: React.FC<AvatarModalProps> = ({
  open,
  onClose,
  onSelect,
  maxAvatars = 50,
  avatarsPerRow = 8,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const language = useSelector((state: RootState) => state.language?.value)['profile']['avatarModal'];

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  // Handle avatar selection
  const handleAvatarClick = (id: number) => {
    setSelectedAvatar(id);
  };

  // Handle select button click
  const handleSelectClick = () => {
    if (selectedAvatar !== null) {
      onSelect(selectedAvatar);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg lg:text-xl font-medium text-gray-900">{language['title']}</h3>
          <div onClick={onClose} className="flex justify-between items-center p-2 bg-cb-red/10 rounded-full">
            <X className=' text-cb-red h-4 lg:h-6 w-4 lg:w-6'/>
          </div>
        </div>
        
        {/* Avatar Grid */}
        <div className="p-6 max-h-72 overflow-y-auto">
          <div 
            className="relative grid gap-4"
            style={{ 
              gridTemplateColumns: `repeat(${avatarsPerRow}, minmax(0, 1fr))` 
            }}
          >
            {Array.from({ length: maxAvatars }, (_, i) => i + 1).map((id) => (
              <div 
                key={id}
                onClick={() => handleAvatarClick(id)}
                className={`
                  cursor-pointer transition-all duration-200 
                  rounded-full overflow-hidden
                  ${selectedAvatar === id 
                    ? 'ring-4 ring-blue-500 ring-offset-2 scale-105' 
                    : 'hover:ring-2 hover:ring-gray-300 hover:scale-105'
                  }
                `}
              >
                <img 
                  src={`/avatars/avatar-${id}.svg`} 
                  alt={`Avatar ${id}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback in case the avatar doesn't exist
                    (e.target as HTMLImageElement).src = '/avatars/avatar-1.svg';
                  }}
                />
                {/* <p className="absolute ">{id}</p> */}
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer with Select button */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSelectClick}
            disabled={selectedAvatar === null}
            className={`
              px-8 py-1 lg:py-2 rounded-full font-medium text-white 
              ${selectedAvatar !== null 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-red-300 cursor-not-allowed'
              }
            `}
          >
            {language['select']}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;