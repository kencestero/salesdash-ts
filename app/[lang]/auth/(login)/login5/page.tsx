"use client";
import Image from "next/image";
import { Icon } from "@iconify/react";
import background from "@/public/images/auth/line.png";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Fragment, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LogInForm from "@/components/auth/login-form";

const LoginPage = () => {
  const [openVideo, setOpenVideo] = useState<boolean>(false);
  return (
    <Fragment>
      <div className="min-h-screen bg-background flex overflow-hidden w-full">
        <div className="min-h-screen basis-full flex w-full">
          <div className="basis-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 w-full relative hidden xl:flex overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/auth/line.png')] opacity-10"></div>
            <Image
              src="/images/mjenterprises.webp"
              alt="MJ Enterprises"
              width={1200}
              height={1200}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          <div className="min-h-screen basis-full md:basis-1/2 w-full px-4 py-5 flex justify-center items-center overflow-y-auto">
            <div className="lg:w-[480px]">
              <LogInForm />
            </div>
          </div>
        </div>
      </div>
      <Dialog open={openVideo} >
        <DialogContent size="lg" className="p-0" hiddenCloseIcon>
          <Button
            size="icon"
            onClick={() => setOpenVideo(false)}
            className="absolute -top-4 -right-4 bg-default-900"
          >
            <X className="w-6 h-6" />
          </Button>
          <iframe
            width="100%"
            height="315"
            src="https://www.youtube.com/embed/8D6b3McyhhU?si=zGOlY311c21dR70j"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default LoginPage;
