interface Order {
  orderId: string;
  symbol: string;
  side: string;
  type: string;
  quantity: number;
  price?: number;
  status: string;
  createdAt: string;
}

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return <div className="text-gray-400 text-sm">No orders yet</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILLED':
        return 'text-green-400';
      case 'REJECTED':
        return 'text-red-400';
      case 'PENDING':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left">Symbol</th>
            <th className="px-4 py-2 text-left">Side</th>
            <th className="px-4 py-2 text-right">Qty</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId} className="border-t border-gray-700">
              <td className="px-4 py-2">{order.symbol}</td>
              <td className={`px-4 py-2 ${order.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                {order.side}
              </td>
              <td className="px-4 py-2 text-right">{order.quantity}</td>
              <td className={`px-4 py-2 ${getStatusColor(order.status)}`}>
                {order.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
