import { PrismaClient, QueueStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// TRIMTIME — Database Seed
// Creates initial data required for development and testing:
//  1. Subscription plans (Free, Pro, Enterprise)
//  2. Admin user
//  3. Sample shop with barbers and services
// ============================================================

async function main() {
  console.log('🌱 Seeding TrimTime database...\n');

  // ── 1. Subscription Plans ──────────────────────────────
  console.log('📦 Creating subscription plans...');

  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Free' },
    update: {},
    create: {
      name:                   'Free',
      priceMonthly:           0,
      maxBarbers:             1,
      maxDailyQueueEntries:   50,
      analyticsRetentionDays: 7,
      smsCreditsMonthly:      0,
      hasAppointments:        false,
      hasAnalytics:           false,
      hasMultiBranch:         false,
      hasApiAccess:           false,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Pro' },
    update: {},
    create: {
      name:                   'Pro',
      priceMonthly:           29.99,
      maxBarbers:             5,
      maxDailyQueueEntries:   500,
      analyticsRetentionDays: 90,
      smsCreditsMonthly:      200,
      hasAppointments:        true,
      hasAnalytics:           true,
      hasMultiBranch:         false,
      hasApiAccess:           false,
    },
  });

  const enterprisePlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Enterprise' },
    update: {},
    create: {
      name:                   'Enterprise',
      priceMonthly:           99.99,
      maxBarbers:             999,
      maxDailyQueueEntries:   9999,
      analyticsRetentionDays: 365,
      smsCreditsMonthly:      1000,
      hasAppointments:        true,
      hasAnalytics:           true,
      hasMultiBranch:         true,
      hasApiAccess:           true,
    },
  });

  console.log(`  ✅ Free plan:       ID ${freePlan.id}`);
  console.log(`  ✅ Pro plan:        ID ${proPlan.id}`);
  console.log(`  ✅ Enterprise plan: ID ${enterprisePlan.id}\n`);

  // ── 2. Admin User ─────────────────────────────────────
  console.log('👤 Creating admin user...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@trimtime.app' },
    update: {},
    create: {
      name:       'TrimTime Admin',
      email:      'admin@trimtime.app',
      phone:      '+10000000000',
      isVerified: true,
      isActive:   true,
    },
  });

// create admin user
const admin = await prisma.user.upsert({
  where: { phone: "+10000000000" },
  update: {},
  create: {
    name: "Admin",
    phone: "+10000000000",
    isVerified: true,
    isActive: true
  }
});

// create shop
const shop = await prisma.shop.upsert({
  where: { slug: "trimtime-barber-shop" },
  update: {},
  create: {
    name: "TrimTime Barber Shop",
    slug: "trimtime-barber-shop",
    phone: "+10000000000",
    isActive: true,
    ownerId: admin.id
  }
});

// assign admin role
await prisma.userRoleAssignment.upsert({
  where: {
    unique_user_role_shop: {
      userId: admin.id,
      role: "ADMIN",
      shopId: shop.id
    }
  },
  update: {},
  create: {
    userId: admin.id,
    role: "ADMIN",
    shopId: shop.id
  }
});

  console.log(`  ✅ Admin user: ${adminUser.email} (ID ${adminUser.id})\n`);

  // ── 3. Sample Shop Owner ──────────────────────────────
  console.log('💈 Creating sample shop owner...');

  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@demo.trimtime.app' },
    update: {},
    create: {
      name:       'Mike Johnson',
      email:      'owner@demo.trimtime.app',
      phone:      '+15551234567',
      isVerified: true,
      isActive:   true,
    },
  });

  // ── 4. Sample Shop ────────────────────────────────────
  console.log('🏪 Creating sample shop...');

  const demoShop = await prisma.shop.upsert({
    where: { slug: 'downtown-barber' },
    update: {},
    create: {
      ownerId:     ownerUser.id,
      name:        'Downtown Barber',
      slug:        'downtown-barber',
      description: 'Modern barber shop in Chennai OMR.',
      phone:       '+919999000001',
      email:       'hello@downtownbarber.trimtime',
      country:     'IN',
      timezone:    'Asia/Kolkata',
      isActive:    true,
      isVerified:  true,
    },
  });

  // ── 5. Shop Owner Role ─────────────────────────────────
  await prisma.userRoleAssignment.upsert({
    where: {
      unique_user_role_shop: {
        userId: ownerUser.id,
        role:   'SHOP_OWNER',
        shopId: shop.id,
      },
    },
    update: {},
    create: {
      userId: ownerUser.id,
      role:   'SHOP_OWNER',
      shopId: shop.id,
    },
  });

  // ── 6. Main Branch ─────────────────────────────────────
  const mainBranch = await prisma.shopBranch.upsert({
    where: { id: 'seed-branch-main' },
    update: {},
    create: {
      id:      'seed-branch-main',
      shopId:  shop.id,
      name:    'Main Branch',
      address: '123 Barber Street',
      city:    'New York',
      isMain:  true,
      isActive: true,
    },
  });

  // ── 7. Operating Hours (Mon–Sat, 9am–8pm) ──────────────
  const workDays = [1, 2, 3, 4, 5, 6]; // Mon–Sat
  for (const day of workDays) {
    await prisma.operatingHour.upsert({
      where: {
        unique_branch_day: { branchId: mainBranch.id, dayOfWeek: day },
      },
      update: {},
      create: {
        branchId:  mainBranch.id,
        dayOfWeek: day,
        openTime:  '09:00',
        closeTime: '20:00',
        isClosed:  false,
      },
    });
  }
  // Sunday closed
  await prisma.operatingHour.upsert({
    where: {
      unique_branch_day: { branchId: mainBranch.id, dayOfWeek: 0 },
    },
    update: {},
    create: {
      branchId:  mainBranch.id,
      dayOfWeek: 0,
      openTime:  '09:00',
      closeTime: '17:00',
      isClosed:  true,
    },
  });

  // ── 8. Services ───────────────────────────────────────
  console.log('✂️  Creating services...');

  const haircut = await prisma.service.upsert({
    where: { id: 'seed-service-haircut' },
    update: {},
    create: {
      id:          'seed-service-haircut',
      shopId:      shop.id,
      name:        'Haircut',
      durationMins: 20,
      price:       25.00,
      currency:    'USD',
      displayOrder: 1,
    },
  });

  const beardTrim = await prisma.service.upsert({
    where: { id: 'seed-service-beard' },
    update: {},
    create: {
      id:           'seed-service-beard',
      shopId:       shop.id,
      name:         'Beard Trim',
      durationMins: 15,
      price:        15.00,
      currency:     'USD',
      displayOrder: 2,
    },
  });

  const haircutBeard = await prisma.service.upsert({
    where: { id: 'seed-service-combo' },
    update: {},
    create: {
      id:           'seed-service-combo',
      shopId:       shop.id,
      name:         'Haircut + Beard',
      durationMins: 35,
      price:        35.00,
      currency:     'USD',
      displayOrder: 3,
    },
  });

  // ── 9. Barber Users ────────────────────────────────────
  console.log('💈 Creating barbers...');

  const barberUser1 = await prisma.user.upsert({
    where: { email: 'mike@demo.trimtime.app' },
    update: {},
    create: {
      name:       'Mike',
      email:      'mike@demo.trimtime.app',
      phone:      '+15559990001',
      isVerified: true,
    },
  });

  const barberUser2 = await prisma.user.upsert({
    where: { email: 'arun@downtownbarber.trimtime' },
    update: {},
    create: {
      name:       'Arun',
      email:      'arun@downtownbarber.trimtime',
      phone:      '+919999000002',
      isVerified: true,
    },
  });

  const barberUser3 = await prisma.user.upsert({
    where: { email: 'karthik@downtownbarber.trimtime' },
    update: {},
    create: {
      name:       'Karthik',
      email:      'karthik@downtownbarber.trimtime',
      phone:      '+919999000003',
      isVerified: true,
    },
  });

  // ── 10. Barber Profiles ────────────────────────────────
  const barber1 = await prisma.barber.upsert({
    where: { userId: barberUser1.id },
    update: {},
    create: {
      userId:                barberUser1.id,
      shopId:                shop.id,
      branchId:              mainBranch.id,
      displayName:           'Mike',
      avgServiceDurationMins: 20,
      currentStatus:         'OFFLINE',
      queueAccepting:        false,
      maxQueueSize:          15,
    },
  });

  const barber2 = await prisma.barber.upsert({
    where: { userId: barberUser2.id },
    update: {},
    create: {
      userId:                barberUser2.id,
      shopId:                shop.id,
      branchId:              mainBranch.id,
      displayName:           'Arun',
      avgServiceDurationMins: 20,
      currentStatus:         'AVAILABLE',
      queueAccepting:        true,
      maxQueueSize:          20,
    },
  });

  const barber3 = await prisma.barber.upsert({
    where: { userId: barberUser3.id },
    update: {},
    create: {
      userId:                barberUser3.id,
      shopId:                shop.id,
      branchId:              mainBranch.id,
      displayName:           'Karthik',
      avgServiceDurationMins: 20,
      currentStatus:         'AVAILABLE',
      queueAccepting:        true,
      maxQueueSize:          20,
    },
  });

  // Assign barber role
  for (const { userId, barberId } of [
    { userId: barberUser1.id, barberId: barber1.id },
    { userId: barberUser2.id, barberId: barber2.id },
    { userId: barberUser3.id, barberId: barber3.id },
  ]) {
    await prisma.userRoleAssignment.upsert({
      where: {
        unique_user_role_shop: { userId, role: 'BARBER', shopId: shop.id },
      },
      update: {},
      create: { userId, role: 'BARBER', shopId: shop.id },
    });
  }

  // ── 11. Barber Services ────────────────────────────────
  for (const barberId of [barber1.id, barber2.id, barber3.id]) {
    for (const serviceId of [haircut.id, beardTrim.id, haircutBeard.id]) {
      await prisma.barberService.upsert({
        where: { unique_barber_service: { barberId, serviceId } },
        update: {},
        create: { barberId, serviceId, isActive: true },
      });
    }
  }

  // ── 12. Shop Subscription (Pro Trial) ─────────────────
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 14);
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.subscription.upsert({
    where: { shopId: shop.id },
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

  // ── 13. QR Code for Shop ───────────────────────────────
  console.log('📱 Creating QR codes...');

  await prisma.qrCode.upsert({
    where: { code: 'demo-shop-qr-code-001' },
    update: {},
    create: {
      code:      'demo-shop-qr-code-001',
      shopId:    shop.id,
      branchId:  mainBranch.id,
      type:      'SHOP',
      targetUrl: `${process.env.MOBILE_URL || 'http://localhost:4300'}/shop/downtown-barber`,
      isActive:  true,
    },
  });

  await prisma.qrCode.upsert({
    where: { code: 'demo-barber-mike-qr' },
    update: {},
    create: {
      code:      'demo-barber-mike-qr',
      shopId:    shop.id,
      branchId:  mainBranch.id,
      barberId:  barber1.id,
      type:      'BARBER',
      targetUrl: `${process.env.MOBILE_URL || 'http://localhost:4300'}/join-queue?barber=${barber1.id}&qr=demo-barber-mike-qr`,
      isActive:  true,
    },
  });

  // ── 14. Customers ─────────────────────────────────────────
  const raj = await prisma.user.upsert({
    where: { email: 'raj@downtownbarber.trimtime' },
    update: {},
    create: { name: 'Raj', email: 'raj@downtownbarber.trimtime', phone: '+919900010001', isVerified: true },
  });

  const vijay = await prisma.user.upsert({
    where: { email: 'vijay@downtownbarber.trimtime' },
    update: {},
    create: { name: 'Vijay', email: 'vijay@downtownbarber.trimtime', phone: '+919900010002', isVerified: true },
  });

  const suresh = await prisma.user.upsert({
    where: { email: 'suresh@downtownbarber.trimtime' },
    update: {},
    create: { name: 'Suresh', email: 'suresh@downtownbarber.trimtime', phone: '+919900010003', isVerified: true },
  });

  const arjun = await prisma.user.upsert({
    where: { email: 'arjun@downtownbarber.trimtime' },
    update: {},
    create: { name: 'Arjun', email: 'arjun@downtownbarber.trimtime', phone: '+919900010004', isVerified: true },
  });

  // ── 15. Queue entries ─────────────────────────────────────
  await prisma.queueEntry.create({
    data: {
      shopId: shop.id,
      branchId: mainBranch.id,
      barberId: barber1.id,
      customerId: raj.id,
      serviceId: haircut.id,
      ticketNumber: 1001,
      ticketDisplay: 'A001',
      status: QueueStatus.WAITING,
      position: 1,
      estimatedWaitMins: 15,
    },
  });

  await prisma.queueEntry.create({
    data: {
      shopId: shop.id,
      branchId: mainBranch.id,
      barberId: barber2.id,
      customerId: vijay.id,
      serviceId: beardTrim.id,
      ticketNumber: 1002,
      ticketDisplay: 'A002',
      status: QueueStatus.SERVING,
      position: 2,
      estimatedWaitMins: 5,
      calledAt: new Date(),
      servingAt: new Date(),
    },
  });

  await prisma.queueEntry.create({
    data: {
      shopId: shop.id,
      branchId: mainBranch.id,
      barberId: barber3.id,
      customerId: suresh.id,
      serviceId: haircutBeard.id,
      ticketNumber: 1003,
      ticketDisplay: 'A003',
      status: QueueStatus.SERVED,
      position: 3,
      estimatedWaitMins: 0,
      calledAt: new Date(Date.now() - 1000 * 60 * 20),
      servingAt: new Date(Date.now() - 1000 * 60 * 18),
      servedAt: new Date(Date.now() - 1000 * 60 * 5),
    },
  });

  await prisma.queueEntry.create({
    data: {
      shopId: shop.id,
      branchId: mainBranch.id,
      barberId: barber1.id,
      customerId: arjun.id,
      serviceId: haircut.id,
      ticketNumber: 1004,
      ticketDisplay: 'A004',
      status: QueueStatus.WAITING,
      position: 4,
      estimatedWaitMins: 22,
    },
  });

  await prisma.queueEntry.create({
    data: {
      shopId: shop.id,
      branchId: mainBranch.id,
      barberId: barber2.id,
      guestName: 'Guest Priya',
      guestPhone: '+919900011111',
      serviceId: beardTrim.id,
      ticketNumber: 1005,
      ticketDisplay: 'A005',
      status: QueueStatus.WAITING,
      position: 5,
      estimatedWaitMins: 25,
    },
  });

  console.log('\n✅ Seed completed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log(`   Plans:   Free, Pro, Enterprise`);
  console.log(`   Shop:    Downtown Barber  (slug: downtown-barber)`);
  console.log(`   Barbers: Mike, Arun, Karthik`);
  console.log(`   Services: Haircut, Beard Trim, Haircut + Beard`);
  console.log(`   QR scan URL: http://localhost:4300/shop/downtown-barber`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
