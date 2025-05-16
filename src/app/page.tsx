import Link from "next/link";
import { IDSearchForm } from "./parts/form";

export default function Home() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center bg-gray-50">
      <main className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Retake/Improvement Application Wizard
        </h1>
        <p className="text-gray-600 text-center mb-8">
          স্যার বলেছে কোনো কোর্সে রিটেক / ইম্প্রুভমেন্ট মিলিয়ে ১০/১৫ জন হলে নতুন সেকশনই খোলা যেতে পারে।
          তাই বানিয়ে ফেললাম এই ওয়েবসাইটটা।
          এটা আনঅফিসিয়াল তবে ১৮ তারিখ সবার তালিকা নিয়ে স্যারের কাছে  গিয়ে নতুন সেকশনের ব্যাপারে ডিসকাস করব ইনশাল্লাহ।
          এর আগেই সাবমিট করুন। ১৮ তারিখ রাত ১ টা পর্যন্ট লাস্ট ডেট ধরে রাখতে পারেন।
          কোনো সমস্যা থাকলে জানান admin@courseimprove.studio এ।
        </p>
        <p className="text-gray-800 text-center mb-8">
          নোটঃ আপনার যেসব কোর্সে রিটেক আছে বা ইম্প্রুভমেন্ট নিতে চান এমন সব কোর্সই সিলেক্ট করবেন।
          কোনোটা বাদ দিবেন না।
          তাহলে সেকশন খোলা সহজ হবে। সেকশন অ্যাপ্রুভ হলে ফোনে জানানো হবে ইনশাল্লাহ।
          ফোন ম্যান্ডেটরি কারণ অ্যাপ্লিকেশন করলে ফোন নম্বর চায়।
        </p>
        <p className="text-black-800 text-center mb-8">
          কোন কোর্সে কতজন হয়েছে দেখতে ক্লিক করুন{" "}
          <Link href={"/ranking"} className="underline">এখানে।</Link>
        </p>
        <IDSearchForm />
      </main>
    </div>
  );
}
