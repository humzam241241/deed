// Mock order data — swap these functions with Supabase calls when ready.
// e.g.: const { data } = await supabase.from('orders').select('*').order('date', { ascending: false })

export const MOCK_ORDERS = [
  {
    id: 'ORD-2026-001',
    customer: 'Ontario Tech Soccer Club',
    email: 'soccer@ontariotechu.ca',
    product: 'T-Shirt',
    qty: 75,
    amount: 937.50,
    status: 'completed',
    date: '2026-02-10',
    design: 'Club Crest 2026',
    notes: 'Back print + sleeve logo',
  },
  {
    id: 'ORD-2026-002',
    customer: 'Sanofi Canada',
    email: 'hr@sanofi.ca',
    product: 'Polo',
    qty: 120,
    amount: 2400.00,
    status: 'in-progress',
    date: '2026-02-15',
    design: 'Sanofi Logo - Left Chest',
    notes: 'Embroidered logo, Navy colour',
  },
  {
    id: 'ORD-2026-003',
    customer: 'UOIT Engineering Society',
    email: 'eng@ontariotechu.ca',
    product: 'Hoodie',
    qty: 50,
    amount: 1500.00,
    status: 'pending',
    date: '2026-02-18',
    design: 'Engineering Class 2026',
    notes: 'Front + back print',
  },
  {
    id: 'ORD-2026-004',
    customer: 'Ridgeback Athletics',
    email: 'athletics@uoit.ca',
    product: 'T-Shirt',
    qty: 200,
    amount: 2500.00,
    status: 'completed',
    date: '2026-01-28',
    design: 'Ridgebacks Mascot',
    notes: '3 colour front print',
  },
  {
    id: 'ORD-2026-005',
    customer: 'TechStart Oshawa',
    email: 'hello@techstart.ca',
    product: 'Hat',
    qty: 40,
    amount: 720.00,
    status: 'completed',
    date: '2026-01-20',
    design: 'TechStart Logo Embroidery',
    notes: 'Structured snapback',
  },
  {
    id: 'ORD-2026-006',
    customer: 'Durham College Esports',
    email: 'esports@durhamcollege.ca',
    product: 'Hoodie',
    qty: 30,
    amount: 900.00,
    status: 'pending',
    date: '2026-02-20',
    design: 'DC Esports 2026',
    notes: 'Zip-up, embroidered back',
  },
  {
    id: 'ORD-2026-007',
    customer: 'Magna International',
    email: 'procurement@magna.com',
    product: 'Polo',
    qty: 300,
    amount: 6000.00,
    status: 'in-progress',
    date: '2026-02-12',
    design: 'Magna Corporate Crest',
    notes: 'Bulk corporate order — 3 colours',
  },
  {
    id: 'ORD-2026-008',
    customer: 'UOIT Robotics Club',
    email: 'robotics@ontariotechu.ca',
    product: 'T-Shirt',
    qty: 35,
    amount: 437.50,
    status: 'completed',
    date: '2026-01-15',
    design: 'Robot Mascot + Club Name',
    notes: '',
  },
];

export function getStats(orders) {
  const total       = orders.length;
  const revenue     = orders.reduce((s, o) => s + o.amount, 0);
  const pending     = orders.filter(o => o.status === 'pending').length;
  const inProgress  = orders.filter(o => o.status === 'in-progress').length;
  const completed   = orders.filter(o => o.status === 'completed').length;
  const avgOrder    = revenue / total;

  const productCounts = orders.reduce((acc, o) => {
    acc[o.product] = (acc[o.product] || 0) + 1;
    return acc;
  }, {});

  const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return { total, revenue, pending, inProgress, completed, avgOrder, productCounts, topProduct };
}
