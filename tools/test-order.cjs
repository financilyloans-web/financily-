async function main() {
  // Unauthenticated → expect 401
  const res = await fetch(
    "http://localhost:3001/api/payments/youpi-order?orderId=EMI-LN-2026-ABCD",
  );
  const text = await res.text();
  console.log("status", res.status);
  console.log("body", text.slice(0, 300));
}
main();
