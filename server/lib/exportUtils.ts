import PDFDocument from 'pdfkit';
import type { TreasurySnapshot } from '@shared/schema';

export function generateCsvData(snapshots: TreasurySnapshot[]): string {
  if (snapshots.length === 0) {
    return 'No data available';
  }

  const headers = [
    'Date',
    'Total USD Value',
    'Token Count',
    'NFT Count',
    'Wallet Count',
  ];

  const rows = snapshots.map(snapshot => [
    new Date(snapshot.timestamp).toISOString(),
    snapshot.totalUsdValue.toFixed(2),
    Array.isArray(snapshot.tokens) ? snapshot.tokens.length : 0,
    Array.isArray(snapshot.nfts) ? snapshot.nfts.length : 0,
    Array.isArray(snapshot.wallets) ? snapshot.wallets.length : 0,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
}

export async function generatePdfReport(snapshots: TreasurySnapshot[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(24).text('KingDAO Treasury Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      if (snapshots.length === 0) {
        doc.fontSize(14).text('No data available for the selected date range');
        doc.end();
        return;
      }

      const latest = snapshots[snapshots.length - 1];
      const oldest = snapshots[0];

      doc.fontSize(16).text('Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Period: ${new Date(oldest.timestamp).toLocaleDateString()} - ${new Date(latest.timestamp).toLocaleDateString()}`);
      doc.text(`Latest Total Value: $${latest.totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      
      if (snapshots.length > 1) {
        const change = latest.totalUsdValue - oldest.totalUsdValue;
        const changePercent = ((change / oldest.totalUsdValue) * 100).toFixed(2);
        doc.text(`Change: $${change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${changePercent}%)`);
      }

      doc.moveDown(2);

      doc.fontSize(16).text('Top Holdings', { underline: true });
      doc.moveDown();

      if (Array.isArray(latest.tokens) && latest.tokens.length > 0) {
        doc.fontSize(12).text('Tokens:', { underline: true });
        doc.moveDown(0.5);

        const sortedTokens = [...(latest.tokens as any[])].sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0)).slice(0, 10);

        const tableTop = doc.y;
        const symbolX = 50;
        const amountX = 200;
        const valueX = 350;
        let currentY = tableTop;

        doc.fontSize(10).text('Symbol', symbolX, currentY);
        doc.text('Amount', amountX, currentY);
        doc.text('USD Value', valueX, currentY);
        currentY += 20;

        doc.moveTo(symbolX, currentY).lineTo(500, currentY).stroke();
        currentY += 5;

        sortedTokens.forEach((token) => {
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }

          doc.text(token.symbol, symbolX, currentY);
          doc.text(token.amount.toLocaleString('en-US', { maximumFractionDigits: 4 }), amountX, currentY);
          doc.text(`$${(token.usdValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX, currentY);
          currentY += 18;
        });

        doc.moveDown(2);
      }

      if (Array.isArray(latest.nfts) && latest.nfts.length > 0) {
        if (doc.y > 600) {
          doc.addPage();
        }

        doc.fontSize(12).text('NFTs:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Total NFT Holdings: ${(latest.nfts as any[]).length}`);

        const collectionsMap = new Map();
        (latest.nfts as any[]).forEach((nft) => {
          const count = collectionsMap.get(nft.collection) || 0;
          collectionsMap.set(nft.collection, count + 1);
        });

        doc.moveDown(0.5);
        doc.text('Top Collections:');
        doc.moveDown(0.5);

        Array.from(collectionsMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .forEach(([collection, count]) => {
            doc.text(`${collection}: ${count} items`);
          });
      }

      doc.moveDown(2);

      if (snapshots.length > 1) {
        if (doc.y > 600) {
          doc.addPage();
        }

        doc.fontSize(16).text('Historical Data', { underline: true });
        doc.moveDown();

        const tableTop = doc.y;
        const dateX = 50;
        const valueX = 200;
        let currentY = tableTop;

        doc.fontSize(10).text('Date', dateX, currentY);
        doc.text('Total Value (USD)', valueX, currentY);
        currentY += 20;

        doc.moveTo(dateX, currentY).lineTo(500, currentY).stroke();
        currentY += 5;

        snapshots.slice().reverse().slice(0, 20).forEach((snapshot) => {
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }

          doc.text(new Date(snapshot.timestamp).toLocaleDateString(), dateX, currentY);
          doc.text(`$${snapshot.totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX, currentY);
          currentY += 18;
        });

        if (snapshots.length > 20) {
          doc.text(`... and ${snapshots.length - 20} more snapshots`, dateX, currentY);
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
