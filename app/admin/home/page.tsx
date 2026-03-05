"use client";

import { useState, useEffect } from "react";

export default function HomeSettingsPage() {
  const [formData, setFormData] = useState({
    heroTitle: "",
    heroSubtitle: "",
    heroVideoUrl: "",
    heroImageUrl: "",
    manifestoQuote: "",
    manifestoDescription: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    fetchHomeSettings();
  }, []);

  const fetchHomeSettings = async () => {
    try {
      const res = await fetch("/api/admin/home");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setFormData({
            heroTitle: data.heroTitle || "",
            heroSubtitle: data.heroSubtitle || "",
            heroVideoUrl: data.heroVideoUrl || "",
            heroImageUrl: data.heroImageUrl || "",
            manifestoQuote: data.manifestoQuote || "",
            manifestoDescription: data.manifestoDescription || "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch home settings", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = type === 'video';
    const setUploading = isVideo ? setIsUploadingVideo : setIsUploadingImage;
    const key = isVideo ? 'heroVideoUrl' : 'heroImageUrl';

    setUploading(true);
    try {
      // 1. Get upload signature from our backend
      const sigRes = await fetch("/api/upload/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "home" })
      });
      const sigData = await sigRes.json();
      
      if (!sigRes.ok) throw new Error(sigData.error || "Failed to get upload signature");

      // 2. Upload directly from browser to Cloudinary
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", sigData.apiKey);
      uploadData.append("timestamp", sigData.timestamp.toString());
      uploadData.append("signature", sigData.signature);
      uploadData.append("folder", sigData.folder);

      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`, {
        method: "POST",
        body: uploadData,
      });

      const cloudinaryData = await cloudinaryRes.json();
      if (!cloudinaryRes.ok) throw new Error(cloudinaryData.error?.message || "Cloudinary upload failed");

      setFormData((prev) => ({ ...prev, [key]: cloudinaryData.secure_url }));
    } catch (error: any) {
      console.error(error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/admin/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Failed with status ${res.status}`);
      }
      
      alert("Home Settings updated successfully!");
    } catch (error: any) {
      console.error(error);
      alert(`Error saving: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs tracking-widest text-[#666666] uppercase animate-pulse">Loading Configuration...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-12">
      <div className="flex justify-between items-center border-b border-[#e8e8e8] pb-6">
        <div>
          <h1 className="text-xl tracking-[0.2em] font-light text-[#111111] uppercase mb-2">Home Settings</h1>
          <p className="text-xs tracking-widest text-[#666666] uppercase">Configure dynamic text for the landing page</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#111111] text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#333333] transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col gap-8 bg-white p-8 border border-[#e8e8e8]">
        
        <h2 className="text-sm tracking-widest text-[#111111] border-b border-[#e8e8e8] pb-4">HERO SECTION</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <label className="text-xs tracking-widest font-medium text-[#111111] uppercase">Hero Title</label>
            <input 
              type="text"
              name="heroTitle"
              value={formData.heroTitle}
              onChange={handleChange}
              className="w-full border border-[#e8e8e8] p-4 text-sm focus:outline-none focus:border-[#111111]"
              placeholder="SOCIÉTÉ DU VIDE"
            />
          </div>
          <div className="flex flex-col gap-4">
            <label className="text-xs tracking-widest font-medium text-[#111111] uppercase">Hero Subtitle</label>
            <input 
              type="text"
              name="heroSubtitle"
              value={formData.heroSubtitle}
              onChange={handleChange}
              className="w-full border border-[#e8e8e8] p-4 text-sm focus:outline-none focus:border-[#111111]"
              placeholder="The Intellectual Approach to Form"
            />
          </div>
          <div className="flex flex-col gap-4">
            <label className="text-xs tracking-widest font-medium text-[#111111] uppercase border-b border-[#e8e8e8] pb-2">Hero Video</label>
            <div className="flex flex-col gap-2">
              <input 
                type="file" 
                accept="video/mp4,video/webm" 
                onChange={(e) => handleUpload(e, 'video')}
                disabled={isUploadingVideo}
                className="text-xs"
              />
              {isUploadingVideo && <p className="text-[10px] text-blue-600 animate-pulse">Uploading video (this may take a moment)...</p>}
            </div>
            <p className="text-[10px] text-[#666666]">OR enter URL directly:</p>
            <input 
              type="url"
              name="heroVideoUrl"
              value={formData.heroVideoUrl}
              onChange={handleChange}
              className="w-full border border-[#e8e8e8] p-4 text-sm focus:outline-none focus:border-[#111111]"
              placeholder="e.g. https://cdn.pixabay.com/video/...mp4"
            />
            <span className="text-[10px] text-[#666666]">If provided, this video will autoplay in the background. Max 15MB.</span>
          </div>
          
          <div className="flex flex-col gap-4">
            <label className="text-xs tracking-widest font-medium text-[#111111] uppercase border-b border-[#e8e8e8] pb-2">Hero Image (Fallback)</label>
            <div className="flex flex-col gap-2">
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                onChange={(e) => handleUpload(e, 'image')}
                disabled={isUploadingImage}
                className="text-xs"
              />
              {isUploadingImage && <p className="text-[10px] text-blue-600 animate-pulse">Uploading image...</p>}
            </div>
            <p className="text-[10px] text-[#666666]">OR enter URL directly:</p>
            <input 
              type="url"
              name="heroImageUrl"
              value={formData.heroImageUrl}
              onChange={handleChange}
              className="w-full border border-[#e8e8e8] p-4 text-sm focus:outline-none focus:border-[#111111]"
              placeholder="e.g. https://res.cloudinary.com/...jpg"
            />
            <span className="text-[10px] text-[#666666]">Used if no video is provided or on mobile devices.</span>
          </div>
        </div>

        <h2 className="text-sm tracking-widest text-[#111111] border-b border-[#e8e8e8] pb-4 mt-8">MANIFESTO PREVIEW (HOME)</h2>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <label className="text-xs tracking-widest font-medium text-[#111111] uppercase">Home Manifesto Quote</label>
            <textarea 
              name="manifestoQuote"
              value={formData.manifestoQuote}
              onChange={handleChange}
              rows={3}
              className="w-full border border-[#e8e8e8] p-4 text-sm font-serif leading-relaxed text-[#333333] focus:outline-none focus:border-[#111111] resize-y"
              placeholder="Quote displayed on homepage..."
            />
          </div>
          <div className="flex flex-col gap-4">
            <label className="text-xs tracking-widest font-medium text-[#111111] uppercase">Home Manifesto Description</label>
            <textarea 
              name="manifestoDescription"
              value={formData.manifestoDescription}
              onChange={handleChange}
              rows={5}
              className="w-full border border-[#e8e8e8] p-4 text-sm leading-relaxed text-[#333333] focus:outline-none focus:border-[#111111] resize-y"
              placeholder="Description text displayed below the quote..."
            />
          </div>
        </div>

      </div>
    </div>
  );
}
