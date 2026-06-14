// Поврзување на UI со алгоритмот и серверот.
const form = document.getElementById("loginForm");
const pw = document.getElementById("password");
const usernameEl = document.getElementById("username");
const ageEl = document.getElementById("age");
const emailEl = document.getElementById("email");
const toggle = document.getElementById("toggle");
const mainCard = document.getElementById("mainCard");

// 1) Иницијализација на Supabase клиент (Замени ги вредностите со твоите од Supabase Settings > API)
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Регистрирај посета во базата наместо преку локален /api/visit рутер (Опционално)
async function registerVisit() {
  try {
    // Ако направиш табела за посети 'visits', можеш да го откоментираш ова:
    // await supabase.from('visits').insert([{ visited_at: new Date() }]);
  } catch {}
}
registerVisit();

// Email validation
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

emailEl.addEventListener("input", () => {
  if (isValidEmail(emailEl.value)) {
    emailEl.style.borderColor = "";
  } else {
    emailEl.style.borderColor = "red";
  }
});

// Прикажи/сокриј лозинка
toggle.addEventListener("click", () => {
  pw.type = pw.type === "password" ? "text" : "password";
});

// Најава: Испраќање податоци директно во облак базата на Supabase
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isValidEmail(emailEl.value)) {
    emailEl.style.borderColor = "red";
    return;
  }
  const { score, hints } = scorePassword(pw.value);
  const username = usernameEl.value;
  const age = parseInt(ageEl.value); // Конвертирај го внесот во бројка
  const email = emailEl.value;

  // 2) Зачувување на корисничките податоци директно во Supabase табелата 'users'
  try {
    const { error } = await supabase
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
      console.error("Грешка при зачувување:", error.message);
    } else {
      console.log("Успешно запишано во Supabase!");
    }
  } catch (err) {
    console.error("Мрежна грешка:", err);
  }

  const hintsHtml = hints.map(h => `<li>${h}</li>`).join("");

  mainCard.innerHTML = `
    <div style="font-size: 14px; line-height: 1.6; padding: 20px; margin-bottom: 30px;">
      <p>This is a demonstration — <strong>your password is never saved.</strong> It exists to show how easily you’d be compromised in a real attack. If this were real, a single reused password could unlock your email, bank, and social accounts. Your password is the key to your digital life; hand it to the wrong site and you hand over everything.</p>
<p>Always verify a site before typing credentials. Use unique passwords and a password manager. Think twice — your money and data depend on it.</p>
      <p style="margin-top: 15px; font-weight: bold; color: var(--accent); font-size: 16px;">
        Your original password has a strength of ${score}/10. 
      </p>
      ${score < 6 ? `<p style="color: var(--muted); font-size: 13px;">(If it is under 6, you should change it)</p>` : ''}
      
      ${hints.length > 0 ? `
      <p style="margin-top: 15px;">Here is what your password is missing:</p>
      <ul class="hints" style="margin-top:0">${hintsHtml}</ul>
      ` : ''}

      <div style="margin-top: 25px; border-top: 1px solid var(--border); padding-top: 20px;">
        <label for="testNewPassword">Test a new password</label>
        <div class="pass-wrap">
          <input type="password" id="testNewPassword" placeholder="Type a new password..." style="width:100%; padding: 12px 14px; background: #0f131a; border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 15px; outline: none; margin-bottom: 10px;" />
        </div>
        
        <div class="meter">
          <div class="meter-bar"><div id="newMeterFill" class="meter-fill" style="height: 100%; width: 0; background: red;"></div></div>
          <div class="meter-info" style="display:flex; justify-content:space-between; font-size:12px; color:var(--muted); margin-top:6px;">
            <span id="newMeterLabel">Empty</span>
            <span id="newMeterScore">0/10</span>
          </div>
        </div>
        <ul id="newHints" class="hints" style="margin-top:10px;"></ul>
      </div>
    </div>
  `;

  // Attach event listener for the new test input
  const testInput = document.getElementById("testNewPassword");
  const newFill = document.getElementById("newMeterFill");
  const newLabel = document.getElementById("newMeterLabel");
  const newScoreLabel = document.getElementById("newMeterScore");
  const newHintsEl = document.getElementById("newHints");

  function colorFor(s) {
    if (s <= 3) return "#e5484d";
    if (s <= 6) return "#f5a623";
    if (s <= 8) return "#3aa655";
    return "#1f9d55";
  }

  testInput.addEventListener("input", () => {
    const res = scorePassword(testInput.value);
    const pct = (res.score / 10) * 100;
    
    newFill.style.width = pct + "%";
    newFill.style.background = colorFor(res.score);
    newLabel.textContent = res.label;
    newScoreLabel.textContent = res.score + "/10";

    newHintsEl.innerHTML = "";
    res.hints.forEach((h) => {
      const li = document.createElement("li");
      li.textContent = h;
      newHintsEl.appendChild(li);
    });
  });
});
