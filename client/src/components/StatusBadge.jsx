const STATUS_STYLES = {
  Pending: 'bg-slate-100 text-slate-700',
  'In Transit': 'bg-blue-100 text-blue-700',
  Customs: 'bg-amber-100 text-amber-700',
  Delivered: 'bg-green-100 text-green-700',
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
