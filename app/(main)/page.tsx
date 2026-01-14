"use client";

import {
  Card,
  Grid,
  Title,
  Text,
  Button,
  List,
  ListItem,
  Icon,
} from "@tremor/react";
import {
  UserGroupIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const quickLinks = [
  {
    title: "כניסה לדשבורד",
    description: "תצוגה מרוכזת של כל היחידות והמדדים החיים.",
    href: "/dashboard",
    color: "blue",
  },
  {
    title: "ניהול מתנדבים",
    description: "טיפול בסוגי מתנדבים, סינון ומעקב אחר פעילות.",
    href: "/volunteers",
    color: "cyan",
  },
  {
    title: "ניהול גולשים",
    description: "כל הנתונים הקליניים והתפעוליים עבור המשתתפים.",
    href: "/surfers",
    color: "indigo",
  },
  {
    title: "פעילויות ולו״ז",
    description: "יצירה ותיאום של מפגשי הים, כולל הצמדות.",
    href: "/activities",
    color: "emerald",
  },
];

const highlightCards = [
  {
    title: "מתנדבים",
    description: "ניהול מלא של מתנדבי מים, מדיה ותומכי שטח עם סטטוס חי.",
    icon: UserGroupIcon,
    color: "blue",
  },
  {
    title: "גולשים",
    description: "התאמה אישית לקבוצות, תוכניות ושיקולים רפואיים.",
    icon: UserIcon,
    color: "cyan",
  },
  {
    title: "משאבים",
    description: "ציוד, ספקים, תורמים ותזרים כספי במקום אחד.",
    icon: WrenchScrewdriverIcon,
    color: "amber",
  },
];

const relationBenefits = [
  "מעקב מדויק אחר אילו מתנדבי מים תמכו בכל גולש.",
  "שיוך הפעילות מאפשר להבין עומסים וזמינות.",
  "שכבת נתונים אחת שמשרתת גם את הגולשים וגם את המתנדבים.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-tremor-background-muted p-6 sm:p-12" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-10">
        <section>
          <div className="mb-6">
            <Text className="font-bold text-tremor-brand uppercase tracking-wider">
              POSSEABLE SYSTEM
            </Text>
            <Title className="mt-2 text-3xl sm:text-4xl font-extrabold text-tremor-content-strong">
              ברוכים הבאים למרכז השליטה
            </Title>
            <Text className="mt-4 text-lg max-w-3xl">
              כל המודולים — מתנדבים, גולשים, פעילויות, ציוד ותורמים — מרוכזים כאן
              עם חוויית משתמש מתקדמת.
            </Text>
          </div>

          <Grid numItems={1} numItemsSm={2} className="gap-6 mt-8">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block group">
                <Card
                  className="h-full transition-all duration-200 hover:shadow-lg hover:border-tremor-brand-subtle group-hover:ring-1 group-hover:ring-tremor-brand-subtle flex flex-col justify-between"
                  decoration="top"
                  decorationColor={link.color as any}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Title className="text-tremor-content-strong group-hover:text-tremor-brand-emphasis transition-colors">
                        {link.title}
                      </Title>
                      <ArrowRightIcon className="h-5 w-5 text-tremor-content-subtle group-hover:text-tremor-brand transition-transform group-hover:-translate-x-1" />
                    </div>
                    <Text>{link.description}</Text>
                  </div>
                  <div className={`h-1.5 w-12 rounded-full mt-4 bg-${link.color}-500/20 group-hover:bg-${link.color}-500 transition-colors duration-300`} />
                </Card>
              </Link>
            ))}
          </Grid>
        </section>

        <Grid numItems={1} numItemsSm={3} className="gap-6">
          {highlightCards.map((card) => (
            <Card 
              key={card.title} 
              className="flex flex-col items-start gap-4 transition-all hover:shadow-lg group relative overflow-hidden"
              decoration="top"
              decorationColor={card.color as any}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${card.color}-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className={`p-2 rounded-lg bg-${card.color}-50 group-hover:bg-${card.color}-100 transition-colors`}>
                <Icon
                  icon={card.icon}
                  variant="simple"
                  size="xl"
                  color={card.color as any}
                />
              </div>
              <div>
                <Title className="text-lg font-semibold text-slate-900 group-hover:text-tremor-content-strong transition-colors">{card.title}</Title>
                <Text className="mt-2 text-sm text-slate-500">{card.description}</Text>
              </div>
            </Card>
          ))}
        </Grid>

        <Card>
          <div className="flex flex-col gap-6">
            <div>
              <Text className="font-semibold text-emerald-600 uppercase text-xs tracking-wider">
                עדכון מערכת
              </Text>
              <Title className="mt-2">
                volunteer_surfer_activity: שכבת קשר חדשה
              </Title>
              <Text className="mt-2">
                הוספנו טבלה ייעודית שמתעדת לכל פעילות מי המתנדבים שליוו את הגולשים.
              </Text>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                <Text className="font-semibold text-emerald-800">יתרונות השינוי</Text>
              </div>
              <List className="mt-2">
                {relationBenefits.map((item) => (
                  <ListItem key={item}>
                    <Text className="text-emerald-700">{item}</Text>
                  </ListItem>
                ))}
              </List>
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              <Link href="/volunteers">
                <Button size="sm" variant="primary" color="blue">
                  ניהול שיוכים
                </Button>
              </Link>
              <Link href="/surfers">
                <Button size="sm" variant="secondary" color="slate">
                  צפייה בתמיכת גולשים
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
