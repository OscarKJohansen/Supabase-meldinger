// Supabase init
const SUPABASE_URL = "https://aiseafkfjhixolxezjjq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mdoTv5Opu_0idPCaV64_6A_nIegPRg1";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// UI refs
const adminArea = document.getElementById("admin-area");
const refreshBtn = document.getElementById("refresh-btn");
const clearBtn = document.getElementById("clear-btn");
const userBadge = document.getElementById("user-badge");
const roleBadge = document.getElementById("role-badge");

const loginForm = document.getElementById("login-form");
const loginEmailInput = document.getElementById("login-email");
const loginPasswordInput = document.getElementById("login-password");
const loginStatusEl = document.getElementById("login-status");
const logoutBtn = document.getElementById("logout-btn");
const appArea = document.getElementById("app-area");

const form = document.getElementById("form");
const nameInput = document.getElementById("name");
const contentInput = document.getElementById("content");
const msgsEl = document.getElementById("msgs");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");

// State
let currentUser = null;
let displayName = null;
let currentRole = "user";

// Badges
function updateUserBadge() {
  if (currentUser?.email) {
    const isAdmin = currentRole === "admin";
    userBadge.textContent = currentUser.email;
    userBadge.className = "badge rounded-pill text-bg-secondary";
    roleBadge.textContent = isAdmin ? "Admin" : "Bruker";
    roleBadge.className =
      "badge rounded-pill " +
      (isAdmin ? "text-bg-warning" : "text-bg-secondary");
    roleBadge.classList.remove("d-none");
  } else {
    userBadge.textContent = "Gjest";
    userBadge.className = "badge rounded-pill text-bg-light";
    roleBadge.classList.add("d-none");
  }
}

// Utils
function esc(s) {
  return (s || "").replace(
    /[<>&"']/g,
    (c) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}

function parseRow(r) {
  return {
    name: r.display_name || "Anonym",
    message: r.message || r.content || "",
    created_at: r.created_at,
  };
}

// Data
async function loadMessages() {
  statusEl.textContent = "Laster...";
  const { data, error } = await supabase
    .from("messages")
    .select("id, message, display_name, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    statusEl.textContent = "Feil: " + error.message;
    return;
  }

  countEl.textContent = (data || []).length;

  msgsEl.innerHTML = (data || [])
    .map((r) => {
      const it = parseRow(r);
      const when = new Date(it.created_at).toLocaleString();
      return `
        <div class="border rounded p-2">
          <div class="fw-semibold">${esc(it.name)}</div>
          <div>${esc(it.message)}</div>
          <div class="small text-muted">${when}</div>
        </div>
      `;
    })
    .join("");

  statusEl.textContent = "Klar";
}

// Profile + role
async function ensureDisplayName() {
  if (!currentUser) return;

  let metaName = currentUser.user_metadata?.display_name;
  if (metaName && metaName.trim().length >= 2 && metaName.trim().length <= 30) {
    displayName = metaName.trim();
    nameInput.value = displayName;
    await supabase
      .from("profiles")
      .upsert(
        [
          {
            id: currentUser.id,
            email: currentUser.email,
            display_name: displayName,
          },
        ],
        { onConflict: "id" }
      );
    return;
  }

  while (true) {
    const input = prompt(
      "Hva vil du hete når du sender meldinger? (2–30 tegn)"
    );
    if (!input) {
      alert("Du må velge et navn for å bruke tjenesten.");
      continue;
    }
    const trimmed = input.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      alert("Navnet må være mellom 2 og 30 tegn.");
      continue;
    }

    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: trimmed },
    });
    if (error) {
      alert("Kunne ikke lagre navnet: " + error.message);
      return;
    }

    const { error: pErr } = await supabase
      .from("profiles")
      .upsert(
        [
          {
            id: currentUser.id,
            email: currentUser.email,
            display_name: trimmed,
          },
        ],
        { onConflict: "id" }
      );
    if (pErr) {
      alert("Kunne ikke lagre navnet i profiles: " + pErr.message);
      return;
    }

    currentUser = data.user;
    displayName = trimmed;
    nameInput.value = displayName;
    break;
  }
}

async function loadProfileRole() {
  if (!currentUser) return;
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();
  if (error) {
    console.warn("Kunne ikke hente profilrolle:", error.message);
    currentRole = "user";
    updateUserBadge();
    return;
  }
  currentRole = data?.role || "user";
  updateUserBadge();
}

// Auth UI
function updateAuthUI() {
  console.log("DEBUG user:", currentUser?.email);
  console.log("DEBUG role:", currentRole);
  updateUserBadge();
  if (currentUser) {
    appArea.classList.remove("d-none");
    loginForm.classList.add("d-none");
    logoutBtn.classList.remove("d-none");
    loginStatusEl.textContent =
      "Du er logget inn som " +
      currentUser.email +
      " – rolle: " +
      (currentRole === "admin" ? "Admin" : "Bruker");

    if (currentRole === "admin") {
      adminArea.classList.remove("d-none");
    } else {
      adminArea.classList.add("d-none");
    }
  } else {
    appArea.classList.add("d-none");
    loginForm.classList.remove("d-none");
    logoutBtn.classList.add("d-none");
    loginStatusEl.textContent = "Ikke innlogget.";
    nameInput.value = "";
    displayName = null;
    currentRole = "user";
    adminArea.classList.add("d-none");
    updateUserBadge();
  }
}

// Lifecycle
async function ensureAuthOnLoad() {
  loginStatusEl.textContent = "Sjekker innlogging...";

  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    if (!data.user.confirmed_at) {
      loginStatusEl.textContent =
        "E-posten er ikke bekreftet. Sjekk e-posten din.";
      await supabase.auth.signOut();
      currentUser = null;
      updateAuthUI();
      return;
    }

    currentUser = data.user;
    updateUserBadge();
    await ensureDisplayName();
    await loadProfileRole();
    updateAuthUI();
    await loadMessages();
  } else {
    currentUser = null;
    await supabase.auth.signOut();
    updateAuthUI();
  }
}

supabase.auth.onAuthStateChange((_event, session) => {
  currentUser = session?.user ?? null;
  updateUserBadge();
});

// Events
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  let email = loginEmailInput.value.trim().toLowerCase();
  const password = loginPasswordInput.value;

  if (!email || !password) {
    loginStatusEl.textContent = "Skriv inn både e-post og passord.";
    return;
  }

  loginStatusEl.textContent = "Logger inn...";

  let { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    if (signInError.message.includes("Invalid login credentials")) {
      loginStatusEl.textContent =
        "Bruker finnes ikke – oppretter ny og sender verifisering...";

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.href },
        });

      if (signUpError) {
        loginStatusEl.textContent =
          "Feil ved oppretting av bruker: " + signUpError.message;
        return;
      }

      loginStatusEl.textContent =
        "Bruker opprettet! Sjekk e-posten din for en bekreftelseslenke før du kan logge inn.";
      return;
    }

    loginStatusEl.textContent = "Innlogging feilet: " + signInError.message;
    return;
  }

  if (!signInData.user.confirmed_at) {
    loginStatusEl.textContent =
      "E-posten er ikke bekreftet ennå. Sjekk innboksen din og klikk på lenken.";
    await supabase.auth.signOut();
    return;
  }

  currentUser = signInData.user;
  await ensureDisplayName();
  await loadProfileRole();
  updateAuthUI();
  await loadMessages();
});

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  currentUser = null;
  updateAuthUI();
  statusEl.textContent = "Du er logget ut.";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  form.classList.add("was-validated");
  if (!form.checkValidity()) return;

  if (!currentUser || !currentUser.email) {
    statusEl.textContent = "Du må være logget inn for å sende meldinger.";
    return;
  }

  if (!displayName) {
    await ensureDisplayName();
    if (!displayName) {
      statusEl.textContent = "Kunne ikke hente navnet ditt.";
      return;
    }
  }

  const msg = contentInput.value.trim();
  if (!msg) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  statusEl.textContent = "Lagrer...";

  const { error } = await supabase
    .from("messages")
    .insert({ message: msg, display_name: displayName });

  if (error) console.error("Insert failed", error);
  submitBtn.disabled = false;

  if (error) {
    statusEl.textContent = "Feil ved lagring: " + error.message;
    return;
  }

  form.classList.remove("was-validated");
  contentInput.value = "";
  statusEl.textContent = "Lagret!";
  contentInput.focus();

  await loadMessages();
});

refreshBtn?.addEventListener("click", async () => {
  await loadMessages();
});

clearBtn?.addEventListener("click", async () => {
  if (currentRole !== "admin") return;
  if (!confirm("Er du sikker på at du vil slette alle meldinger?")) return;

  const { error } = await supabase.from("messages").delete().neq("id", 0);
  if (error) {
    alert("Feil ved sletting: " + error.message);
    return;
  }
  await loadMessages();
});

// Start
ensureAuthOnLoad();
