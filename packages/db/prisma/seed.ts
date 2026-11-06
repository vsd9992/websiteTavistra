import { PrismaClient, PurchaseMode } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Tavistra Commerce Engine database...');

  // 1. Seed Shipping Zones (TAV-03 & TAV-09)
  console.log('Seeding Shipping Zones & PIN Code mappings...');

  const zoneA = await prisma.shippingZone.upsert({
    where: { code: 'ZONE_A' },
    update: {},
    create: {
      code: 'ZONE_A',
      name: 'Zone A (Intra-State / Karnataka)',
      description: 'Local express transit with specialized courier handling.',
      baseWeightGrams: 2000,
      baseRate: 450.0,
      perAdditionalKgRate: 80.0,
      estimatedDaysMin: 2,
      estimatedDaysMax: 3,
      pincodeRanges: {
        create: [
          { stateName: 'Karnataka', pincodePrefix: '56', isServiceable: true },
          { stateName: 'Karnataka', pincodePrefix: '57', isServiceable: true },
          { stateName: 'Karnataka', pincodePrefix: '58', isServiceable: true },
          { stateName: 'Karnataka', pincodePrefix: '59', isServiceable: true },
        ],
      },
    },
  });

  const zoneB = await prisma.shippingZone.upsert({
    where: { code: 'ZONE_B' },
    update: {},
    create: {
      code: 'ZONE_B',
      name: 'Zone B (Regional / South & West)',
      description: 'Southern & Western states (TN, KL, AP, TS, GA, MH).',
      baseWeightGrams: 2000,
      baseRate: 750.0,
      perAdditionalKgRate: 120.0,
      estimatedDaysMin: 3,
      estimatedDaysMax: 5,
      pincodeRanges: {
        create: [
          { stateName: 'Tamil Nadu', pincodePrefix: '60', isServiceable: true },
          { stateName: 'Kerala', pincodePrefix: '68', isServiceable: true },
          { stateName: 'Telangana', pincodePrefix: '50', isServiceable: true },
          { stateName: 'Maharashtra', pincodePrefix: '40', isServiceable: true },
          { stateName: 'Goa', pincodePrefix: '403', isServiceable: true },
        ],
      },
    },
  });

  const zoneC = await prisma.shippingZone.upsert({
    where: { code: 'ZONE_C' },
    update: {},
    create: {
      code: 'ZONE_C',
      name: 'Zone C (National / Metro & Rest of India)',
      description: 'Major metros, Northern, Central and Eastern states.',
      baseWeightGrams: 2000,
      baseRate: 1100.0,
      perAdditionalKgRate: 160.0,
      estimatedDaysMin: 5,
      estimatedDaysMax: 8,
      pincodeRanges: {
        create: [
          { stateName: 'Delhi NCR', pincodePrefix: '11', isServiceable: true },
          { stateName: 'Gujarat', pincodePrefix: '38', isServiceable: true },
          { stateName: 'West Bengal', pincodePrefix: '70', isServiceable: true },
          { stateName: 'Rajasthan', pincodePrefix: '30', isServiceable: true },
        ],
      },
    },
  });

  const zoneD = await prisma.shippingZone.upsert({
    where: { code: 'ZONE_D' },
    update: {},
    create: {
      code: 'ZONE_D',
      name: 'Zone D (Remote / Special Terrain)',
      description: 'J&K, Ladakh, North-East, and Island territories.',
      baseWeightGrams: 2000,
      baseRate: 1650.0,
      perAdditionalKgRate: 220.0,
      estimatedDaysMin: 7,
      estimatedDaysMax: 12,
      pincodeRanges: {
        create: [
          { stateName: 'Jammu & Kashmir', pincodePrefix: '19', isServiceable: true },
          { stateName: 'Assam', pincodePrefix: '78', isServiceable: true },
          { stateName: 'Andaman & Nicobar', pincodePrefix: '744', isServiceable: true },
        ],
      },
    },
  });

  console.log(`Zones seeded: ${zoneA.code}, ${zoneB.code}, ${zoneC.code}, ${zoneD.code}`);

  // 2. Seed the 6 Approved Categories (TAV-01)
  console.log('Seeding Approved Product Categories...');

  const categories = [
    {
      slug: 'personal-accessories',
      name: 'Personal Accessories',
      description: 'Tactile daily companions, pocket talismans, and carry objects.',
      sortOrder: 1,
    },
    {
      slug: 'home-decor-objects',
      name: 'Home Décor & Objects',
      description: 'Sculptural wall clocks, solid brass mirrors, and ceramic monoliths.',
      sortOrder: 2,
    },
    {
      slug: 'desk-workspace',
      name: 'Desk & Workspace',
      description: 'Weighted stone organisers, milled pen rests, and fine brass trays.',
      sortOrder: 3,
    },
    {
      slug: 'lighting-ambience',
      name: 'Lighting & Ambience',
      description: 'Atmospheric table lamps, articulated desk lamps, and ambient optics.',
      sortOrder: 4,
    },
    {
      slug: 'outdoor-balcony',
      name: 'Outdoor & Balcony',
      description: 'Architectural planters, weathered vessels, and balcony pedestals.',
      sortOrder: 5,
    },
    {
      slug: 'art-collectibles',
      name: 'Art & Collectibles',
      description: 'Numbered kinetic sculptures, limited foundry editions, and signed works.',
      sortOrder: 6,
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }

  // 3. Seed Catalogue Products & Inventory Ledgers
  console.log('Seeding Initial Products, Variants & Inventory Ledgers...');

  const products = [
    {
      slug: 'monolith-minimalist-wall-clock',
      sku: 'TAV-CLK-001',
      title: 'Monolith Minimalist Wall Clock',
      categorySlug: 'home-decor-objects',
      primaryMode: PurchaseMode.READY_STOCK,
      taxInclusivePrice: 14500.0,
      shortDescription: 'Precision-milled aerospace aluminium body with an unlacquered brushed brass dial.',
      fullDescription: 'Machined from a single block of aerospace aluminium with brushed brass hands and silent German quartz movement.',
      materialDescription: 'Milled Solid Aluminium, Brushed Brass, German Silent Quartz Movement',
      dimensions: '320mm Dia × 38mm D',
      weightGrams: 2400,
      lengthMm: 360,
      widthMm: 360,
      heightMm: 70,
      isReturnable: true,
      returnWindowDays: 7,
      initialStock: 8,
      variantTitle: 'Matte Obsidian & Brushed Brass',
    },
    {
      slug: 'arc-solid-brass-wall-mirror',
      sku: 'TAV-MIR-002',
      title: 'Arc Sculptural Brass Wall Mirror',
      categorySlug: 'home-decor-objects',
      primaryMode: PurchaseMode.MADE_TO_ORDER,
      taxInclusivePrice: 38000.0,
      shortDescription: 'Hand-rolled architectural brass frame cradling high-definition distortion-free float glass.',
      fullDescription: 'Hand-rolled architectural brass with heavy-gauge Z-bar cleat wall mounting. Made to order in small workshop batches.',
      materialDescription: 'Solid Architect Brass, HD Silvered Float Glass, Engineered Wood Backing',
      dimensions: '600mm W × 900mm H × 30mm D',
      weightGrams: 8500,
      lengthMm: 980,
      widthMm: 680,
      heightMm: 80,
      isReturnable: false,
      returnWindowDays: null,
      initialStock: 0,
      variantTitle: 'Warm Aged Patina Brass',
    },
    {
      slug: 'strata-modular-desk-organiser',
      sku: 'TAV-DSK-003',
      title: 'Strata Modular Desk Organiser',
      categorySlug: 'desk-workspace',
      primaryMode: PurchaseMode.READY_STOCK,
      taxInclusivePrice: 8200.0,
      shortDescription: 'Weighted cast composite stone with integrated anodised bronze pen channels.',
      fullDescription: 'Substantial 1.8kg weighted base prevents desk slippage with natural wool felt smartphone tray and micro-catchment.',
      materialDescription: 'Cast Mineral Stone, Anodised Bronze Aluminium, Natural Wool Felt',
      dimensions: '280mm L × 140mm W × 45mm H',
      weightGrams: 1800,
      lengthMm: 310,
      widthMm: 170,
      heightMm: 70,
      isReturnable: false,
      returnWindowDays: null,
      initialStock: 14,
      variantTitle: 'Warm Charcoal Stone / Bronze',
    },
    {
      slug: 'aether-kinetic-desk-lamp',
      sku: 'TAV-LGT-004',
      title: 'Aether Architectural Desk Lamp',
      categorySlug: 'lighting-ambience',
      primaryMode: PurchaseMode.MADE_TO_ORDER,
      taxInclusivePrice: 42500.0,
      shortDescription: 'Counterbalanced articulated arm in gunmetal stainless steel with warm 2700K LED optic engine.',
      fullDescription: 'Fluid counterbalance movement with zero spring backlash, precision rotary dimmer switch, and CRI 95+ warm architectural light.',
      materialDescription: 'Gunmetal Stainless Steel, Counterweight Brass, High-CRI LED 2700K',
      dimensions: '520mm Reach × 480mm Max Height',
      weightGrams: 4200,
      lengthMm: 560,
      widthMm: 240,
      heightMm: 180,
      isReturnable: false,
      returnWindowDays: null,
      initialStock: 0,
      variantTitle: 'Gunmetal & Brushed Brass',
    },
    {
      slug: 'torus-sculptural-brass-key-tag',
      sku: 'TAV-ACC-005',
      title: 'Torus Sculptural Brass Key Tag',
      categorySlug: 'personal-accessories',
      primaryMode: PurchaseMode.READY_STOCK,
      taxInclusivePrice: 3400.0,
      shortDescription: 'Hand-finished lost-wax cast solid brass pocket talisman with screw-locking titanium wire.',
      fullDescription: 'Smooth organic contour shaped for tactile pocket carry with heavy-duty threaded Grade 5 titanium cable.',
      materialDescription: 'Cast Solid Brass, Grade 5 Titanium Wire',
      dimensions: '42mm Dia × 8mm Thickness',
      weightGrams: 140,
      lengthMm: 80,
      widthMm: 80,
      heightMm: 25,
      isReturnable: false,
      returnWindowDays: null,
      initialStock: 25,
      variantTitle: 'Natural Raw Brushed Brass',
    },
    {
      slug: 'oblique-kinetic-wind-sculpture',
      sku: 'TAV-ART-006',
      title: 'Oblique Site-Specific Art Sculpture',
      categorySlug: 'art-collectibles',
      primaryMode: PurchaseMode.QUOTE_ONLY,
      taxInclusivePrice: 120000.0,
      shortDescription: 'Bespoke balance-weighted kinetic sculpture for indoor lobbies or private courtyards.',
      fullDescription: 'Custom architectural sizing tailored to client floorplans with independently numbered and studio-signed edition certificate.',
      materialDescription: 'Hand-Beaten Bronze, Black Granite Plinth, Precision Ceramic Bearings',
      dimensions: 'Custom Scaled (1.2m to 2.4m Height Options)',
      weightGrams: 35000,
      lengthMm: 1500,
      widthMm: 800,
      heightMm: 800,
      isReturnable: false,
      returnWindowDays: null,
      initialStock: 0,
      variantTitle: 'Hand-Beaten Patinated Bronze',
    },
  ];

  for (const item of products) {
    const categoryId = categoryMap.get(item.categorySlug)!;

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        taxInclusivePrice: item.taxInclusivePrice,
        primaryMode: item.primaryMode,
      },
      create: {
        slug: item.slug,
        sku: item.sku,
        title: item.title,
        shortDescription: item.shortDescription,
        fullDescription: item.fullDescription,
        materialDescription: item.materialDescription,
        dimensions: item.dimensions,
        weightGrams: item.weightGrams,
        lengthMm: item.lengthMm,
        widthMm: item.widthMm,
        heightMm: item.heightMm,
        primaryMode: item.primaryMode,
        taxInclusivePrice: item.taxInclusivePrice,
        isReturnable: item.isReturnable,
        returnWindowDays: item.returnWindowDays,
        categoryId,
      },
    });

    // Create default variant
    const variantSku = `${item.sku}-VAR1`;
    const variant = await prisma.productVariant.upsert({
      where: { sku: variantSku },
      update: {},
      create: {
        productId: product.id,
        sku: variantSku,
        title: item.variantTitle,
        materialFinish: item.materialDescription,
        taxInclusivePrice: item.taxInclusivePrice,
      },
    });

    // Create inventory ledger
    await prisma.inventoryLedger.upsert({
      where: { variantId: variant.id },
      update: {
        availableStock: item.initialStock,
      },
      create: {
        variantId: variant.id,
        availableStock: item.initialStock,
        reservedStock: 0,
        lowStockThreshold: 2,
      },
    });
  }

  console.log('Database seeding successfully completed.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

