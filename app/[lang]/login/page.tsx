import { redirect } from "next/navigation";

export default function Page({ params }: { params: { lang: string } }) {
  redirect(`/${params.lang}/auth/login`);
}