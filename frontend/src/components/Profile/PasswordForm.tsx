import { useState } from "react";
import { getCurrentAdmin } from "../../services/authService";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const PasswordForm = () => {
  const admin = getCurrentAdmin();
  const ADMIN_ID = admin?.adminid;

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState({ text: "", error: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!ADMIN_ID) return;

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage({ text: "សូមបញ្ចូលគ្រប់ Field", error: true });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ text: "Passwords do not match!", error: true });
      return;
    }
    setLoading(true);
    setMessage({ text: "", error: false });
    try {
      const token = localStorage.getItem("ssrms_token") || "";
      const res = await fetch(`${API_BASE_URL}/api/admin/${ADMIN_ID}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          oldPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error || "Error!", error: true });
      } else {
        setMessage({ text: data.message, error: false });
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      setMessage({ text: "Server error.", error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">Change Password</h2>

      <div className="space-y-5">
        {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
          <div key={field}>
            <label className="mb-2 block text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type="password"
              value={form[field as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white px-4 py-2.5 focus:border-pink-500 outline-none"
            />
          </div>
        ))}

        {message.text && (
          <p className={`text-sm ${message.error ? "text-red-500 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
            {message.text}
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-pink-400 px-6 py-2.5 text-white hover:bg-pink-500 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordForm;