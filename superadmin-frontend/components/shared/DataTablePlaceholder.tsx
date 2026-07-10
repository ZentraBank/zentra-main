export default function DataTablePlaceholder({
  columns,
}: {
  columns: string[];
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-[24px] bg-white shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row">
        <input
          placeholder="Search records"
          className="h-11 flex-1 rounded-xl bg-slate-100 px-4 text-sm outline-none"
        />
        <select className="h-11 rounded-xl bg-slate-100 px-4 text-sm outline-none">
          <option>All statuses</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Suspended</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-5 py-4 font-bold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className="px-5 py-16 text-center text-slate-500">
                Connect this table to the relevant backend service.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
