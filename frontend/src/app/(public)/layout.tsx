import HeaderPublic from "@/components/Layouts/publicLayout/Header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderPublic />
      {children}
    </>
  );
}
