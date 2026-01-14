"use client";

import { useState, useEffect } from "react";
import { SeasonPlan, ActivitySeries, Activity } from "@/type";
import {
  Card,
  Title,
  Text,
  TextInput,
  Select,
  SelectItem,
  Button,
  Badge,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import { StatusPill } from "@/app/components/shared";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  EyeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

const ACTIVITY_KINDS = [
  { value: "surf", label: "גלישה" },
  { value: "social", label: "חברתי" },
  { value: "special", label: "אירוע מיוחד" },
  { value: "training", label: "הכשרה והדרכה" },
] as const;
const SERIES_STATUS_OPTIONS = ["פעיל", "בהקמה", "הוקפא", "נסגר"] as const;

export default function PlanningSeriesTab() {
  const [seasons, setSeasons] = useState<SeasonPlan[]>([]);
  const [seriesList, setSeriesList] = useState<ActivitySeries[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [groups, setGroups] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  const [selectedSeasonId, setSelectedSeasonId] = useState<number | "all">("all");
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterGroup, setFilterGroup] = useState<string>("");

  const [showModal, setShowModal] = useState(false);
  const [editingSeries, setEditingSeries] = useState<ActivitySeries | null>(null);
  const [seriesModalSeason, setSeriesModalSeason] = useState<SeasonPlan | null>(null);
  const [seriesSaving, setSeriesSaving] = useState(false);

  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [viewingSeries, setViewingSeries] = useState<ActivitySeries | null>(null);
  const [seriesActivities, setSeriesActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  
  const [seriesForm, setSeriesForm] = useState({
    name: "",
    status: "פעיל",
    start_date: "",
    end_date: "",
    lead_national_id: "",
    notes: "",
    is_default: false,
    group_id: "",
    schedule_type: "Fixed",
    default_day: "",
    default_start_time: "",
    default_end_time: "",
    frequency: "Weekly",
    occurrences_count: "",
    manual_activities: [] as Array<{ date: string; start_time: string; end_time: string }>,
    default_activity_kind: ACTIVITY_KINDS[0].value,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [selectedSeasonId]);

  const fetchInitialData = async () => {
    try {
      const seasonsRes = await fetch("/api/seasons");
      const seasonsData = await seasonsRes.json();
      if (seasonsData.success) {
        setSeasons(seasonsData.seasons);
        const active = seasonsData.seasons.find((s: SeasonPlan) => {
            const now = new Date();
            return new Date(s.start_date) <= now && new Date(s.end_date) >= now;
        });
        if (active) setSelectedSeasonId(active.id);
        else if (seasonsData.seasons.length > 0) setSelectedSeasonId(seasonsData.seasons[0].id);
      }

      const groupsRes = await fetch("/api/groups");
      const groupsData = await groupsRes.json();
      if (groupsData.success) setGroups(groupsData.groups);

      const [staffRes, mgmtRes] = await Promise.all([
        fetch("/api/volunteers?classification=staff"),
        fetch("/api/volunteers?classification=management"),
      ]);
      const staffD = await staffRes.json();
      const mgmtD = await mgmtRes.json();
      const allStaff = [
        ...(staffD.success ? staffD.volunteers : []),
        ...(mgmtD.success ? mgmtD.volunteers : [])
      ];
      const uniqueStaff = Array.from(new Map(allStaff.map(item => [item.national_id, item])).values());
      setStaffList(uniqueStaff);

    } catch (err) {
      console.error("Error fetching initial data", err);
    }
  };

  const fetchSeries = async () => {
    setLoading(true);
    try {
      let url = "/api/series";
      if (selectedSeasonId !== "all") {
        url += `?season_id=${selectedSeasonId}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSeriesList(data.series);
      } else {
        setSeriesList([]);
      }
    } catch (err) {
      console.error("Error fetching series", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterText("");
    setFilterStatus("");
    setFilterGroup("");
  };

  const filteredSeries = seriesList.filter(s => {
      if (filterText && !s.name.includes(filterText)) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      if (filterGroup && s.group_id !== filterGroup) return false;
      return true;
  });

  const openActivitiesModal = async (series: ActivitySeries) => {
    setViewingSeries(series);
    setShowActivitiesModal(true);
    setSeriesActivities([]);
    setLoadingActivities(true);

    try {
        const res = await fetch(`/api/activities?series_id=${series.id}`);
        const data = await res.json();
        if (data.success) {
            setSeriesActivities(data.activities);
        }
    } catch (err) {
        console.error("Failed to load series activities", err);
    } finally {
        setLoadingActivities(false);
    }
  };

  const openModal = (series?: ActivitySeries) => {
    const seasonIdToUse = (series ? series.season_id : (selectedSeasonId === "all" ? seasons[0]?.id : selectedSeasonId));
    const season = seasons.find(s => s.id === Number(seasonIdToUse));
    
    if (!season) {
        alert("יש לבחור עונה כדי ליצור סדרה");
        return;
    }

    setSeriesModalSeason(season);
    setEditingSeries(series || null);

    let initialDate = "";
    if (series?.start_date) {
      initialDate = new Date(series.start_date).toISOString().split("T")[0];
    } else if (season.start_date) {
      initialDate = new Date(season.start_date).toISOString().split("T")[0];
    }

    setSeriesForm({
      name: series?.name || "",
      status: series?.status || "פעיל",
      start_date: initialDate,
      end_date: series?.end_date ? new Date(series.end_date).toISOString().split("T")[0] : "",
      lead_national_id: series?.lead_national_id || "",
      notes: series?.notes || "",
      is_default: Boolean(series?.is_default),
      group_id: series?.group_id || "",
      schedule_type: series?.schedule_type || "Fixed",
      default_day: series?.default_day || "",
      default_start_time: series?.default_start_time ? series.default_start_time.substring(0, 5) : "",
      default_end_time: series?.default_end_time ? series.default_end_time.substring(0, 5) : "",
      frequency: series?.frequency || "Weekly",
      occurrences_count: series?.occurrences_count || "",
      manual_activities: [], 
      default_activity_kind: series?.default_activity_kind || ACTIVITY_KINDS[0].value,
    });
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSeries(null);
    setSeriesModalSeason(null);
  };

  const handleSubmit = async () => {
    if (!seriesModalSeason) return;
    if (!seriesForm.name.trim()) {
      alert("שם הסדרה הוא שדה חובה");
      return;
    }
    
    try {
      setSeriesSaving(true);
      const payload: any = {
        season_id: seriesModalSeason.id,
        name: seriesForm.name.trim(),
        status: seriesForm.status || null,
        start_date: seriesForm.start_date || null,
        end_date: seriesForm.end_date || null,
        lead_national_id: seriesForm.lead_national_id || null,
        notes: seriesForm.notes || null,
        is_default: seriesForm.is_default,
        group_id: seriesForm.group_id || null,
        schedule_type: seriesForm.schedule_type,
        default_day: seriesForm.default_day || null,
        default_start_time: seriesForm.default_start_time || null,
        default_end_time: seriesForm.default_end_time || null,
        frequency: seriesForm.frequency || null,
        occurrences_count: seriesForm.occurrences_count || null,
        manual_activities: seriesForm.schedule_type === "Manual" ? seriesForm.manual_activities : [],
        default_activity_kind: seriesForm.default_activity_kind,
      };

      const url = editingSeries ? "/api/series/update" : "/api/series/add";
      const method = editingSeries ? "PUT" : "POST";
      if (editingSeries) payload.id = editingSeries.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (data.success) {
        alert(editingSeries ? "סדרה עודכנה בהצלחה!" : "סדרה נוספה בהצלחה!");
        closeModal();
        fetchSeries();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving series", err);
      alert("שגיאה בשמירה");
    } finally {
      setSeriesSaving(false);
    }
  };

  const handleDelete = async (series: ActivitySeries) => {
    if (!confirm(`מחיקת הסדרה "${series.name}" תמחק גם את כל הפעילויות המשויכות אליה. להמשיך?`)) return;
    try {
      const res = await fetch(`/api/series/update?id=${series.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("הסדרה נמחקה בהצלחה");
        fetchSeries();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      alert("שגיאה במחיקת סדרה");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-4">
            <Title>רשימת סדרות</Title>
            <Select 
                value={selectedSeasonId.toString()}
                onValueChange={(val) => {
                    setSelectedSeasonId(val === "all" ? "all" : Number(val));
                }}
                className="w-52"
            >
                {seasons.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name} ({s.year})</SelectItem>
                ))}
            </Select>
          </div>
          <Button icon={PlusIcon} onClick={() => openModal()}>הוסף סדרה</Button>
        </div>
        
        <div
          className="flex gap-2 pt-2 items-center flex-wrap"
          style={{ borderTop: `1px solid ${cssVar.border.primary}` }}
        >
            <div className="flex items-center gap-1" style={{ color: cssVar.text.muted }}>
                <FunnelIcon className="w-3.5 h-3.5" />
                <Text className="text-sm font-semibold">סינון:</Text>
            </div>
            
            <TextInput 
                placeholder="חיפוש לפי שם..." 
                className="w-36"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
            />

            <Select 
                value={filterStatus || undefined}
                onValueChange={(val) => setFilterStatus(val || "")}
                placeholder="כל הסטטוסים"
                className="w-36"
            >
                {SERIES_STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </Select>

            <Select 
                value={filterGroup || undefined}
                onValueChange={(val) => setFilterGroup(val || "")}
                placeholder="כל הקבוצות"
                className="w-40"
            >
                {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </Select>

            {(filterText || filterStatus || filterGroup) && (
                <button 
                    onClick={clearFilters} 
                    className="bg-transparent border-none text-xs cursor-pointer flex items-center gap-1"
                    style={{ color: cssVar.status.danger }}
                >
                    <XMarkIcon className="w-3 h-3" /> ניקוי פילטרים
                </button>
            )}
        </div>
        
        <div className="overflow-x-auto mt-2">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>שם הסדרה</TableHeaderCell>
                <TableHeaderCell>קבוצה</TableHeaderCell>
                <TableHeaderCell>סוג</TableHeaderCell>
                <TableHeaderCell>תזמון</TableHeaderCell>
                <TableHeaderCell>סטטוס</TableHeaderCell>
                <TableHeaderCell>פעולות</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                 <TableRow><TableCell colSpan={6} className="text-center p-5"><Text>טוען...</Text></TableCell></TableRow>
              ) : filteredSeries.length === 0 ? (
                 <TableRow><TableCell colSpan={6} className="text-center p-5"><Text style={{ color: cssVar.text.muted }}>לא נמצאו סדרות.</Text></TableCell></TableRow>
              ) : filteredSeries.map((series) => (
                  <TableRow key={series.id}>
                    <TableCell className="font-semibold">{series.name}</TableCell>
                    <TableCell>
                        {series.group_name || "-"}
                    </TableCell>
                    <TableCell>
                      {ACTIVITY_KINDS.find(k => k.value === series.default_activity_kind)?.label || series.default_activity_kind || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                        {series.schedule_type === 'Fixed' ? 
                            `${series.frequency === 'Weekly' ? 'שבועי' : series.frequency === 'Daily' ? 'יומי' : series.frequency === 'Monthly' ? 'חודשי' : series.frequency} (${series.occurrences_count || 0} חזרות)` : 
                            'ידני'}
                    </TableCell>
                    <TableCell>
                       <Badge color="emerald">
                         {series.status}
                       </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        <Button variant="secondary" size="xs" icon={EyeIcon} onClick={() => openActivitiesModal(series)} title="צפה בפעילויות" />
                        <Button variant="secondary" size="xs" icon={PencilIcon} onClick={() => openModal(series)} title="עריכה" />
                        <Button variant="secondary" size="xs" color="rose" icon={TrashIcon} onClick={() => handleDelete(series)} title="מחיקה" />
                      </div>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Series Modal */}
      <Dialog open={showModal} onClose={closeModal}>
        <DialogPanel className="max-w-3xl">
          <Title>
            {editingSeries ? "ערוך סדרת פעילויות" : "הוסף סדרת פעילויות חדשה"}
          </Title>
          {seriesModalSeason && (
            <Text className="text-sm" style={{ color: cssVar.text.muted }}>
              עונה: {seriesModalSeason.name}
            </Text>
          )}
          
          {seriesModalSeason && (
            <div className="flex flex-col gap-4 mt-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                    שם הסדרה <span style={{ color: cssVar.status.danger }}>*</span>
                  </Text>
                  <TextInput
                    value={seriesForm.name}
                    onChange={(e) => setSeriesForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>סטטוס</Text>
                  <Select value={seriesForm.status || undefined} onValueChange={(val) => setSeriesForm((prev) => ({ ...prev, status: val || "" }))}>
                    {SERIES_STATUS_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </Select>
                </div>
                <div>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>סוג פעילות</Text>
                  <Select value={seriesForm.default_activity_kind} onValueChange={(val) => setSeriesForm((prev) => ({ ...prev, default_activity_kind: val }))}>
                    {ACTIVITY_KINDS.map(kind => <SelectItem key={kind.value} value={kind.value}>{kind.label}</SelectItem>)}
                  </Select>
                </div>
                <div>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>מנהל/ת סדרה</Text>
                  <Select value={seriesForm.lead_national_id || undefined} onValueChange={(val) => setSeriesForm((prev) => ({ ...prev, lead_national_id: val || "" }))} placeholder="בחר מנהל/ת">
                    {staffList.map(staff => <SelectItem key={staff.national_id} value={staff.national_id}>{staff.full_name}</SelectItem>)}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>קבוצה משויכת</Text>
                  <Select value={seriesForm.group_id || undefined} onValueChange={(val) => setSeriesForm((prev) => ({ ...prev, group_id: val || "" }))} placeholder="בחר קבוצה">
                    {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </Select>
                </div>
                <div>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>סוג תזמון</Text>
                  <Select value={seriesForm.schedule_type} onValueChange={(val) => setSeriesForm((prev) => ({ ...prev, schedule_type: val }))}>
                    <SelectItem value="Fixed">קבוע (ימים ושעות)</SelectItem>
                    <SelectItem value="Manual">ידני</SelectItem>
                  </Select>
                </div>
                <div>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>תדירות</Text>
                  <Select value={seriesForm.frequency} onValueChange={(val) => setSeriesForm((prev) => ({ ...prev, frequency: val }))} disabled={seriesForm.schedule_type === "Manual"}>
                    <SelectItem value="Weekly">שבועי</SelectItem>
                    <SelectItem value="Daily">יומי</SelectItem>
                    <SelectItem value="Monthly">חודשי</SelectItem>
                  </Select>
                </div>
              </div>

              {seriesForm.schedule_type === "Fixed" && (
                <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>תאריך התחלה (וקביעת יום)</Text>
                      <input
                        type="date"
                        className="w-full rounded-md border px-3 py-2"
                        style={{ borderColor: cssVar.border.primary }}
                        value={seriesForm.start_date}
                        min={seriesModalSeason ? new Date(seriesModalSeason.start_date).toISOString().split('T')[0] : undefined}
                        max={seriesModalSeason ? new Date(seriesModalSeason.end_date).toISOString().split('T')[0] : undefined}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          const day = date.getDay() + 1;
                          setSeriesForm((prev) => ({ ...prev, start_date: e.target.value, default_day: day.toString() }));
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                        <div>
                          <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>שעת התחלה</Text>
                          <input
                            type="time"
                            className="w-full rounded-md border px-3 py-2"
                            style={{ borderColor: cssVar.border.primary }}
                            value={seriesForm.default_start_time}
                            onChange={(e) => setSeriesForm((prev) => ({ ...prev, default_start_time: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>שעת סיום</Text>
                          <input
                            type="time"
                            className="w-full rounded-md border px-3 py-2"
                            style={{ borderColor: cssVar.border.primary }}
                            value={seriesForm.default_end_time}
                            onChange={(e) => setSeriesForm((prev) => ({ ...prev, default_end_time: e.target.value }))}
                          />
                        </div>
                    </div>
                    <div>
                      <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>כמות חזרות</Text>
                      <TextInput
                        type="number"
                        value={seriesForm.occurrences_count}
                        onChange={(e) => setSeriesForm((prev) => ({ ...prev, occurrences_count: e.target.value }))}
                        placeholder="כמה פעילויות ליצור?"
                      />
                    </div>
                </div>
              )}

              {seriesForm.schedule_type === "Manual" && (
                <div className="flex flex-col gap-2">
                  <Text className="text-sm" style={{ color: cssVar.text.secondary }}>תאריכים ידניים</Text>
                  {seriesForm.manual_activities.map((activity, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="date"
                        className="flex-1 rounded-md border px-3 py-2"
                        style={{ borderColor: cssVar.border.primary }}
                        value={activity.date}
                        min={seriesModalSeason ? new Date(seriesModalSeason.start_date).toISOString().split('T')[0] : undefined}
                        max={seriesModalSeason ? new Date(seriesModalSeason.end_date).toISOString().split('T')[0] : undefined}
                        onChange={(e) => {
                          const newActivities = [...seriesForm.manual_activities];
                          newActivities[index].date = e.target.value;
                          setSeriesForm(prev => ({ ...prev, manual_activities: newActivities }));
                        }}
                      />
                      <input
                        type="time"
                        className="w-24 rounded-md border px-3 py-2"
                        style={{ borderColor: cssVar.border.primary }}
                        value={activity.start_time}
                        onChange={(e) => {
                          const newActivities = [...seriesForm.manual_activities];
                          newActivities[index].start_time = e.target.value;
                          setSeriesForm(prev => ({ ...prev, manual_activities: newActivities }));
                        }}
                      />
                      <input
                        type="time"
                        className="w-24 rounded-md border px-3 py-2"
                        style={{ borderColor: cssVar.border.primary }}
                        value={activity.end_time}
                        onChange={(e) => {
                          const newActivities = [...seriesForm.manual_activities];
                          newActivities[index].end_time = e.target.value;
                          setSeriesForm(prev => ({ ...prev, manual_activities: newActivities }));
                        }}
                      />
                      <Button variant="secondary" size="xs" color="rose" icon={TrashIcon} onClick={() => {
                          const newActivities = seriesForm.manual_activities.filter((_, i) => i !== index);
                          setSeriesForm(prev => ({ ...prev, manual_activities: newActivities }));
                      }} />
                    </div>
                  ))}
                  <Button variant="secondary" onClick={() => {
                      setSeriesForm(prev => ({ ...prev, manual_activities: [...prev.manual_activities, { date: "", start_time: "", end_time: "" }] }));
                  }}>+ הוסף תאריך</Button>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={closeModal}>ביטול</Button>
            <Button onClick={handleSubmit} disabled={seriesSaving}>{seriesSaving ? "שומר..." : editingSeries ? "עדכן" : "הוסף"}</Button>
          </div>
        </DialogPanel>
      </Dialog>

      {/* Activities View Modal */}
      <Dialog open={showActivitiesModal} onClose={() => setShowActivitiesModal(false)}>
        <DialogPanel className="max-w-3xl">
          <Title>פעילויות בסדרה: {viewingSeries?.name || ''}</Title>
          <Text className="text-sm" style={{ color: cssVar.text.muted }}>
            רשימת כל הפעילויות שנוצרו עבור סדרה זו.
          </Text>
          
          <div className="mt-4">
            {loadingActivities ? (
                <div className="text-center p-5">
                  <Text style={{ color: cssVar.text.muted }}>טוען פעילויות...</Text>
                </div>
            ) : seriesActivities.length === 0 ? (
                <Card className="text-center p-5 border-dashed">
                    <Text style={{ color: cssVar.text.muted }}>לא נמצאו פעילויות משויכות.</Text>
                </Card>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>תאריך</TableHeaderCell>
                                <TableHeaderCell>שעה</TableHeaderCell>
                                <TableHeaderCell>מיקום</TableHeaderCell>
                                <TableHeaderCell>משתתפים</TableHeaderCell>
                                <TableHeaderCell>סטטוס</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {seriesActivities.map(activity => (
                                <TableRow key={activity.id}>
                                    <TableCell>{format(new Date(activity.activity_date), "dd/MM/yyyy")}</TableCell>
                                    <TableCell>{activity.start_time?.slice(0,5) || "-"} - {activity.end_time?.slice(0,5) || "-"}</TableCell>
                                    <TableCell>{activity.location || "-"}</TableCell>
                                    <TableCell>{activity.participant_count || 0}</TableCell>
                                    <TableCell>
                                        <StatusPill tone={
                                            activity.status === 'Completed' ? 'success' : 
                                            activity.status === 'Cancelled' ? 'error' : 
                                            activity.status === 'In Progress' ? 'info' : 'neutral'
                                        }>
                                            {activity.status === 'Planned' ? 'מתוכנן' : 
                                             activity.status === 'Completed' ? 'הושלם' : 
                                             activity.status === 'Cancelled' ? 'בוטל' : 
                                             activity.status === 'In Progress' ? 'בביצוע' : activity.status}
                                        </StatusPill>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="secondary" onClick={() => setShowActivitiesModal(false)}>סגור</Button>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
