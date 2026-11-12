import { PrismaClient, PurchaseMode } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Tavistra Commerce Engine database...');

  // 1. Seed Shipping Zones (TAV-03 & TAV-09: Delhi Origin 110062/110019/110074)
  console.log('Seeding Shipping Zones & PIN Code mappings (Delhi Origin)...');

  const zoneA = await prisma.shippingZone.upsert({
    where: { code: 'ZONE_A' },
    update: {},
    create: {
      code: 'ZONE_A',
      name: 'Zone A (Delhi NCR / Local)',
      description: 'Local Delhi NCR white-glove direct carrier transit.',
      baseWeightGrams: 2000,
      baseRate: 250.0,
      perAdditionalKgRate: 50.0,
      estimatedDaysMin: 1,
      estimatedDaysMax: 2,
      pincodeRanges: {
        create: [
          { stateName: 'Delhi', pincodePrefix: '11', isServiceable: true },
          { stateName: 'Haryana', pincodePrefix: '121', isServiceable: true }, // Faridabad
          { stateName: 'Haryana', pincodePrefix: '122', isServiceable: true }, // Gurugram
          { stateName: 'Uttar Pradesh', pincodePrefix: '201', isServiceable: true }, // Noida/Ghaziabad
        ],
      },
    },
  });

  const zoneB = await prisma.shippingZone.upsert({
    where: { code: 'ZONE_B' },
    update: {},
    create: {
      code: 'ZONE_B',
      name: 'Zone B (Regional / North & Nearby)',
      description: 'Northern & nearby regional states (HR, PB, CH, RJ, UP, HP).',
      baseWeightGrams: 2000,
      baseRate: 500.0,
      perAdditionalKgRate: 80.0,
      estimatedDaysMin: 2,
      estimatedDaysMax: 4,
      pincodeRanges: {
        create: [
          { stateName: 'Punjab', pincodePrefix: '14', isServiceable: true },
          { stateName: 'Chandigarh', pincodePrefix: '16', isServiceable: true },
          { stateName: 'Rajasthan', pincodePrefix: '30', isServiceable: true },
          { stateName: 'Uttar Pradesh', pincodePrefix: '22', isServiceable: true },
          { stateName: 'Himachal Pradesh', pincodePrefix: '17', isServiceable: true },
        ],
      },
    },
  });

  const zoneC = await prisma.shippingZone.upsert({
    where: { code: 'ZONE_C' },
    update: {},
    create: {
      code: 'ZONE_C',
      name: 'Zone C (National Metros / Central, West & South)',
      description: 'Major national economic hubs (MH, KA, TS, TN, WB, GJ).',
      baseWeightGrams: 2000,
      baseRate: 1000.0,
      perAdditionalKgRate: 120.0,
      estimatedDaysMin: 3,
      estimatedDaysMax: 6,
      pincodeRanges: {
        create: [
          { stateName: 'Maharashtra', pincodePrefix: '40', isServiceable: true },
          { stateName: 'Karnataka', pincodePrefix: '56', isServiceable: true },
          { stateName: 'Telangana', pincodePrefix: '50', isServiceable: true },
          { stateName: 'Tamil Nadu', pincodePrefix: '60', isServiceable: true },
          { stateName: 'West Bengal', pincodePrefix: '70', isServiceable: true },
          { stateName: 'Gujarat', pincodePrefix: '38', isServiceable: true },
        ],
      },
    },
  });

  const zoneD = await prisma.shippingZone.upsert({
    where: { code: 'ZONE_D' },
    update: {},
    create: {
      code: 'ZONE_D',
      name: 'Zone D (Rest of India / Tier 2 & 3)',
      description: 'Rest of India towns and regional districts (MH/MP/CG/OR/BR/JH/KL/AP).',
      baseWeightGrams: 2000,
      baseRate: 1500.0,
      perAdditionalKgRate: 180.0,
      estimatedDaysMin: 5,
      estimatedDaysMax: 8,
      pincodeRanges: {
        create: [
          { stateName: 'Madhya Pradesh', cityLabel: 'Bhopal / Indore', pincodePrefix: '46', isServiceable: true },
          { stateName: 'Kerala', cityLabel: 'Kochi / Thiruvananthapuram', pincodePrefix: '68', isServiceable: true },
          { stateName: 'Odisha', cityLabel: 'Bhubaneswar', pincodePrefix: '75', isServiceable: true },
        ],
      },
    },
  });

  const zoneE = await prisma.shippingZone.upsert({
    where: { code: 'ZONE_E' },
    update: {},
    create: {
      code: 'ZONE_E',
      name: 'Zone E (Special & Remote Terrain)',
      description: 'J&K, Ladakh, Assam, North-East, and Island territories.',
      baseWeightGrams: 2000,
      baseRate: 2000.0,
      perAdditionalKgRate: 250.0,
      estimatedDaysMin: 7,
      estimatedDaysMax: 12,
      pincodeRanges: {
        create: [
          { stateName: 'Jammu & Kashmir', cityLabel: 'Jammu Region', pincodePrefix: '18', isServiceable: true },
          { stateName: 'Jammu & Kashmir', cityLabel: 'Kashmir Valley', pincodePrefix: '19', isServiceable: true },
          {
            stateName: 'Ladakh',
            cityLabel: 'Leh',
            pincodePrefix: '194',
            isServiceable: false,
            unserviceableReason: 'High-altitude remote terrain restricted for fragile gallery consignments.',
          },
          { stateName: 'Assam', cityLabel: 'Guwahati / Upper Assam', pincodePrefix: '78', isServiceable: true },
          { stateName: 'North-East Frontier', cityLabel: 'Arunachal / Manipur / Meghalaya', pincodePrefix: '79', isServiceable: true },
        ],
      },
    },
  });

  console.log(`Zones seeded: ${zoneA.code}, ${zoneB.code}, ${zoneC.code}, ${zoneD.code}, ${zoneE.code}`);

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

  // 4. Seed Operational Test Users & Orders
  console.log('Seeding Operational Test Users, Orders & Financial Ledgers...');

  const user1 = await prisma.user.upsert({
    where: { email: 'arjun.mehta@studio.in' },
    update: {},
    create: {
      email: 'arjun.mehta@studio.in',
      name: 'Arjun Mehta',
      phone: '+91 98101 23456',
    },
  });

  const address1 = await prisma.customerAddress.create({
    data: {
      userId: user1.id,
      fullName: 'Arjun Mehta',
      phone: '+91 98101 23456',
      addressLine1: 'B-42 Defence Colony, Ring Road',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110024',
      isDefault: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'vikramaditya@studiovishnu.in' },
    update: {},
    create: {
      email: 'vikramaditya@studiovishnu.in',
      name: 'Ar. Vikramaditya Sharma',
      phone: '+91 98765 43210',
    },
  });

  const address2 = await prisma.customerAddress.create({
    data: {
      userId: user2.id,
      fullName: 'Ar. Vikramaditya Sharma',
      phone: '+91 98765 43210',
      addressLine1: '14 Barakhamba Road, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      isDefault: true,
    },
  });

  const productClock = await prisma.product.findUnique({ where: { slug: 'monolith-minimalist-wall-clock' } });
  const productMirror = await prisma.product.findUnique({ where: { slug: 'arc-solid-brass-wall-mirror' } });

  // Order 1: Ready Stock - Dispatched
  await prisma.order.upsert({
    where: { orderNumber: 'TAV-RS-2026-1001' },
    update: {},
    create: {
      orderNumber: 'TAV-RS-2026-1001',
      userId: user1.id,
      customerEmail: user1.email,
      customerPhone: user1.phone,
      shippingAddressId: address1.id,
      purchaseMode: PurchaseMode.READY_STOCK,
      itemsSubtotal: 6997.0,
      shippingCharge: 500.0,
      totalAmount: 7497.0,
      requiredAdvanceAmount: 7497.0,
      amountPaid: 7497.0,
      balanceAmount: 0.0,
      status: 'DISPATCHED',
      confirmedAt: new Date(Date.now() - 4 * 86400000),
      dispatchedAt: new Date(Date.now() - 1 * 86400000),
      carrierName: 'Blue Dart Fragile Surface',
      trackingNumber: 'BD-DEL-89472911',
      items: {
        create: [
          {
            productId: productClock!.id,
            quantity: 1,
            unitPrice: 6997.0,
            subtotal: 6997.0,
          },
        ],
      },
      payments: {
        create: {
          paymentType: 'FULL_PAYMENT',
          amount: 7497.0,
          status: 'COMPLETED',
          gateway: 'PHONEPE',
          gatewayTransactionId: 'TXN-BD-7497-1001',
          verifiedAt: new Date(Date.now() - 4 * 86400000),
        },
      },
    },
  });

  // Order 2: Made to Order - 7-Day Grace Active, 25% paid, 75% due
  await prisma.order.upsert({
    where: { orderNumber: 'TAV-MTO-2026-2002' },
    update: {},
    create: {
      orderNumber: 'TAV-MTO-2026-2002',
      userId: user2.id,
      customerEmail: user2.email,
      customerPhone: user2.phone,
      shippingAddressId: address2.id,
      purchaseMode: PurchaseMode.MADE_TO_ORDER,
      itemsSubtotal: 28500.0,
      shippingCharge: 1500.0,
      totalAmount: 30000.0,
      requiredAdvanceAmount: 7500.0,
      amountPaid: 7500.0,
      balanceAmount: 22500.0,
      status: 'CONFIRMED',
      confirmedAt: new Date(Date.now() - 3 * 86400000), // Day 3 of 7
      carrierName: 'Safeexpress Caged Heavy Freight',
      items: {
        create: [
          {
            productId: productMirror!.id,
            quantity: 1,
            unitPrice: 28500.0,
            subtotal: 28500.0,
          },
        ],
      },
      payments: {
        create: {
          paymentType: 'ADVANCE_25',
          amount: 7500.0,
          status: 'COMPLETED',
          gateway: 'PHONEPE',
          gatewayTransactionId: 'TXN-MTO-7500-2002',
          verifiedAt: new Date(Date.now() - 3 * 86400000),
        },
      },
    },
  });

  // Order 3: Made to Order - Crafting in workshop with QC Photos ready
  await prisma.order.upsert({
    where: { orderNumber: 'TAV-MTO-2026-2004' },
    update: {},
    create: {
      orderNumber: 'TAV-MTO-2026-2004',
      userId: user2.id,
      customerEmail: user2.email,
      customerPhone: user2.phone,
      shippingAddressId: address2.id,
      purchaseMode: PurchaseMode.MADE_TO_ORDER,
      itemsSubtotal: 30500.0,
      shippingCharge: 1500.0,
      totalAmount: 32000.0,
      requiredAdvanceAmount: 8000.0,
      amountPaid: 8000.0,
      balanceAmount: 24000.0,
      status: 'PRODUCTION_COMPLETED',
      confirmedAt: new Date(Date.now() - 14 * 86400000),
      productionStartedAt: new Date(Date.now() - 6 * 86400000),
      productionCompletedAt: new Date(Date.now() - 1 * 86400000),
      carrierName: 'Blue Dart Fragile Surface',
      qcNotes: 'Hand-beveled edges verified. Brass brushed patina uniform and sealed with aerospace microcrystalline wax.',
      qcImages: JSON.stringify([
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
      ]),
      items: {
        create: [
          {
            productId: productMirror!.id,
            quantity: 1,
            unitPrice: 30500.0,
            subtotal: 30500.0,
          },
        ],
      },
      payments: {
        create: {
          paymentType: 'ADVANCE_25',
          amount: 8000.0,
          status: 'COMPLETED',
          gateway: 'PHONEPE',
          gatewayTransactionId: 'TXN-QC-8000-2004',
          verifiedAt: new Date(Date.now() - 14 * 86400000),
        },
      },
    },
  });

  // 5. Seed Support Tickets
  console.log('Seeding Support Tickets & Messages...');
  const ticket1 = await prisma.supportTicket.upsert({
    where: { ticketNumber: 'TCK-2026-101' },
    update: {},
    create: {
      ticketNumber: 'TCK-2026-101',
      orderNumber: 'TAV-MTO-2026-2002',
      customerName: 'Ar. Vikramaditya Sharma',
      email: 'vikramaditya@studiovishnu.in',
      phone: '+91 98765 43210',
      subject: 'Inquiry regarding brass edge finish variation',
      category: 'SPEC_ALTERATION',
      priority: 'HIGH',
      status: 'OPEN',
      messages: {
        create: [
          {
            sender: 'CUSTOMER',
            authorName: 'Ar. Vikramaditya Sharma',
            text: 'Greetings. For our Arc Solid Brass Wall Mirror order, can we request a slightly deeper brushed patina on the outer rim to match our site hardware?',
          },
        ],
      },
    },
  });

  // 6. Seed Bulk Inquiries
  console.log('Seeding Bulk Inquiries...');
  await prisma.bulkInquiry.upsert({
    where: { inquiryNumber: 'INQ-2026-801' },
    update: {},
    create: {
      inquiryNumber: 'INQ-2026-801',
      clientName: 'Sunita Singhania',
      practiceOrStudio: 'Studio Lotus Architects',
      email: 'procurement@studiolotus.in',
      phone: '+91 98110 55432',
      destinationCity: 'New Delhi',
      destinationPincode: '110049',
      requestedEditions: 'Monolith Minimalist Wall Clock (Custom 600mm variant)',
      quantityUnits: 14,
      specifications: 'Custom 600mm oversized architectural wall clocks for private boutique hotel lobby suites. Need unified courier transit and staggered delivery.',
      status: 'NEW',
    },
  });

  // 7. Seed System Governance & Hiatus Settings
  console.log('Seeding System Settings...');
  const settings = [
    {
      key: 'MAINTENANCE_MODE',
      value: 'false',
      description: 'Global maintenance mode toggle. When true, checkout is frozen.',
    },
    {
      key: 'STUDIO_HIATUS',
      value: 'false',
      description: 'Studio hiatus toggle for workshop maintenance periods.',
    },
    {
      key: 'ANNOUNCEMENT_BANNER',
      value: 'Studio craftsmanship running normally. All editions dispatched on schedule.',
      description: 'Top luxury notification banner displayed on storefront.',
    },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { description: s.description },
      create: s,
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

