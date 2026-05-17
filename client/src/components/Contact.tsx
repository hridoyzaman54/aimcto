import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export default function Contact() {
  return (
    <section className="w-full bg-white py-24">
      <div className="container mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">

          {/* Left: Heading & Video */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-5xl font-bold uppercase tracking-tight text-black">
                Connect With Us
              </h2>
              <p className="text-lg text-gray-600">
                Get In Touch
              </p>
            </div>

            <div className="flex justify-center md:justify-center w-full mt-0">
              <audio id="hover-bgm" loop>
                <source src="/sounds/festive-melody.wav" type="audio/wav" />
              </audio>
              <div className="relative w-full max-w-[60%] aspect-square overflow-hidden bg-white">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[150%] h-auto mix-blend-multiply"
                >
                  <source src="/videos/logo_video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Central Hit Area (Book Icon) */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[35%] cursor-pointer z-10"
                  onMouseEnter={() => {
                    const audio = document.getElementById('hover-bgm') as HTMLAudioElement;
                    if (audio) {
                      audio.currentTime = 0;
                      audio.play().catch(() => { });
                    }
                  }}
                  onMouseLeave={() => {
                    const audio = document.getElementById('hover-bgm') as HTMLAudioElement;
                    if (audio) {
                      audio.pause();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Form & Info */}
          <div className="flex flex-col gap-12">
            <div className="max-w-md text-gray-600 text-sm leading-relaxed">
              <p>
                Reach out to us to explore our diverse range of courses and programs, and discover the perfect learning path for you or your child.
              </p>
            </div>

            <form className="flex flex-col gap-8 w-full max-w-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Name *</label>
                  <Input className="border-0 border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black bg-transparent" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Email *</label>
                  <Input className="border-0 border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black bg-transparent" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Phone</label>
                  <Input className="border-0 border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black bg-transparent" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Subject</label>
                  <Input className="border-0 border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black bg-transparent" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-gray-500">Message</label>
                <Textarea className="border-0 border-b border-gray-300 rounded-none px-0 min-h-[100px] resize-none focus-visible:ring-0 focus-visible:border-black bg-transparent" />
              </div>

              <div className="pt-4">
                <Button
                  className="bg-black text-white hover:bg-gray-800 rounded-none px-12 py-6 uppercase tracking-widest text-xs w-full md:w-auto"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
