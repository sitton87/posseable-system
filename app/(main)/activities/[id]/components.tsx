import { ReactNode } from "react";
import { tw, cssVar } from "@/app/styles/design-system";
import { Activity } from "@/type";
import { useRouter } from "next/navigation";

export function ActivityHeader({ activity }: { activity: Activity }) {
  const router = useRouter();

  return (
    <div className="mb-ds-spacing-5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-ds-spacing-3 flex-wrap">
          {/* Group Name */}
          <h1 className={`text-ds-font-size-2xl font-ds-font-weight-bold ${tw.text.primary} m-0`}>
            {activity.group_name}
          </h1>

          {/* Series Info */}
          {activity.series_name && (
            <>
                <span className={`${tw.text.subtle} text-ds-font-size-xl`}>|</span>
                <span className={`text-ds-font-size-base ${tw.text.muted} ${tw.bg.secondary} px-ds-spacing-2 py-ds-spacing-0-5 ${tw.rounded.sm}`}>
                    {activity.series_name} {(activity as any).series_index ? `(${(activity as any).series_index}/${(activity as any).series_total_count})` : ""}
                </span>
            </>
          )}

          {/* Location */}
          {activity.location && (
            <>
                <span className={`${tw.text.subtle} text-ds-font-size-xl`}>|</span>
                <span className={`text-ds-font-size-base ${tw.text.muted}`}>{activity.location}</span>
            </>
          )}

          {/* Date */}
          <span className={`${tw.text.subtle} text-ds-font-size-xl`}>|</span>
          <span className={`text-ds-font-size-base ${tw.text.muted}`}>
            {new Date(activity.activity_date).toLocaleDateString("he-IL")}
          </span>

          {/* Time */}
          {activity.start_time && (
            <>
                <span className={`${tw.text.subtle} text-ds-font-size-xl`}>|</span>
                <span className={`text-ds-font-size-base ${tw.text.muted}`}>
                    {activity.start_time.slice(0, 5)} - {activity.end_time?.slice(0, 5)}
                </span>
            </>
          )}
        </div>
        
        <div className="flex gap-ds-spacing-4 items-center">
          <div className="text-left">
            <div className={`font-ds-font-weight-bold ${tw.text.brand}`}>
              {activity.status}
            </div>
            <div className={`text-ds-font-size-sm ${tw.text.muted}`}>
              {activity.participant_count || 0} משתתפים
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-ds-spacing-5 py-ds-spacing-2 border-none ${tw.rounded.full} cursor-pointer font-ds-font-weight-medium transition-all ${
        active 
          ? `${tw.bg.brand} text-ds-text-inverted` 
          : `bg-transparent ${tw.text.muted}`
      }`}
    >
      {children}
    </button>
  );
}
