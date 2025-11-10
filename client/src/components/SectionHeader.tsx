interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold font-heading text-foreground">{title}</h2>
      {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
