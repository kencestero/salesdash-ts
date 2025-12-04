import { getDictionary } from "@/app/dictionaries";
import EcommercePageView from "./page-view";

interface DashboardProps {
  params: Promise<{
    lang: any;
  }>;
}
const EcommercePage = async (props: DashboardProps) => {
  const params = await props.params;

  const {
    lang
  } = params;

  const trans = await getDictionary(lang);
  return <EcommercePageView trans={trans} />;
};

export default EcommercePage;
