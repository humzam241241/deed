import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, ZoomIn, ZoomOut, RotateCw, Move, Download, Save, 
  Shirt, Settings, Palette, Maximize2, ArrowLeft, Box 
} from 'lucide-react';
import Product3DViewer from '../components/Product3DViewer';
import ProductTemplates from '../components/ProductTemplates';
import ChatBot from '../components/ChatBot';

export default function DesignStudio() {
  const [designImage, setDesignImage] = useState(null);
  const [product, setProduct] = useState('tshirt');
  const [garmentColor, setGarmentColor] = useState('#ffffff');
  const [printLocation, setPrintLocation] = useState('front-center');
  const [designSize, setDesignSize] = useState(0.8);
  const [rotation, setRotation] = useState(0);
  const [designName, setDesignName] = useState('My Design');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [view3D, setView3D] = useState(true);
  const [greyMode, setGreyMode] = useState(false);
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Load saved designs from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedDesigns');
    if (saved) {
      setSavedDesigns(JSON.parse(saved));
    }
  }, []);

  const products = [
    { id: 'tshirt', name: 'T-Shirt', icon: '👕', locations: ['front-center', 'front-left', 'back-center', 'sleeve'] },
    { id: 'polo',   name: 'Polo',    icon: '👔', locations: ['front-center', 'front-left', 'back-center', 'sleeve'] },
    { id: 'hoodie', name: 'Hoodie',  icon: '🧥', locations: ['front-center', 'front-left', 'back-center', 'sleeve'] },
    { id: 'hat',    name: 'Hat',     icon: '🧢', locations: ['front-center', 'side', 'back'] },
    { id: 'banner', name: 'Banner',  icon: '🚩', locations: ['front-center'] },
  ];

  const colors = [
    { name: 'White', value: '#ffffff', dark: false },
    { name: 'Black', value: '#000000', dark: true },
    { name: 'Navy', value: '#001f3f', dark: true },
    { name: 'Gray', value: '#aaaaaa', dark: false },
    { name: 'Red', value: '#ff4136', dark: true },
    { name: 'Royal Blue', value: '#0074d9', dark: true },
    { name: 'Forest Green', value: '#2ecc40', dark: false },
    { name: 'Maroon', value: '#85144b', dark: true },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDesignImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductChange = (newProduct) => {
    setProduct(newProduct);
    // Reset to first available location for new product
    const productData = products.find(p => p.id === newProduct);
    if (productData) {
      setPrintLocation(productData.locations[0]);
    }
  };

  const exportDesign = () => {
    if (!canvasRef.current || !designImage) return;

    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 1000;
    
    // Clone the SVG
    const svgElement = canvasRef.current.querySelector('svg');
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert to downloadable image
      canvas.toBlob((blob) => {
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${designName.replace(/\s+/g, '-').toLowerCase()}-${product}.png`;
        link.click();
        URL.revokeObjectURL(downloadUrl);
      });
      
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const saveDesign = () => {
    const design = {
      id: Date.now(),
      name: designName,
      image: designImage,
      product,
      garmentColor,
      printLocation,
      designSize,
      rotation,
      createdAt: new Date().toISOString()
    };

    const updated = [...savedDesigns, design];
    setSavedDesigns(updated);
    localStorage.setItem('savedDesigns', JSON.stringify(updated));
    setShowSaveModal(false);
    
    // Show success message
    alert('Design saved successfully!');
  };

  const loadDesign = (design) => {
    setDesignImage(design.image);
    setProduct(design.product);
    setGarmentColor(design.garmentColor);
    setPrintLocation(design.printLocation);
    setDesignSize(design.designSize);
    setRotation(design.rotation);
    setDesignName(design.name);
  };

  const deleteDesign = (id) => {
    if (confirm('Are you sure you want to delete this design?')) {
      const updated = savedDesigns.filter(d => d.id !== id);
      setSavedDesigns(updated);
      localStorage.setItem('savedDesigns', JSON.stringify(updated));
    }
  };

  const resetDesign = () => {
    if (confirm('Reset all design settings?')) {
      setDesignImage(null);
      setDesignSize(0.8);
      setRotation(0);
      setDesignName('My Design');
    }
  };

  const currentProduct = products.find(p => p.id === product);
  const printLocations = currentProduct?.locations.map(loc => ({
    id: loc,
    name: loc.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-gray-600 hover:text-primary mr-4">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold">Design Studio</h1>
            </div>
            <div className="flex items-center gap-3">
              {designImage && (
                <>
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Design
                  </button>
                  <button
                    onClick={exportDesign}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Upload Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Design
              </h3>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 font-medium">Click to upload</span>
                <span className="text-xs text-gray-500 mt-1">PNG, SVG, JPG (Max 5MB)</span>
              </button>
              {designImage && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Current Design</span>
                    <button
                      onClick={resetDesign}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <img src={designImage} alt="Uploaded design" className="w-full h-20 object-contain bg-gray-50 rounded p-2" />
                </div>
              )}
            </div>

            {/* Product Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center">
                <Shirt className="w-5 h-5 mr-2" />
                Select Product
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProductChange(p.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      product === p.id 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{p.icon}</div>
                    <div className="text-sm font-medium">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Garment Color
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setGarmentColor(c.value)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      garmentColor === c.value 
                        ? 'border-primary scale-110 shadow-lg' 
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  >
                    {garmentColor === c.value && (
                      <div className={`w-full h-full flex items-center justify-center ${c.dark ? 'text-white' : 'text-gray-800'}`}>
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Print Location */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Print Location
              </h3>
              <select 
                value={printLocation}
                onChange={(e) => setPrintLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                {printLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            {/* Design Controls */}
            {designImage && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Maximize2 className="w-5 h-5 mr-2" />
                  Adjust Design
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-gray-600">Size</label>
                      <span className="text-sm font-medium">{Math.round(designSize * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="150"
                      value={designSize * 100}
                      onChange={(e) => setDesignSize(e.target.value / 100)}
                      className="w-full accent-primary"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-gray-600">Rotation</label>
                      <span className="text-sm font-medium">{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setRotation((rotation - 90 + 360) % 360)}
                      className="flex-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                      title="Rotate left 90°"
                    >
                      <RotateCw className="w-4 h-4 transform scale-x-[-1]" />
                    </button>
                    <button
                      onClick={() => setRotation((rotation + 90) % 360)}
                      className="flex-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                      title="Rotate right 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Designs */}
            {savedDesigns.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Saved Designs ({savedDesigns.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedDesigns.map((design) => (
                    <div key={design.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center flex-1">
                        <img src={design.image} alt={design.name} className="w-10 h-10 object-contain bg-white rounded mr-3" />
                        <div>
                          <div className="text-sm font-medium">{design.name}</div>
                          <div className="text-xs text-gray-500">{design.product}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => loadDesign(design)}
                          className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteDesign(design.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-8 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <h3 className="font-semibold text-lg">Live Preview</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Grey / Mockup mode toggle */}
                  {view3D && (
                    <button
                      onClick={() => setGreyMode(g => !g)}
                      title="Grey mockup mode — shows design on neutral grey garment"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1.5 ${
                        greyMode
                          ? 'bg-gray-700 text-white border-gray-700'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full inline-block border border-current"
                        style={{ background: greyMode ? '#c0c0c0' : 'transparent' }}
                      />
                      Mockup
                    </button>
                  )}

                  {/* 3D / 2D switcher */}
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setView3D(true)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                        view3D
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Box className="w-4 h-4" />
                      3D View
                    </button>
                    <button
                      onClick={() => setView3D(false)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        !view3D
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      2D Flat
                    </button>
                  </div>
                </div>
              </div>
              
              <div 
                ref={canvasRef}
                className="mx-auto"
                style={{ maxWidth: '600px', minHeight: '500px' }}
              >
                {view3D ? (
                  <Product3DViewer
                    product={product}
                    designImage={designImage}
                    garmentColor={garmentColor}
                    printLocation={printLocation}
                    rotation={rotation}
                    greyMode={greyMode}
                  />
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <ProductTemplates
                      type={product}
                      color={garmentColor}
                      printLocation={printLocation}
                      designSize={designSize}
                      rotation={rotation}
                      designImage={designImage}
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-6 text-center space-y-2">
                {view3D && (
                  <p className="text-sm text-primary font-medium mb-2">
                    ✨ Interactive 3D Model - Drag to rotate, scroll to zoom
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Your design will be printed at high resolution
                </p>
                <p className="text-xs text-gray-500">
                  This is a preview only - actual colors may vary slightly
                </p>
                {designImage && (
                  <div className="mt-4 pt-4 border-t">
                    <Link
                      to="/contact"
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Get a Quote for This Design
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Design Tips */}
            <div className="mt-6 bg-blue-50 rounded-xl p-6">
              <h4 className="font-semibold mb-3">💡 Design Tips</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Use PNG files with transparent backgrounds for best results</li>
                <li>• Vector files (SVG) will scale perfectly to any size</li>
                <li>• Consider contrast - dark designs on dark garments won't show well</li>
                <li>• Recommended design width: 10-12 inches for front/back, 3-4 inches for left chest</li>
                <li>• High resolution: at least 300 DPI for print quality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Save Design</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Design Name
              </label>
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Enter design name"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveDesign}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatBot />
    </div>
  );
}
