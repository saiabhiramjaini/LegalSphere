import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import  LandingPage  from "@/components/LandingPage";

export default async function HomePage() {
  const session = await getServerSession();

  if (session) {
    redirect("/home");
  }

  return (
    <div>
      <LandingPage />
    </div>
  );
}