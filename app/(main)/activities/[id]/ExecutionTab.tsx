import { Activity } from "@/type";
import { Card, Title, Text, Button } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import { useRouter } from "next/navigation";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";

export function ExecutionTab({ activity }: { activity: Activity }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 items-center mt-8">
      
      <Card 
        className="max-w-xl text-center p-8 flex flex-col gap-6 items-center"
      >
        <Title className="text-2xl">מוכנים לפעילות?</Title>
        <Text style={{ color: cssVar.text.muted }}>
          מצב שטח הוא מסך מותאם לנייד, ללא הסחות דעת, המאפשר ניהול מהיר של נוכחות, גישה לחירום וצפייה במידע רפואי בזמן אמת.
        </Text>
        
        <Button 
          size="lg"
          icon={RocketLaunchIcon}
          className="w-full"
          onClick={() => router.push(`/field-mode/${activity.id}`)}
        >
          עבור למצב שטח (Field Mode)
        </Button>
      </Card>

    </div>
  );
}
