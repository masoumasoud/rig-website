import type { SeedLocale } from "./types";

const en: SeedLocale = {
  pages: {
    home: {
      heroTitle: "Precision industrial parts, made exactly to your drawing",
      heroLead:
        "CNC milling and turning, wire EDM, grinding, welding and special-purpose machine building in Karaj, Iran — from a single piece to production runs.",
      aboutTitle: "Nearly three decades of industrial manufacturing",
      aboutBody:
        "Rezaei Industrial Group has been designing and manufacturing industrial parts and special-purpose machines, with CNC and manual machining, since 1997. Every part is made to order in exactly the quantity requested — from a single spare part to production batches. Our strengths are build quality and fast turnaround, and before production we offer technical advice to make your drawing or machine simpler and more economical to build.",
      ctaTitle: "Send us your drawing or sample part",
      ctaLead: "We will reply quickly with a price and lead time. Shipping across Iran.",
      metaTitle: "Rezaei Industrial Group | CNC Machining & Custom Parts in Karaj, Iran",
      metaDescription:
        "Custom industrial parts from 1 piece: CNC milling and turning, wire EDM to 0.01 mm, surface and cylindrical grinding, laser and TIG welding and special machines in Karaj, Iran.",
    },
    services: {
      metaTitle: "CNC Machining, Wire EDM & Parts Manufacturing Services | R.I.G",
      metaDescription:
        "Services of Rezaei Industrial Group: CNC milling and turning, wire EDM, grinding, welding, tapping, special-purpose machines and reverse engineering in Karaj, Iran.",
    },
    equipment: {
      metaTitle: "Machinery & Workshop Equipment | Rezaei Industrial Group",
      metaDescription:
        "CNC mill with 1000×500×500 mm travel, CNC lathe Ø250 mm, wire EDM 700×300 mm, surface and cylindrical grinders to 0.01 mm, plus precision QC instruments.",
    },
    portfolio: {
      metaTitle: "Portfolio of Machined Parts & Machines | Rezaei Industrial Group",
      metaDescription:
        "Examples of industrial parts and special-purpose machines built by Rezaei Industrial Group using CNC machining, wire EDM and precision grinding.",
    },
    contact: {
      metaTitle: "Contact & Request a Quote | Rezaei Industrial Group, Karaj",
      metaDescription:
        "Request a quote by sending a drawing or photo. Phone +98 26 3471 1130, mobile +98 912 464 0459. Sanatkaran Complex, Kamalshahr, Karaj, Iran.",
    },
  },
  services: {
    "cnc-milling": {
      title: "CNC Milling",
      summary: "Prismatic parts, pockets, slots and complex surfaces on a CNC mill with 1000×500×500 mm travel.",
      body: "<p>CNC milling is used for parts with complex shapes, pockets, slots, precise hole patterns and 3D surfaces. In our workshop, parts up to 1000×500×500 mm are machined to tolerances as tight as 0.02 mm.</p><p>Whether you need a single spare part or a production batch, programming and machining follow your drawing or sample.</p>",
      bullets: ["Travel: 1000×500×500 mm", "Precision down to 0.02 mm", "From 1 piece to production runs"],
      metaTitle: "CNC Milling Services in Karaj, Iran | Rezaei Industrial Group",
      metaDescription:
        "CNC milling of industrial parts in Karaj, Iran, with 1000×500×500 mm travel and 0.02 mm precision. Made to drawing or sample from 1 piece.",
    },
    "cnc-turning": {
      title: "CNC Turning",
      summary: "Shafts, bushings, flanges and round parts on a CNC lathe up to Ø250 × 600 mm.",
      body: "<p>CNC turning is the best way to make round parts such as shafts, bushings, pins, flanges and threaded components. Our CNC lathe handles parts up to 250 mm in diameter and 600 mm long, with a 75 mm spindle bore and precision down to 0.02 mm.</p><p>High repeatability means every part in an order is identical.</p>",
      bullets: ["Up to Ø250 mm and 600 mm long", "75 mm spindle bore", "Precision down to 0.02 mm"],
      metaTitle: "CNC Turning Services in Karaj, Iran | Rezaei Industrial Group",
      metaDescription:
        "CNC turning of shafts, bushings and round parts up to Ø250 × 600 mm with 0.02 mm precision in Karaj, Iran. Made to drawing from 1 piece.",
    },
    "wire-edm": {
      title: "Wire EDM",
      summary: "Precision cutting of hardened metals, punches, dies and complex profiles to 0.01 mm.",
      body: "<p>Wire EDM is used to cut hardened metals and to make punches, dies, gears and profiles that conventional tools cannot produce. Our wire EDM machine cuts parts up to 700×300 mm and 30 cm high with 0.01 mm precision.</p>",
      bullets: ["Working area 700×300 mm", "Cutting height up to 30 cm", "Precision 0.01 mm"],
      metaTitle: "Wire EDM Cutting in Karaj, Iran | 0.01 mm Precision",
      metaDescription:
        "Wire EDM services in Karaj, Iran, for punches, dies and hardened parts: 700×300 mm working area, 30 cm height, 0.01 mm precision.",
    },
    grinding: {
      title: "Surface & Cylindrical Grinding",
      summary: "Final finishing of flat surfaces and diameters to 0.01 mm.",
      body: "<p>Grinding is the final step for precision parts, ensuring surface finish and dimensional accuracy. We finish flat, parallel surfaces on our surface grinder and outside diameters of shafts and pins on our cylindrical grinder, both to 0.01 mm.</p>",
      bullets: ["Surface grinding to 0.01 mm", "Cylindrical grinding to 0.01 mm", "Suitable for hardened parts"],
      metaTitle: "Surface & Cylindrical Grinding in Karaj, Iran | 0.01 mm",
      metaDescription:
        "Surface and cylindrical grinding of industrial parts in Karaj, Iran, to 0.01 mm for shafts, pins, plates and hardened parts.",
    },
    "manual-machining": {
      title: "Manual Turning & Milling",
      summary: "Making and repairing parts on a 1 m manual lathe and a manual mill — fast and economical.",
      body: "<p>For simple parts, repairs and urgent orders, manual machining is the fastest and most economical route. Our manual lathe machines parts up to 1 m long to 0.05 mm, and our manual mill works to 0.1 mm.</p>",
      bullets: ["Manual lathe up to 1 m, 0.05 mm", "Manual milling to 0.1 mm", "Ideal for repairs and rush jobs"],
      metaTitle: "Manual Turning & Milling Services in Karaj, Iran",
      metaDescription:
        "Manual turning and milling in Karaj, Iran, for making and repairing industrial parts: lathe up to 1 m, fast and economical.",
    },
    welding: {
      title: "Laser, TIG & Arc Welding",
      summary: "Clean, precise joining of steel, stainless steel and aluminium.",
      body: "<p>Depending on the material and how critical the part is, we use laser welding for very precise, low-heat joints, TIG welding for stainless steel and aluminium, and arc welding for structures and heavy parts. Welding can be part of building a machine or repairing a component.</p>",
      bullets: ["Laser welding for precise joints", "TIG for stainless and aluminium", "Arc welding for structures"],
      metaTitle: "Laser & TIG Welding Services in Karaj, Iran | R.I.G",
      metaDescription:
        "Laser, TIG and arc welding of industrial parts in Karaj, Iran: precise joining of steel, stainless steel and aluminium.",
    },
    "drilling-tapping": {
      title: "Drilling & Tapping",
      summary: "Drilling up to Ø50 mm and tapping up to M24 and 1\"; automatic tapping up to M16.",
      body: "<p>Our pillar drill handles holes up to 50 mm in diameter, and our automatic arm tapping machine produces fast, consistent threads up to M16. Tapping up to M24 and 1 inch is also available.</p>",
      bullets: ["Drilling up to Ø50 mm", "Automatic tapping up to M16", "Tapping up to M24 and 1\""],
      metaTitle: "Drilling & Tapping Services in Karaj, Iran",
      metaDescription:
        "Industrial drilling up to Ø50 mm and tapping up to M24 and 1 inch with an automatic tapping machine in Karaj, Iran.",
    },
    "special-machines": {
      title: "Special-Purpose Machine Design & Build",
      summary: "Design and build of custom machines, fixtures and production-line equipment.",
      body: "<p>If your production line needs a machine or fixture that you cannot buy off the shelf, we take it from design through manufacturing and assembly. Before building, we advise on how to make the machine simpler and more cost-effective.</p>",
      bullets: ["Mechanical design to your needs", "Manufacturing, assembly and commissioning", "Advice to reduce build cost"],
      metaTitle: "Special-Purpose Machines & Fixtures | Rezaei Industrial Group",
      metaDescription:
        "Design and build of special-purpose machines, fixtures and custom production-line equipment in Karaj, Iran, with cost-saving technical advice.",
    },
    "reverse-engineering": {
      title: "Parts from Samples (Reverse Engineering)",
      summary: "Parts made from an old sample, a photo or a hand sketch — even without a drawing.",
      body: "<p>No drawing? No problem. Send us a sample part, a photo or even a description and hand sketch. We measure it, draw it and manufacture it. This is especially useful for spare parts of old or imported machines.</p>",
      bullets: ["Design from a sample part", "Works from photos or sketches", "Ideal for hard-to-find spares"],
      metaTitle: "Reverse Engineering & Parts from Samples in Karaj, Iran",
      metaDescription:
        "Industrial spare parts made from samples, photos or hand sketches: measurement, drawing and manufacturing in Karaj, Iran.",
    },
    "tooling-prototyping": {
      title: "Tooling & Prototyping",
      summary: "Mould components, punches and dies, and prototypes before production.",
      body: "<p>By combining CNC milling, wire EDM and grinding, we make mould components, punches, dies and prototypes with high precision, so your design can be tested and approved before mass production.</p>",
      bullets: ["Mould components, punches and dies", "Prototypes before production", "CNC, wire EDM and grinding combined"],
      metaTitle: "Tooling & Prototyping of Industrial Parts in Karaj, Iran",
      metaDescription:
        "Mould components, punches, dies and prototypes of industrial parts made with CNC, wire EDM and precision grinding in Karaj, Iran.",
    },
  },
  equipment: {
    cncMill: { name: "CNC milling machine", description: "Machining of prismatic parts and complex shapes." },
    cncLathe: { name: "CNC lathe", description: "Round parts with high repeatability." },
    wireCut: { name: "Wire EDM", description: "Precision cutting of hard metals and complex profiles." },
    surfaceGrinder: { name: "Surface grinder", description: "Finishing flat, parallel surfaces." },
    cylGrinder: { name: "Cylindrical grinder", description: "Finishing outside diameters of shafts and pins." },
    manualLathe: { name: "Manual lathe", description: "Fast making and repair of round parts." },
    manualMill: { name: "Manual milling machine", description: "Quick machining of simple parts." },
    columnDrill: { name: "Pillar drill", description: "Drilling large and heavy parts." },
    tapping: { name: "Automatic arm tapping machine", description: "Fast, consistent threading." },
    welding: { name: "Welding", description: "Precise joining of steel, stainless steel and aluminium." },
    calipers: { name: "Digital calipers & depth gauges", description: "Quick measurement of dimensions and depths." },
    micrometers: { name: "Micrometers", description: "Precise measurement of diameters in many sizes." },
    boreGauges: { name: "Internal bore gauges", description: "Checking inner diameters of holes and bushings." },
    cmm: { name: "Optical & CMM inspection", description: "Coordinate measurement for critical parts, when required." },
  },
  specLabels: {
    workArea: "Working area",
    precision: "Precision",
    maxDiameter: "Max. diameter",
    maxLength: "Max. length",
    spindleBore: "Spindle bore",
    maxHeight: "Max. height",
    drillDiameter: "Drilling up to",
    autoTapping: "Automatic tapping up to",
    tapRange: "Tapping up to",
    processes: "Processes",
  },
  specTexts: { weldProcesses: "Laser, TIG, arc" },
  units: { mm: "mm", cm: "cm" },
  faqs: [
    {
      q: "What is the minimum order quantity?",
      a: "The minimum order is 1 piece. The maximum quantity depends on the drawing, the part and the required time.",
    },
    {
      q: "What do I need to send to order a part?",
      a: "A technical drawing, a sample part, a photo or even a description and hand sketch is enough. If needed, we prepare the drawing ourselves.",
    },
    {
      q: "What is the lead time?",
      a: "Lead time depends on the drawing or sample and is confirmed together with the price after review.",
    },
    {
      q: "Do you ship to other cities?",
      a: "Yes. Parts are shipped across Iran in protective packaging so they are not damaged in transit.",
    },
    {
      q: "What precision can you achieve?",
      a: "Up to 0.01 mm with wire EDM and grinding, and up to 0.02 mm with CNC milling and turning.",
    },
    {
      q: "How can I send my drawing?",
      a: "Through the quote form on this website, email, WhatsApp, Telegram or Iranian messengers such as Eitaa, Bale and Rubika. DWG, DXF, STEP, PDF and photos are accepted.",
    },
    {
      q: "Do you offer advice to reduce manufacturing cost?",
      a: "Yes. Before production we review the drawing or machine and suggest simpler, more economical options.",
    },
  ],
};

export default en;
