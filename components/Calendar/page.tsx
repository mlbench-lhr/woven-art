"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
 

type CalendarGridProps = {
  onDataChange?: (data: {
    slots: {
      startDate: Date;
      endDate: Date;
      adultPrice: number;
      childPrice: number;
      seatsAvailable: number;
    }[];
    stopBookingDates: Date[];
  }) => void;
  defaultSlots?: {
    startDate: Date;
    endDate: Date;
    adultPrice: number;
    childPrice: number;
    seatsAvailable: number;
  }[];
  defaultStopBookingDates?: Date[];
  readOnly?: boolean;
  title?: string;
  kidsAllowed?: boolean;
};

export default function CalendarGrid({
  onDataChange,
  defaultSlots,
  defaultStopBookingDates,
  readOnly,
  title,
  kidsAllowed = true,
}: CalendarGridProps) {
  const [windowSize, setWindowSize] = useState(14);
  const [startOffset, setStartOffset] = useState(0);
 
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  const generateDates = () => {
    const items: { label: string; date: Date }[] = [];
    const base = new Date();
    for (let i = 0; i < windowSize; i++) {
      const date = new Date(base);
      date.setDate(base.getDate() + startOffset + i);
      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "short" });
      items.push({ label: `${day} ${month}`, date });
    }
    return items;
  };

  const dates = generateDates();
  const rows = [
    { id: "stop", name: "Stop Booking" },
    { id: "adult", name: "Adult Price (EUR)" },
    ...(kidsAllowed ? [{ id: "child", name: "Child Price (EUR)" }] : []),
    { id: "seats", name: "Seats Available" },
  ];

  const initial: Record<string, Record<string, any>> = {};
  rows.forEach((r) => {
    initial[r.id] = {} as Record<string, any>;
    dates.forEach((d) => {
      initial[r.id][d.label] = r.id === "stop" ? "false" : "0";
    });
  });

  const [values, setValues] = useState(initial);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const isDragging = useRef(false);
  const selectedRowRef = useRef<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 640) setWindowSize(7);
      else if (w < 1280) setWindowSize(14);
      else setWindowSize(21);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    setValues((prev) => {
      const copy = { ...prev } as Record<string, Record<string, any>>;
      rows.forEach((r) => {
        copy[r.id] = { ...copy[r.id] };
        dates.forEach((d) => {
          if (!(d.label in copy[r.id])) {
            copy[r.id][d.label] = r.id === "stop" ? "false" : "0";
          }
        });
      });
      return copy;
    });
  }, [startOffset, windowSize]);

  useEffect(() => {
    if (!defaultSlots && !defaultStopBookingDates) return;
    const nextValues: Record<string, Record<string, any>> = {} as any;
    rows.forEach((r) => {
      nextValues[r.id] = {} as Record<string, any>;
      dates.forEach((d) => {
        nextValues[r.id][d.label] = r.id === "stop" ? "false" : "0";
      });
    });

    const toMid = (dt: Date) =>
      new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();

    const slotDays: Map<
      number,
      { adultPrice: number; childPrice: number; seatsAvailable: number }
    > = new Map();
    if (defaultSlots && defaultSlots.length > 0) {
      for (const s of defaultSlots) {
        let cur = new Date(s.startDate);
        const end = new Date(s.endDate);
        const curMid = new Date(
          cur.getFullYear(),
          cur.getMonth(),
          cur.getDate()
        );
        const endMid = new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate()
        );
        let p = curMid.getTime();
        while (p <= endMid.getTime()) {
          slotDays.set(p, {
            adultPrice: s.adultPrice,
            childPrice: s.childPrice,
            seatsAvailable: s.seatsAvailable,
          });
          p = p + 24 * 60 * 60 * 1000;
        }
      }
    }

    const stopSet: Set<number> = new Set();
    if (defaultStopBookingDates && defaultStopBookingDates.length > 0) {
      for (const d of defaultStopBookingDates) stopSet.add(toMid(new Date(d)));
    }

    const nextDirty = new Set<string>();
    dates.forEach((d) => {
      const ms = toMid(d.date);
      if (slotDays.has(ms)) {
        const v = slotDays.get(ms)!;
        nextValues["adult"][d.label] = String(v.adultPrice);
        if (kidsAllowed) nextValues["child"][d.label] = String(v.childPrice);
        nextValues["seats"][d.label] = String(v.seatsAvailable);
        if (String(v.adultPrice) !== "0") nextDirty.add(`adult||${d.label}`);
        if (kidsAllowed && String(v.childPrice) !== "0")
          nextDirty.add(`child||${d.label}`);
        if (String(v.seatsAvailable) !== "0")
          nextDirty.add(`seats||${d.label}`);
      }
      if (stopSet.has(ms)) {
        nextValues["stop"][d.label] = "true";
        nextDirty.add(`stop||${d.label}`);
      }
    });

    setValues(nextValues);
    setDirty(nextDirty);
  }, [defaultSlots, defaultStopBookingDates, startOffset]);

  const keyFor = (rowId: string, dateLabel: string) => `${rowId}||${dateLabel}`;

  const handleMouseDown = (
    rowId: string,
    dateLabel: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    if (readOnly) return;
    const k = keyFor(rowId, dateLabel);
    isDragging.current = true;
    selectedRowRef.current = rowId;
    setSelectedKeys(new Set([k]));
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseEnter = (rowId: string, dateLabel: string) => {
    if (!isDragging.current) return;
    if (readOnly) return;
    if (selectedRowRef.current && selectedRowRef.current !== rowId) return;
    const k = keyFor(rowId, dateLabel);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      next.add(k);
      return next;
    });
  };

  useEffect(() => {
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      // focus first selected input
      const first = selectedKeys.values().next();
      if (!first.done) {
        const ref = inputRefs.current[first.value as string];
        if (ref && typeof ref.focus === "function") ref.focus();
      }
    };
    window.addEventListener("mouseup", onMouseUp);
    const onTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const first = selectedKeys.values().next();
      if (!first.done) {
        const ref = inputRefs.current[first.value as string];
        if (ref && typeof ref.focus === "function") ref.focus();
      }
    };
    window.addEventListener("touchend", onTouchEnd);
    const autoScrollAndSelect = (x: number, y: number) => {
      if (!isDragging.current) return;
      if (readOnly) return;
      const div = containerRef.current;
      if (!div) return;
      const rect = div.getBoundingClientRect();
      const threshold = 28;
      const canScrollRight = div.scrollLeft + div.clientWidth < div.scrollWidth;
      const canScrollLeft = div.scrollLeft > 0;
      const stickyEl =
        div.querySelector("th.sticky.left-0") ||
        div.querySelector("td.sticky.left-0");
      const stickyWidth = stickyEl
        ? (stickyEl as HTMLElement).getBoundingClientRect().width
        : 0;
      const leftEdge = rect.left + stickyWidth;
      if (x > rect.right - threshold && canScrollRight) {
        div.scrollLeft = Math.min(
          div.scrollLeft + 36,
          div.scrollWidth - div.clientWidth
        );
      } else if (x < leftEdge + threshold && canScrollLeft) {
        div.scrollLeft = Math.max(div.scrollLeft - 36, 0);
      }
      const elem = document.elementFromPoint(x, y);
      if (!elem) return;
      const td = elem.closest("td") as HTMLTableCellElement | null;
      if (!td) return;
      const rid = td.getAttribute("data-rowid");
      const label = td.getAttribute("data-label");
      if (!rid || !label) return;
      if (selectedRowRef.current && selectedRowRef.current !== rid) return;
      const k = keyFor(rid, label);
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        next.add(k);
        return next;
      });
    };
    const onMouseMoveWindow = (e: MouseEvent) => {
      if (!isDragging.current) return;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      autoScrollAndSelect(e.clientX, e.clientY);
    };
    const onTouchMoveWindow = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const t = e.touches[0];
      if (!t) return;
      lastPointer.current = { x: t.clientX, y: t.clientY };
      if (windowSize <= 7) return;
      autoScrollAndSelect(t.clientX, t.clientY);
    };
    window.addEventListener("mousemove", onMouseMoveWindow);
    window.addEventListener("touchmove", onTouchMoveWindow, { passive: true });
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("mousemove", onMouseMoveWindow);
      window.removeEventListener("touchmove", onTouchMoveWindow as any);
    };
  }, [selectedKeys, readOnly, windowSize]);

  const handleTouchStart = (
    rowId: string,
    dateLabel: string,
    e?: React.TouchEvent
  ) => {
    if (readOnly) return;
    if (windowSize <= 7) return;
    const k = keyFor(rowId, dateLabel);
    isDragging.current = true;
    selectedRowRef.current = rowId;
    setSelectedKeys(new Set([k]));
    const t = e?.touches?.[0];
    if (t) touchStartPos.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchMove: React.TouchEventHandler<HTMLTableCellElement> = (
    e
  ) => {
    if (!isDragging.current) return;
    if (readOnly) return;
    if (windowSize <= 7) return;
    const touch = e.touches[0];
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const threshold = 28;
      const canScrollRight =
        containerRef.current.scrollLeft + containerRef.current.clientWidth <
        containerRef.current.scrollWidth;
      const canScrollLeft = containerRef.current.scrollLeft > 0;
      const stickyEl =
        containerRef.current.querySelector("th.sticky.left-0") ||
        containerRef.current.querySelector("td.sticky.left-0");
      const stickyWidth = stickyEl
        ? (stickyEl as HTMLElement).getBoundingClientRect().width
        : 0;
      const leftEdge = rect.left + stickyWidth;
      if (touch.clientX > rect.right - threshold && canScrollRight) {
        containerRef.current.scrollLeft = Math.min(
          containerRef.current.scrollLeft + 36,
          containerRef.current.scrollWidth - containerRef.current.clientWidth
        );
      } else if (touch.clientX < leftEdge + threshold && canScrollLeft) {
        containerRef.current.scrollLeft = Math.max(
          containerRef.current.scrollLeft - 36,
          0
        );
      }
    }
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elem) return;
    const td = elem.closest("td") as HTMLTableCellElement | null;
    if (!td) return;
    const rid = td.getAttribute("data-rowid");
    const label = td.getAttribute("data-label");
    if (!rid || !label) return;
    if (selectedRowRef.current && selectedRowRef.current !== rid) return;
    const k = keyFor(rid, label);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      next.add(k);
      return next;
    });
  };

  const updateSelected = (val: string) => {
    setValues((prev) => {
      const copy = { ...prev };
      selectedKeys.forEach((k) => {
        const [rowId, date] = k.split("||");
        if (rowId !== "stop") {
          copy[rowId] = { ...copy[rowId], [date]: val };
        }
      });
      return copy;
    });
    setDirty((prev) => {
      const next = new Set(prev);
      selectedKeys.forEach((k) => {
        const [rowId, date] = k.split("||");
        if (rowId === "stop") return;
        const def = "0";
        if (val !== def) next.add(k);
        else next.delete(k);
      });
      return next;
    });
  };

  const updateStopSelected = (value: string, currentKey: string) => {
    setValues((prev) => {
      const copy = { ...prev } as Record<string, Record<string, any>>;
      const [rowId, date] = currentKey.split("||");
      copy[rowId] = { ...copy[rowId], [date]: value };
      selectedKeys.forEach((k) => {
        const [r, d] = k.split("||");
        if (r === "stop") {
          copy[r] = { ...copy[r], [d]: value };
        }
      });
      return copy;
    });
    setDirty((prev) => {
      const next = new Set(prev);
      const def = "false";
      const [rowId, date] = currentKey.split("||");
      if (value !== def) next.add(`${rowId}||${date}`);
      else next.delete(`${rowId}||${date}`);
      selectedKeys.forEach((k) => {
        const [r, d] = k.split("||");
        if (r === "stop") {
          if (value !== def) next.add(k);
          else next.delete(k);
        }
      });
      return next;
    });
  };

  const midnight = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const isCompleteDay = (label: string) => {
    const ap = Number(values.adult[label]);
    const cp = Number(values.child?.[label] ?? 0);
    const seats = Number(values.seats[label]);
    return kidsAllowed ? ap > 0 && cp > 0 && seats > 0 : ap > 0 && seats > 0;
  };

  const emitData = () => {
    const slots: {
      startDate: Date;
      endDate: Date;
      adultPrice: number;
      childPrice: number;
      seatsAvailable: number;
    }[] = [];

    const stopBookingDates: Date[] = [];

    dates.forEach((d) => {
      const label = d.label;
      const flag = String(values.stop[label]) === "true";
      if (flag) stopBookingDates.push(midnight(d.date));
    });

    const isConsecutive = (a: Date, b: Date) => {
      const msPerDay = 24 * 60 * 60 * 1000;
      const aMid = new Date(
        a.getFullYear(),
        a.getMonth(),
        a.getDate()
      ).getTime();
      const bMid = new Date(
        b.getFullYear(),
        b.getMonth(),
        b.getDate()
      ).getTime();
      return bMid - aMid === msPerDay;
    };

    let current: {
      startDate: Date;
      endDate: Date;
      adultPrice: number;
      childPrice: number;
      seatsAvailable: number;
    } | null = null;

    const isModifiedDay = (label: string) => {
      return (
        dirty.has(`adult||${label}`) ||
        (kidsAllowed && dirty.has(`child||${label}`)) ||
        dirty.has(`seats||${label}`)
      );
    };

    for (let i = 0; i < dates.length; i++) {
      const d = dates[i];
      const label = d.label;
      if (!isCompleteDay(label)) continue;
      const ap = Number(values.adult[label]);
      const cp = Number(values.child?.[label] ?? 0);
      const seats = Number(values.seats[label]);

      if (!current) {
        current = {
          startDate: midnight(d.date),
          endDate: midnight(d.date),
          adultPrice: ap,
          childPrice: cp,
          seatsAvailable: seats,
        };
        continue;
      }

      const same =
        current.adultPrice === ap &&
        current.childPrice === cp &&
        current.seatsAvailable === seats;
      const consecutive = isConsecutive(current.endDate, midnight(d.date));

      if (same && consecutive) {
        current.endDate = midnight(d.date);
      } else {
        slots.push(current);
        current = {
          startDate: midnight(d.date),
          endDate: midnight(d.date),
          adultPrice: ap,
          childPrice: cp,
          seatsAvailable: seats,
        };
      }
    }

    if (current) slots.push(current);
    if (onDataChange) onDataChange({ slots, stopBookingDates });
  };

  useEffect(() => {
    emitData();
  }, [values, dirty]);

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setStartOffset((prev) => Math.max(0, prev - windowSize))
            }
            disabled={startOffset === 0}
            aria-label="Previous"
            title="Previous"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setStartOffset((prev) => prev + windowSize)}
            aria-label="Next"
            title="Next"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            disabled={!!readOnly}
            onClick={() => {
              setValues((prev) => {
                const copy = { ...prev } as Record<string, Record<string, any>>;
                rows.forEach((r) => {
                  dates.forEach((d) => {
                    copy[r.id][d.label] =
                      r.id === "stop"
                        ? "false"
                        : r.id === "seats"
                        ? "10"
                        : "300";
                  });
                });
                return copy;
              });
              setDirty((prev) => {
                const next = new Set(prev);
                dates.forEach((d) => {
                  ["adult", "child", "seats", "stop"].forEach((rid) => {
                    next.delete(`${rid}||${d.label}`);
                  });
                });
                return next;
              });
            }}
            aria-label="Reset defaults"
            title="Reset defaults"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            {dates[0].label} – {dates[dates.length - 1].label}
          </div>
          <select
            value={String(windowSize)}
            onChange={(e) => setWindowSize(Number(e.target.value))}
            disabled={!!readOnly}
            className="border rounded-md px-2 py-2 text-xs h-9"
          >
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="45">45</option>
            <option value="60">60</option>
            <option value="75">75</option>
            <option value="90">90</option>
          </select>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative rounded-md border overflow-x-auto"
      >
        <table className="border-collapse min-w-[720px] w-full text-xs md:text-sm">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 text-left bg-gray-200 sticky left-0 z-20">
                {title || "Availability"}
              </th>
              {dates.map((d) => (
                <th
                  key={d.label}
                  className="border border-gray-300 p-2 bg-gray-200 sticky top-0"
                >
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-300 p-2 bg-gray-50 sticky left-0 z-10">
                  {row.name}
                </td>
                {dates.map((date) => {
                  const k = keyFor(row.id, date.label);
                  const isSelected = selectedKeys.has(k);
                  const isDirtyCell = dirty.has(k);
                  return (
                    <td
                      key={date.label}
                      data-rowid={row.id}
                      data-label={date.label}
                      onMouseDown={(e) =>
                        handleMouseDown(row.id, date.label, e)
                      }
                      onMouseEnter={() => handleMouseEnter(row.id, date.label)}
                      onTouchStart={() => handleTouchStart(row.id, date.label)}
                      onTouchMove={handleTouchMove}
                      className={`border border-gray-300 p-0 min-w-[72px] md:min-w-[96px] ${
                        isSelected
                          ? "bg-blue-100"
                          : isDirtyCell
                          ? "bg-emerald-50"
                          : "bg-white"
                      }`}
                    >
                      {row.id === "stop" ? (
                        <div className="flex items-center justify-center p-2">
                          <input
                            type="checkbox"
                            checked={
                              String(values[row.id][date.label]) === "true"
                            }
                            disabled={!!readOnly}
                            onChange={(e) => {
                              const cellKey = keyFor(row.id, date.label);
                              selectedRowRef.current = "stop";
                              updateStopSelected(
                                e.target.checked ? "true" : "false",
                                cellKey
                              );
                            }}
                            onFocus={() => {
                              selectedRowRef.current = row.id;
                              setSelectedKeys((prev) => {
                                const next = new Set(prev);
                                next.add(k);
                                return next;
                              });
                            }}
                            aria-label={`Stop Booking for ${date.label}`}
                            title={`Stop Booking for ${date.label}`}
                          />
                        </div>
                      ) : (
                        <input
                          ref={(el) => {
                            inputRefs.current[k] =
                              el as HTMLInputElement | null;
                          }}
                          value={values[row.id][date.label] ?? "0"}
                          type="number"
                          min={0}
                          disabled={!!readOnly}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const num = Math.max(0, Number(raw) || 0);
                            const newVal = String(num);
                            if (selectedKeys.has(k)) {
                              updateSelected(newVal);
                            } else {
                              setValues((prev) => ({
                                ...prev,
                                [row.id]: {
                                  ...prev[row.id],
                                  [date.label]: newVal,
                                },
                              }));
                              setDirty((prev) => {
                                const next = new Set(prev);
                                const def = "0";
                                if (newVal !== def) next.add(k);
                                else next.delete(k);
                                return next;
                              });
                            }
                          }}
                          onFocus={() => {
                            selectedRowRef.current = row.id;
                            setSelectedKeys((prev) => {
                              const next = new Set(prev);
                              next.add(k);
                              return next;
                            });
                          }}
                          aria-label={`${row.name} for ${date.label}`}
                          title={`${row.name} for ${date.label}`}
                          className="w-full p-2 border-none outline-none bg-transparent text-center"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4" />
    </div>
  );
}
