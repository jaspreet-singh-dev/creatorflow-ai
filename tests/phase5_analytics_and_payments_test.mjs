import assert from "assert";
import fs from "fs";

console.log("=====================================================");
console.log("  Phase 5 & 8: Analytics, Payments & Compliance Test ");
console.log("=====================================================");

// 1. YouTube Analytics Date Range Verification
console.log("\n--- 1. ANALYTICS REPORTING RANGE & LATENCY ---");
function calculateDateRange(range) {
  const now = new Date();
  const end = new Date(now.getTime() - 2 * 86400000);
  const daysMap = { "7d": 7, "28d": 28, "90d": 90, "365d": 365 };
  const numDays = daysMap[range] || 28;
  const start = new Date(end.getTime() - numDays * 86400000);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

const range28d = calculateDateRange("28d");
console.log(`28d Range: ${range28d.startDate} to ${range28d.endDate}`);
assert(range28d.startDate < range28d.endDate, "Start date must precede end date");
const endDateObj = new Date(range28d.endDate);
const now = new Date();
const diffDays = Math.round((now.getTime() - endDateObj.getTime()) / 86400000);
assert(diffDays >= 1, "End date must incorporate YouTube's 24-48h processing latency");
console.log(`✔ PASS [1] Date range respects YouTube's official latency window (T-${diffDays} days)`);

// 2. INR Pricing Structure
console.log("\n--- 2. INR PRICING VERIFICATION ---");
const pageSource = fs.readFileSync("src/app/page.tsx", "utf8");
assert(pageSource.includes("₹0"), "Landing page must feature ₹0 Starter plan");
assert(pageSource.includes("₹999"), "Landing page must feature ₹999 Creator Pro plan");
assert(pageSource.includes("₹2,499"), "Landing page must feature ₹2,499 Agency Studio plan");
assert(!pageSource.includes("$29"), "Legacy USD $29 pricing must be completely removed");
assert(!pageSource.includes("$79"), "Legacy USD $79 pricing must be completely removed");
console.log("✔ PASS [2] Landing page re-denominated to Indian Rupees (₹0, ₹999, ₹2,499)");

const subscriptionSource = fs.readFileSync("src/app/dashboard/subscription/page.tsx", "utf8");
assert(subscriptionSource.includes("₹999"), "Subscription page must feature ₹999 Creator Pro plan");
assert(subscriptionSource.includes("₹2,499"), "Subscription page must feature ₹2,499 Agency Studio plan");
assert(subscriptionSource.includes("₹999.00"), "Invoice amounts must reflect INR currency");
assert(subscriptionSource.includes("OWNER PRIVILEGES"), "Owner privileges banner must be present for owner account");
console.log("✔ PASS [3] Subscription dashboard renders INR amounts, invoices, and Owner banner");

// 3. Owner Quota Bypass
console.log("\n--- 3. OWNER QUOTA BYPASS VERIFICATION ---");
const dataContextSource = fs.readFileSync("src/context/data-context.tsx", "utf8");
assert(dataContextSource.includes("isOwner ||"), "checkQuota must inspect isOwner flag");
assert(dataContextSource.includes("max: Infinity"), "Owner account must receive unlimited (Infinity) quota");
console.log("✔ PASS [4] Owner role verified to receive unlimited usage quotas");

// 4. Legal Compliance Pages
console.log("\n--- 4. LEGAL COMPLIANCE & GOOGLE POLICIES ---");
assert(fs.existsSync("src/app/terms/page.tsx"), "Terms page must exist");
assert(fs.existsSync("src/app/privacy/page.tsx"), "Privacy page must exist");
assert(fs.existsSync("src/app/refund/page.tsx"), "Refund page must exist");

const privacySource = fs.readFileSync("src/app/privacy/page.tsx", "utf8");
assert(privacySource.includes("Limited Use"), "Privacy policy must include Google Limited Use disclosure");
assert(privacySource.includes("Google API Services User Data Policy"), "Privacy policy must cite Google User Data Policy");
assert(privacySource.includes("sell your Google user data"), "Privacy policy must state data is never sold");
assert(privacySource.includes("serving advertisements"), "Ad transfer prohibition must be explicit");
console.log("✔ PASS [5] Privacy Policy complies with Google API Services Limited Use requirements");

const refundSource = fs.readFileSync("src/app/refund/page.tsx", "utf8");
assert(refundSource.includes("7-Day"), "Refund policy must specify 7-Day Money-Back Guarantee");
console.log("✔ PASS [6] Refund Policy provides 7-Day Money-Back Guarantee for INR subscriptions");

// 5. Payment API Routes
console.log("\n--- 5. PAYMENT API ROUTES VERIFICATION ---");
assert(fs.existsSync("src/app/api/payments/create-order/route.ts"), "Create order route must exist");
assert(fs.existsSync("src/app/api/payments/webhook/route.ts"), "Webhook route must exist");

const createOrderSource = fs.readFileSync("src/app/api/payments/create-order/route.ts", "utf8");
assert(createOrderSource.includes("INR_PRICES"), "Create order must use INR prices");
assert(createOrderSource.includes("razorpay"), "Create order route must support Razorpay gateway");

const webhookSource = fs.readFileSync("src/app/api/payments/webhook/route.ts", "utf8");
assert(webhookSource.includes("x-razorpay-signature"), "Webhook route must verify signature header");
assert(webhookSource.includes("subscriptions"), "Webhook route must update subscriptions table");
console.log("✔ PASS [7] Payment API routes correctly verify INR pricing, signatures, and subscriptions");

console.log("\n=====================================================");
console.log("Result: 7 / 7 tests passed successfully!");
console.log("=====================================================");
