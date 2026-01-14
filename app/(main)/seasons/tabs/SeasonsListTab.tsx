"use client";

import { useState, useEffect, Fragment } from "react";
import { SeasonPlan, ActivitySeries } from "@/type";
import {
  Card,
  Title,
  Text,
  TextInput,
  Button,
  Flex,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { cssVar } from "@/app/styles/design-system";

export default function SeasonsListTab() {
  const [seasons, setSeasons] = useState<SeasonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState<SeasonPlan | null>(null);

  // Filtering
  const [filterText, setFilterText] = useState("");

  // Expandable Rows State
  const [expandedSeasons, setExpandedSeasons] = useState<Record<number, boolean>>({});
  const [seasonSeries, setSeasonSeries] = useState<Record<number, ActivitySeries[]>>({});
  const [seriesLoading, setSeriesLoading] = useState<Record<number, boolean>>({});

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
    if (!formData.name.trim() || !formData.year || !formData.start_date || !formData.end_date) {
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
      const res = await fetch(`/api/seasons/update?id=${id}`, { method: "DELETE" });
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
    <div className="space-y-6">
      <Card>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Title className="text-xl font-bold" style={{ color: cssVar.text.primary }}>
              רשימת עונות
            </Title>
            <TextInput
              icon={MagnifyingGlassIcon}
              placeholder="חיפוש עונה..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-48"
            />
          </div>
          <button
            onClick={handleAdd}
            className="h-[38px] flex items-center justify-center gap-2 px-4 rounded-lg transition-all active:scale-95 border-none outline-none"
            style={{
              background: cssVar.brand.primary,
              color: cssVar.text.inverted,
              boxShadow: cssVar.shadow.sm,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = cssVar.brand.emphasis;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = cssVar.brand.primary;
            }}
          >
            <PlusIcon className="w-5 h-5" />
            <span className="text-sm font-medium whitespace-nowrap">הוסף עונה</span>
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-10" style={{ color: cssVar.text.muted }}>
            טוען...
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-10"></TableHeaderCell>
                <TableHeaderCell className="text-center">שם העונה</TableHeaderCell>
                <TableHeaderCell className="text-center">שנה</TableHeaderCell>
                <TableHeaderCell className="text-center">תאריך התחלה</TableHeaderCell>
                <TableHeaderCell className="text-center">תאריך סיום</TableHeaderCell>
                <TableHeaderCell className="text-center">משך (ימים)</TableHeaderCell>
                <TableHeaderCell className="text-center">פעולות</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSeasons.map((s) => {
                const start = new Date(s.start_date);
                const end = new Date(s.end_date);
                const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                const isExpanded = expandedSeasons[s.id];

                return (
                  <Fragment key={s.id}>
                    <TableRow
                      className={`transition-colors ${isExpanded ? "bg-tremor-background-subtle" : ""}`}
                    >
                      <TableCell className="text-center">
                        <button
                          onClick={() => toggleSeasonExpand(s)}
                          className="p-1 hover:bg-gray-100 rounded"
                          style={{ color: cssVar.text.muted }}
                        >
                          {isExpanded ? (
                            <ChevronUpIcon className="w-5 h-5" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="font-semibold" style={{ color: cssVar.text.primary }}>
                        {s.name}
                      </TableCell>
                      <TableCell className="text-center" style={{ color: cssVar.text.muted }}>
                        {s.year}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {start.toLocaleDateString("he-IL")}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {end.toLocaleDateString("he-IL")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge color="blue" size="sm">
                          {duration} ימים
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Flex justifyContent="center" className="gap-2">
                          <Button
                            size="xs"
                            variant="secondary"
                            color="blue"
                            icon={PencilIcon}
                            onClick={() => handleEdit(s)}
                            tooltip="עריכה"
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                          />
                          <Button
                            size="xs"
                            variant="secondary"
                            color="rose"
                            icon={TrashIcon}
                            onClick={() => handleDelete(s.id)}
                            tooltip="מחיקה"
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200"
                          />
                        </Flex>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <div
                            className="p-4 border-b"
                            style={{
                              backgroundColor: cssVar.bg.secondary,
                              borderColor: cssVar.border.muted,
                            }}
                          >
                            <Text className="font-semibold mb-2" style={{ color: cssVar.text.primary }}>
                              סדרות פעילות ({seasonSeries[s.id]?.length || 0})
                            </Text>
                            {seriesLoading[s.id] ? (
                              <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                                טוען סדרות...
                              </Text>
                            ) : (seasonSeries[s.id]?.length || 0) === 0 ? (
                              <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                                אין סדרות משויכות לעונה זו.
                              </Text>
                            ) : (
                              <div className="space-y-2">
                                {(seasonSeries[s.id] || []).map((series) => (
                                  <div
                                    key={series.id}
                                    className="p-2 rounded-md border flex justify-between items-center text-sm"
                                    style={{
                                      backgroundColor: cssVar.bg.primary,
                                      borderColor: cssVar.border.muted,
                                    }}
                                  >
                                    <div>
                                      <span className="font-semibold">{series.name}</span>
                                      <span className="mx-2" style={{ color: cssVar.text.muted }}>
                                        |
                                      </span>
                                      <span>{series.group_name || "ללא קבוצה"}</span>
                                      <span className="mx-2" style={{ color: cssVar.text.muted }}>
                                        |
                                      </span>
                                      <Badge
                                        color={series.status === "פעיל" ? "emerald" : "slate"}
                                        size="xs"
                                      >
                                        {series.status}
                                      </Badge>
                                    </div>
                                    <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                                      {series.schedule_type === "Fixed"
                                        ? `${
                                            series.frequency === "Weekly"
                                              ? "שבועי"
                                              : series.frequency === "Daily"
                                              ? "יומי"
                                              : series.frequency === "Monthly"
                                              ? "חודשי"
                                              : series.frequency
                                          } (${series.occurrences_count || 0} חזרות)`
                                        : "תזמון ידני"}
                                    </Text>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
              {!loading && filteredSeasons.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10"
                    style={{ color: cssVar.text.muted }}
                  >
                    אין עונות במערכת.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogPanel className="max-w-xl">
          <Title className="mb-6">
            {editingSeason ? "ערוך עונה" : "הוסף עונה חדשה"}
          </Title>

          <div className="space-y-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                שם העונה <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <TextInput
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="שם העונה"
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                שנה <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <TextInput
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2025"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  תאריך התחלה <span style={{ color: cssVar.status.danger }}>*</span>
                </Text>
                <TextInput
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  תאריך סיום <span style={{ color: cssVar.status.danger }}>*</span>
                </Text>
                <TextInput
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                הערות
              </Text>
              <textarea
                className="w-full min-h-[80px] p-3 border rounded-lg resize-y text-sm"
                style={{
                  borderColor: cssVar.border.primary,
                  backgroundColor: cssVar.bg.primary,
                  color: cssVar.text.primary,
                }}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="הערות נוספות..."
              />
            </div>
            <Flex justifyContent="end" className="gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                ביטול
              </Button>
              <Button onClick={handleSubmit}>{editingSeason ? "עדכן" : "הוסף"}</Button>
            </Flex>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
