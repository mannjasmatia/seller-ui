import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import SearchBar from './SearchBar';
import ConfirmationModal from '../OtherModals/ConfirmationModal';
import MediaModal from '../OtherModals/MediaModal';

/**
 * Demo component showing usage of all the UI components
 */
const DemoUsage: React.FC = () => {
  // State for demo
  const [searchValue, setSearchValue] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'image' | 'pdf' | 'video'>('image');
  
  // Sample data for the media modal carousel
  const sampleImages = [
    {
      src: 'https://picsum.photos/800/600?random=1',
      type: 'image' as const,
      alt: 'Sample Image 1',
      title: 'Beautiful Landscape'
    },
    {
      src: 'https://picsum.photos/800/600?random=2',
      type: 'image' as const,
      alt: 'Sample Image 2',
      title: 'City View'
    },
    {
      src: 'https://picsum.photos/800/600?random=3',
      type: 'image' as const,
      alt: 'Sample Image 3',
      title: 'Nature'
    }
  ];
  
  // Sample handler functions
  const handleSearch = (value: string) => {
    console.log('Search submitted:', value);
  };
  
  const handleConfirm = (data: any, reason?: string) => {
    console.log('Confirmed with data:', data);
    if (reason) {
      console.log('Reason provided:', reason);
    }
    setIsConfirmModalOpen(false);
    setIsReasonModalOpen(false);
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-cb-red">UI Components Demo</h1>
      
      {/* Buttons Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Button Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Button>Default Button</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link Style</Button>
            </div>
            
            <h3 className="text-lg font-medium">Button Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Button States</h3>
            <div className="flex flex-wrap gap-3">
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button fullWidth>Full Width</Button>
            </div>
            
            <h3 className="text-lg font-medium">Button with Icons</h3>
            <div className="flex flex-wrap gap-3">
              <Button 
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                }
              >
                Add Item
              </Button>
              
              <Button 
                rightIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                }
                theme={['blue-500', 'white']}
              >
                Continue
              </Button>
            </div>
            
            <h3 className="text-lg font-medium">Link Button</h3>
            <Button 
              as="link" 
              href="https://example.com" 
              target="_blank"
              theme={['green-500', 'white']}
            >
              Visit Website
            </Button>
          </div>
        </div>
      </section>
      
      {/* Input Fields Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Input Fields</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Text Input Types</h3>
            <Input 
              label="Username" 
              placeholder="Enter your username" 
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
              validation={{ required: true }}
            />
            
            <Input 
              type="email" 
              label="Email" 
              placeholder="Enter your email" 
              validation={{ 
                required: true, 
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                errorMessages: {
                  required: "Email is required",
                  pattern: "Please enter a valid email address"
                }
              }}
            />
            
            <Input 
              type="password" 
              label="Password" 
              placeholder="Enter your password" 
              rightIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              }
              validation={{ 
                required: true, 
                minLength: 8,
                errorMessages: {
                  minLength: "Password must be at least 8 characters"
                }
              }}
            />
            
            <Input 
              type="number" 
              label="Age" 
              placeholder="Enter your age" 
              validation={{ 
                min: 18, 
                max: 100,
                errorMessages: {
                  min: "You must be at least 18 years old",
                  max: "Age cannot exceed 100 years"
                }
              }}
              hint="Must be between 18 and 100"
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Input</h3>
            <Input 
              type="select" 
              label="Country" 
              placeholder="Select your country" 
              options={[
                { label: "United States", value: "us" },
                { label: "Canada", value: "ca" },
                { label: "United Kingdom", value: "uk" },
                { label: "Australia", value: "au" }
              ]}
            />
            
            <h3 className="text-lg font-medium">Multi-select Checkboxes</h3>
            <Input 
              type="checkbox" 
              label="Interests" 
              multiple 
              options={[
                { label: "Sports", value: "sports" },
                { label: "Music", value: "music" },
                { label: "Movies", value: "movies" },
                { label: "Technology", value: "tech" }
              ]}
            />
            
            <h3 className="text-lg font-medium">Radio Buttons</h3>
            <Input 
              type="radio" 
              label="Gender" 
              name="gender" 
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Non-binary", value: "non-binary" },
                { label: "Prefer not to say", value: "not-specified" }
              ]}
            />
            
            <h3 className="text-lg font-medium">Textarea</h3>
            <Input 
              type="textarea" 
              label="Bio" 
              placeholder="Tell us about yourself" 
              rows={4}
            />
          </div>
        </div>
      </section>
      
      {/* Search Bar Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Search Bar</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Basic Search</h3>
            <SearchBar 
              placeholder="Search for anything..." 
              onSearch={handleSearch}
              value={searchValue}
              onChange={setSearchValue}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">With Clear Button</h3>
              <SearchBar 
                placeholder="Search products..." 
                showClear 
                onChange={(value) => console.log('Searching:', value)}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Custom Theme</h3>
              <SearchBar 
                placeholder="Search users..." 
                buttonText="Find"
                theme={['blue-600', 'white']}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Button on Left</h3>
              <SearchBar 
                placeholder="Search orders..." 
                buttonPosition="left"
                theme={['green-600', 'white']}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Different Sizes</h3>
              <div className="space-y-2">
                <SearchBar placeholder="Small search..." size="sm" />
                <SearchBar placeholder="Large search..." size="lg" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Modals Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Modals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Confirmation Modal</h3>
            <Button 
              onClick={() => setIsConfirmModalOpen(true)}
              theme={['red-500', 'white']}
            >
              Open Confirmation Modal
            </Button>
            
            <ConfirmationModal 
              open={isConfirmModalOpen}
              title="Confirm Action"
              description="Are you sure you want to perform this action? This cannot be undone."
              onClose={() => setIsConfirmModalOpen(false)}
              onConfirm={handleConfirm}
              data={{ id: 123, action: 'delete' }}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Confirmation Modal with Reason</h3>
            <Button 
              onClick={() => setIsReasonModalOpen(true)}
              theme={['amber-500', 'white']}
            >
              Open Modal with Reason
            </Button>
            
            <ConfirmationModal 
              open={isReasonModalOpen}
              title="Reject Application"
              description="Please provide a reason for rejecting this application."
              confirmButtonText="Reject"
              reason={true}
              reasonRequired={true}
              reasonPlaceholder="Enter detailed rejection reason..."
              onClose={() => setIsReasonModalOpen(false)}
              onConfirm={handleConfirm}
              data={{ id: 456, action: 'reject' }}
              theme={['amber-500', 'white']}
            />
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Media Modal</h3>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => {
                setModalType('image');
                setIsMediaModalOpen(true);
              }}
              theme={['blue-500', 'white']}
            >
              Open Image Gallery
            </Button>
            
            <Button 
              onClick={() => {
                setModalType('pdf');
                setIsMediaModalOpen(true);
              }}
              theme={['green-500', 'white']}
            >
              Open PDF Document
            </Button>
            
            <Button 
              onClick={() => {
                setModalType('video');
                setIsMediaModalOpen(true);
              }}
              theme={['purple-500', 'white']}
            >
              Open Video
            </Button>
          </div>
          
          <MediaModal 
            open={isMediaModalOpen}
            onClose={() => setIsMediaModalOpen(false)}
            files={modalType === 'image' ? sampleImages : undefined}
            src={modalType === 'pdf' 
              ? 'https://www.orimi.com/pdf-test.pdf' 
              : modalType === 'video' 
                ? 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
                : ''
            }
            type={modalType}
            title={modalType === 'pdf' ? 'Sample PDF Document' : modalType === 'video' ? 'Sample Video' : ''}
            height="80vh"
            download={true}
            theme={['cb-red', 'white']}
          />
        </div>
      </section>
      
      {/* Theme Customization Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Theme Customization</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-3">Default Theme</h3>
            <Button>Default Button</Button>
            <div className="mt-2">
              <Input 
                label="Default Input" 
                placeholder="Enter text..." 
              />
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-3">Blue Theme</h3>
            <Button theme={['yellow-500', 'white']}>Blue Button</Button>
            <div className="mt-2">
              <Input 
                label="Blue Input" 
                placeholder="Enter text..." 
                theme={['yellow-500', 'white']}
              />
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-3">Green Theme</h3>
            <Button theme={['green-500', 'white']}>Green Button</Button>
            <div className="mt-2">
              <Input 
                label="Green Input" 
                placeholder="Enter text..." 
                theme={['green-500', 'white']}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DemoUsage;