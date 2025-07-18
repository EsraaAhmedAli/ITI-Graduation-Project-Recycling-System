import React, { useState } from "react";
import DataTable from "react-data-table-component";
import styled from "styled-components";

// البيانات
const initialData = [
  { id: 1, name: "أحمد", age: 28, job: "مهندس" },
  { id: 2, name: "سارة", age: 25, job: "مصممة" },
  { id: 3, name: "محمد", age: 30, job: "محاسب" },
  { id: 4, name: "ليلى", age: 22, job: "مطورة" },
];

// الأعمدة
const columns = [
  {
    name: "الاسم",
    selector: row => row.name,
    sortable: true,
  },
  {
    name: "العمر",
    selector: row => row.age,
    sortable: true,
  },
  {
    name: "الوظيفة",
    selector: row => row.job,
    sortable: true,
  },
];

// تصميم مخصص
const CustomStyles = {
  rows: {
    style: {
      minHeight: "50px",
      fontSize: "16px",
    },
  },
  headCells: {
    style: {
      backgroundColor: "#e0f7fa",
      color: "#00796b",
      fontWeight: "bold",
    },
  },
  cells: {
    style: {
      paddingLeft: "8px",
      paddingRight: "8px",
    },
  },
};

// عنصر البحث
const FilterInput = styled.input`
  margin: 10px;
  padding: 8px;
  font-size: 16px;
  width: 250px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const Table = () => {
  const [filterText, setFilterText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  // تصفية البيانات حسب البحث
  const filteredData = initialData.filter(item =>
    item.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>جدول الموظفين</h2>

      {/* البحث */}
      <FilterInput
        type="text"
        placeholder="ابحث بالاسم..."
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
      />

      {/* الجدول */}
      <DataTable
        columns={columns}
        data={filteredData}
        customStyles={CustomStyles}
        pagination
        selectableRows
        onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
        highlightOnHover
        striped
        responsive
      />
    </div>
  );
};

export default Table;
