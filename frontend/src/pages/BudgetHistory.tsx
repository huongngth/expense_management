import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { api } from "../lib/api";
import { formatVND } from "../lib/mockData";

interface BudgetHistoryItem {
  id: string;
  amountLimit: number;
  amountSpent: number;
  percentUsed: number;
  startDate: string;
  endDate: string;
  category: {
    name: string;
    color: string;
  };
}

interface BudgetGroup {
  label: string;
  totalLimit: number;
  totalSpent: number;
  count: number;
  avgPercentUsed: number;
}

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

export function BudgetHistory() {
  const today = new Date();
  const currentYear = today.getFullYear();

  const [groupBy, setGroupBy] = useState<"month" | "year" | "category">(
    "month",
  );
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState(
    String(today.getMonth() + 1),
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [historyGroups, setHistoryGroups] = useState<BudgetGroup[]>([]);
  const [historyItems, setHistoryItems] = useState<BudgetHistoryItem[]>([]);
  const [stats, setStats] = useState({
    totalBudgets: 0,
    totalLimit: 0,
    totalSpent: 0,
    averageUsage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const yearOptions = useMemo(
    () => [currentYear, currentYear - 1, currentYear - 2, currentYear - 3],
    [currentYear],
  );

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: new Date(0, i).toLocaleString("vi-VN", { month: "long" }),
      })),
    [],
  );

  const fetchCategories = async () => {
    try {
      const data = await api.get("/api/categories");
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("groupBy", groupBy);
      if (selectedYear) params.append("year", selectedYear);
      if (groupBy === "month" && selectedMonth)
        params.append("month", selectedMonth);
      if (selectedCategory) params.append("categoryId", selectedCategory);

      const data = await api.get(`/api/budgets/history?${params.toString()}`);
      setHistoryGroups(data.groups || []);
      setHistoryItems(data.items || []);
      setStats(
        data.stats || {
          totalBudgets: 0,
          totalLimit: 0,
          totalSpent: 0,
          averageUsage: 0,
        },
      );
    } catch (error) {
      console.error("Error fetching budget history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [groupBy, selectedYear, selectedMonth, selectedCategory]);

  const headerLabel =
    groupBy === "year" ? "Năm" : groupBy === "category" ? "Danh mục" : "Tháng";

  const handleGroupByChange = (value: "month" | "year" | "category") => {
    setGroupBy(value);
    if (value === "category") {
      setSelectedMonth("");
    } else if (value === "year") {
      setSelectedMonth("");
    } else {
      if (!selectedMonth) setSelectedMonth(String(today.getMonth() + 1));
    }
  };

  return (
    <div className="h-full max-w-7xl mx-auto space-y-6">


      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-slate-500">Tổng số mục chi tiêu (có lập ngân sách)</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {stats.totalBudgets}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Tổng ngân sách</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatVND(stats.totalLimit)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Đã chi</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatVND(stats.totalSpent)}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Trung bình {stats.averageUsage}% sử dụng
          </p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {["month", "year", "category"].map((option) => (
              <button
                key={option}
                onClick={() =>
                  handleGroupByChange(option as "month" | "year" | "category")
                }
                className={`px-3 py-2 rounded-full border text-sm font-medium transition ${groupBy === option ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
              >
                {option === "month"
                  ? "Theo tháng"
                  : option === "year"
                    ? "Theo năm"
                    : "Theo danh mục"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 mb-1">Năm</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="input-field"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {groupBy === "month" && (
              <div className="flex flex-col">
                <label className="text-xs text-slate-500 mb-1">Tháng</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="input-field"
                >
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col">
              <label className="text-xs text-slate-500 mb-1">
                Danh mục (tùy chọn)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                <option value="">Tất cả</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Ngân sách {headerLabel}
              </h3>
            </div>
          </div>
          <div className="h-[320px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : historyGroups.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={historyGroups.slice(0, 8)}
                  margin={{ top: 10, right: 20, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(value) => formatVND(value)}
                    width={90}
                    tick={{ fill: "#475569", fontSize: 11 }}
                  />
                  <Tooltip formatter={(value: number) => formatVND(value)} />
                  <Legend />
                  <Bar dataKey="totalSpent" name="Đã chi" fill="#10B981" />
                  <Bar dataKey="totalLimit" name="ngân sách" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                Không có dữ liệu lịch sử ngân sách.
              </div>
            )}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Tóm tắt</h3>
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Tổng Ngân sách</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {formatVND(stats.totalLimit)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Tổng chi</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {formatVND(stats.totalSpent)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Số mục chi tiêu (có lập ngân sách)</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {stats.totalBudgets}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Sử dụng trung bình</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {stats.averageUsage}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Chi tiết ngân sách
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-wide">
                  Danh mục
                </th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-wide">
                  Khoảng thời gian
                </th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-wide text-right">
                  ngân sách
                </th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-wide text-right">
                  Đã chi
                </th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-wide text-right">
                  Sử dụng
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : historyItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Không tìm thấy ngân sách nào trong khoảng chọn.
                  </td>
                </tr>
              ) : (
                historyItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.category.color }}
                        />
                        <span className="font-medium text-slate-800">
                          {item.category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {item.startDate} → {item.endDate}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-900">
                      {formatVND(item.amountLimit)}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-700">
                      {formatVND(item.amountSpent)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${item.percentUsed >= 100 ? "bg-red-50 text-red-600" : item.percentUsed >= 80 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-600"}`}
                      >
                        {item.percentUsed}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
