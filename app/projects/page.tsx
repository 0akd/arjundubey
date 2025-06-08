import Projects from "./project";
import axios from "axios";

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  updated_at: string;
  fork: boolean;
}

async function getProjects(): Promise<GitHubRepo[]> {
  const uri = `https://api.github.com/users/arjundubeyg/repos`;
  
  try {
    const res = await axios.get<GitHubRepo[]>(uri);
    return res.data;
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div>
      <Projects data={projects} />
    </div>
  );
}