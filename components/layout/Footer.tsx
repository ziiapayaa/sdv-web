export function Footer() {
  return (
    <footer className="w-full py-20 px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end border-t border-[#e8e8e8] bg-[#f4f4f4] text-xs tracking-widest text-[#666666] uppercase">
      <div className="mb-12 md:mb-0">
        <h3 className="text-[#111111] text-xl tracking-[0.3em] font-light mb-6">SOCIÉTÉ DU VIDE</h3>
        <p className="max-w-xs leading-relaxed lowercase text-[#333333] mb-2">
          embracing the void. <br/>
          calm, intellectual garments for the modern mind.
        </p>
        <p className="text-[10px] text-[#666666] lowercase">EST. 2026 // Indonesia</p>
      </div>

      <div className="flex gap-16 md:gap-24">
        <div className="flex flex-col gap-6">
          <span className="text-[#111111] font-medium mb-2 border-b border-[#e8e8e8] pb-2">Explore</span>
          <a href="/collections" className="hover:text-[#111111] transition-colors">Collections</a>
          <a href="/about" className="hover:text-[#111111] transition-colors">Manifesto</a>
          <a href="/orders/track" className="hover:text-[#111111] transition-colors">Track Order</a>
        </div>
        
        <div className="flex flex-col gap-6">
          <span className="text-[#111111] font-medium mb-2 border-b border-[#e8e8e8] pb-2">Legal</span>
          <a href="/legal/shipping" className="hover:text-[#111111] transition-colors">Shipping</a>
          <a href="/legal/returns" className="hover:text-[#111111] transition-colors">Returns</a>
          <a href="/legal/terms" className="hover:text-[#111111] transition-colors">Terms</a>
          <a href="/legal/privacy" className="hover:text-[#111111] transition-colors">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
