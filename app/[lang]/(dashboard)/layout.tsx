import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/app/dictionaries";

const layout = async (props: { children: React.ReactNode; params: Promise<{ lang: any }> }) => {
  const params = await props.params;

  const {
    lang
  } = params;

  const {
    children
  } = props;

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const trans = await getDictionary(lang);

  return (
    <DashBoardLayoutProvider trans={trans}>{children}</DashBoardLayoutProvider>
  );
};

export default layout;
