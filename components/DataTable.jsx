"use client";
import { React, useState, useEffect, useMemo } from "react";
import { reviews } from "@/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FilterDepartment from "./FilterDepartment";
import FilterShortlisted from "./FilterShortlisted";
import { FaSortAmountDownAlt } from "react-icons/fa";
import { GrPowerReset } from "react-icons/gr";
import { Button } from "./ui/button";
import { CheckBoxComp } from "./CheckBoxComp";
import { toast } from "sonner";
import { curDate, curDay, curMonth, curYear, months, days } from "@/constants";
import { IoCloudDownloadOutline } from "react-icons/io5";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useFilters,
  usePagination,
  useRowSelect,
} from "react-table";
import { Input } from "@/components/ui/input";
import PaginationComp from "./PaginationComp";
import DialogComp from "./DialogComp";
import dynamic from "next/dynamic";
import { CSVLink } from "react-csv";
import { CSV_Header } from "@/constants";

const MailComposer = dynamic(() => import("./MailComposer"), { ssr: false });

const DataTable = ({ data }) => {
  const [tableData, setTableData] = useState(data);

  const [deptFiltered, setDeptFiltered] = useState(data);
  const [shortFiltered, setShortFiltered] = useState(data);

  const commonElements = (arr1, arr2) => {
    let common = [];
    arr1.map((elt1) => {
      arr2.map((elt2) => {
        if (elt1 === elt2) {
          common.push(elt1);
        }
      });
    });
    return common;
  };

  const filterFunc = (dept) => {
    setDeptFiltered(data);
    const filteredData = data.filter((data) => {
      return data.Department === dept;
    });

    setDeptFiltered(filteredData);
  };

  const shortlistedFilterFunc = (status) => {
    const filteredData = data.filter((data) => {
      return String(data.shortlisted) === status;
    });

    setShortFiltered(filteredData);
  };

  // Reconcile dept + shortlisted filters
  useEffect(() => {
    if (deptFiltered !== data && shortFiltered !== data) {
      setTableData(commonElements(deptFiltered, shortFiltered));
    } else if (deptFiltered !== data && shortFiltered === data) {
      setTableData(deptFiltered);
    } else if (deptFiltered === data && shortFiltered !== data) {
      setTableData(shortFiltered);
    } else {
      setTableData(data);
    }
  }, [deptFiltered, shortFiltered]);

  const handleShortlist = async (id, isShortlisted) => {
    try {
      const res = await fetch(`/api/shortlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortlisted: !isShortlisted }), // Send the new status
      });

      if (res.ok) {
        const updatedData = tableData.map((applicant) => {
          if (applicant._id === id) {
            return { ...applicant, shortlisted: !isShortlisted }; // Update in local state
          }
          return applicant;
        });
        setTableData(updatedData);
        toast.success("Student status updated!");
      } else {
        console.error("Failed to update applicant status.");
        throw new Error("Failed to update");
      }
    } catch (error) {
      console.error("Error occurred while updating the status:", error.message);
      toast.error("Failed to update status");
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: "Sr No",
        accessor: (row, index) => index + 1,
      },
      {
        Header: "Name",
        accessor: "Name",
      },
      {
        Header: "RegistrationNumber",
        accessor: "RegistrationNumber",
      },
      {
        Header: "Email",
        accessor: "Email",
      },
      {
        Header: "Phone",
        accessor: "Phone",
      },
      {
        Header: "Department",
        accessor: "Department",
      },
      {
        Header: "Shortlisted",
        accessor: "shortlisted",
        Cell: ({ row }) => {
          const isShortlisted = row.original.shortlisted;
          return (
            <button
              onClick={() =>
                handleShortlist(row.original._id, isShortlisted)
              }
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: isShortlisted ? "#6ee7a0" : "rgba(255,255,255,0.45)",
                border: isShortlisted
                  ? "1px solid rgba(110,231,160,0.35)"
                  : "1px solid rgba(255,255,255,0.15)",
                background: "transparent",
                padding: "3px 10px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {isShortlisted ? "[ Unshortlist ]" : "[ Shortlist ]"}
            </button>
          );
        },
      },
    ],
    [tableData]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    setGlobalFilter,
    selectedFlatRows,
  } = useTable(
    {
      columns,
      data: tableData,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => {
        return [
          {
            Header: ({ getToggleAllRowsSelectedProps }) => (
              <CheckBoxComp {...getToggleAllRowsSelectedProps()} />
            ),
            Cell: ({ row }) => (
              <CheckBoxComp {...row.getToggleRowSelectedProps()} />
            ),
          },
          ...columns,
        ];
      });
    }
  );

  const { globalFilter, pageIndex } = state;

  const handlePageSize = (e) => {
    const sz = Number(e.target.value);
    if (sz) {
      setPageSize(sz);
    } else {
      setPageSize(10);
    }
  };

  const handleRowSelection = async (payloadData) => {
    const selectedApplicants = selectedFlatRows.map((row) => row.original);
    const request = {
      recipients: selectedApplicants,
      payloadData: payloadData,
    };

    try {
      // const response = await MailSender(request);
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        toast("Invite has been sent!", {
          description: `On ${months[curMonth - 1]} ${curDate}, ${curYear}`,
        });
      } else {
        toast("Failed to send invite", {
          description: "Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      toast("Failed to send invite", {
        description: "Please try again later.",
      });
    }
  };

  const showRowData = () => {
    const selectedApplicants = selectedFlatRows.map((row) => row.original);
    return selectedApplicants;
  };

  const formatQuestionsForCsv = (item) => {
    if (!item?.Questions) return "";

    if (Array.isArray(item.Questions)) {
      return item.Questions
        .map((entry) => {
          if (typeof entry === "string") return entry;
          if (Array.isArray(entry)) return entry.join(": ");
          if (entry && typeof entry === "object") {
            return Object.entries(entry)
              .map(([key, value]) => `Q: ${key}\nA: ${value}`)
              .join("\n\n");
          }
          return String(entry ?? "");
        })
        .join("\n\n");
    }

    if (typeof item.Questions === "object") {
      return Object.entries(item.Questions)
        .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
        .join("\n\n");
    }

    return String(item.Questions);
  };

  const csv_link = useMemo(
    () => ({
      headers: CSV_Header,
      data: tableData.map((item) => ({
        ...item,
        Questions: formatQuestionsForCsv(item),
      })),
    }),
    [tableData]
  );

  // Dept tone lookup for chips
  const getDeptTone = (deptName) => {
    return reviews.find((r) => r.name === deptName)?.tone ?? "rgba(255,255,255,0.3)";
  };

  return (
    <div className="flex flex-col gap-0">
      {/* ── Editorial toolbar ── */}
      <div
        className="flex items-center flex-wrap gap-2 py-4 mb-4 overflow-x-auto"
        style={{ borderBottom: "var(--editorial-rule)" }}
      >
        {/* Search */}
        <Input
          value={globalFilter || ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search applicants…"
          className="field-underline min-w-[200px] max-w-[280px] text-sm"
        />
        {/* Page size */}
        <Input
          className="field-underline w-[90px] text-sm"
          onChange={(e) => handlePageSize(e)}
          placeholder="Page size"
        />
        <FilterDepartment filterFunc={filterFunc} />
        <FilterShortlisted filterFunc={shortlistedFilterFunc} />
        <MailComposer
          recipients={selectedFlatRows.length}
          handleRowSelection={handleRowSelection}
        />
        <button
          onClick={() => window.location.reload()}
          className="btn-editorial flex items-center gap-1.5"
        >
          <GrPowerReset size={11} />
          Reset
        </button>
        <button className="btn-editorial">
          <CSVLink
            {...csv_link}
            className="flex gap-1.5 items-center"
          >
            <IoCloudDownloadOutline size={12} />
            CSV
          </CSVLink>
        </button>
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: "auto" }}>
        <Table
          {...getTableProps()}
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <TableHeader>
            {headerGroups.map((hg) => (
              <TableRow
                key={hg.id}
                {...hg.getHeaderGroupProps()}
                style={{ borderBottom: "var(--editorial-rule)" }}
              >
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    {...header.getHeaderProps(header.getSortByToggleProps())}
                    style={{
                      fontFamily: "var(--font-mono), ui-monospace, monospace",
                      fontSize: "9px",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.35)",
                      padding: "10px 12px",
                      whiteSpace: "nowrap",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div className="inline-flex gap-1 items-center">
                      {header.render("Header")}
                      <FaSortAmountDownAlt size={8} style={{ opacity: 0.4 }} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody {...getTableBodyProps()}>
            {page.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    borderBottom: "var(--editorial-rule)",
                  }}
                >
                  <p className="mono-label">
                    {data.length === 0
                      ? "No applicants have registered yet."
                      : "No applicants match your current filters."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              page.map((row) => {
                prepareRow(row);
                return (
                  <TableRow
                    key={row.id}
                    {...row.getRowProps()}
                    style={{ borderBottom: "var(--editorial-rule)" }}
                  >
                    {row.cells.map((cell) => {
                      const isDeptCell = cell.column.id === "Department";
                      const deptTone = isDeptCell
                        ? getDeptTone(cell.value)
                        : null;

                      return (
                        <TableCell
                          key={cell.id}
                          {...cell.getCellProps()}
                          style={{
                            padding: "10px 12px",
                            fontSize: "12px",
                            color: "rgba(237,237,237,0.75)",
                            border: "none",
                            whiteSpace: isDeptCell ? "nowrap" : undefined,
                          }}
                        >
                          {isDeptCell ? (
                            <span
                              style={{
                                fontFamily:
                                  "var(--font-mono), ui-monospace, monospace",
                                fontSize: "9px",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: deptTone,
                                border: `1px solid ${deptTone}33`,
                                padding: "2px 7px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {cell.value}
                            </span>
                          ) : (
                            cell.render("Cell")
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div style={{ borderTop: "var(--editorial-rule)", paddingTop: "1rem", marginTop: "0.5rem" }}>
        <PaginationComp
          pageIndex={pageIndex}
          pages={pageOptions.length}
          nextPage={nextPage}
          canNext={canNextPage}
          previousPage={previousPage}
          canPrev={canPreviousPage}
          goto={gotoPage}
          pageCount={pageCount}
        />
      </div>
    </div>
  );
};

export default DataTable;
