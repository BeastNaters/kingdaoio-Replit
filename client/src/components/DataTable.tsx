import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import type { TokenBalance } from "@shared/treasury-types";

interface DataTableProps {
  tokens: TokenBalance[];
  title?: string;
}

type SortField = 'symbol' | 'amount' | 'usdValue' | 'source';
type SortDirection = 'asc' | 'desc';

export function DataTable({ tokens, title = "Token Balances" }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>('usdValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTokens = [...tokens].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (sortField) {
      case 'symbol':
        aVal = a.symbol;
        bVal = b.symbol;
        break;
      case 'amount':
        aVal = a.amount;
        bVal = b.amount;
        break;
      case 'usdValue':
        aVal = a.usdValue || 0;
        bVal = b.usdValue || 0;
        break;
      case 'source':
        aVal = a.source;
        bVal = b.source;
        break;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'dune': return 'bg-chart-1/20 text-chart-1 border-chart-1/30';
      case 'safe': return 'bg-chart-2/20 text-chart-2 border-chart-2/30';
      case 'onchain': return 'bg-chart-3/20 text-chart-3 border-chart-3/30';
      case 'sheets': return 'bg-chart-4/20 text-chart-4 border-chart-4/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  if (tokens.length === 0) {
    return (
      <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-6" data-testid="card-token-table">
        <h3 className="text-lg font-semibold mb-4 font-heading">{title}</h3>
        <div className="text-center py-8 text-muted-foreground">
          No tokens found
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-6" data-testid="card-token-table">
      <h3 className="text-lg font-semibold mb-4 font-heading">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="pb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                <button
                  onClick={() => handleSort('symbol')}
                  className="flex items-center gap-1 hover-elevate p-1 rounded"
                  data-testid="button-sort-symbol"
                >
                  Token
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="pb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide text-right">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center gap-1 ml-auto hover-elevate p-1 rounded"
                  data-testid="button-sort-amount"
                >
                  Amount
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="pb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide text-right">
                Price
              </th>
              <th className="pb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide text-right">
                <button
                  onClick={() => handleSort('usdValue')}
                  className="flex items-center gap-1 ml-auto hover-elevate p-1 rounded"
                  data-testid="button-sort-value"
                >
                  Value (USD)
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="pb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                <button
                  onClick={() => handleSort('source')}
                  className="flex items-center gap-1 hover-elevate p-1 rounded"
                  data-testid="button-sort-source"
                >
                  Source
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTokens.map((token, idx) => (
              <tr
                key={`${token.symbol}-${idx}`}
                className="border-t border-white/5 hover:bg-white/[0.02] transition-colors"
                data-testid={`row-token-${token.symbol.toLowerCase()}`}
              >
                <td className="py-4">
                  <div>
                    <div className="font-semibold text-foreground">{token.symbol}</div>
                    {token.name && (
                      <div className="text-sm text-muted-foreground">{token.name}</div>
                    )}
                  </div>
                </td>
                <td className="py-4 text-right font-mono text-foreground">
                  {token.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </td>
                <td className="py-4 text-right font-mono text-muted-foreground">
                  {token.usdPrice ? `$${token.usdPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                </td>
                <td className="py-4 text-right font-mono font-semibold text-foreground">
                  {token.usdValue ? `$${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                </td>
                <td className="py-4">
                  <Badge variant="outline" className={`${getSourceColor(token.source)} rounded-full text-xs`}>
                    {token.source}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
