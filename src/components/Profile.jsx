import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../services/state/userState";
import { getById, updateUser } from "../services/api/userService";

export default function Profile() {
  const { user, updateUserDetails } = useContext(UserContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [feedback, setFeedback] = useState({ text: "", type: "" });
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [initial, setInitial] = useState({ fullName: "", email: "" });

  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const response = await getById(user.id);
      if (cancelled) return;

      if (response.success) {
        const data = response.body || {};
        const next = {
          fullName: data.fullName ?? "",
          email: data.email ?? "",
        };
        setForm(next);
        setInitial(next);
      } else {
        setLoadError(response.message || "Încărcarea profilului a eșuat");
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, navigate]);

  useEffect(() => {
    if (!feedback.text) return;
    const t = setTimeout(() => setFeedback({ text: "", type: "" }), 3000);
    return () => clearTimeout(t);
  }, [feedback]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const isDirty =
    form.fullName !== initial.fullName ||
    form.email !== initial.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty || saving) return;

    setSaving(true);
    const response = await updateUser(user.id, {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
    });
    setSaving(false);

    if (response.success) {
      setInitial(form);
      updateUserDetails({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
      });
      setFeedback({ text: "Profil actualizat", type: "success" });
    } else {
      setFeedback({
        text: response.message || "Actualizarea profilului a eșuat",
        type: "error",
      });
    }
  };

  const handleReset = () => {
    setForm(initial);
  };

  if (loading) {
    return <div className="loading animate-fadeIn">Se încarcă profilul tău...</div>;
  }

  if (loadError) {
    return <div className="error-message animate-fadeIn">{loadError}</div>;
  }

  return (
    <div className="profile-container animate-fadeIn">
      <div className="profile-card animate-slideUp">
        <div className="profile-header">
          <h1 className="profile-title">Profilul tău</h1>
          <p className="profile-subtitle">
            Vizualizează și actualizează informațiile personale
          </p>
        </div>

        {feedback.text && (
          <div className={`status-message ${feedback.type} animate-fadeIn`}>
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group animate-slideUp">
            <label htmlFor="fullName" className="form-label">Nume complet</label>
            <input
              id="fullName"
              className="form-input"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Ion Popescu"
              required
            />
          </div>

          <div className="form-group animate-slideUp">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              className="form-input"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="profile-actions">
            <button
              type="button"
              className="profile-button secondary"
              onClick={handleReset}
              disabled={!isDirty || saving}
            >
              Anulează
            </button>
            <button
              type="submit"
              className="profile-button primary"
              disabled={!isDirty || saving}
            >
              {saving ? "Se salvează..." : "Salvează modificările"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
