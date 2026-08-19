const SummaryCards = ({ summary }) => {
  const cards = [
    { label: 'Total shipments', value: summary.total, color: 'var(--paper)' },
    { label: 'In transit', value: summary.inTransit, color: 'var(--cyan)' },
    { label: 'Delayed', value: summary.delayed, color: 'var(--red)' },
    { label: 'Delivered', value: summary.delivered, color: 'var(--green)' },
  ];

  return (
    <div className="summary-grid">
      {cards.map((card) => (
        <div key={card.label} className="panel summary-cell">
          <p className="label">{card.label}</p>
          <p className="value" style={{ color: card.color }}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
