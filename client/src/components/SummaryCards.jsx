const SummaryCards = ({ summary }) => {
  const cards = [
    { label: 'Total shipments', value: summary.total, accent: 'text-slate-900' },
    { label: 'In transit', value: summary.inTransit, accent: 'text-blue-600' },
    { label: 'Delayed', value: summary.delayed, accent: 'text-red-600' },
    { label: 'Delivered', value: summary.delivered, accent: 'text-green-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className={`text-2xl font-semibold mt-1 ${card.accent}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
