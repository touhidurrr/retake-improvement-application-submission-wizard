import Link from "next/link";
import { Copyright } from "./parts/copyright";
import { WhatsAppButton } from "./parts/whatsapp-button";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center bg-gray-50">
      <main className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Retake/Improvement Application Wizard
        </h1>
        <p className="text-black font-bold text-center mb-8">ধন্যবাদ সবাইকে!</p>
        <p className="text-gray-600 text-center mb-8">
          আপনারা আপনাদের তথ্য দিয়ে আমাদের খুলতে সাহায্য করেছেন নতুন নতুন সব
          সেকশন! আপনাদের নামের তালিকা CSE ডিপার্টমেন্ট এর অ্যাডমিনকে পাঠানো
          হয়েছে!
        </p>
        <p className="text-gray-600 text-center mb-8">
          এখন চেয়ারম্যান স্যারের রুমে গিয়ে <b>৫ জুনের মধ্যে</b> আপনার পছন্দের
          কোর্সে আপনার নামের পাশে সই করে আপনার আবেদনটি নিশ্চিত করুন।{" "}
          <b>সই না করলে কোর্স অ্যাড হবে না</b> তাই দ্রুত সই করুন!
        </p>

        <div className="flex justify-center mb-8">
          <Button asChild size="lg">
            <Link href={"/ranking"}>
              কোর্স অনুযায়ী আবেদনকারীদের তালিকা দেখুন
            </Link>
          </Button>
        </div>
      </main>

      <div className="py-4">
        <WhatsAppButton />
      </div>

      <Copyright />
    </div>
  );
}
