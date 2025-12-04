import DashboardPageView from "./page-view";
import { getDictionary } from "@/app/dictionaries";

interface DashboardProps {
  params: Promise<{
    lang: any;
  }>;
}
const Dashboard = async (props: DashboardProps) => {
  const params = await props.params;

  const {
    lang
  } = params;

  const trans = await getDictionary(lang);

  return <DashboardPageView trans={trans} />;
};

export default Dashboard;
