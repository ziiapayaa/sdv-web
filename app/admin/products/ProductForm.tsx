"use client";

import { useTransition, useState } from "react";
import { upsertProduct } from "../actions";
import { Button } from "@/components/ui/Button";

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface ProductFormProps {
  product?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    published: boolean;
    isLimited: boolean;
    dropDate: Date | null;
    dropStatus: string;
    collectionId: string | null;
    images: ProductImage[];
    variants: { size: string; stock: number }[];
  } | null;
  collections: { id: string; title: string }[];
}

interface ImageState {
  id: string;
  url?: string;
  file?: File;
  previewUrl?: string;
  isPrimary: boolean;
}

export function ProductForm({ product, collections }: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const [images, setImages] = useState<ImageState[]>(
    product?.images && product.images.length > 0 
      ? product.images.map(img => ({ id: Math.random().toString(), url: img.url, isPrimary: img.isPrimary }))
      : []
  );
  
  // Format price helper
  const [displayPrice, setDisplayPrice] = useState(
    product ? new Intl.NumberFormat('id-ID').format(product.price) : ""
  );

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // allow only numbers
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val) {
      setDisplayPrice(new Intl.NumberFormat('id-ID').format(parseInt(val, 10)));
    } else {
      setDisplayPrice("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file, i) => ({
        id: Math.random().toString(),
        file,
        previewUrl: URL.createObjectURL(file),
        isPrimary: images.length === 0 && i === 0 // Make first image primary if list is empty
      }));
      setImages([...images, ...newFiles]);
    }
  };

  const removeImage = (idToRemove: string) => {
    setImages(images.filter((img) => img.id !== idToRemove));
  };

  const setPrimary = (idToPrimary: string) => {
    setImages(images.map((img) => ({
      ...img,
      isPrimary: img.id === idToPrimary
    })));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please add at least one image.");
      return;
    }

    // Capture form data synchronously before any async operations
    const formElementData = new FormData(e.currentTarget);

    setIsUploading(true);
    try {
      const finalImages = [];
      let primaryIndex = 0;

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.isPrimary) primaryIndex = i;

        if (img.file) {
          const uploadFormData = new FormData();
          uploadFormData.append("file", img.file);
          if (product?.id) uploadFormData.append("productId", product.id);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: uploadFormData,
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Upload failed for " + img.file.name);
          }
          const data = await res.json();
          finalImages.push({ url: data.url, isPrimary: img.isPrimary });
        } else if (img.url) {
          finalImages.push({ url: img.url, isPrimary: img.isPrimary });
        }
      }

      // Override or add dynamic image fields
      finalImages.forEach((img, i) => {
        formElementData.append(`images_${i}`, img.url!);
      });
      formElementData.append(`primaryImageIndex`, primaryIndex.toString());

      startTransition(() => {
        upsertProduct(formElementData, product?.id);
      });
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "An error occurred during upload.");
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl bg-[#ffffff] p-8 border border-[#e8e8e8] shadow-sm">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-xs tracking-widest uppercase text-[#333333] mb-2">Title</label>
          <input type="text" id="title" name="title" defaultValue={product?.title} required className="w-full border border-[#e8e8e8] px-4 py-3 text-sm focus:outline-none focus:border-[#111111] text-[#111111] bg-[#fafafa] focus:bg-[#ffffff] transition-colors" />
        </div>
        <div>
          <label htmlFor="slug" className="block text-xs tracking-widest uppercase text-[#333333] mb-2">Slug</label>
          <input type="text" id="slug" name="slug" defaultValue={product?.slug} required className="w-full border border-[#e8e8e8] px-4 py-3 text-sm focus:outline-none focus:border-[#111111] text-[#111111] bg-[#fafafa] focus:bg-[#ffffff] transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className="block text-xs tracking-widest uppercase text-[#333333] mb-2">Price (IDR)</label>
          <input type="text" id="price" name="price" value={displayPrice} onChange={handlePriceChange} required className="w-full border border-[#e8e8e8] px-4 py-3 text-sm focus:outline-none focus:border-[#111111] text-[#111111] bg-[#fafafa] focus:bg-[#ffffff] transition-colors" />
        </div>
      </div>

      {/* Per-Size Stock */}
      <div>
        <label className="block text-xs tracking-widest uppercase text-[#333333] mb-3">Stock Per Size</label>
        <div className="grid grid-cols-4 gap-4">
          {['S', 'M', 'L', 'XL'].map(size => {
            const existing = product?.variants?.find(v => v.size === size);
            return (
              <div key={size} className="flex flex-col gap-1">
                <span className="text-xs tracking-widest text-center font-medium text-[#111111]">{size}</span>
                <input
                  type="number"
                  name={`variant_${size}`}
                  min="0"
                  defaultValue={existing?.stock ?? 0}
                  className="w-full border border-[#e8e8e8] px-3 py-2 text-sm text-center focus:outline-none focus:border-[#111111] text-[#111111] bg-[#fafafa] focus:bg-[#ffffff] transition-colors"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-xs tracking-widest uppercase text-[#333333] mb-2">Description</label>
        <textarea id="description" name="description" defaultValue={product?.description} required rows={5} className="w-full border border-[#e8e8e8] px-4 py-3 text-sm focus:outline-none focus:border-[#111111] text-[#111111] bg-[#fafafa] focus:bg-[#ffffff] transition-colors custom-scrollbar" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="collectionId" className="block text-xs tracking-widest uppercase text-[#333333] mb-2">Collection</label>
          <select id="collectionId" name="collectionId" defaultValue={product?.collectionId || ""} className="w-full border border-[#e8e8e8] px-4 py-3 text-sm focus:outline-none focus:border-[#111111] text-[#111111] bg-[#fafafa] focus:bg-[#ffffff] transition-colors">
            <option value="">No Collection</option>
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="dropStatus" className="block text-xs tracking-widest uppercase text-[#333333] mb-2">Drop Status</label>
          <select id="dropStatus" name="dropStatus" defaultValue={product?.dropStatus || "UPCOMING"} className="w-full border border-[#e8e8e8] px-4 py-3 text-sm focus:outline-none focus:border-[#111111] text-[#111111] bg-[#fafafa] focus:bg-[#ffffff] transition-colors">
            <option value="UPCOMING">Upcoming</option>
            <option value="LIVE">Live</option>
            <option value="SOLD_OUT">Sold Out</option>
            <option value="ENDED">Ended</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="dropDate" className="block text-xs tracking-widest uppercase text-[#333333] mb-2">Drop Date (Optional)</label>
          <input type="datetime-local" id="dropDate" name="dropDate" defaultValue={product?.dropDate ? new Date(product.dropDate).toISOString().slice(0, 16) : ""} className="w-full border border-[#e8e8e8] px-4 py-3 text-sm focus:outline-none focus:border-[#111111] text-[#111111] bg-[#fafafa] focus:bg-[#ffffff] transition-colors" />
        </div>
        <div className="flex flex-col gap-3 justify-center">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="published" name="published" defaultChecked={product?.published} className="w-4 h-4 accent-[#111111]" />
            <label htmlFor="published" className="text-xs tracking-widest uppercase text-[#333333]">Published</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isLimited" name="isLimited" defaultChecked={product?.isLimited ?? true} className="w-4 h-4 accent-[#111111]" />
            <label htmlFor="isLimited" className="text-xs tracking-widest uppercase text-[#333333]">Limited Drop</label>
          </div>
        </div>
      </div>

      <div className="border border-[#e8e8e8] p-4 bg-[#fafafa]">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-xs tracking-widest uppercase text-[#333333]">Product Images</label>
          <div>
            <input type="file" id="fileUpload" multiple accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} className="hidden" />
            <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById("fileUpload")?.click()} className="text-xs border border-[#e8e8e8] bg-transparent text-[#111111] hover:bg-black hover:text-white transition-colors">Select Files</Button>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className={`relative aspect-[3/4] border ${img.isPrimary ? 'border-2 border-[#111111]' : 'border-[#e8e8e8]'} group overflow-hidden bg-white flex items-center justify-center`}>
              <img src={img.previewUrl || img.url} alt="Product Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <label className="flex items-center gap-1 text-[10px] text-white cursor-pointer tracking-widest uppercase bg-black/50 p-1 w-max">
                  <input type="radio" name="primaryImageRadio" checked={img.isPrimary} onChange={() => setPrimary(img.id)} className="accent-white" />
                  Primary
                </label>
                <button type="button" onClick={() => removeImage(img.id)} className="text-white text-[10px] uppercase tracking-widest hover:text-red-400 bg-black/50 p-1 w-max">Delete</button>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs tracking-widest uppercase text-[#666666] border border-dashed border-[#cccccc]">
              No images selected
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-[#e8e8e8]">
        <Button type="submit" disabled={isPending || isUploading} className="w-full disabled:bg-[#333333]">
          {isUploading ? "UPLOADING IMAGES..." : isPending ? "SAVING..." : (product ? "SAVE CHANGES" : "CREATE PRODUCT")}
        </Button>
      </div>
    </form>
  );
}
