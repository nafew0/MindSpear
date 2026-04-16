import HeaderPublic from "@/components/Layouts/PublicLayout/Header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderPublic />
      {children}
    </>
  );
}
