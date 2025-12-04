import { getDictionary } from "@/app/dictionaries";
import ProjectPageView from "./page-view";

interface DashboardProps {
  params: Promise<{
    lang: any;
  }>;
}

const ProjectPage = async (props: DashboardProps) => {
  const params = await props.params;

  const {
    lang
  } = params;

  const trans = await getDictionary(lang);
  return <ProjectPageView trans={trans} />;
};

export default ProjectPage;
