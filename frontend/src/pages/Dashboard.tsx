import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { getRooms, type Room } from '../services/roomService';
import { getTenants, type Tenant } from '../services/tenantService';
import { getInvoices, type Invoice } from '../services/invoiceService';
import { getMaintenance, type Maintenance } from '../services/maintenanceService';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
}
function StatCardItem({ stat }: { stat: StatCard }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
          <p className="text-2xl font-semibold text-gray-800 dark:text-white">{stat.value}</p>
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl ${stat.color}`}>
          {stat.icon}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const isPositive = status === 'Paid' || status === 'Done';
  const label =
    status === 'Paid' ? 'បានបង់' :
    status === 'Unpaid' ? 'ជំពាក់' :
    status === 'Done' ? 'រួចរាល់' : 'កំពុងរង់ចាំ';
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-md ${
        isPositive
          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
      }`}
    >
      {label}
    </span>
  );
}

function RevenueChart({ invoices }: { invoices: Invoice[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const revenueByMonth: Record<string, number> = {};
    invoices.forEach((inv) => {
      const date = new Date(inv.invoicedate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(inv.totalamount);
    });

    const sortedKeys = Object.keys(revenueByMonth).sort();
    const labels = sortedKeys.map((k) => {
      const [, m] = k.split('-');
      const monthNames = ['មករា', 'កុម្ភៈ', 'មិនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
      return monthNames[parseInt(m) - 1];
    });
    const data = sortedKeys.map((k) => revenueByMonth[k]);

    const isDark = document.documentElement.classList.contains('dark');

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: labels.length > 0 ? labels : ['គ្មានទិន្នន័យ'],
        datasets: [
          {
            label: 'ចំណូល',
            data: data.length > 0 ? data : [0],
            backgroundColor: '#378ADD',
            borderRadius: 6,
            maxBarThickness: 36,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (v: string | number) => `$${v}`, color: isDark ? '#9ca3af' : '#6b7280' },
            grid: { color: isDark ? '#374151' : '#f0f0f0' },
          },
          x: {
            grid: { display: false },
            ticks: { color: isDark ? '#9ca3af' : '#6b7280' },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [invoices]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '260px' }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="ក្រាបបង្ហាញចំណូលប្រចាំខែ"
      />
    </div>
  );
}

function OccupancyGauge({ rooms }: { rooms: Room[] }) {
  const total = rooms.length;
  const occupied = rooms.filter((r) => r.status === 'Occupied').length;
  const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col items-center justify-center">
      <h2 className="font-semibold text-gray-800 dark:text-white self-start mb-4">អត្រាកាន់កាប់បន្ទប់</h2>
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" className="stroke-[#f1f0e8] dark:stroke-gray-700" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#378ADD"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(rate / 100) * 263.9} 263.9`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-semibold text-gray-800 dark:text-white">{rate}%</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
        {occupied} ក្នុងចំណោម {total} បន្ទប់
      </p>
    </div>
  );
}

function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [, setTenants] = useState<Tenant[]>([]);
  const [tenantCount, setTenantCount] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAutoRefresh(() => {
    const loadDashboard = async () => {
      try {
        setError(null);
        const [roomsData, tenantsData, invoicesData, maintenanceData] = await Promise.all([
          getRooms(),
          getTenants(),
          getInvoices(),
          getMaintenance(),
        ]);
        setRooms(roomsData);
        setTenants(tenantsData);
        setTenantCount(tenantsData.length);
        setInvoices(invoicesData);
        setMaintenance(maintenanceData);
      } catch (err) {
        setError('មិនអាចទាញទិន្នន័យបានទេ។ សូមពិនិត្យ Backend Server។');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, 15000);

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400 text-center py-10">កំពុងផ្ទុកទិន្នន័យ...</p>;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm">
        {error}
      </div>
    );
  }

  const availableRooms = rooms.filter((r) => r.status === 'Available').length;
  const now = new Date();
  const thisMonthRevenue = invoices
    .filter((inv) => {
      const d = new Date(inv.invoicedate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, inv) => sum + Number(inv.totalamount), 0);

  const stats: StatCard[] = [
    { label: 'បន្ទប់ទាំងអស់', value: String(rooms.length), icon: '🚪', color: 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
    { label: 'បន្ទប់ទំនេរ', value: String(availableRooms), icon: '✅', color: 'bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400' },
    { label: 'អ្នកជួលសរុប', value: String(tenantCount), icon: '👥', color: 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' },
    { label: 'ចំណូលខែនេះ', value: `$${thisMonthRevenue.toFixed(2)}`, icon: '💰', color: 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' },
  ];

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.invoicedate).getTime() - new Date(a.invoicedate).getTime())
    .slice(0, 3);

  const recentMaintenance = [...maintenance]
    .sort((a, b) => new Date(b.reportdate).getTime() - new Date(a.reportdate).getTime())
    .slice(0, 3);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងផ្ទះជួល</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stats.map((stat) => (
          <StatCardItem key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">ចំណូលប្រចាំខែ</h2>
          <RevenueChart invoices={invoices} />
        </div>

        <OccupancyGauge rooms={rooms} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">វិក្កយបត្រថ្មីៗ</h2>
          {recentInvoices.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">មិនទាន់មានវិក្កយបត្រទេ</p>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((inv) => (
                <div key={inv.invoiceid} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{inv.tenantname}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">បន្ទប់ {inv.roomnumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">${inv.totalamount}</p>
                    <StatusPill status={inv.paymentstatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">ការជួសជុលថ្មីៗ</h2>
          {recentMaintenance.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">មិនទាន់មានការជួសជុលទេ</p>
          ) : (
            <div className="space-y-3">
              {recentMaintenance.map((m) => (
                <div key={m.maintenanceid} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{m.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">បន្ទប់ {m.roomnumber}</p>
                  </div>
                  <StatusPill status={m.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;