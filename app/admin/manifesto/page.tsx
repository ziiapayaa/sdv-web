"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function ManifestoSettingsPage() {
  const [content, setContent] = useState("");
  const [craftContent, setCraftContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchManifesto();
  }, []);

  const fetchManifesto = async () => {
    try {
      const res = await fetch("/api/admin/manifesto");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setContent(data.content || "");
          setCraftContent(data.craftContent || "");
          setImageUrl(data.imageUrl || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch manifesto", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("Image must be smaller than 3MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "manifesto");
    formData.append("productId", "manifesto-cover");

    try {
      setIsSaving(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to upload image");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/admin/manifesto", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, craftContent, imageUrl }),
      });

      if (!res.ok) throw new Error("Failed to save");
      alert("Manifesto updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save manifesto data");
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
          <h1 className="text-xl tracking-[0.2em] font-light text-[#111111] uppercase mb-2">Manifesto Settings</h1>
          <p className="text-xs tracking-widest text-[#666666] uppercase">Configure the master brand philosophy & editorial imagery</p>
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
        {/* Cover Image Uploader */}
        <div className="flex flex-col gap-4">
          <label className="text-xs tracking-widest font-medium text-[#111111] uppercase">Editorial Cover Image</label>
          <div className="text-[10px] tracking-widest text-[#666666] uppercase mb-2">
            Recommended ratio: 21:9 (Ultrawide). Max 3MB (JPG/PNG/WEBP).
          </div>
          
          <div className="flex flex-col gap-6">
            <div className={`w-full aspect-[21/9] border-2 border-dashed ${imageUrl ? 'border-transparent' : 'border-[#e8e8e8] hover:border-[#cccccc]'} relative bg-[#fafafa] flex items-center justify-center overflow-hidden transition-colors`}>
              {imageUrl ? (
                <Image src={imageUrl} alt="Manifesto Cover" fill className="object-cover" />
              ) : (
                <span className="text-xs tracking-widest text-[#999999]">[ EDITORIAL IMAGE PREVIEW ]</span>
              )}
            </div>

            <div className="flex gap-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/jpeg,image/png,image/webp" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
                className="border border-[#111111] px-6 py-2 text-xs tracking-widest uppercase hover:bg-[#fafafa] transition-colors disabled:opacity-50"
              >
                {imageUrl ? "Change Image" : "Upload Image"}
              </button>
              {imageUrl && (
                <button 
                  onClick={() => setImageUrl("")}
                  className="text-red-600 px-4 py-2 text-xs tracking-widest uppercase hover:underline"
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>
        </div>

        <hr className="border-[#e8e8e8] my-4" />

        {/* Content Editor */}
        <div className="flex flex-col gap-4">
          <label className="text-xs tracking-widest font-medium text-[#111111] uppercase">01 // The Philosophy Manuscript</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full border border-[#e8e8e8] p-4 text-sm font-serif leading-relaxed text-[#333333] focus:outline-none focus:border-[#111111] resize-y"
            placeholder="Write the brand philosophy..."
          />
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <label className="text-xs tracking-widest font-medium text-[#111111] uppercase">02 // The Craft Manuscript</label>
          <textarea 
            value={craftContent}
            onChange={(e) => setCraftContent(e.target.value)}
            rows={8}
            className="w-full border border-[#e8e8e8] p-4 text-sm font-serif leading-relaxed text-[#333333] focus:outline-none focus:border-[#111111] resize-y"
            placeholder="Write the crafting details..."
          />
        </div>
      </div>
    </div>
  );
}
