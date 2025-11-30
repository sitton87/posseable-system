"use client";

import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

type AccessDeniedProps = {
  title?: string;
  description?: string;
  onReturn?: () => void;
};

export function AccessDenied({
  title = "אין לך הרשאה לדף זה",
  description = "פנה למנהל המערכת כדי לקבל הרשאות מתאימות.",
  onReturn,
}: AccessDeniedProps) {
  return (
    <div className="flex items-center justify-center px-4 py-16">
      <Card className="max-w-lg space-y-4 p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          ⛔
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        </div>
        <div className="flex justify-center">
          <Button
            type="button"
            variant="secondary"
            onClick={
              onReturn ||
              (() => {
                window.location.href = "/dashboard";
              })
            }
          >
            חזרה לדף הבית
          </Button>
        </div>
      </Card>
    </div>
  );
}

