async function testChat() {
  const url = "http://localhost:3000/api/chat";
  
  console.log("--- Test 1: Arabic ---");
  const res1 = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "أريد فيلم أكشن" })
  });
  console.log(await res1.json());

  console.log("\n--- Test 2: English ---");
  const res2 = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "I want an action movie" })
  });
  console.log(await res2.json());

  console.log("\n--- Test 3: Snacks ---");
  const res3 = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "I am hungry" })
  });
  console.log(await res3.json());
}

testChat().catch(console.error);
