"use client";

import { useTransition } from "react";
import { upsertCollection } from "../actions";
import { Button } from "@/components/ui/Button";

interface CollectionFormProps {
  collection?: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    published: boolean;
  } | null;
}

export function CollectionForm({ collection }: CollectionFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(() => {
      upsertCollection(formData, collection?.id);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl bg-[#ffffff] p-8 border border-[#e8e8e8] shadow-sm">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-xs tracking-widest uppercase text-[#333333] mb-2">Title</label>
          <input type="text" id="title" name="title" defaultValue={collection?.title} required className="w-full border border-[#e8e8e8] px-4 py-3 text-sm focus:outline-none focus:border-[#111111] text-[#111111] bg-[#fafafa] focus:bg-[#ffffff] transition-colors" />
        </div>
        <div>
          <label htmlFor="slug" className="block text-xs tracking-widest uppercase text-[#333333] mb-2">Slug</label>
          <input type="text" id="slug" name="slug" defaultValue={collection?.slug} required className="w-full border border-[#e8e8e8] px-4 py-3 text-sm focus:outline-none focus:border-[#111111] text-[#111111] bg-[#fafafa] focus:bg-[#ffffff] transition-colors" />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-xs tracking-widest uppercase text-[#333333] mb-2">Description</label>
        <textarea id="description" name="description" defaultValue={collection?.description || ""} rows={4} className="w-full border border-[#e8e8e8] px-4 py-3 text-sm focus:outline-none focus:border-[#111111] text-[#111111] bg-[#fafafa] focus:bg-[#ffffff] transition-colors custom-scrollbar" />
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="published" name="published" defaultChecked={collection?.published} className="w-4 h-4 accent-[#111111]" />
        <label htmlFor="published" className="text-xs tracking-widest uppercase text-[#333333]">Published</label>
      </div>

      <div className="pt-4 mt-4 border-t border-[#e8e8e8]">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "SAVING..." : (collection ? "SAVE CHANGES" : "CREATE COLLECTION")}
        </Button>
      </div>
    </form>
  );
}
