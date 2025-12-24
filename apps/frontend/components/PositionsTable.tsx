interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
}

interface PositionsTableProps {
  positions: Position[];
}

export default function PositionsTable({ positions }: PositionsTableProps) {
  if (positions.length === 0) {
    return <div className="text-gray-400 text-sm">No open positions</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left">Symbol</th>
            <th className="px-4 py-2 text-right">Quantity</th>
            <th className="px-4 py-2 text-right">Avg Price</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position, index) => (
            <tr key={index} className="border-t border-gray-700">
              <td className="px-4 py-2">{position.symbol}</td>
              <td className={`px-4 py-2 text-right ${position.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {position.quantity.toFixed(6)}
              </td>
              <td className="px-4 py-2 text-right">
                ${position.averagePrice.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
