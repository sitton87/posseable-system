import { Activity } from "@/type";
import { Section } from "@/app/components/shared/layoutPrimitives";
import { Button } from "@/app/components/ui";
import { colors, spacing } from "@/app/styles/foundations";
import { useRouter } from "next/navigation";

export function ExecutionTab({ activity }: { activity: Activity }) {
  const router = useRouter();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg, alignItems: "center", marginTop: spacing.xl }}>
      
      <div style={{ 
        maxWidth: 600, 
        textAlign: "center",
        padding: spacing.xl,
        background: colors.surfaceAlt,
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        gap: spacing.lg,
        alignItems: "center"
      }}>
        <h2 style={{ fontSize: 24, fontWeight: "bold" }}>מוכנים לפעילות?</h2>
        <p style={{ fontSize: 16, color: colors.textMuted }}>
          מצב שטח הוא מסך מותאם לנייד, ללא הסחות דעת, המאפשר ניהול מהיר של נוכחות, גישה לחירום וצפייה במידע רפואי בזמן אמת.
        </p>
        
        <Button 
          variant="primary" 
          style={{ padding: "16px 32px", fontSize: 18, width: "100%" }}
          onClick={() => router.push(`/field-mode/${activity.id}`)}
        >
          🚀 עבור למצב שטח (Field Mode)
        </Button>
      </div>

    </div>
  );
}

