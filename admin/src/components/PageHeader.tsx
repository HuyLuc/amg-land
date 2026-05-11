interface PageHeaderProps {
  title: string;
  description: string;
  action?: JSX.Element;
}

export function PageHeader({ title, description, action }: PageHeaderProps): JSX.Element {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
