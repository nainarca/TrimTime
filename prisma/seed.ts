/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   TRIMTIME — Comprehensive Demo Seed                        ║
 * ║   Shop: Elite Barber Lounge, Chennai                        ║
 * ║   Run:  npm run prisma:seed  (or npx prisma db seed)        ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  PrismaClient,
  QueueStatus,
  AppointmentStatus,
  BarberStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// ── Avatar helper ────────────────────────────────────────────────
const avatar = (name: string, bg = '6366f1') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=200&bold=true`;

// ── Fixed seed IDs (stable across re-runs) ───────────────────────
const IDS = {
  // Shop
  SHOP:   'seed-elite-shop-001',
  BRANCH: 'seed-elite-branch-001',

  // Services
  SVC_HAIRCUT:  'seed-elite-svc-haircut',
  SVC_BEARD:    'seed-elite-svc-beard',
  SVC_COMBO:    'seed-elite-svc-combo',
  SVC_SPA:      'seed-elite-svc-spa',

  // Barber users
  U_ARJUN:  'seed-elite-u-arjun',
  U_KARTHIK:'seed-elite-u-karthik',
  U_RAHIM:  'seed-elite-u-rahim',
  U_VIJAY:  'seed-elite-u-vijay',

  // Customer users
  U_SURESH:  'seed-elite-c-suresh',
  U_RAMESH:  'seed-elite-c-ramesh',
  U_PRIYA:   'seed-elite-c-priya',
  U_ANAND:   'seed-elite-c-anand',
  U_KAVITHA: 'seed-elite-c-kavitha',
  U_RAVI:    'seed-elite-c-ravi',
  U_DEEPA:   'seed-elite-c-deepa',
  U_MURUGAN: 'seed-elite-c-murugan',
  U_LAKSHMI: 'seed-elite-c-lakshmi',
  U_SELVAM:  'seed-elite-c-selvam',
  U_NITHYA:  'seed-elite-c-nithya',
  U_BALAJI:  'seed-elite-c-balaji',
  U_KISHORE: 'seed-elite-c-kishore',
  U_MEERA:   'seed-elite-c-meera',
};

// ── Time helpers ─────────────────────────────────────────────────
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);
const hoursAgo   = (h: number) => new Date(Date.now() - h * 3_600_000);
const daysAgo    = (d: number) => new Date(Date.now() - d * 86_400_000);
const hoursFrom  = (h: number) => new Date(Date.now() + h * 3_600_000);
const daysFrom   = (d: number) => new Date(Date.now() + d * 86_400_000);

// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱  Seeding Elite Barber Lounge demo data…\n');

  // ══════════════════════════════════════════════════════════════
  // 1. Subscription Plans
  // ══════════════════════════════════════════════════════════════
  console.log('📦  Plans…');

  const freePlan = await prisma.subscriptionPlan.upsert({
    where:  { name: 'Free' },
    update: {},
    create: {
      name: 'Free', priceMonthly: 0,
      maxBarbers: 1, maxDailyQueueEntries: 50,
      analyticsRetentionDays: 7, smsCreditsMonthly: 0,
      hasAppointments: false, hasAnalytics: false,
      hasMultiBranch: false, hasApiAccess: false,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where:  { name: 'Pro' },
    update: {},
    create: {
      name: 'Pro', priceMonthly: 1999,
      maxBarbers: 10, maxDailyQueueEntries: 500,
      analyticsRetentionDays: 90, smsCreditsMonthly: 200,
      hasAppointments: true, hasAnalytics: true,
      hasMultiBranch: false, hasApiAccess: false,
    },
  });

  await prisma.subscriptionPlan.upsert({
    where:  { name: 'Enterprise' },
    update: {},
    create: {
      name: 'Enterprise', priceMonthly: 4999,
      maxBarbers: 999, maxDailyQueueEntries: 9999,
      analyticsRetentionDays: 365, smsCreditsMonthly: 1000,
      hasAppointments: true, hasAnalytics: true,
      hasMultiBranch: true, hasApiAccess: true,
    },
  });

  console.log('  ✅  Plans ready\n');

  // ══════════════════════════════════════════════════════════════
  // 2. Shop Owner User
  // ══════════════════════════════════════════════════════════════
  console.log('👤  Shop owner…');

  const ownerUser = await prisma.user.upsert({
    where:  { email: 'owner@elitebarber.in' },
    update: { name: 'Ganesh Kumar', isVerified: true, isActive: true },
    create: {
      email: 'owner@elitebarber.in',
      phone: '+919876500001',
      name:  'Ganesh Kumar',
      avatarUrl: avatar('Ganesh Kumar', '0f172a'),
      isVerified: true,
      isActive:   true,
    },
  });

  const adminDemo = await prisma.user.upsert({
    where:  { email: 'admin@elitebarber.in' },
    update: { name: 'Shop Admin', isVerified: true, isActive: true },
    create: {
      email: 'admin@elitebarber.in',
      phone: '+919876500000',
      name:  'Shop Admin',
      avatarUrl: avatar('Admin', '1e293b'),
      isVerified: true,
      isActive:   true,
    },
  });

  // ══════════════════════════════════════════════════════════════
  // 3. Elite Barber Lounge Shop
  // ══════════════════════════════════════════════════════════════
  console.log('🏪  Elite Barber Lounge shop…');

  const shop = await prisma.shop.upsert({
    where:  { slug: 'elite-barber-lounge' },
    update: {
      name: 'Elite Barber Lounge',
      description: 'Premium grooming for the modern gentleman. Walk-in & appointments welcome.',
      isVerified: true,
      isActive:   true,
    },
    create: {
      id:          IDS.SHOP,
      ownerId:     ownerUser.id,
      name:        'Elite Barber Lounge',
      slug:        'elite-barber-lounge',
      description: 'Premium grooming for the modern gentleman. Walk-in & appointments welcome.',
      phone:       '+914422001234',
      email:       'hello@elitebarber.in',
      country:     'IN',
      timezone:    'Asia/Kolkata',
      currency:    'INR',
      isActive:    true,
      isVerified:  true,
    },
  });

  await prisma.userRoleAssignment.upsert({
    where: { unique_user_role_shop: { userId: ownerUser.id, role: 'SHOP_OWNER', shopId: shop.id } },
    update: {},
    create: { userId: ownerUser.id, role: 'SHOP_OWNER', shopId: shop.id },
  });

  await prisma.userRoleAssignment.upsert({
    where: { unique_user_role_shop: { userId: adminDemo.id, role: 'ADMIN', shopId: shop.id } },
    update: {},
    create: { userId: adminDemo.id, role: 'ADMIN', shopId: shop.id },
  });

  // ══════════════════════════════════════════════════════════════
  // 4. Main Branch — Anna Nagar, Chennai
  // ══════════════════════════════════════════════════════════════
  console.log('📍  Main branch…');

  const branch = await prisma.shopBranch.upsert({
    where:  { id: IDS.BRANCH },
    update: { isActive: true },
    create: {
      id:       IDS.BRANCH,
      shopId:   shop.id,
      name:     'Main Branch',
      address:  '42, 2nd Avenue, Anna Nagar',
      city:     'Chennai',
      isMain:   true,
      isActive: true,
      latitude:  13.0850,
      longitude: 80.2101,
    },
  });

  // Operating hours: Mon–Sun 9 AM – 9 PM (Sunday closed)
  for (let day = 0; day <= 6; day++) {
    await prisma.operatingHour.upsert({
      where:  { unique_branch_day: { branchId: branch.id, dayOfWeek: day } },
      update: {},
      create: {
        branchId:  branch.id,
        dayOfWeek: day,
        openTime:  '09:00',
        closeTime: '21:00',
        isClosed:  day === 0, // Sunday closed
      },
    });
  }

  // ══════════════════════════════════════════════════════════════
  // 5. Subscription
  // ══════════════════════════════════════════════════════════════
  const now       = new Date();
  const trialEnd  = daysFrom(14);
  const periodEnd = daysFrom(30);

  await prisma.subscription.upsert({
    where:  { shopId: shop.id },
    update: {},
    create: {
      shopId:             shop.id,
      planId:             proPlan.id,
      status:             'TRIALING',
      currentPeriodStart: now,
      currentPeriodEnd:   periodEnd,
      trialEndsAt:        trialEnd,
    },
  });

  // ══════════════════════════════════════════════════════════════
  // 6. Services (INR)
  // ══════════════════════════════════════════════════════════════
  console.log('✂️   Services…');

  const svcHaircut = await prisma.service.upsert({
    where:  { id: IDS.SVC_HAIRCUT },
    update: { name: 'Haircut', price: 200, durationMins: 20, currency: 'INR', isActive: true },
    create: {
      id: IDS.SVC_HAIRCUT, shopId: shop.id,
      name: 'Haircut', description: 'Classic precision cut — scissor or clipper finish',
      durationMins: 20, price: 200, currency: 'INR', displayOrder: 1,
    },
  });

  const svcBeard = await prisma.service.upsert({
    where:  { id: IDS.SVC_BEARD },
    update: { name: 'Beard Trim', price: 100, durationMins: 10, currency: 'INR', isActive: true },
    create: {
      id: IDS.SVC_BEARD, shopId: shop.id,
      name: 'Beard Trim', description: 'Shape, trim & clean-up with straight razor finish',
      durationMins: 10, price: 100, currency: 'INR', displayOrder: 2,
    },
  });

  const svcCombo = await prisma.service.upsert({
    where:  { id: IDS.SVC_COMBO },
    update: { name: 'Haircut + Beard', price: 250, durationMins: 30, currency: 'INR', isActive: true },
    create: {
      id: IDS.SVC_COMBO, shopId: shop.id,
      name: 'Haircut + Beard', description: 'Complete grooming combo — cut & beard together',
      durationMins: 30, price: 250, currency: 'INR', displayOrder: 3,
    },
  });

  const svcSpa = await prisma.service.upsert({
    where:  { id: IDS.SVC_SPA },
    update: { name: 'Hair Spa', price: 500, durationMins: 45, currency: 'INR', isActive: true },
    create: {
      id: IDS.SVC_SPA, shopId: shop.id,
      name: 'Hair Spa', description: 'Deep conditioning treatment — nourish & revitalise',
      durationMins: 45, price: 500, currency: 'INR', displayOrder: 4,
    },
  });

  console.log('  ✅  4 services ready\n');

  // ══════════════════════════════════════════════════════════════
  // 7. Barbers
  // ══════════════════════════════════════════════════════════════
  console.log('💈  Barbers…');

  const barberDefs = [
    {
      userId: IDS.U_ARJUN,
      email:  'arjun@elitebarber.in',
      phone:  '+919876500011',
      name:   'Arjun Kumar',
      display:'Arjun',
      bio:    '8 years experience · Haircut Specialist · Fade & texture expert',
      avatar: avatar('Arjun Kumar', '6366f1'),
      status: 'AVAILABLE' as BarberStatus,
      accepting: true,
      avgMins: 20,
    },
    {
      userId: IDS.U_KARTHIK,
      email:  'karthik@elitebarber.in',
      phone:  '+919876500012',
      name:   'Karthik Raja',
      display:'Karthik',
      bio:    '6 years experience · Beard & Styling Specialist · Hot shave expert',
      avatar: avatar('Karthik Raja', '10b981'),
      status: 'AVAILABLE' as BarberStatus,
      accepting: true,
      avgMins: 15,
    },
    {
      userId: IDS.U_RAHIM,
      email:  'rahim@elitebarber.in',
      phone:  '+919876500013',
      name:   'Rahim Sheikh',
      display:'Rahim',
      bio:    '12 years experience · Senior Barber · Traditional & modern cuts',
      avatar: avatar('Rahim Sheikh', 'f59e0b'),
      status: 'BUSY' as BarberStatus,
      accepting: true,
      avgMins: 25,
    },
    {
      userId: IDS.U_VIJAY,
      email:  'vijay@elitebarber.in',
      phone:  '+919876500014',
      name:   'Vijay Kumar',
      display:'Vijay',
      bio:    '5 years experience · Kids Specialist · Patient & gentle with children',
      avatar: avatar('Vijay Kumar', 'ef4444'),
      status: 'AVAILABLE' as BarberStatus,
      accepting: true,
      avgMins: 20,
    },
  ];

  const barbers: Record<string, { id: string }> = {};

  for (const def of barberDefs) {
    const user = await prisma.user.upsert({
      where:  { id: def.userId },
      update: { name: def.name, avatarUrl: def.avatar, isVerified: true },
      create: {
        id: def.userId, name: def.name,
        email: def.email, phone: def.phone,
        avatarUrl: def.avatar,
        isVerified: true, isActive: true,
      },
    });

    const barber = await prisma.barber.upsert({
      where:  { userId: user.id },
      update: {
        displayName: def.display, bio: def.bio,
        avatarUrl: def.avatar,
        currentStatus: def.status,
        queueAccepting: def.accepting,
        avgServiceDurationMins: def.avgMins,
        isActive: true,
      },
      create: {
        userId: user.id, shopId: shop.id, branchId: branch.id,
        displayName: def.display, bio: def.bio,
        avatarUrl: def.avatar,
        avgServiceDurationMins: def.avgMins,
        currentStatus: def.status,
        queueAccepting: def.accepting,
        maxQueueSize: 20, isActive: true,
      },
    });

    barbers[def.display] = barber;

    await prisma.userRoleAssignment.upsert({
      where: { unique_user_role_shop: { userId: user.id, role: 'BARBER', shopId: shop.id } },
      update: {},
      create: { userId: user.id, role: 'BARBER', shopId: shop.id },
    });

    // Assign all services to each barber
    for (const svc of [svcHaircut, svcBeard, svcCombo, svcSpa]) {
      await prisma.barberService.upsert({
        where:  { unique_barber_service: { barberId: barber.id, serviceId: svc.id } },
        update: {},
        create: { barberId: barber.id, serviceId: svc.id, isActive: true },
      });
    }
  }

  const [bArjun, bKarthik, bRahim, bVijay] = [
    barbers['Arjun'],
    barbers['Karthik'],
    barbers['Rahim'],
    barbers['Vijay'],
  ];

  console.log('  ✅  4 barbers ready\n');

  // ══════════════════════════════════════════════════════════════
  // 8. Customers (12 realistic Indian profiles)
  // ══════════════════════════════════════════════════════════════
  console.log('👥  Customers…');

  const customerDefs = [
    { id: IDS.U_SURESH,  name: 'Suresh Babu',       phone: '+919876501001', email: 'suresh@demo.in',  age: 35, gender: 'M', addr: '12, T. Nagar, Chennai',      pin: '600017' },
    { id: IDS.U_RAMESH,  name: 'Ramesh Kumar',       phone: '+919876501002', email: 'ramesh@demo.in',  age: 28, gender: 'M', addr: '5, Adyar, Chennai',           pin: '600020' },
    { id: IDS.U_PRIYA,   name: 'Priya Devi',         phone: '+919876501003', email: 'priya@demo.in',   age: 24, gender: 'F', addr: '88, Velachery, Chennai',      pin: '600042' },
    { id: IDS.U_ANAND,   name: 'Anand Raj',          phone: '+919876501004', email: 'anand@demo.in',   age: 42, gender: 'M', addr: '3, Anna Nagar, Chennai',      pin: '600040' },
    { id: IDS.U_KAVITHA, name: 'Kavitha Subramani',  phone: '+919876501005', email: 'kavitha@demo.in', age: 31, gender: 'F', addr: '17, Porur, Chennai',          pin: '600116' },
    { id: IDS.U_RAVI,    name: 'Ravi Shankar',       phone: '+919876501006', email: 'ravi@demo.in',    age: 38, gender: 'M', addr: '9, Tambaram, Chennai',        pin: '600045' },
    { id: IDS.U_DEEPA,   name: 'Deepa Menon',        phone: '+919876501007', email: 'deepa@demo.in',   age: 26, gender: 'F', addr: '21, Nungambakkam, Chennai',   pin: '600034' },
    { id: IDS.U_MURUGAN, name: 'Murugan Pillai',     phone: '+919876501008', email: 'murugan@demo.in', age: 45, gender: 'M', addr: '64, Guindy, Chennai',         pin: '600032' },
    { id: IDS.U_LAKSHMI, name: 'Lakshmi Narayanan',  phone: '+919876501009', email: 'lakshmi@demo.in', age: 33, gender: 'F', addr: '7, Mylapore, Chennai',        pin: '600004' },
    { id: IDS.U_SELVAM,  name: 'Selvam Rajendran',   phone: '+919876501010', email: 'selvam@demo.in',  age: 29, gender: 'M', addr: '11, Chromepet, Chennai',      pin: '600044' },
    { id: IDS.U_NITHYA,  name: 'Nithya Krishnan',    phone: '+919876501011', email: 'nithya@demo.in',  age: 22, gender: 'F', addr: '30, Medavakkam, Chennai',     pin: '600100' },
    { id: IDS.U_BALAJI,  name: 'Balaji Venkatesh',   phone: '+919876501012', email: 'balaji@demo.in',  age: 36, gender: 'M', addr: '55, Sholinganallur, Chennai', pin: '600119' },
    { id: IDS.U_KISHORE, name: 'Kishore Anand',      phone: '+919876502001', email: 'kishore@demo.in', age: 27, gender: 'M', addr: '8, OMR, Chennai',             pin: '600097' },
    { id: IDS.U_MEERA,   name: 'Meera Iyer',         phone: '+919876502002', email: 'meera@demo.in',   age: 30, gender: 'F', addr: '14, Besant Nagar, Chennai',   pin: '600090' },
  ];

  const customers: Record<string, { id: string; name: string; phone: string; age: number; gender: string; addr: string; pin: string }> = {};

  for (const c of customerDefs) {
    const user = await prisma.user.upsert({
      where:  { id: c.id },
      update: { name: c.name, isVerified: true, isActive: true },
      create: {
        id: c.id, name: c.name,
        phone: c.phone, email: c.email,
        avatarUrl: avatar(c.name, '64748b'),
        isVerified: true, isActive: true,
      },
    });
    customers[c.name] = { id: user.id, name: c.name, phone: c.phone, age: c.age, gender: c.gender, addr: c.addr, pin: c.pin };
  }

  console.log('  ✅  14 customers ready\n');

  // ══════════════════════════════════════════════════════════════
  // 9. Clear previous demo queue / appointments / reviews
  //    (safe re-run: wipe-and-recreate for this shop only)
  // ══════════════════════════════════════════════════════════════
  console.log('🧹  Clearing previous demo queue data…');

  await prisma.review.deleteMany({ where: { shopId: shop.id } });
  await prisma.queueEntry.deleteMany({ where: { shopId: shop.id } });
  await prisma.appointment.deleteMany({ where: { shopId: shop.id } });
  await prisma.analyticsSnapshot.deleteMany({ where: { shopId: shop.id } });
  await prisma.notificationLog.deleteMany({
    where: { eventType: { in: ['payment.mock.upi', 'payment.mock.cash', 'payment.mock.pending'] } },
  });

  console.log('  ✅  Cleared\n');

  // ══════════════════════════════════════════════════════════════
  // 10. Queue Entries (live demo queue — looks busy)
  // ══════════════════════════════════════════════════════════════
  console.log('🔢  Queue entries…');

  const notes = (c: typeof customerDefs[number]) =>
    JSON.stringify({ age: c.age, gender: c.gender, address: c.addr, pincode: c.pin });

  // ── SERVED (3 completed earlier today) ──────────────────────
  const qServed1 = await prisma.queueEntry.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId: bArjun.id,
    customerId: customers['Suresh Babu'].id,
    serviceId: svcHaircut.id,
    ticketNumber: 1, ticketDisplay: 'A001',
    entryType: 'WALK_IN', priority: 0,
    status: QueueStatus.SERVED, position: 0,
    estimatedWaitMins: 0,
    joinedAt:  hoursAgo(3),
    calledAt:  hoursAgo(3),
    servingAt: hoursAgo(3),
    servedAt:  new Date(hoursAgo(3).getTime() + 22 * 60_000),
    notes: notes(customerDefs[0]),
  }});

  const qServed2 = await prisma.queueEntry.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId: bKarthik.id,
    customerId: customers['Ramesh Kumar'].id,
    serviceId: svcBeard.id,
    ticketNumber: 2, ticketDisplay: 'A002',
    entryType: 'WALK_IN', priority: 0,
    status: QueueStatus.SERVED, position: 0,
    estimatedWaitMins: 0,
    joinedAt:  hoursAgo(2.5),
    calledAt:  hoursAgo(2.5),
    servingAt: hoursAgo(2.5),
    servedAt:  new Date(hoursAgo(2.5).getTime() + 12 * 60_000),
    notes: notes(customerDefs[1]),
  }});

  const qServed3 = await prisma.queueEntry.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId: bRahim.id,
    customerId: customers['Anand Raj'].id,
    serviceId: svcCombo.id,
    ticketNumber: 3, ticketDisplay: 'A003',
    entryType: 'WALK_IN', priority: 0,
    status: QueueStatus.SERVED, position: 0,
    estimatedWaitMins: 0,
    joinedAt:  hoursAgo(2),
    calledAt:  hoursAgo(2),
    servingAt: hoursAgo(2),
    servedAt:  new Date(hoursAgo(2).getTime() + 32 * 60_000),
    notes: notes(customerDefs[3]),
  }});

  // ── SERVING (1 customer actively being served NOW) ───────────
  const qServing = await prisma.queueEntry.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId: bRahim.id,
    customerId: customers['Ravi Shankar'].id,
    serviceId: svcCombo.id,
    ticketNumber: 4, ticketDisplay: 'A004',
    entryType: 'WALK_IN', priority: 0,
    status: QueueStatus.SERVING, position: 0,
    estimatedWaitMins: 5,
    joinedAt:  minutesAgo(25),
    calledAt:  minutesAgo(8),
    servingAt: minutesAgo(7),
    notes: notes(customerDefs[5]),
  }});

  // ── WAITING (5 customers in queue) ──────────────────────────
  const qWait1 = await prisma.queueEntry.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId: bArjun.id,
    customerId: customers['Murugan Pillai'].id,
    serviceId: svcHaircut.id,
    ticketNumber: 5, ticketDisplay: 'A005',
    entryType: 'WALK_IN', priority: 0,
    status: QueueStatus.WAITING, position: 1,
    estimatedWaitMins: 20,
    joinedAt: minutesAgo(18),
    notes: notes(customerDefs[7]),
  }});

  const qWait2 = await prisma.queueEntry.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId: bKarthik.id,
    customerId: customers['Selvam Rajendran'].id,
    serviceId: svcBeard.id,
    ticketNumber: 6, ticketDisplay: 'A006',
    entryType: 'WALK_IN', priority: 0,
    status: QueueStatus.WAITING, position: 2,
    estimatedWaitMins: 25,
    joinedAt: minutesAgo(14),
    notes: notes(customerDefs[9]),
  }});

  await prisma.queueEntry.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId: bVijay.id,
    guestName: 'Balaji Venkatesh',
    guestPhone: '+919876501012',
    serviceId: svcHaircut.id,
    ticketNumber: 7, ticketDisplay: 'A007',
    entryType: 'WALK_IN', priority: 0,
    status: QueueStatus.WAITING, position: 3,
    estimatedWaitMins: 20,
    joinedAt: minutesAgo(10),
    notes: JSON.stringify({ age: 36, gender: 'M', address: '55, Sholinganallur', pincode: '600119' }),
  }});

  await prisma.queueEntry.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId: bArjun.id,
    guestName: 'Nithya Krishnan',
    guestPhone: '+919876501011',
    serviceId: svcSpa.id,
    ticketNumber: 8, ticketDisplay: 'A008',
    entryType: 'WALK_IN', priority: 0,
    status: QueueStatus.WAITING, position: 4,
    estimatedWaitMins: 40,
    joinedAt: minutesAgo(7),
    notes: JSON.stringify({ age: 22, gender: 'F', address: '30, Medavakkam', pincode: '600100' }),
  }});

  await prisma.queueEntry.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId: bKarthik.id,
    guestName: 'Deepa Menon',
    guestPhone: '+919876501007',
    serviceId: svcCombo.id,
    ticketNumber: 9, ticketDisplay: 'A009',
    entryType: 'WALK_IN', priority: 0,
    status: QueueStatus.WAITING, position: 5,
    estimatedWaitMins: 30,
    joinedAt: minutesAgo(3),
    notes: JSON.stringify({ age: 26, gender: 'F', address: '21, Nungambakkam', pincode: '600034' }),
  }});

  // Extra served (for more reviews + payment demo trail)
  const qServed4 = await prisma.queueEntry.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId: bVijay.id,
    customerId: customers['Priya Devi'].id,
    serviceId: svcHaircut.id,
    ticketNumber: 10, ticketDisplay: 'A010',
    entryType: 'WALK_IN', priority: 0,
    status: QueueStatus.SERVED, position: 0,
    estimatedWaitMins: 0,
    joinedAt:  hoursAgo(5),
    calledAt:  hoursAgo(5),
    servingAt: hoursAgo(5),
    servedAt:  new Date(hoursAgo(5).getTime() + 18 * 60_000),
    notes: notes(customerDefs[2]),
  }});

  const qServed5 = await prisma.queueEntry.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId: bArjun.id,
    customerId: customers['Lakshmi Narayanan'].id,
    serviceId: svcBeard.id,
    ticketNumber: 11, ticketDisplay: 'A011',
    entryType: 'WALK_IN', priority: 0,
    status: QueueStatus.SERVED, position: 0,
    estimatedWaitMins: 0,
    joinedAt:  hoursAgo(6),
    calledAt:  hoursAgo(6),
    servingAt: hoursAgo(6),
    servedAt:  new Date(hoursAgo(6).getTime() + 12 * 60_000),
    notes: notes(customerDefs[8]),
  }});

  console.log('  ✅  11 queue entries (5 served · 1 serving · 5 waiting)\n');

  // ══════════════════════════════════════════════════════════════
  // 11. Appointments (8 bookings — past + future)
  // ══════════════════════════════════════════════════════════════
  console.log('📅  Appointments…');

  const pastAppt = (dayAgo: number, h: number, m: number) => {
    const d = daysAgo(dayAgo);
    d.setHours(h, m, 0, 0);
    return d;
  };
  const tomorrowAt = (h: number, m = 0) => {
    const d = daysFrom(1);
    d.setHours(h, m, 0, 0);
    return d;
  };
  const dayAfterAt = (h: number, m = 0) => {
    const d = daysFrom(2);
    d.setHours(h, m, 0, 0);
    return d;
  };
  /** Always in the future (stable demo regardless of clock time). */
  const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000);

  // Past — COMPLETED
  await prisma.appointment.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId:   bArjun.id,
    customerId: customers['Kavitha Subramani'].id,
    serviceId:  svcHaircut.id,
    scheduledAt: pastAppt(1, 10, 0),
    durationMins: 20,
    status: AppointmentStatus.COMPLETED,
    notes: 'Regular customer — prefers scissor cut',
  }});

  await prisma.appointment.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId:   bKarthik.id,
    customerId: customers['Lakshmi Narayanan'].id,
    serviceId:  svcSpa.id,
    scheduledAt: pastAppt(1, 14, 30),
    durationMins: 45,
    status: AppointmentStatus.COMPLETED,
    notes: 'Deep conditioning requested',
  }});

  await prisma.appointment.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId:   bRahim.id,
    customerId: customers['Suresh Babu'].id,
    serviceId:  svcCombo.id,
    scheduledAt: pastAppt(2, 9, 30),
    durationMins: 30,
    status: AppointmentStatus.COMPLETED,
    notes: 'Morning slot',
  }});

  // Future — CONFIRMED / PENDING (wall-clock safe)
  await prisma.appointment.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId:   bArjun.id,
    customerId: customers['Priya Devi'].id,
    serviceId:  svcHaircut.id,
    scheduledAt: hoursFromNow(2),
    durationMins: 20,
    status: AppointmentStatus.CONFIRMED,
  }});

  await prisma.appointment.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId:   bKarthik.id,
    customerId: customers['Ramesh Kumar'].id,
    serviceId:  svcBeard.id,
    scheduledAt: hoursFromNow(5),
    durationMins: 10,
    status: AppointmentStatus.CONFIRMED,
  }});

  await prisma.appointment.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId:   bVijay.id,
    customerId: customers['Anand Raj'].id,
    serviceId:  svcCombo.id,
    scheduledAt: hoursFromNow(8),
    durationMins: 30,
    status: AppointmentStatus.CONFIRMED,
    notes: 'Bring son for kids haircut as well',
  }});

  await prisma.appointment.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId:   bRahim.id,
    customerId: customers['Murugan Pillai'].id,
    serviceId:  svcSpa.id,
    scheduledAt: tomorrowAt(11, 0),
    durationMins: 45,
    status: AppointmentStatus.CONFIRMED,
  }});

  await prisma.appointment.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId:   bArjun.id,
    customerId: customers['Selvam Rajendran'].id,
    serviceId:  svcHaircut.id,
    scheduledAt: dayAfterAt(16, 0),
    durationMins: 20,
    status: AppointmentStatus.CONFIRMED,
  }});

  await prisma.appointment.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId:   bKarthik.id,
    customerId: customers['Kishore Anand'].id,
    serviceId:  svcCombo.id,
    scheduledAt: hoursFromNow(26),
    durationMins: 30,
    status: AppointmentStatus.PENDING,
    notes: 'First visit — requested WhatsApp reminder',
  }});

  await prisma.appointment.create({ data: {
    shopId: shop.id, branchId: branch.id,
    barberId:   bVijay.id,
    customerId: customers['Meera Iyer'].id,
    serviceId:  svcHaircut.id,
    scheduledAt: tomorrowAt(15, 30),
    durationMins: 20,
    status: AppointmentStatus.PENDING,
  }});

  console.log('  ✅  10 appointments (3 completed · 5 confirmed · 2 pending)\n');

  // ══════════════════════════════════════════════════════════════
  // 12. Reviews (on served queue entries)
  // ══════════════════════════════════════════════════════════════
  console.log('⭐  Reviews…');

  await prisma.review.create({ data: {
    shopId:     shop.id,
    barberId:   bArjun.id,
    customerId: customers['Suresh Babu'].id,
    queueId:    qServed1.id,
    rating:     5,
    comment:    'Excellent fade! Arjun really knows his craft. Will be back.',
    isVisible:  true,
  }});

  await prisma.review.create({ data: {
    shopId:     shop.id,
    barberId:   bKarthik.id,
    customerId: customers['Ramesh Kumar'].id,
    queueId:    qServed2.id,
    rating:     5,
    comment:    'Best beard trim in Chennai. Very clean finish.',
    isVisible:  true,
  }});

  await prisma.review.create({ data: {
    shopId:     shop.id,
    barberId:   bRahim.id,
    customerId: customers['Anand Raj'].id,
    queueId:    qServed3.id,
    rating:     4,
    comment:    'Great service. Rahim is very experienced. Slightly long wait.',
    isVisible:  true,
  }});

  await prisma.review.create({ data: {
    shopId:     shop.id,
    barberId:   bVijay.id,
    customerId: customers['Priya Devi'].id,
    queueId:    qServed4.id,
    rating:     5,
    comment:    'Vijay was patient and precise — love the cut!',
    isVisible:  true,
  }});

  await prisma.review.create({ data: {
    shopId:     shop.id,
    barberId:   bArjun.id,
    customerId: customers['Lakshmi Narayanan'].id,
    queueId:    qServed5.id,
    rating:     5,
    comment:    'Neatest beard line in town. Highly recommend Arjun.',
    isVisible:  true,
  }});

  await prisma.review.create({ data: {
    shopId:     shop.id,
    barberId:   bKarthik.id,
    customerId: customers['Kishore Anand'].id,
    queueId:    null,
    rating:     4,
    comment:    'Walk-in spa treatment was relaxing — booking again.',
    isVisible:  true,
  }});

  console.log('  ✅  6 reviews ready\n');

  // ══════════════════════════════════════════════════════════════
  // 12b. Mock payments (no Payment table — audit via NotificationLog)
  // ══════════════════════════════════════════════════════════════
  console.log('💳  Mock payment notifications…');

  const payLogs: { userId: string; phone: string; content: string; type: string }[] = [
    { userId: customers['Suresh Babu'].id, phone: '+919876501001', type: 'payment.mock.upi', content: 'UPI ₹200 received — Haircut (A001) · ref MOCK-UPI-7K2P' },
    { userId: customers['Ramesh Kumar'].id, phone: '+919876501002', type: 'payment.mock.upi', content: 'UPI ₹100 received — Beard trim (A002) · ref MOCK-UPI-9Q1L' },
    { userId: customers['Anand Raj'].id, phone: '+919876501004', type: 'payment.mock.cash', content: 'Cash ₹250 recorded — Combo (A003) at counter' },
    { userId: customers['Priya Devi'].id, phone: '+919876501003', type: 'payment.mock.upi', content: 'UPI ₹200 received — Haircut (A010) · ref MOCK-UPI-3N8R' },
    { userId: customers['Lakshmi Narayanan'].id, phone: '+919876501009', type: 'payment.mock.upi', content: 'UPI ₹100 received — Beard (A011) · ref MOCK-UPI-2M5T' },
    { userId: customers['Murugan Pillai'].id, phone: '+919876501008', type: 'payment.mock.pending', content: 'Payment pending — Spa booking tomorrow (pay at shop or UPI)' },
  ];

  for (const p of payLogs) {
    await prisma.notificationLog.create({
      data: {
        userId: p.userId,
        channel: 'IN_APP',
        eventType: p.type,
        recipient: p.phone,
        content: p.content,
        status: p.type === 'payment.mock.pending' ? 'PENDING' : 'DELIVERED',
        sentAt: p.type === 'payment.mock.pending' ? null : new Date(),
      },
    });
  }

  console.log('  ✅  6 mock payment logs ready\n');

  // ══════════════════════════════════════════════════════════════
  // 13. Analytics Snapshots (last 7 days — powers dashboard KPIs)
  // ══════════════════════════════════════════════════════════════
  console.log('📊  Analytics snapshots…');

  const analyticsData = [
    // daysAgo, totalServed, noShow, left, avgWait, avgService, peakHour, totalEntries
    { d: 7, served: 38, noShow: 3, left: 2, wait: 14.2, svc: 22.1, peak: 11, total: 43 },
    { d: 6, served: 42, noShow: 2, left: 1, wait: 12.8, svc: 21.5, peak: 10, total: 45 },
    { d: 5, served: 35, noShow: 4, left: 3, wait: 15.5, svc: 23.0, peak: 12, total: 42 },
    { d: 4, served: 51, noShow: 2, left: 0, wait: 11.2, svc: 20.8, peak: 11, total: 53 },
    { d: 3, served: 47, noShow: 3, left: 2, wait: 13.0, svc: 22.3, peak: 10, total: 52 },
    { d: 2, served: 55, noShow: 1, left: 1, wait: 10.8, svc: 19.9, peak: 12, total: 57 },
    { d: 1, served: 48, noShow: 2, left: 2, wait: 12.4, svc: 21.2, peak: 11, total: 52 },
  ];

  for (const row of analyticsData) {
    const date = new Date(daysAgo(row.d));
    date.setHours(0, 0, 0, 0);

    // NOTE: We delete shop analytics for this shop earlier in this seed.
    // Using create avoids Prisma TS issues around `barberId: null` in composite uniques.
    await prisma.analyticsSnapshot.create({
      data: {
        shopId: shop.id,
        barberId: null,
        date,
        totalServed: row.served,
        totalNoShow: row.noShow,
        totalLeft: row.left,
        avgWaitTimeMins: row.wait,
        avgServiceTimeMins: row.svc,
        peakHour: row.peak,
        totalQueueEntries: row.total,
      },
    });
  }

  // Per-barber analytics (today only — for barber performance row)
  const barberAnalytics = [
    { barber: bArjun,   served: 16, noShow: 1, wait: 10.2, svc: 19.8 },
    { barber: bKarthik, served: 14, noShow: 0, wait: 11.5, svc: 14.2 },
    { barber: bRahim,   served: 12, noShow: 1, wait: 13.8, svc: 26.0 },
    { barber: bVijay,   served: 6,  noShow: 0, wait: 12.0, svc: 21.5 },
  ];

  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (const ba of barberAnalytics) {
    await prisma.analyticsSnapshot.upsert({
      where: { unique_shop_barber_date: { shopId: shop.id, barberId: ba.barber.id, date: today } },
      update: {
        totalServed: ba.served, totalNoShow: ba.noShow,
        avgWaitTimeMins: ba.wait, avgServiceTimeMins: ba.svc,
      },
      create: {
        shopId: shop.id, barberId: ba.barber.id, date: today,
        totalServed: ba.served, totalNoShow: ba.noShow,
        avgWaitTimeMins: ba.wait, avgServiceTimeMins: ba.svc,
        totalQueueEntries: ba.served + ba.noShow,
      },
    });
  }

  console.log('  ✅  7-day analytics + per-barber snapshots ready\n');

  // ══════════════════════════════════════════════════════════════
  // 14. QR Code
  // ══════════════════════════════════════════════════════════════
  await prisma.qrCode.upsert({
    where:  { code: 'elite-shop-qr-001' },
    update: { isActive: true },
    create: {
      code:      'elite-shop-qr-001',
      shopId:    shop.id,
      branchId:  branch.id,
      type:      'SHOP',
      targetUrl: `http://localhost:4300/shop/elite-barber-lounge`,
      isActive:  true,
    },
  });

  // ══════════════════════════════════════════════════════════════
  // 15. Keep existing trimtime-barber-shop intact (legacy)
  // ══════════════════════════════════════════════════════════════
  // (Plans are already upserted above — no further action needed)

  // ── Done ─────────────────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉  SEED COMPLETE — Elite Barber Lounge is live!\n');
  console.log('  Shop slug  : elite-barber-lounge');
  console.log('  Branch     : Main Branch · Anna Nagar, Chennai');
  console.log('  Barbers    : Arjun · Karthik · Rahim · Vijay');
  console.log('  Services   : Haircut ₹200 · Beard ₹100 · Combo ₹250 · Spa ₹500');
  console.log('  Customers  : 14 seeded');
  console.log('  Queue      : 11 entries (5 served · 1 serving · 5 waiting)');
  console.log('  Bookings   : 10 (3 completed · 5 confirmed · 2 pending)');
  console.log('  Reviews    : 6');
  console.log('  Payments   : 6 mock UPI/cash/pending logs (NotificationLog)');
  console.log('  Analytics  : 7-day snapshots');
  console.log('\n  📱 Mobile scan URL: http://localhost:4300/shop/elite-barber-lounge');
  console.log('  🖥️  Owner login   : owner@elitebarber.in  (demo password: any 4+ chars)');
  console.log('  🖥️  Admin login   : admin@elitebarber.in (demo password: any 4+ chars)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
