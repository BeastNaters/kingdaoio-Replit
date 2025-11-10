import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from "@/components/ui/card";
import type { TokenBalance } from "@shared/treasury-types";

interface PortfolioChartProps {
  tokens: TokenBalance[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function PortfolioChart({ tokens }: PortfolioChartProps) {
  const data = tokens
    .filter(t => t.usdValue && t.usdValue > 0)
    .slice(0, 5)
    .map(token => ({
      name: token.symbol,
      value: token.usdValue || 0,
    }));

  if (data.length === 0) {
    return (
      <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-6" data-testid="card-portfolio-chart">
        <h3 className="text-lg font-semibold mb-4 font-heading">Portfolio Allocation</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No token data available
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-6" data-testid="card-portfolio-chart">
      <h3 className="text-lg font-semibold mb-4 font-heading">Portfolio Allocation</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
            }}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
