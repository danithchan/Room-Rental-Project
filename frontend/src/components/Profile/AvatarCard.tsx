import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { getCurrentAdmin, getAvatarUrl } from "../../services/authService";

const AvatarCard = () => {
  const admin = getCurrentAdmin();
  const ADMIN_ID = admin?.adminid;

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullname, setFullname] = useState("");
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ADMIN_ID) return;
    api
      .get(`/admin/${ADMIN_ID}`)
      .then(({ data }) => {
        setFullname(data.fullname || "Admin");
        setAvatarUrl(getAvatarUrl(data.avatarurl));
      })
      .catch(() => setFullname("Admin"))
      .finally(() => setFetching(false));
  }, [ADMIN_ID]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ADMIN_ID) return;
    const formData = new FormData();
    formData.append("avatar", file);
    setLoading(true);
    try {
      const { data } = await api.post(`/admin/${ADMIN_ID}/upload-avatar`, formData);
      setAvatarUrl(getAvatarUrl(data.avatarurl));
    } catch (err: any) {
      // A 401/403 here is already handled globally by the api interceptor
      // (clears the session and redirects to /login), so only show an
      // alert for other kinds of failures.
      const status = err?.response?.status;
      if (status !== 401 && status !== 403) {
        alert(err?.response?.data?.error || "Upload failed!");
      }
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const avatarSrc =
    avatarUrl ||
    (fullname
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}&background=3b82f6&color=fff`
      : "");

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="flex flex-col items-center">
        {fetching ? (
          <div className="h-32 w-32 rounded-full border-4 border-pink-500 bg-gray-100 dark:bg-gray-700 animate-pulse" />
        ) : (
          <img
            src={avatarSrc}
            alt="Profile"
            className="h-32 w-32 rounded-full border-4 border-pink-400 object-cover"
          />
        )}
        <h2 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">
          {fetching ? "..." : fullname}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Administrator</p>
        <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading || fetching}
          className="mt-6 w-full rounded-lg bg-pink-400 py-2 text-white hover:bg-pink-500 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload New Photo"}
        </button>
      </div>
    </div>
  );
};

export default AvatarCard;
