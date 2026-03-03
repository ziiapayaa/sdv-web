export default function ShippingPolicy() {
  return (
    <article className="prose prose-sm md:prose-base max-w-none text-[#333333] prose-headings:font-light prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-[#111111] prose-a:text-[#111111]">
      <header className="mb-12 text-center md:text-left border-b border-[#e8e8e8] pb-8">
        <h1 className="text-2xl md:text-3xl font-light tracking-[0.2em] uppercase text-[#111111]">Shipping Policy</h1>
        <p className="text-xs tracking-widest text-[#666666] mt-4 uppercase">Last updated: March 2026</p>
      </header>
      
      <h3>Processing Time</h3>
      <p>All orders map to our philosophy of deliberate creation. Orders are processed within 1–2 business days. Limited drop items may require an extended processing window of 3–5 days as each component undergoes rigorous final inspection.</p>

      <h3>Domestic Shipping (Indonesia)</h3>
      <p>We provide swift domestic logistics with full end-to-end tracking:</p>
      <ul>
        <li><strong>Standard Service:</strong> 2–4 business days</li>
        <li><strong>Express Service:</strong> 1–2 business days (available upon checkout in major cities)</li>
      </ul>

      <h3>International Shipping</h3>
      <p>At current, international fulfillment is selectively managed. We employ DHL Express for cross-border deliveries across Asia, Europe, and North America. Delivery spans 5–10 business days depending on destination.</p>

      <h3>Taxes & Duties</h3>
      <p>International recipients assume full responsibility for any applicable import duties or local customs taxes levied by their respective nations. SOCIÉTÉ DU VIDE is not liable for border-related delays.</p>
    </article>
  );
}
