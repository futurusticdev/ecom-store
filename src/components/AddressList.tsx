async function AddressListComponent({ userId, page }: { userId: string; page: number }) {
  // ... async operations
  return (
    // ... your JSX
  );
}

// Type cast to work around TS2786 error
export const AddressList = AddressListComponent as unknown as (
  props: { userId: string; page: number }
) => JSX.Element; 