// ==========================================
// 1) UI ELEMENTS SELECTION
// ==========================================
const form = document.getElementById("loginForm");
const pw = document.getElementById("password");
const usernameEl = document.getElementById("username");
const ageEl = document.getElementById("age");
const emailEl = document.getElementById("email");
const toggle = document.getElementById("toggle");

// ==========================================
// 2) SUPABASE CLIENT INITIALIZATION
// ==========================================
// IMPORTANT: Replace these strings with your actual Project credentials from Supabase Settings > API
const supabaseUrl = 'https://evzdxqjvevibtzbmwzub.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2emR4cWp2ZXZpYnR6Ym13enViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MzkyNjYsImV4cCI6MjA5NzAxNTI2Nn0.-0qyrnKf9EPbAYltuqibkY2y77Qqwnd98opQQg-EOE8'; 
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// ==========================================
// 3) AUTOMATIC ANALYTICS TRAFFIC TRACKING
// ==========================================
async function handleAnalytics() {
  try {
    // A) Log a brand new unique session entry into the 'visits' table
    await supabaseClient.from('visits').insert([{}]);

    // B) Fetch total count of all logged rows from the 'visits' table
    const { count: totalVisits, error: visitErr } = await supabaseClient
      .from('visits')
      .select('*', { count: 'exact', head: true });

    // C) Fetch total count of all registered entries from the 'users' table
    const { count: totalLogins, error: loginErr } = await supabaseClient
      .from('users')
      .select('*', { count: 'exact', head: true });

    // D) Output the real-time statistics nicely formatted into the F12 Console
    if (!visitErr && !loginErr) {
      console.log(`%c--- BANANAPEEL INC. LIVE STATS ---`, 'color: #4f7cff; font-weight: bold; font-size: 14px;');
      console.log(`👀 Total Website Visits: ${totalVisits}`);
      console.log(`🔐 Total Successful Logins: ${totalLogins}`);
      console.log(`---------------------------------`);
    } else {
      if (visitErr) console.error("Error reading visits count:", visitErr.message);
      if (loginErr) console.error("Error reading logins count:", loginErr.message);
    }
  } catch (err) {
    console.error("Analytics network exception error:", err);
  }
}

// Fire tracking immediately when a visitor loads your URL
handleAnalytics();

// ==========================================
// 4) CLIENT-SIDE VALIDATION & HELPERS
// ==========================================
// Standard Email Regex Validation
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Live-border highlight indicator based on typing structure
emailEl.addEventListener("input", () => {
  emailEl.style.borderColor = isValidEmail(emailEl.value) ? "" : "red";
});

// Show / Hide Clear-text Password Toggle Switch
toggle.addEventListener("click", () => {
  pw.type = pw.type === "password" ? "text" : "password";
});

// ==========================================
// 5) FORM SUBMISSION & CLOUD DATABASE SYNC
// ==========================================
form.addEventListener("submit", async (e) => {
  // Prevent page fallback refresh state from clearing native browser input loops
  e.preventDefault();

  // Enforce validation fallback gate check
  if (!isValidEmail(emailEl.value)) {
    emailEl.style.borderColor = "red";
    return;
  }

  // Extract evaluations from local password calculation script
  const { score } = scorePassword(pw.value);
  const username = usernameEl.value;
  const age = parseInt(ageEl.value); // Convert string parsing into integers for DB compatibility
  const email = emailEl.value;

  try {
    // Insert parameters securely matching your explicit Supabase cloud columns layout
    const { error } = await supabaseClient
      .from('users')
      .insert([
        { 
          username: username, 
          age: age, 
          email: email, 
          strength: score 
        }
      ]);
      
    if (error) {
      console.error("Supabase Database Insertion Rejected:", error.message);
      alert(`Database save failed: ${error.message}\nMake sure RLS is disabled during testing!`);
    } else {
      console.log("Data successfully structured and pushed into your Supabase 'users' table!");
      
      // Clear alert and permanently transition to your landing template dashboard
      alert("Registration Successful!");
      window.location.href = "welcome.html"; 
    }
  } catch (err) {
    console.error("Network connectivity pipeline loss error:", err);
    alert("Connection lost. Check internet settings or your Supabase endpoint connectivity.");
  }
});
