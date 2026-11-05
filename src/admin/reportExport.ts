export interface ReportData {
  from: string;
  to: string;
  daily_registrations: { day: string; count: number }[];
  monthly: { month: string; registrations: number; total_users: number; revenue: number }[];
  subscription_sales: { plan: string; sold: number; amount: number; test_sold: number }[];
  most_viewed: { profile_code: string | null; user_id: string; city: string | null; views: number }[];
}

type Cell = { value: string | number; fontWeight?: 'bold' } | null;

const heading = (...labels: string[]): Cell[] => labels.map((value) => ({ value, fontWeight: 'bold' }));

/** Loaded only when someone exports. Carries member codes and totals, never names or contact details. */
export async function exportReportExcel(data: ReportData): Promise<void> {
  // The universal build runs without a Web Worker, which the site's security policy would block.
  const { default: writeExcelFile } = await import('write-excel-file/universal');
  const sheets = [
    {
      sheet: 'Monthly',
      data: [heading('Month', 'Registrations', 'Total users', 'Revenue (INR)'),
        ...data.monthly.map((m): Cell[] => [{ value: m.month }, { value: m.registrations }, { value: m.total_users }, { value: Number(m.revenue) }])],
    },
    {
      sheet: 'Daily registrations',
      data: [heading('Date', 'Registrations'), ...data.daily_registrations.map((d): Cell[] => [{ value: d.day }, { value: d.count }])],
    },
    {
      sheet: 'Subscription sales',
      data: [heading('Plan', 'Sold', 'Amount (INR)', 'Test entries, not real'),
        ...data.subscription_sales.map((s): Cell[] => [{ value: s.plan }, { value: s.sold }, { value: Number(s.amount) }, { value: s.test_sold }])],
    },
    {
      sheet: 'Most viewed',
      data: [heading('Member ID', 'City', 'Views'),
        ...data.most_viewed.map((v): Cell[] => [{ value: v.profile_code ?? '' }, { value: v.city ?? '' }, { value: v.views }])],
    },
  ];
  const blob: Blob = await (writeExcelFile as any)(sheets).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sanaibandh-report-${data.from}-to-${data.to}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/** English only, and without city names, because the default PDF fonts have no Marathi letters. */
export async function exportReportPdf(data: ReportData): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const bottom = doc.internal.pageSize.getHeight() - 50;
  let y = 60;

  const newPageIfNeeded = () => {
    if (y > bottom) {
      doc.addPage();
      y = 60;
    }
  };
  const title = (text: string) => {
    y += 16;
    newPageIfNeeded();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(text, 50, y);
    y += 20;
  };
  const row = (cells: string[], bold = false) => {
    newPageIfNeeded();
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(10);
    cells.forEach((cell, i) => doc.text(cell, 50 + i * 125, y));
    y += 16;
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('Sanaibandh report', 50, y);
  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${data.from} to ${data.to} (India time). Test payments are not counted as revenue.`, 50, y);
  y += 10;

  title('By month');
  row(['Month', 'Registrations', 'Total users', 'Revenue (INR)'], true);
  data.monthly.forEach((m) => row([m.month, String(m.registrations), String(m.total_users), Number(m.revenue).toFixed(2)]));

  title('Subscription sales');
  if (data.subscription_sales.length === 0) row(['No sales in this period.']);
  else {
    row(['Plan', 'Sold', 'Amount (INR)', 'Test entries'], true);
    data.subscription_sales.forEach((s) => row([s.plan.slice(0, 22), String(s.sold), Number(s.amount).toFixed(2), String(s.test_sold)]));
  }

  title('Most viewed profiles');
  if (data.most_viewed.length === 0) row(['No profile visits in this period.']);
  else {
    row(['Member ID', 'Views'], true);
    data.most_viewed.forEach((v) => row([v.profile_code ?? '-', String(v.views)]));
  }

  doc.save(`sanaibandh-report-${data.from}-to-${data.to}.pdf`);
}
