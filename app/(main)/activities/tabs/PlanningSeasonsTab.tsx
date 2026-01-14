"use client";

import { useState, useEffect, Fragment } from "react";
import { SeasonPlan, ActivitySeries } from "@/type";
import {
  Card,
  Title,
  Text,
  TextInput,
  Textarea,
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
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function PlanningSeasonsTab() {
  const [seasons, setSeasons] = useState<SeasonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState<SeasonPlan | null>(null);

  const [filterText, setFilterText] = useState("");

  const [expandedSeasons, setExpandedSeasons] = useState<
    Record<number, boolean>
  >({});
  const [seasonSeries, setSeasonSeries] = useState<
    Record<number, ActivitySeries[]>
  >({});
  const [seriesLoading, setSeriesLoading] = useState<Record<number, boolean>>(
    {}
  );

  const [formData, setFormData] = useState({
    name: "",
    year: "",
    start_date: "",
    end_date: "",
    notes: "",
  });

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seasons");
      const data = await res.json();
      if (data.success) {
        setSeasons(data.seasons);
      }
    } catch (err) {
      console.error("Error fetching seasons:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonSeries = async (seasonId: number, force = false) => {
    if (seriesLoading[seasonId]) return;
    if (!force && seasonSeries[seasonId]) return;

    setSeriesLoading((prev) => ({ ...prev, [seasonId]: true }));
    try {
      const res = await fetch(`/api/series?season_id=${seasonId}`);
      const data = await res.json();
      if (data.success) {
        setSeasonSeries((prev) => ({ ...prev, [seasonId]: data.series }));
      }
    } catch (err) {
      console.error("Error fetching season series:", err);
    } finally {
      setSeriesLoading((prev) => ({ ...prev, [seasonId]: false }));
    }
  };

  const toggleSeasonExpand = (season: SeasonPlan) => {
    const nextExpanded = !expandedSeasons[season.id];
    setExpandedSeasons((prev) => ({ ...prev, [season.id]: nextExpanded }));
    if (nextExpanded) {
      fetchSeasonSeries(season.id);
    }
  };

  const handleAdd = () => {
    setEditingSeason(null);
    setFormData({
      name: "",
      year: new Date().getFullYear().toString(),
      start_date: "",
      end_date: "",
      notes: "",
    });
    setShowModal(true);
  };

  const handleEdit = (season: SeasonPlan) => {
    setEditingSeason(season);
    setFormData({
      name: season.name,
      year: season.year.toString(),
      start_date: season.start_date.toString().split("T")[0],
      end_date: season.end_date.toString().split("T")[0],
      notes: season.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.year ||
      !formData.start_date ||
      !formData.end_date
    ) {
      alert("שם, שנה, תאריך התחלה וסיום הם שדות חובה");
      return;
    }

    try {
      const url = editingSeason ? "/api/seasons/update" : "/api/seasons/add";
      const method = editingSeason ? "PUT" : "POST";
      const body: any = {
        name: formData.name,
        year: parseInt(formData.year),
        start_date: formData.start_date,
        end_date: formData.end_date,
        notes: formData.notes || null,
      };
      if (editingSeason) body.id = editingSeason.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        alert(editingSeason ? "עונה עודכנה בהצלחה!" : "עונה נוספה בהצלחה!");
        setShowModal(false);
        fetchSeasons();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving season:", err);
      alert("שגיאה בשמירת עונה");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את העונה?")) return;
    try {
      const res = await fetch(`/api/seasons/update?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("עונה נמחקה בהצלחה!");
        fetchSeasons();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      alert("שגיאה במחיקת עונה");
    }
  };

  const filteredSeasons = seasons.filter(
    (s) => s.name.includes(filterText) || s.year.toString().includes(filterText)
  );

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-4">
            <Title>רשימת עונות</Title>

            <div className="relative flex items-center">
              <MagnifyingGlassIcon
                className="absolute right-2.5 w-4 h-4"
                style={{ color: cssVar.text.muted }}
              />
              <TextInput
                placeholder="חיפוש עונה..."
                className="pr-8 w-48"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
              {filterText && (
                <button
                  onClick={() => setFilterText("")}
                  className="absolute left-2.5 bg-transparent border-none cursor-pointer"
                  style={{ color: cssVar.text.muted }}
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <Button icon={PlusIcon} onClick={handleAdd}>
            הוסף עונה
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-10"></TableHeaderCell>
                <TableHeaderCell>שם העונה</TableHeaderCell>
                <TableHeaderCell>שנה</TableHeaderCell>
                <TableHeaderCell>תאריך התחלה</TableHeaderCell>
                <TableHeaderCell>תאריך סיום</TableHeaderCell>
                <TableHeaderCell>משך (ימים)</TableHeaderCell>
                <TableHeaderCell>פעולות</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center p-5">
                    <Text>טוען...</Text>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSeasons.map((s) => {
                  const start = new Date(s.start_date);
                  const end = new Date(s.end_date);
                  const duration = Math.ceil(
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const isExpanded = expandedSeasons[s.id];

                  return (
                    <Fragment key={s.id}>
                      <TableRow
                        className={isExpanded ? "bg-tremor-background-subtle" : ""}
                      >
                        <TableCell className="text-center">
                          <button
                            onClick={() => toggleSeasonExpand(s)}
                            className="border-none bg-transparent cursor-pointer"
                            style={{ color: cssVar.text.muted }}
                          >
                            {isExpanded ? (
                              <ChevronUpIcon className="w-5 h-5" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {s.name}
                        </TableCell>
                        <TableCell>
                          <Text style={{ color: cssVar.text.muted }}>{s.year}</Text>
                        </TableCell>
                        <TableCell className="text-sm">
                          {start.toLocaleDateString("he-IL")}
                        </TableCell>
                        <TableCell className="text-sm">
                          {end.toLocaleDateString("he-IL")}
                        </TableCell>
                        <TableCell>
                          <Badge color="blue">
                            {duration} ימים
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-center">
                            <Button
                              variant="secondary"
                              size="xs"
                              icon={PencilIcon}
                              onClick={() => handleEdit(s)}
                              title="עריכה"
                            />
                            <Button
                              variant="secondary"
                              size="xs"
                              color="rose"
                              icon={TrashIcon}
                              onClick={() => handleDelete(s.id)}
                              title="מחיקה"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
                            <div
                              className="p-4"
                              style={{
                                backgroundColor: cssVar.bg.secondary,
                                borderBottom: `1px solid ${cssVar.border.primary}`,
                              }}
                            >
                              <Text className="font-semibold mb-2">
                                סדרות פעילות ({seasonSeries[s.id]?.length || 0})
                              </Text>
                              {seriesLoading[s.id] ? (
                                <Text style={{ color: cssVar.text.muted }}>
                                  טוען סדרות...
                                </Text>
                              ) : (seasonSeries[s.id]?.length || 0) === 0 ? (
                                <Text style={{ color: cssVar.text.muted }}>
                                  אין סדרות משויכות לעונה זו.
                                </Text>
                              ) : (
                                <div className="grid gap-2">
                                  {(seasonSeries[s.id] || []).map((series) => (
                                    <Card
                                      key={series.id}
                                      className="p-2 flex justify-between text-sm"
                                    >
                                      <div>
                                        <Text className="font-semibold">{series.name}</Text>
                                        <Text style={{ color: cssVar.text.muted }}>
                                          {" | "}
                                          {series.group_name || "ללא קבוצה"}
                                          {" | "}
                                          <span
                                            style={{
                                              color: series.status === "פעיל"
                                                ? cssVar.status.success
                                                : cssVar.text.muted
                                            }}
                                          >
                                            {series.status}
                                          </span>
                                        </Text>
                                      </div>
                                      <Text style={{ color: cssVar.text.muted }}>
                                        {series.schedule_type === "Fixed"
                                          ? `${
                                              series.frequency === "Weekly"
                                                ? "שבועי"
                                                : series.frequency === "Daily"
                                                ? "יומי"
                                                : series.frequency === "Monthly"
                                                ? "חודשי"
                                                : series.frequency
                                            } (${
                                              series.occurrences_count || 0
                                            } חזרות)`
                                          : "תזמון ידני"}
                                      </Text>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
              {!loading && filteredSeasons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center p-5">
                    <Text style={{ color: cssVar.text.muted }}>
                      אין עונות במערכת.
                    </Text>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogPanel className="max-w-lg">
          <Title className="mb-4">
            {editingSeason ? "ערוך עונה" : "הוסף עונה חדשה"}
          </Title>
          <div className="flex flex-col gap-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                שם העונה <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <TextInput
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                שנה <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <TextInput
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  תאריך התחלה <span style={{ color: cssVar.status.danger }}>*</span>
                </Text>
                <input
                  type="date"
                  className="w-full rounded-md border px-3 py-2"
                  style={{ borderColor: cssVar.border.primary }}
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  תאריך סיום <span style={{ color: cssVar.status.danger }}>*</span>
                </Text>
                <input
                  type="date"
                  className="w-full rounded-md border px-3 py-2"
                  style={{ borderColor: cssVar.border.primary }}
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                הערות
              </Text>
              <Textarea
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              ביטול
            </Button>
            <Button onClick={handleSubmit}>
              {editingSeason ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
