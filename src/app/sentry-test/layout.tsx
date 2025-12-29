import Providers from "@/components/Providers";

export default function SentryTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
