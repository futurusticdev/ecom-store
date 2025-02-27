async function OrderListComponent({
  userId,
  page,
  status
}: {
  userId: string;
  page: number;
  status?: string;
}) {
  // ... async operations
  return (
    // ... your JSX
  );
}

// Type cast to work around TS2786 error
export const OrderList = OrderListComponent as unknown as (
  props: { userId: string; page: number; status?: string }
) => JSX.Element; 