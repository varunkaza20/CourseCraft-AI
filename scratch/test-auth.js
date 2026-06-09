async function testAuth() {
  const email = `test_${Date.now()}@example.com`;
  const password = "password123";

  console.log("Registering user...", email);
  try {
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: "Test User", email, password })
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(JSON.stringify(regData));
    console.log("Registered:", regData.user.email);
  } catch (err) {
    console.error("Register failed:", err.message);
    return;
  }

  console.log("Logging in user...");
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
    console.log("Logged in:", loginData.user.email);
  } catch (err) {
    console.error("Login failed:", err.message);
  }
}

testAuth();
