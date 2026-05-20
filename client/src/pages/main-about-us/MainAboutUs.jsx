import { useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock3,
  HandHelping,
  HeartHandshake,
  Home,
  PawPrint,
  ShieldPlus,
  Share2,
  Stethoscope,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import MainNavbar from "@/components/main-navbar/MainNavbar";
import { getImageSrc } from "@/lib/image";

const impactStats = [
  { icon: PawPrint, value: "1,500+", label: "Animals rescued and stabilised" },
  { icon: Home, value: "800+", label: "Successful adoptions completed" },
  { icon: Users, value: "250+", label: "Active volunteers and fosters" },
  { icon: Award, value: "5+", label: "Years serving local communities" },
];

const rescueStories = [
  {
    name: "Bruno's Rainy-Night Rescue",
    summary:
      "Bruno was found hiding under a food cart during monsoon traffic. He was dehydrated, limping, and too scared to come out until one volunteer sat beside him for nearly an hour.",
    outcome:
      "After treatment, foster care, and patient leash training, Bruno was adopted by a family in Chandigarh who now send us weekly park photos.",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Luna Learned to Trust Again",
    summary:
      "Luna arrived after being left outside an apartment complex for days. She avoided touch, refused food, and spent her first week curled up inside a blanket crate.",
    outcome:
      "A slow foster routine, soft handling, and vet support helped her recover. She now lives with a quiet couple and spends her afternoons sleeping by the window.",
    image:
      "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Kiwi's Second Chance Flight",
    summary:
      "Kiwi was brought in with an injured wing after an unsafe home setup. The team built a calm rehabilitation space and worked through weeks of medication and monitored exercise.",
    outcome:
      "Kiwi regained strength and was placed with an experienced adopter who already cared for rescue birds and had a proper aviary environment ready.",
    image:
      "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=1200&q=80",
  },
];

const timeline = [
  {
    year: "2021",
    title: "Started with weekend street rescues",
    text: "LilPaws began as a small volunteer-led effort handling emergency rescues, food drives, and temporary fosters across Chandigarh and nearby sectors.",
  },
  {
    year: "2023",
    title: "Built a structured adoption pipeline",
    text: "We standardised health checks, foster screening, and adoption applications so every placement had better follow-up and accountability.",
  },
  {
    year: "2026",
    title: "Expanded into a full rescue + adoption platform",
    text: "Today the platform supports pet discovery, reporting strays, shelter review, adoption tracking, and ecommerce support for animal care supplies.",
  },
];

const teamMembers = [
  {
    name: "Manoj",
    role: "Founder and Lead Rescuer",
    bio: "Manoj built LilPaws around one principle: rescue must be followed by recovery, and recovery must be followed by a real home.",
    image:
      "https://img.freepik.com/premium-photo/cheerful-millennial-indian-guy-casual-posing-blue_116547-80211.jpg?semt=ais_rp_progressive&w=740&q=80",
  },
  {
    name: "Rahul",
    role: "Veterinary Coordinator",
    bio: "Rahul handles intake triage, treatment plans, vaccination scheduling, and medical readiness checks.",
    image:
      "https://img.freepik.com/free-photo/cheerful-indian-businessman-smiling-closeup-portrait-jobs-career-campaign_53876-129416.jpg?semt=ais_rp_progressive&w=740&q=80",
  },
  {
    name: "Sara",
    role: "Adoption and Foster Lead",
    bio: "Sara works with applicants, verifies household fit, and manages post-adoption follow-ups.",
    image:
      "https://img.freepik.com/premium-photo/indian-hindu-woman-smiling_862994-597707.jpg?semt=ais_hybrid&w=740&q=80",
  },
];
const values = [
  {
    icon: HeartHandshake,
    title: "Compassion with structure",
    text: "Rescue cannot rely on emotion alone. We pair empathy with repeatable intake, recovery, and adoption steps.",
  },
  {
    icon: Stethoscope,
    title: "Health before placement",
    text: "Every animal deserves treatment, recovery time, and an honest medical picture before we match them with a home.",
  },
  {
    icon: ShieldPlus,
    title: "Responsible adoption",
    text: "The goal is not a fast handoff. The goal is a stable, informed, and lasting placement for both adopter and animal.",
  },
];

function AboutUs() {
  const [activeSection, setActiveSection] = useState("mission");

  const detailContent = useMemo(
    () => ({
      mission: {
        icon: HandHelping,
        title: "Our Mission",
        body:
          "LilPaws exists to move animals out of danger and into stable homes. We rescue, document, rehabilitate, and rehome stray and abandoned animals while making the adoption process clearer for shelters, volunteers, and adopters.",
      },
      values: {
        icon: CheckCircle2,
        title: "What We Protect",
        body:
          "We value transparency, humane care, local collaboration, and long-term placement quality. Every rescue should end with safety, health support, and a family that understands the responsibility they are taking on.",
      },
      approach: {
        icon: Share2,
        title: "How We Work",
        body:
          "We combine on-ground rescue support with digital coordination: reported strays, shelter review, adoption applications, application tracking, and shop support for care essentials. The platform is meant to reduce friction, not add more of it.",
      },
    }),
    []
  );

  const currentSection = detailContent[activeSection];
  const SectionIcon = currentSection.icon;

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <MainNavbar />

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.28),transparent_32%),linear-gradient(135deg,#0f172a_0%,#1e3a8a_45%,#0f766e_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-semibold tracking-[0.2em] text-amber-200">
              ABOUT LITTLE PAWS
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-tight text-white sm:text-6xl">
              Rescue work is not a moment. It is a chain of care.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100/90">
              We are building a tighter bridge between street rescue, shelter
              coordination, foster recovery, and responsible adoption. The goal
              is simple: fewer animals stuck waiting, and more animals placed in
              homes that are ready for them.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-amber-200"
              >
                Meet Adoptable Pets
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/reportStray"
                className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Report a Stray
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {impactStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-[28px] border border-white/15 bg-white/10 p-6 text-white shadow-2xl backdrop-blur"
                >
                  <Icon className="mb-4 text-amber-200" size={32} />
                  <div className="text-4xl font-black">{stat.value}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-100/85">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-bold tracking-[0.18em] text-teal-700">
              WHY THIS EXISTS
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              The problem is not only rescue. It is continuity.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Many animals are noticed, few are tracked, and even fewer move
              cleanly from rescue into long-term care. LilPaws was designed to
              reduce that drop-off. We wanted a place where communities can flag
              urgent cases, shelters can review applications, adopters can see
              real animals, and care essentials can be managed in the same flow.
            </p>
            <div className="mt-8 grid gap-4">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div
                    key={value.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-teal-100 p-3 text-teal-800">
                        <Icon size={22} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {value.title}
                        </h3>
                        <p className="mt-1 text-sm leading-7 text-slate-600">
                          {value.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] bg-slate-950 p-8 text-white shadow-sm">
            <p className="text-sm font-bold tracking-[0.18em] text-amber-300">
              OUR STORY
            </p>
            <h2 className="mt-3 text-3xl font-black">
              A rescue effort that grew into a system.
            </h2>
            <div className="mt-8 space-y-6">
              {timeline.map((item, index) => (
                <div
                  key={item.year}
                  className="grid gap-4 border-l border-white/15 pl-5 sm:grid-cols-[110px_1fr]"
                >
                  <div className="text-sm font-black tracking-[0.18em] text-amber-200">
                    {item.year}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      {item.text}
                    </p>
                  </div>
                  {index < timeline.length - 1 ? null : (
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-teal-300 sm:col-span-2">
                      <Clock3 size={16} />
                      Still expanding across rescue, adoption, and care support
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-rose-700">
              RESCUE STORIES
            </p>
            <h2 className="mt-2 text-4xl font-black text-slate-900">
              Real recoveries, not placeholder wins.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Every story below reflects the kind of rescue cycle we are built to
            support: report, stabilise, treat, foster, assess, and place.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {rescueStories.map((story) => (
            <article
              key={story.name}
              className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={getImageSrc(story.image, story.name)}
                alt={story.name}
                className="h-64 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-black text-slate-900">
                  {story.name}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {story.summary}
                </p>
                <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-900 ring-1 ring-emerald-100">
                  <span className="font-bold">Outcome:</span> {story.outcome}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-10">
          <div className="flex flex-wrap justify-center gap-4">
            {["mission", "values", "approach"].map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setActiveSection(section)}
                className={`rounded-full px-6 py-3 text-sm font-bold tracking-wide transition ${
                  activeSection === section
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-3xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <SectionIcon size={30} />
            </div>
            <h3 className="mt-6 text-3xl font-black text-slate-900">
              {currentSection.title}
            </h3>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {currentSection.body}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-indigo-700">
              THE PEOPLE DOING THE WORK
            </p>
            <h2 className="mt-2 text-4xl font-black text-slate-900">
              Small team, high-contact rescue.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            We keep the team section grounded in what each role actually does:
            rescue intake, health coordination, and adoption matching.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200"
            >
              <img
                src={getImageSrc(member.image, member.name)}
                alt={member.name}
                className="h-72 w-full object-cover"
              />
              <div className="p-6">
                <p className="text-xs font-bold tracking-[0.18em] text-indigo-700">
                  {member.role.toUpperCase()}
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-900">
                  {member.name}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_35%,#0f766e_100%)] px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold tracking-[0.22em] text-amber-300">
            READY TO HELP
          </p>
          <h2 className="mt-4 text-4xl font-black sm:text-5xl">
            Adopt, foster, report, or support the care pipeline.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-200">
            A complete rescue ecosystem needs adopters, local reporting, steady
            supply support, and people willing to keep the chain moving when an
            animal is in transit between danger and home.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/search"
              className="rounded-full bg-white px-7 py-3 font-bold text-slate-950 transition hover:bg-slate-100"
            >
              Adopt Now
            </Link>
            <Link
              to="/shop/home"
              className="rounded-full bg-amber-300 px-7 py-3 font-bold text-slate-950 transition hover:bg-amber-200"
            >
              Visit Store
            </Link>
            <Link
              to="/shop/home"
              className="rounded-full border border-white/25 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Support Through Shop
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
