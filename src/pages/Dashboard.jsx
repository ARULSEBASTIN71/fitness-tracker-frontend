import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";

// Helper functions (BMR/TDEE)
function calcBMR({ sex, weightKg, heightCm, age }) {
  if (sex === "female") return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}
function activityMultiplier(level) {
  switch (level) {
    case "sedentary": return 1.2;
    case "light": return 1.375;
    case "moderate": return 1.55;
    case "active": return 1.725;
    case "very": return 1.9;
    default: return 1.375;
  }
}

// Helper: get token from localStorage
function getAuthHeader() {
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export default function Dashboard() {
  const navigate = useNavigate();

  // user email display (optional)
  const [userEmail, setUserEmail] = useState("");
  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail") || "";
    setUserEmail(savedEmail);
  }, []);

  // form fields
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("maintain");

  const [result, setResult] = useState(null);
  const [notes, setNotes] = useState("");

  // plans from backend
  const [savedPlans, setSavedPlans] = useState([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(false);

  // load calorie & plans on mount
  useEffect(() => {
    // load local fallback (compat)
    const saved = localStorage.getItem("calorieTracker");
    if (saved) {
      const parsed = JSON.parse(saved);
      setResult(parsed.result || null);
      setSex(parsed.sex || "male");
      setAge(parsed.age || "");
      setWeightKg(parsed.weightKg || "");
      setHeightCm(parsed.heightCm || "");
      setActivity(parsed.activity || "moderate");
      setGoal(parsed.goal || "maintain");
    }

    // try to load from backend if token available
    const headers = getAuthHeader();
    if (!headers.Authorization) {
      // no token — keep local only
      setNotes("No auth token found — saved plans will be local only.");
      loadLocalPlans();
      return;
    }

    // fetch calorie saved data
    axios.get("/api/calories", { headers })
      .then(res => {
        if (res.data && res.data.calorie) {
          const c = res.data.calorie;
          setSex(c.sex || "male");
          setAge(c.age || "");
          setWeightKg(c.weightKg || "");
          setHeightCm(c.heightCm || "");
          setActivity(c.activity || "moderate");
          setGoal(c.goal || "maintain");
          setResult(c.result || null);
          setNotes("");
        }
      })
      .catch(err => {
        // ignore 404 or auth error — keep local fallback
        // console.warn("calorie load:", err?.response?.data || err.message);
      });

    // fetch plans
    setLoadingPlans(true);
    axios.get("/api/plans", { headers })
      .then(res => {
        if (res.data && res.data.plans) {
          // map to local display format
          const p = res.data.plans.map(pl => ({
            id: pl._id,
            name: pl.name,
            goal: pl.goal,
            createdAt: pl.createdAt,
            snapshot: pl.snapshot
          }));
          setSavedPlans(p);
        } else {
          loadLocalPlans();
        }
      })
      .catch(err => {
        // fallback to local storage plans if backend fails
        loadLocalPlans();
      })
      .finally(() => setLoadingPlans(false));
  }, []);

  function loadLocalPlans() {
    const local = localStorage.getItem("savedPlans");
    if (local) setSavedPlans(JSON.parse(local));
  }

  // persist local savedPlans if backend not used (we keep both in sync)
  useEffect(() => {
    localStorage.setItem("savedPlans", JSON.stringify(savedPlans));
  }, [savedPlans]);

  // when user changes goal to cut/bulk prompt to save
  function onGoalChange(value) {
    setGoal(value);
    if (value === "cut" || value === "bulk") {
      setTimeout(() => setShowSavePrompt(true), 120);
    }
  }

  // calculate result
  function handleCalculate(e) {
    e && e.preventDefault();
    const ageN = Number(age);
    const weightN = Number(weightKg);
    const heightN = Number(heightCm);
    if (!ageN || !weightN || !heightN) {
      setNotes("Please enter valid numeric Age, Weight (kg) and Height (cm).");
      return;
    }
    setNotes("");
    const bmr = calcBMR({ sex, weightKg: weightN, heightCm: heightN, age: ageN });
    const tdee = Math.round(bmr * activityMultiplier(activity));

    let suggested;
    if (goal === "maintain") suggested = tdee;
    else if (goal === "cut") suggested = Math.round(tdee * 0.8);
    else suggested = Math.round(tdee * 1.15);

    const proteinGrams = Math.round(2 * weightN);
    const proteinCals = proteinGrams * 4;
    const fatCals = Math.round(suggested * 0.25);
    const fatGrams = Math.round(fatCals / 9);
    const carbsCals = suggested - (proteinCals + fatCals);
    const carbsGrams = Math.max(0, Math.round(carbsCals / 4));

    const res = { bmr, tdee, suggested, proteinGrams, fatGrams, carbsGrams, goal, activity };
    setResult(res);

    // save to localStorage for compatibility
    localStorage.setItem("calorieTracker", JSON.stringify({ result: res, sex, age, weightKg, heightCm, activity, goal }));

    // also try saving to backend /api/calories if token present
    const headers = getAuthHeader();
    if (headers.Authorization) {
      axios.post("/api/calories", {
        sex, age: Number(age), weightKg: Number(weightKg), heightCm: Number(heightCm),
        activity, goal, result: res
      }, { headers })
        .then(() => {
          // saved
        })
        .catch(() => {
          // ignore backend save error
        });
    }
  }

  function handleClear() {
    localStorage.removeItem("calorieTracker");
    setResult(null);
    setNotes("Saved calorie data cleared.");
    // also delete server-side calorie if token exists
    const headers = getAuthHeader();
    if (headers.Authorization) {
      axios.delete("/api/calories", { headers }).catch(() => {});
    }
  }

  // Save plan (POST /api/plans) or fallback to local
  function saveCurrentPlanToBackend(name = "") {
    // ensure we have result
    if (!result) {
      handleCalculate();
      if (!result) {
        setNotes("Provide valid Age, Weight, Height to save a plan.");
        setShowSavePrompt(false);
        return;
      }
    }

    const snapshot = {
      sex, age: Number(age), weightKg: Number(weightKg), heightCm: Number(heightCm),
      activity, goal, result: result
    };

    const headers = getAuthHeader();
    if (!headers.Authorization) {
      // no token -> save local only
      const plan = {
        id: Date.now().toString(),
        name: name && name.trim() ? name.trim() : `${goal.toUpperCase()} plan (${new Date().toLocaleString()})`,
        goal,
        createdAt: new Date().toISOString(),
        snapshot
      };
      setSavedPlans(prev => [plan, ...prev]);
      setShowSavePrompt(false);
      setNewPlanName("");
      setNotes("Plan saved locally (no token).");
      return;
    }

    // POST to backend
    axios.post("/api/plans", { name: name || `${goal.toUpperCase()} plan`, goal, snapshot }, { headers })
      .then(res => {
        if (res.data && res.data.plan) {
          const pl = res.data.plan;
          const mapped = {
            id: pl._id,
            name: pl.name,
            goal: pl.goal,
            createdAt: pl.createdAt,
            snapshot: pl.snapshot
          };
          // add to UI list (most recent first)
          setSavedPlans(prev => [mapped, ...prev]);
          setShowSavePrompt(false);
          setNewPlanName("");
          setNotes("Plan saved to server.");
        } else {
          throw new Error("Invalid server response");
        }
      })
      .catch(err => {
        // fallback: save local
        const plan = {
          id: Date.now().toString(),
          name: name && name.trim() ? name.trim() : `${goal.toUpperCase()} plan (${new Date().toLocaleString()})`,
          goal,
          createdAt: new Date().toISOString(),
          snapshot
        };
        setSavedPlans(prev => [plan, ...prev]);
        setShowSavePrompt(false);
        setNewPlanName("");
        setNotes("Plan saved locally (server error).");
      });
  }

  // Delete plan (backend if possible)
  function deletePlan(id) {
    const headers = getAuthHeader();
    if (!headers.Authorization || !id.match(/^[0-9a-fA-F]{24}$/)) {
      // local delete
      setSavedPlans(prev => prev.filter(p => p.id !== id));
      setNotes("Plan removed locally.");
      return;
    }

    axios.delete(`/api/plans/${id}`, { headers })
      .then(() => {
        setSavedPlans(prev => prev.filter(p => p.id !== id));
        setNotes("Plan removed from server.");
      })
      .catch(err => {
        // if server delete fails, also remove locally for UI coherence
        setSavedPlans(prev => prev.filter(p => p.id !== id));
        setNotes("Plan removed (server error or not found).");
      });
  }

  // Load into form/result
  function loadPlan(plan) {
    const s = plan.snapshot || {};
    setSex(s.sex || "male");
    setAge(s.age || "");
    setWeightKg(s.weightKg || "");
    setHeightCm(s.heightCm || "");
    setActivity(s.activity || "moderate");
    setGoal(plan.goal || "maintain");
    setResult(s.result || null);
    setNotes(`Loaded plan: ${plan.name}`);
  }

  function handleLogout() {
    localStorage.removeItem("authToken");
    navigate("/login");
  }

  return (
    <div className="dash-wrap">
      <header className="dash-header">
        <div>
          <h1 className="dash-title">Welcome to your Dashboard</h1>
          <p className="dash-sub">This is a placeholder protected page. Token → localStorage.authToken</p>
        </div>

        <div className="header-actions">
          {userEmail && <div className="user-badge">Signed in as <strong>{userEmail}</strong></div>}
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dash-main">
        <section className="card calorie-card">
          <h2>Calorie Tracker</h2>
          <p className="muted">Enter your details to get daily calories and simple macro split for Maintain / Cut / Bulk.</p>

          <form className="calorie-form" onSubmit={handleCalculate}>
            <div className="row">
              <label>Sex</label>
              <select value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="row triple">
              <div>
                <label>Age (years)</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} min="10" />
              </div>
              <div>
                <label>Weight (kg)</label>
                <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} step="0.1" />
              </div>
              <div>
                <label>Height (cm)</label>
                <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
              </div>
            </div>

            <div className="row">
              <label>Activity level</label>
              <select value={activity} onChange={(e) => setActivity(e.target.value)}>
                <option value="sedentary">Sedentary (little/no exercise)</option>
                <option value="light">Light (1–3 days/week)</option>
                <option value="moderate">Moderate (3–5 days/week)</option>
                <option value="active">Active (6–7 days/week)</option>
                <option value="very">Very active (hard exercise / job)</option>
              </select>
            </div>

            <div className="row">
              <label>Goal</label>
              <div className="radio-row">
                <label><input type="radio" name="goal" value="maintain" checked={goal === "maintain"} onChange={() => onGoalChange("maintain")} /> Maintain</label>
                <label><input type="radio" name="goal" value="cut" checked={goal === "cut"} onChange={() => onGoalChange("cut")} /> Cutting (-20%)</label>
                <label><input type="radio" name="goal" value="bulk" checked={goal === "bulk"} onChange={() => onGoalChange("bulk")} /> Bulking (+15%)</label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Calculate</button>
              <button type="button" className="btn-secondary" onClick={handleClear}>Clear saved</button>
            </div>

            {notes && <p className="notes">{notes}</p>}
          </form>

          {result && (
            <div className="result">
              <h3>Results</h3>
              <div className="result-grid">
                <div><strong>BMR</strong><div>{result.bmr} kcal</div></div>
                <div><strong>TDEE</strong><div>{result.tdee} kcal</div></div>
                <div><strong>Suggested</strong><div>{result.suggested} kcal / day ({result.goal})</div></div>
                <div><strong>Protein</strong><div>{result.proteinGrams} g</div></div>
                <div><strong>Fat</strong><div>{result.fatGrams} g</div></div>
                <div><strong>Carbs</strong><div>{result.carbsGrams} g</div></div>
              </div>
              <div className="result-note">
                <small>Tip: Use Cutting for fat loss, Bulking for lean mass gain. Adjust rates and monitor weekly.</small>
              </div>
            </div>
          )}
        </section>

        <aside className="card info-card">
          <h3>Saved Plans</h3>

          {loadingPlans && <div className="muted" style={{ fontSize: 13 }}>Loading plans...</div>}

          {(!loadingPlans && savedPlans.length === 0) && (
            <div className="muted" style={{ fontSize: 13 }}>No saved plans yet. Choose Cutting or Bulking and save the plan when prompted.</div>
          )}

          {savedPlans.length > 0 && (
            <div className="plans-list">
              {savedPlans.map((p) => (
                <div key={p.id} className="plan-item">
                  <div className="plan-head">
                    <strong>{p.name}</strong>
                    <div className="plan-actions">
                      <button className="small-btn" onClick={() => loadPlan(p)}>Load</button>
                      <button className="small-btn danger" onClick={() => deletePlan(p.id)}>Delete</button>
                    </div>
                  </div>
                  <div className="plan-meta">
                    <div><small>{new Date(p.createdAt).toLocaleString()}</small></div>
                    <div style={{ marginTop: 6 }}>
                      <small>Goal: {p.goal}</small> · <small>Cal: {p.snapshot?.result?.suggested ?? "-"}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12, borderTop: "1px dashed rgba(255,255,255,0.04)", paddingTop: 10 }}>
            <h3>Quick Actions</h3>
            <ul>
              <li>Logout will clear token and redirect to login.</li>
              <li>Saved plans sync to backend if you're logged in (token present).</li>
              <li>Load a plan to prefill form and results on-screen.</li>
            </ul>
          </div>
        </aside>
      </main>

      {/* Save Prompt Modal */}
      {showSavePrompt && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Save plan?</h3>
            <p>Do you want to save the numbers for <strong>{goal.toUpperCase()}</strong> as a plan? You can name it or keep the default.</p>

            <div style={{ marginTop: 8 }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Plan name (optional)</label>
              <input value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} placeholder="My cutting plan" />
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={() => { setShowSavePrompt(false); setNewPlanName(""); }}>Cancel</button>
              <button className="btn-primary" onClick={() => saveCurrentPlanToBackend(newPlanName)}>Save plan</button>
            </div>
            <div style={{ marginTop: 10 }}>
              <small className="muted">If you haven't calculated yet, we will calculate automatically before saving.</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
