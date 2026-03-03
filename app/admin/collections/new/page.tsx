import { CollectionForm } from "../CollectionForm";

export default function NewCollection() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-light tracking-widest uppercase mb-2 text-[#111111]">New Collection</h1>
        <p className="text-xs text-[#666666] tracking-wider">Curate a new season.</p>
      </header>
      
      <CollectionForm collection={null} />
    </div>
  );
}
