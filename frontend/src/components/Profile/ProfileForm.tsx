import { useEffect, useState } from "react";
import { getCurrentAdmin } from "../../services/authService";

const ProfileForm = () => {
  const admin = getCurrentAdmin();
  const ADMIN_ID = admin?.adminid;

  const [form, setForm] = useState({ username: "", fullname: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!ADMIN_ID) return;
    fetch(`http://localhost:3000/api/admin/${ADMIN_ID}`)
      .then((r) => r.json())
      .then((data) =>
        setForm({
          username: data.username || "",
          fullname: data.fullname || "",
          phone: data.phone || "",
        })
      );
  }, [ADMIN_ID]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ADMIN_ID) return;
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("ssrms_token") || "";
      const res = await fetch(`http://localhost:3000/api/admin/${ADMIN_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ fullname: form.fullname, phone: form.phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Error saving profile.");
        return;
      }
      setMessage("Profile updated successfully!");
    } catch {
      setMessage("Error saving profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-800">Personal Information</h2>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            placeholder="Full Name"
            value={form.fullname}
            onChange={(e) => setForm({ ...form, fullname: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            disabled
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-400 outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
          />
        </div>
        {message && <p className="text-sm text-green-600">{message}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;