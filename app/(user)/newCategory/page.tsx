'use client'
import React, { useEffect, useState } from 'react';
import { ChevronDown, Plus, Minus, Upload, X, Camera } from 'lucide-react';
import api from '@/lib/axios';

interface RecyclingItem {
  _id: string;
  name: string;
  points?: number;
}

interface Category {
  id: string;
  name: string;
  items?: RecyclingItem[];
}
interface ApiCategory {
  _id: string;  // Changed from 'id' to '_id'
  name: string;
}

interface SelectedItem {
  categoryId: string;
  itemId: string;
  quantity: number;
  itemName: string;
  categoryName: string;
}

export default function RecyclingForm() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [allCategories, setAllCategories] = useState<ApiCategory[]>([]);
  const [subcategories, setSubcategories] = useState<RecyclingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const getCategories = async () => {
    try {
      const response = await api.get('/categories');
      setAllCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };



  useEffect(() => {
    getCategories();
  }, []);

const handleCategoryChange = (categoryId: string) => {
  setSelectedCategory(categoryId);
  const selectedCategoryObj = allCategories.find(cat => cat._id === categoryId);

  if (selectedCategoryObj) {
    setSubcategories(selectedCategoryObj.items || []);
  } else {
    setSubcategories([]);
  }
};

  const incrementItem = (categoryId: string, itemId: string, itemName: string, categoryName: string) => {
    setSelectedItems(prev => {
      const existingIndex = prev.findIndex(item => 
        item.categoryId === categoryId && item.itemId === itemId
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      } else {
        return [...prev, {
          categoryId,
          itemId,
          quantity: 1,
          itemName,
          categoryName
        }];
      }
    });
  };

  const decrementItem = (categoryId: string, itemId: string) => {
    setSelectedItems(prev => {
      const existingIndex = prev.findIndex(item => 
        item.categoryId === categoryId && item.itemId === itemId
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        if (updated[existingIndex].quantity > 1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity - 1
          };
        } else {
          updated.splice(existingIndex, 1);
        }
        return updated;
      }
      return prev;
    });
  };

  const getItemQuantity = (categoryId: string, itemId: string): number => {
    const item = selectedItems.find(item => 
      item.categoryId === categoryId && item.itemId === itemId
    );
    return item?.quantity || 0;
  };

  const handleImageUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
      
      // Create preview URLs
      validFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        setPreviewUrls(prev => [...prev, url]);
      });
    }
  };

  const removeImage = (index: number) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const calculateTotalPoints = (): number => {
    return selectedItems.reduce((total, selectedItem) => {
      const item = subcategories.find(item => item.id === selectedItem.itemId);
      return total + (item?.points || 0) * selectedItem.quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Add selected items to form data
    formData.append('selectedItems', JSON.stringify(selectedItems));
    formData.append('totalPoints', calculateTotalPoints().toString());
    formData.append('timestamp', new Date().toISOString());
    
    // Add images to form data
    images.forEach((image, index) => {
      formData.append(`image_${index}`, image);
    });
    
    try {
      // Replace with your actual submit endpoint
      const response = await api.post('/recycling-request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Form submitted successfully:', response.data);
      alert(`Recycling request submitted! Total points: ${calculateTotalPoints()}`);
      
      // Reset form
      setSelectedCategory('');
      setSubcategories([]);
      setSelectedItems([]);
      setImages([]);
      setPreviewUrls([]);
      
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Error submitting form. Please try again.');
    }
  };

  const selectedCategory_obj = allCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">Recycling Request Form</h1>
            <p className="text-green-100">Help make the planet greener by recycling your items</p>
          </div>

          <div className="p-8">
            {/* Category Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                Select Category
              </label>
              <div className="relative">
              <select
  value={selectedCategory}
  onChange={(e) => handleCategoryChange(e.target.value)}
  className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 appearance-none bg-white text-gray-700 font-medium"
>
  <option value="">Choose a recycling category...</option>
  {allCategories.map(category => (
    <option key={category._id} value={category._id}> {/* Changed from 'id' to '_id' */}
      {category.name}
    </option>
  ))}
</select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Items Selection */}
            {/* {selectedCategory_obj && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Items in {selectedCategory_obj.name}
                </h3>
           {subcategories.length === 0 ? (
  <div className="text-center py-8 text-gray-500">
    No items found in this category
  </div>
) : (
  <div className="grid gap-4">
    {subcategories.map((item) => (
      <div key={item._id} className="bg-gray-50 rounded-xl p-4 border-2 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">{item.name}</h4>
            {item.points && (
              <span className="text-sm text-green-600 font-medium">
                {item.points} points each
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => decrementItem(selectedCategory, item._id)}
              className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center"
              disabled={getItemQuantity(selectedCategory, item._id) === 0}
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="w-12 text-center font-bold text-lg text-gray-700">
              {getItemQuantity(selectedCategory, item._id)}
            </span>
            <button
              type="button"
              onClick={() =>
                incrementItem(selectedCategory, item._id, item.name, selectedCategory_obj.name)
              }
              className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

              </div>
            )} */}
{loadingSubcategories ? (
  <div className="text-center py-8 text-gray-500">
    Loading items...
  </div>
) : subcategories.length === 0 ? (
  <div className="text-center py-8 text-gray-500">
    No items found in this category
  </div>
) : (
    <div className="grid gap-4">
    {subcategories.map((item) => (
      <div key={item._id} className="bg-gray-50 rounded-xl p-4 border-2 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">{item.name}</h4>
            {item.points && (
              <span className="text-sm text-green-600 font-medium">
                {item.points} points each
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => decrementItem(selectedCategory, item._id)}
              className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center"
              disabled={getItemQuantity(selectedCategory, item._id) === 0}
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="w-12 text-center font-bold text-lg text-gray-700">
              {getItemQuantity(selectedCategory, item._id)}
            </span>
            <button
              type="button"
              onClick={() =>
                incrementItem(selectedCategory, item._id, item.name, selectedCategory_obj.name)
              }
              className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
            {/* Selected Items Summary */}
            {selectedItems.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Selected Items ({selectedItems.length})
                </h3>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="space-y-2">
                    {selectedItems.map((item, index) => (
                      <div key={`${item.categoryId}-${item.itemId}`} className="flex justify-between items-center">
                        <span className="text-gray-700">
                          <span className="font-medium">{item.itemName}</span>
                          <span className="text-sm text-gray-500 ml-2">({item.categoryName})</span>
                        </span>
                        <span className="font-bold text-green-600">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Total Points:</span>
                      <span className="font-bold text-xl text-green-600">{calculateTotalPoints()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                Upload Images of Items
              </label>
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-green-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Camera className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Drag and drop images here, or click to select files
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select Images
                </label>
              </div>

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Uploaded Images ({images.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selectedItems.length === 0}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                Submit Recycling Request
                {selectedItems.length > 0 && (
                  <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                    {calculateTotalPoints()} pts
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}