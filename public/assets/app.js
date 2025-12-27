const taglines = [
  "Train with Hundreds of Coaches in One App",
  "AI Trained by Real Coaches",
  "Get the Right Coaching, Every Workout"
];

function rotateTagline(){
  const el = document.querySelector("[data-rotate-tagline]");
  if(!el) return;
  let i = 0;
  el.textContent = taglines[i];
  setInterval(() => {
    i = (i+1) % taglines.length;
    el.textContent = taglines[i];
  }, 3500);
}

async function postJSON(url, payload){
  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(()=>({}));
  if(!res.ok){
    const msg = data && data.error ? data.error : "Something went wrong.";
    throw new Error(msg);
  }
  return data;
}

function bindWaitlist(formId){
  const form = document.getElementById(formId);
  if(!form) return;
  const msg = form.querySelector("[data-msg]");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = "";
    const email = form.querySelector("input[name=email]").value.trim();
    const hp = form.querySelector("input[name=company]").value.trim(); // honeypot
    try{
      const out = await postJSON("/api/waitlist", { email, company: hp, source: form.dataset.source || "website" });
      msg.innerHTML = `<div class="notice">Thanks — you’re on the waitlist.</div>`;
      form.reset();
      window.dispatchEvent(new CustomEvent("mygym_event", { detail: { type:"waitlist_submit" }}));
    }catch(err){
      msg.innerHTML = `<div class="error">${err.message}</div>`;
    }
  });
}

function bindCoachApply(formId){
  const form = document.getElementById(formId);
  if(!form) return;
  const msg = form.querySelector("[data-msg]");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = "";
    const payload = Object.fromEntries(new FormData(form).entries());
    // honeypot
    if(payload.company && payload.company.trim().length > 0){
      msg.innerHTML = `<div class="notice">Thanks — received.</div>`;
      form.reset();
      return;
    }
    try{
      const out = await postJSON("/api/coach-apply", payload);
      msg.innerHTML = `<div class="notice">Application received. We’ll be in touch shortly.</div>`;
      form.reset();
      window.dispatchEvent(new CustomEvent("mygym_event", { detail: { type:"coach_apply_submit" }}));
    }catch(err){
      msg.innerHTML = `<div class="error">${err.message}</div>`;
    }
  });
}

// Simple analytics stub (no external keys)
(function(){
  window.addEventListener("click", (e) => {
    const target = e.target.closest("[data-event]");
    if(target){
      window.dispatchEvent(new CustomEvent("mygym_event", { detail: { type: target.dataset.event }}));
    }
  });
  window.addEventListener("mygym_event", (e) => {
    // Replace this with your analytics provider later
    console.log("[MyGym.AI event]", e.detail);
  });
})();

rotateTagline();
bindWaitlist("waitlistFormHome");
bindWaitlist("waitlistFormFooter");
bindCoachApply("coachApplyForm");