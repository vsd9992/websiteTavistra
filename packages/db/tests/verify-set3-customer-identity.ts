/**
 * Set 3 Comprehensive Verification Suite
 * Verifies Customer Identity, Password + Mailpit OTP Auth, Session Cookies,
 * Saved Addresses (with Strict 6-Digit PIN Whitelist), Privacy Isolation,
 * Guest vs Account Order Separation, and Admin Customer Visibility.
 *
 * Targets live devMachine: http://192.168.1.100:3001, :3002, and Mailpit :8025
 */

import { prisma } from "../src";

const STOREFRONT_URL = process.env.STOREFRONT_URL || "http://192.168.1.100:3001";
const ADMIN_URL = process.env.ADMIN_URL || "http://192.168.1.100:3002";
const MAILPIT_URL = process.env.MAILPIT_URL || "http://192.168.1.100:8025";

interface TestReport {
  name: string;
  category: string;
  passed: boolean;
  details: string;
}

const report: TestReport[] = [];

function assert(condition: boolean, name: string, category: string, details: string) {
  if (condition) {
    report.push({ name, category, passed: true, details });
    console.log(`  [PASS] ${category} > ${name}`);
  } else {
    report.push({ name, category, passed: false, details: `FAILED: ${details}` });
    console.error(`  [FAIL] ${category} > ${name}: ${details}`);
  }
}

function extractSessionCookie(res: Response): string | null {
  const getSetCookie = (res.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie;
  const rawCookies = typeof getSetCookie === "function"
    ? getSetCookie.call(res.headers)
    : res.headers.get("set-cookie")
    ? [res.headers.get("set-cookie") as string]
    : [];

  for (const header of rawCookies) {
    const match = header.match(/tavistra_session=([^;]+)/);
    if (match && match[1]) {
      return `tavistra_session=${match[1]}`;
    }
  }
  return null;
}

async function fetchLatestOtpFromMailpit(
  recipientEmail: string,
  subjectMatch: string,
  sinceMs: number
): Promise<string | null> {
  const deadline = Date.now() + 8000;
  const target = recipientEmail.toLowerCase();

  while (Date.now() < deadline) {
    try {
      const listRes = await fetch(`${MAILPIT_URL}/api/v1/messages?limit=30`);
      if (listRes.ok) {
        const listData = (await listRes.json()) as {
          messages?: Array<{
            ID: string;
            Subject: string;
            Created: string;
            To?: Array<{ Address: string }>;
          }>;
        };
        const candidate = (listData.messages || []).find((m) => {
          const toMatch = (m.To || []).some((t) => t.Address.toLowerCase() === target);
          const subjMatch = m.Subject.toLowerCase().includes(subjectMatch.toLowerCase());
          const createdMs = new Date(m.Created).getTime();
          return toMatch && subjMatch && createdMs >= sinceMs - 5000;
        });

        if (candidate) {
          const msgRes = await fetch(`${MAILPIT_URL}/api/v1/message/${candidate.ID}`);
          if (msgRes.ok) {
            const msgData = (await msgRes.json()) as { Text?: string; HTML?: string };
            const body = msgData.Text || msgData.HTML || "";
            const otpMatch = body.match(/\b(\d{6})\b/);
            if (otpMatch) return otpMatch[1];
          }
        }
      }
    } catch {
      // retry briefly
    }
    await new Promise((r) => setTimeout(r, 350));
  }
  return null;
}

async function runSet3Verification() {
  const ts = Date.now();
  const userAEmail = `qa-set3-a-${ts}@vdesign-qa.in`;
  const userBEmail = `qa-set3-b-${ts}@vdesign-qa.in`;
  const guestEmail = `qa-set3-guest-${ts}@vdesign-qa.in`;
  const userAPassInitial = "AtelierPass#2026";
  const userAPassReset = "NewAtelierPass#2026";

  let userAId = "";
  let userBId = "";
  let cookieA = "";
  let cookieB = "";
  let addressAId = "";
  let authOrderNumber = "";
  let guestOrderNumber = "";

  console.log("\n=======================================================");
  console.log("  SET 3 VERIFICATION SUITE — LIVE ON DEVMACHINE");
  console.log(`  Storefront: ${STOREFRONT_URL}`);
  console.log(`  Admin:      ${ADMIN_URL}`);
  console.log(`  Mailpit:    ${MAILPIT_URL}`);
  console.log("=======================================================\n");

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: Unauthenticated Privacy Isolation
    // ------------------------------------------------------------------------
    console.log("--- Section 1: Unauthenticated Privacy Isolation ---");

    const acctUnauth = await fetch(`${STOREFRONT_URL}/api/account`);
    assert(acctUnauth.status === 401, "GET /api/account Unauth", "Privacy", `Expected 401, got ${acctUnauth.status}`);

    const ordersUnauth = await fetch(`${STOREFRONT_URL}/api/account/orders`);
    assert(ordersUnauth.status === 401, "GET /api/account/orders Unauth", "Privacy", `Expected 401, got ${ordersUnauth.status}`);

    const addrUnauth = await fetch(`${STOREFRONT_URL}/api/account/addresses`);
    assert(addrUnauth.status === 401, "GET /api/account/addresses Unauth", "Privacy", `Expected 401, got ${addrUnauth.status}`);

    const emailQueryUnauth = await fetch(`${STOREFRONT_URL}/api/orders?email=arjun.mehta@studio.in`);
    assert(
      emailQueryUnauth.status === 401,
      "GET /api/orders?email= Unauth",
      "Privacy",
      `Expected 401, got ${emailQueryUnauth.status}`
    );

    const quotesQueryUnauth = await fetch(`${STOREFRONT_URL}/api/quotes?email=arjun.mehta@studio.in`);
    assert(
      quotesQueryUnauth.status === 401,
      "GET /api/quotes?email= Unauth",
      "Privacy",
      `Expected 401, got ${quotesQueryUnauth.status}`
    );

    const bareOrderLookup = await fetch(`${STOREFRONT_URL}/api/orders?orderId=TAV-RS-2026-1001`);
    assert(
      bareOrderLookup.status === 401,
      "GET /api/orders?orderId= Without Contact Unauth",
      "Privacy",
      `Expected 401, got ${bareOrderLookup.status}`
    );

    // ------------------------------------------------------------------------
    // SECTION 2: Registration, Mailpit OTP Verification & Password Login
    // ------------------------------------------------------------------------
    console.log("\n--- Section 2: Registration & Mailpit OTP Verification ---");

    const regStartMs = Date.now();
    const regARes = await fetch(`${STOREFRONT_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "QA Architect A",
        email: userAEmail,
        phone: "9810101010",
        password: userAPassInitial,
        practiceOrStudio: "QA Studio A",
        gstin: "24ABCDE1234F1Z5",
      }),
    });
    const regAData = await regARes.json();
    assert(
      regARes.ok && regAData.requiresVerification === true,
      "Register User A Requires OTP",
      "Registration",
      `status=${regARes.status} requiresVerification=${regAData.requiresVerification}`
    );

    // Confirm login fails BEFORE email verification
    const unverifiedLoginRes = await fetch(`${STOREFRONT_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "password",
        email: userAEmail,
        password: userAPassInitial,
      }),
    });
    const unverifiedLoginData = await unverifiedLoginRes.json();
    assert(
      unverifiedLoginRes.status === 403 && unverifiedLoginData.requiresVerification === true,
      "Block Password Login Before Verification",
      "Auth",
      `Expected 403 requiresVerification=true, got ${unverifiedLoginRes.status}`
    );

    // Fetch real verification OTP from Mailpit
    const verifyOtp = await fetchLatestOtpFromMailpit(userAEmail, "verify", regStartMs);
    assert(Boolean(verifyOtp && /^\d{6}$/.test(verifyOtp)), "Mailpit Delivery of Verify OTP", "Mailpit", `OTP=${verifyOtp || "missing"}`);

    if (verifyOtp) {
      const verifyRes = await fetch(`${STOREFRONT_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userAEmail, code: verifyOtp }),
      });
      const verifyData = await verifyRes.json();
      cookieA = extractSessionCookie(verifyRes) || "";
      userAId = verifyData.user?.id || "";
      assert(
        verifyRes.ok && Boolean(cookieA) && verifyData.user?.emailVerified === true,
        "Verify Email Issues HTTP-Only Cookie",
        "Auth",
        `ok=${verifyRes.ok} hasCookie=${Boolean(cookieA)} emailVerified=${verifyData.user?.emailVerified}`
      );
    }

    // Wrong password rejected
    const badPassRes = await fetch(`${STOREFRONT_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "password",
        email: userAEmail,
        password: "WrongPassword#123",
      }),
    });
    assert(badPassRes.status === 401, "Wrong Password Rejected (401)", "Auth", `status=${badPassRes.status}`);

    // Logout revokes session cookie in DB
    const logoutRes = await fetch(`${STOREFRONT_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: cookieA },
    });
    assert(logoutRes.ok, "POST /api/auth/logout Succeeds", "Auth", `status=${logoutRes.status}`);

    const revokedCheck = await fetch(`${STOREFRONT_URL}/api/account`, {
      headers: { Cookie: cookieA },
    });
    assert(revokedCheck.status === 401, "Revoked Cookie Rejected on /api/account", "Auth", `status=${revokedCheck.status}`);

    // Re-login with password
    const loginPassRes = await fetch(`${STOREFRONT_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "password",
        email: userAEmail,
        password: userAPassInitial,
      }),
    });
    cookieA = extractSessionCookie(loginPassRes) || "";
    assert(loginPassRes.ok && Boolean(cookieA), "Password Login Re-issues Session Cookie", "Auth", `ok=${loginPassRes.ok}`);

    // ------------------------------------------------------------------------
    // SECTION 3: Email Login OTP & Forgot/Reset Password via Mailpit
    // ------------------------------------------------------------------------
    console.log("\n--- Section 3: Email Login OTP & Password Reset ---");

    const loginOtpStart = Date.now();
    const reqOtpRes = await fetch(`${STOREFRONT_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "otp_request", email: userAEmail }),
    });
    assert(reqOtpRes.ok, "Request Email Login OTP", "OTP Login", `status=${reqOtpRes.status}`);

    const loginOtpCode = await fetchLatestOtpFromMailpit(userAEmail, "Sign-In Verification Code", loginOtpStart);
    assert(Boolean(loginOtpCode), "Mailpit Delivery of Login OTP", "Mailpit", `OTP=${loginOtpCode || "missing"}`);

    if (loginOtpCode) {
      const verifyLoginOtpRes = await fetch(`${STOREFRONT_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "otp_verify", email: userAEmail, code: loginOtpCode }),
      });
      const otpCookie = extractSessionCookie(verifyLoginOtpRes);
      if (otpCookie) cookieA = otpCookie;
      assert(verifyLoginOtpRes.ok && Boolean(otpCookie), "OTP Verify Logs User In", "OTP Login", `ok=${verifyLoginOtpRes.ok}`);
    }

    const resetStart = Date.now();
    const forgotRes = await fetch(`${STOREFRONT_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userAEmail }),
    });
    assert(forgotRes.ok, "Forgot Password Sends OTP", "Password Reset", `status=${forgotRes.status}`);

    const resetOtp = await fetchLatestOtpFromMailpit(userAEmail, "Reset", resetStart);
    assert(Boolean(resetOtp), "Mailpit Delivery of Reset OTP", "Mailpit", `OTP=${resetOtp || "missing"}`);

    if (resetOtp) {
      const resetRes = await fetch(`${STOREFRONT_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userAEmail,
          code: resetOtp,
          newPassword: userAPassReset,
        }),
      });
      assert(resetRes.ok, "Reset Password Updates Password Hash", "Password Reset", `status=${resetRes.status}`);

      // Verify old password fails & new password succeeds
      const oldPassAfterReset = await fetch(`${STOREFRONT_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "password", email: userAEmail, password: userAPassInitial }),
      });
      assert(oldPassAfterReset.status === 401, "Old Password Fails After Reset", "Password Reset", `status=${oldPassAfterReset.status}`);

      const newPassAfterReset = await fetch(`${STOREFRONT_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "password", email: userAEmail, password: userAPassReset }),
      });
      cookieA = extractSessionCookie(newPassAfterReset) || cookieA;
      assert(newPassAfterReset.ok && Boolean(cookieA), "New Password Works After Reset", "Password Reset", `status=${newPassAfterReset.status}`);
    }

    // ------------------------------------------------------------------------
    // SECTION 4: Profile Update & Address Book (+ Strict 6-Digit PIN Whitelist)
    // ------------------------------------------------------------------------
    console.log("\n--- Section 4: Profile, Addresses & Strict PIN Whitelist ---");

    const invalidGstinRes = await fetch(`${STOREFRONT_URL}/api/account`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({ gstin: "INVALID-GST" }),
    });
    assert(invalidGstinRes.status === 400, "Reject Malformed GSTIN (400)", "Profile", `status=${invalidGstinRes.status}`);

    const patchProfileRes = await fetch(`${STOREFRONT_URL}/api/account`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({
        name: "QA Architect A Updated",
        practiceOrStudio: "QA Atelier Renovated",
        gstin: "27ABCDE1234F1Z2",
      }),
    });
    const patchProfileData = await patchProfileRes.json();
    assert(
      patchProfileRes.ok && patchProfileData.user?.gstin === "27ABCDE1234F1Z2",
      "PATCH /api/account Updates Profile & GSTIN",
      "Profile",
      `ok=${patchProfileRes.ok} gstin=${patchProfileData.user?.gstin}`
    );

    // Reject unlisted 6-digit PIN 380053
    const badPinAddrRes = await fetch(`${STOREFRONT_URL}/api/account/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({
        label: "Studio",
        fullName: "QA Architect A",
        phone: "9810101010",
        addressLine1: "42 Unlisted St",
        pincode: "380053",
      }),
    });
    assert(
      badPinAddrRes.status === 400,
      "Reject Unserviceable PIN 380053 on Address Create",
      "Address PIN Whitelist",
      `Expected 400, got ${badPinAddrRes.status}`
    );

    // Accept listed serviceable PIN 380001
    const goodPinAddrRes = await fetch(`${STOREFRONT_URL}/api/account/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({
        label: "Studio / Office",
        fullName: "QA Architect A",
        phone: "9810101010",
        addressLine1: "14 Ashram Road",
        pincode: "380001",
        isDefault: true,
      }),
    });
    const goodPinAddrData = await goodPinAddrRes.json();
    addressAId = goodPinAddrData.address?.id || "";
    assert(
      goodPinAddrRes.ok && goodPinAddrData.address?.city && goodPinAddrData.address?.isDefault === true,
      "Accept Listed PIN 380001 & Resolve City/State",
      "Address PIN Whitelist",
      `ok=${goodPinAddrRes.ok} city=${goodPinAddrData.address?.city}`
    );

    // Edit address A
    const editAddrRes = await fetch(`${STOREFRONT_URL}/api/account/addresses/${addressAId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({ addressLine2: "Floor 3, West Wing" }),
    });
    const editAddrData = await editAddrRes.json();
    assert(
      editAddrRes.ok && editAddrData.address?.addressLine2 === "Floor 3, West Wing",
      "Edit Saved Address",
      "Addresses",
      `ok=${editAddrRes.ok}`
    );

    // Register & verify User B to test cross-user isolation
    const regBStart = Date.now();
    await fetch(`${STOREFRONT_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "QA Architect B",
        email: userBEmail,
        phone: "9820202020",
        password: userAPassInitial,
      }),
    });
    const verifyOtpB = await fetchLatestOtpFromMailpit(userBEmail, "verify", regBStart);
    if (verifyOtpB) {
      const verifyBRes = await fetch(`${STOREFRONT_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userBEmail, code: verifyOtpB }),
      });
      const verifyBData = await verifyBRes.json();
      cookieB = extractSessionCookie(verifyBRes) || "";
      userBId = verifyBData.user?.id || "";
    }
    assert(Boolean(cookieB && userBId), "Setup Verified User B", "Cross-User Isolation", `userBId=${userBId}`);

    const crossEditRes = await fetch(`${STOREFRONT_URL}/api/account/addresses/${addressAId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookieB },
      body: JSON.stringify({ addressLine1: "Hacked Street" }),
    });
    assert(crossEditRes.status === 403, "User B Blocked from Editing User A Address (403)", "Cross-User Isolation", `status=${crossEditRes.status}`);

    const crossDeleteRes = await fetch(`${STOREFRONT_URL}/api/account/addresses/${addressAId}`, {
      method: "DELETE",
      headers: { Cookie: cookieB },
    });
    assert(crossDeleteRes.status === 403, "User B Blocked from Deleting User A Address (403)", "Cross-User Isolation", `status=${crossDeleteRes.status}`);

    // ------------------------------------------------------------------------
    // SECTION 5: Guest vs Authenticated Order Separation & Tracking
    // ------------------------------------------------------------------------
    console.log("\n--- Section 5: Guest vs Authenticated Order Separation ---");

    authOrderNumber = `TAV-QA-A-${ts}`;
    guestOrderNumber = `TAV-QA-G-${ts}`;

    // Place Authenticated order using exact same saved address fields to verify address reuse + FK detach
    const authOrderRes = await fetch(`${STOREFRONT_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({
        id: authOrderNumber,
        mode: "READY_STOCK",
        customerName: "QA Architect A",
        email: userAEmail,
        phone: "9810101010",
        addressLine1: "14 Ashram Road",
        city: "Ahmedabad",
        state: "Gujarat",
        destinationPin: "380001",
        items: [{ name: "Monolith Minimalist Wall Clock", quantity: 1, pricePaise: 2450000 }],
        itemsSubtotalRupees: 24500,
        deliveryFeeRupees: 500,
        totalAmountRupees: 25000,
        amountPaidRupees: 25000,
        balanceDueRupees: 0,
      }),
    });
    assert(authOrderRes.ok, "Place Authenticated Order (User A)", "Orders", `status=${authOrderRes.status}`);

    // Place a Guest order (no cookie) using User A's email to prove strict separation!
    const guestOrderRes = await fetch(`${STOREFRONT_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: guestOrderNumber,
        mode: "READY_STOCK",
        customerName: "Guest Checkout Buyer",
        email: userAEmail,
        phone: "9899999999",
        addressLine1: "99 Guest Lane",
        city: "Ahmedabad",
        state: "Gujarat",
        destinationPin: "380001",
        items: [{ name: "Monolith Minimalist Wall Clock", quantity: 1, pricePaise: 2450000 }],
        itemsSubtotalRupees: 24500,
        deliveryFeeRupees: 500,
        totalAmountRupees: 25000,
        amountPaidRupees: 25000,
        balanceDueRupees: 0,
      }),
    });
    assert(guestOrderRes.ok, "Place Guest Order (No Cookie, Same Email)", "Orders", `status=${guestOrderRes.status}`);

    const userAOrdersRes = await fetch(`${STOREFRONT_URL}/api/account/orders`, {
      headers: { Cookie: cookieA },
    });
    const userAOrdersData = await userAOrdersRes.json();
    const orderNumsA = (userAOrdersData.orders || []).map((o: { orderNumber: string }) => o.orderNumber);
    assert(
      orderNumsA.includes(authOrderNumber) && !orderNumsA.includes(guestOrderNumber),
      "User A Sees ONLY Auth Order (Guest Order Isolated)",
      "Orders Isolation",
      `orders=${JSON.stringify(orderNumsA)}`
    );

    const userBOrdersRes = await fetch(`${STOREFRONT_URL}/api/account/orders`, {
      headers: { Cookie: cookieB },
    });
    const userBOrdersData = await userBOrdersRes.json();
    assert(
      (userBOrdersData.orders || []).length === 0,
      "User B Sees Zero Orders (No Cross-User Leak)",
      "Orders Isolation",
      `count=${(userBOrdersData.orders || []).length}`
    );

    // Track guest order with wrong contact vs right contact
    const wrongTrackRes = await fetch(
      `${STOREFRONT_URL}/api/orders?orderId=${encodeURIComponent(guestOrderNumber)}&contact=wrong@email.com`
    );
    const wrongTrackData = await wrongTrackRes.json();
    assert(
      wrongTrackRes.status === 403 && wrongTrackData.found === false,
      "Guest Track Rejects Wrong Contact (403)",
      "Guest Tracking",
      `status=${wrongTrackRes.status} found=${wrongTrackData.found}`
    );

    const validTrackRes = await fetch(
      `${STOREFRONT_URL}/api/orders?orderId=${encodeURIComponent(guestOrderNumber)}&contact=9899999999`
    );
    const validTrackData = await validTrackRes.json();
    assert(
      validTrackRes.ok && validTrackData.found === true && validTrackData.order?.id === guestOrderNumber,
      "Guest Track Succeeds with Order ID + Matching Phone",
      "Guest Tracking",
      `found=${validTrackData.found}`
    );

    // ------------------------------------------------------------------------
    // SECTION 6: Admin Customers Visibility & Security Hygiene
    // ------------------------------------------------------------------------
    console.log("\n--- Section 6: Admin Customers API & Secret Protection ---");

    const adminCustRes = await fetch(`${ADMIN_URL}/api/admin/customers`);
    const adminCustData = await adminCustRes.json();
    const foundUserA = (adminCustData.customers || []).find((c: { email: string }) => c.email === userAEmail);
    assert(
      adminCustRes.ok &&
        Boolean(foundUserA) &&
        foundUserA.lifetimeSpendRupees === 25000 &&
        foundUserA.gstin === "27ABCDE1234F1Z2" &&
        foundUserA.emailVerified === true &&
        Array.isArray(foundUserA.addresses) &&
        foundUserA.addresses.length === 1 &&
        foundUserA.passwordHash === undefined,
      "Admin Customers Accurate Spend/GSTIN/Addresses & No passwordHash",
      "Admin Customers",
      `found=${Boolean(foundUserA)} spend=${foundUserA?.lifetimeSpendRupees} addrCount=${foundUserA?.addresses?.length}`
    );

    // Delete address A as User A (even though linked to authOrderNumber -> FK-safe detach!)
    const deleteAddrARes = await fetch(`${STOREFRONT_URL}/api/account/addresses/${addressAId}`, {
      method: "DELETE",
      headers: { Cookie: cookieA },
    });
    assert(deleteAddrARes.ok, "Delete Address Linked to Order (FK-Safe Detach)", "Addresses", `status=${deleteAddrARes.status}`);
  } finally {
    // Cleanup QA data cleanly
    console.log("\n--- Cleanup QA Artifacts ---");
    try {
      const orderNumsToClean = [authOrderNumber, guestOrderNumber].filter(Boolean);
      if (orderNumsToClean.length > 0) {
        await prisma.orderItem.deleteMany({
          where: { order: { orderNumber: { in: orderNumsToClean } } },
        });
        await prisma.payment.deleteMany({
          where: { order: { orderNumber: { in: orderNumsToClean } } },
        });
        await prisma.order.deleteMany({
          where: { orderNumber: { in: orderNumsToClean } },
        });
      }
      const emailsToClean = [userAEmail, userBEmail, guestEmail];
      await prisma.emailVerificationToken.deleteMany({ where: { email: { in: emailsToClean } } });
      await prisma.customerSession.deleteMany({
        where: { user: { email: { in: emailsToClean } } },
      });
      await prisma.customerAddress.deleteMany({
        where: { user: { email: { in: emailsToClean } } },
      });
      await prisma.user.deleteMany({ where: { email: { in: emailsToClean } } });
      console.log("  Cleaned QA test users, sessions, tokens, addresses, and orders.");
    } catch (cleanupErr) {
      console.error("  QA cleanup warning:", cleanupErr);
    }
    await prisma.$disconnect();
  }

  const passedCount = report.filter((r) => r.passed).length;
  const failedCount = report.filter((r) => !r.passed).length;

  console.log("\n=======================================================");
  console.log(`  SET 3 VERIFICATION SUMMARY: ${passedCount}/${report.length} PASSED (${failedCount} FAILED)`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSet3Verification().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});

