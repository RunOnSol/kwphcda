import React, { useEffect, useState } from "react";

import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Calendar,
  CreditCard as Edit,
  Download,
  Filter,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

import {
  createStaff,
  deleteStaff,
  getAllStaff,
  updateStaff,
} from "../../lib/supabase";
import { KWARA_LGAS, Staff, STAFF_CADRES, STAFF_TIERS } from "../../types";
import { logActivity } from "../../lib/activityLogger";

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    sex: "",
    lga: "",
    tier: "",
    cadre: "",
    ageRange: { min: "", max: "" },
  });

  const [formData, setFormData] = useState({
    name: "",
    psn: "",
    gl: "",
    sex: "Male" as "Male" | "Female",
    date_of_birth: "",
    lga: "",
    date_of_first_appt: "",
    date_of_confirmation: "",
    date_of_present_appt: "",
    qualification: "",
    rank: "",
    cadre: "",
    parent_mda: "KWPHCDA",
    present_posting: "",
    mobile_number: "",
    tier: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    applyFilters();
    if (searchTerm && searchTerm.length > 2) {
      logActivity('staff_search', `Searched for staff: ${searchTerm}`, {
        search_term: searchTerm,
        filters: filters
      });
    }
  }, [staff, searchTerm, filters]);

  const fetchStaff = async () => {
    try {
      const { data, error } = await getAllStaff();
      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = staff.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.psn &&
          member.psn.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSex = !filters.sex || member.sex === filters.sex;
      const matchesLGA = !filters.lga || member.lga === filters.lga;
      const matchesTier = !filters.tier || member.tier === filters.tier;
      const matchesCadre = !filters.cadre || member.cadre === filters.cadre;

      let matchesAge = true;
      if (filters.ageRange.min || filters.ageRange.max) {
        if (member.date_of_birth) {
          const age =
            new Date().getFullYear() -
            new Date(member.date_of_birth).getFullYear();
          const minAge = filters.ageRange.min
            ? parseInt(filters.ageRange.min)
            : 0;
          const maxAge = filters.ageRange.max
            ? parseInt(filters.ageRange.max)
            : 100;
          matchesAge = age >= minAge && age <= maxAge;
        } else {
          matchesAge = false;
        }
      }

      return (
        matchesSearch &&
        matchesSex &&
        matchesLGA &&
        matchesTier &&
        matchesCadre &&
        matchesAge
      );
    });

    setFilteredStaff(filtered);
  };

  const generateStaffNumber = () => {
    const numericStaffNumbers = staff
      .map((s) => parseInt(s.sn))
      .filter((n) => !isNaN(n));

    const maxNumber =
      numericStaffNumbers.length > 0 ? Math.max(...numericStaffNumbers) : 0;
    return (maxNumber + 1).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStaff) {
        const { error } = await updateStaff(editingStaff.id, formData);
        if (error) throw error;

        setStaff(
          staff.map((member) =>
            member.id === editingStaff.id ? { ...member, ...formData } : member
          )
        );
        toast.success("Staff updated successfully");
      } else {
        const staffNumber = generateStaffNumber();
        const staffData = { ...formData, sn: staffNumber };

        const { data, error } = await createStaff(staffData);
        if (error) throw error;

        setStaff([data, ...staff]);
        toast.success(`Staff created successfully with number: ${staffNumber}`);
      }

      resetForm();
    } catch (error: any) {
      console.error("Error saving staff:", error);
      toast.error(error.message || "Failed to save staff");
    }
  };

  const handleEdit = (member: Staff) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      psn: member.psn || "",
      gl: member.gl || "",
      sex: member.sex,
      date_of_birth: member.date_of_birth || "",
      lga: member.lga,
      date_of_first_appt: member.date_of_first_appt || "",
      date_of_confirmation: member.date_of_confirmation || "",
      date_of_present_appt: member.date_of_present_appt || "",
      qualification: member.qualification || "",
      rank: member.rank || "",
      cadre: member.cadre || "",
      parent_mda: member.parent_mda || "KWPHCDA",
      present_posting: member.present_posting || "",
      mobile_number: member.mobile_number || "",
      tier: member.tier || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const { error } = await deleteStaff(id);
      if (error) throw error;

      setStaff(staff.filter((member) => member.id !== id));
      toast.success("Staff deleted successfully");
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("Failed to delete staff");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      psn: "",
      gl: "",
      sex: "Male",
      date_of_birth: "",
      lga: "",
      date_of_first_appt: "",
      date_of_confirmation: "",
      date_of_present_appt: "",
      qualification: "",
      rank: "",
      cadre: "",
      parent_mda: "KWPHCDA",
      present_posting: "",
      mobile_number: "",
      tier: "",
    });
    setEditingStaff(null);
    setShowModal(false);
  };

  const clearFilters = () => {
    setFilters({
      sex: "",
      lga: "",
      tier: "",
      cadre: "",
      ageRange: { min: "", max: "" },
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "N/A";
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    return age.toString();
  };

  // Export functions
  const exportToPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(16);
    doc.text("KWPHCDA Staff List", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
    doc.text(`Total Staff: ${filteredStaff.length}`, 14, 30);

    const tableData = filteredStaff.map((member, index) => [
      index + 1,
      member.sn,
      member.name,
      member.sex,
      calculateAge(member.date_of_birth || ""),
      member.lga,
      member.rank || "N/A",
      member.cadre || "N/A",
      member.present_posting || "N/A",
      member.tier || "N/A",
    ]);

    autoTable(doc, {
      head: [
        [
          "#",
          "S/N",
          "Name",
          "Sex",
          "Age",
          "LGA",
          "Rank",
          "Cadre",
          "Posting",
          "Tier",
        ],
      ],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94] },
    });

    doc.save("kwphcda-staff-list.pdf");
    toast.success("PDF exported successfully");
  };

  const exportToExcel = () => {
    const exportData = filteredStaff.map((member, index) => ({
      "#": index + 1,
      "Staff Number": member.sn,
      Name: member.name,
      PSN: member.psn || "N/A",
      "Grade Level": member.gl || "N/A",
      Sex: member.sex,
      "Date of Birth": member.date_of_birth || "N/A",
      Age: calculateAge(member.date_of_birth || ""),
      LGA: member.lga,
      "Date of First Appointment": member.date_of_first_appt || "N/A",
      "Date of Confirmation": member.date_of_confirmation || "N/A",
      "Date of Present Appointment": member.date_of_present_appt || "N/A",
      Qualification: member.qualification || "N/A",
      Rank: member.rank || "N/A",
      Cadre: member.cadre || "N/A",
      "Parent MDA": member.parent_mda || "N/A",
      "Present Posting": member.present_posting || "N/A",
      "Mobile Number": member.mobile_number || "N/A",
      Tier: member.tier || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff List");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "kwphcda-staff-list.xlsx");
    toast.success("Excel file exported successfully");
  };

  const exportToCSV = () => {
    const exportData = filteredStaff.map((member, index) => ({
      "#": index + 1,
      "Staff Number": member.sn,
      Name: member.name,
      PSN: member.psn || "N/A",
      "Grade Level": member.gl || "N/A",
      Sex: member.sex,
      "Date of Birth": member.date_of_birth || "N/A",
      Age: calculateAge(member.date_of_birth || ""),
      LGA: member.lga,
      "Date of First Appointment": member.date_of_first_appt || "N/A",
      "Date of Confirmation": member.date_of_confirmation || "N/A",
      "Date of Present Appointment": member.date_of_present_appt || "N/A",
      Qualification: member.qualification || "N/A",
      Rank: member.rank || "N/A",
      Cadre: member.cadre || "N/A",
      "Parent MDA": member.parent_mda || "N/A",
      "Present Posting": member.present_posting || "N/A",
      "Mobile Number": member.mobile_number || "N/A",
      Tier: member.tier || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const csvOutput = XLSX.utils.sheet_to_csv(ws);
    const data = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    saveAs(data, "kwphcda-staff-list.csv");
    toast.success("CSV file exported successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-600">Manage KWPHCDA staff records</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Male Staff</p>
              <p className="text-2xl font-bold text-gray-900">
                {staff.filter((s) => s.sex === "Male").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-pink-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Female Staff</p>
              <p className="text-2xl font-bold text-gray-900">
                {staff.filter((s) => s.sex === "Female").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Filtered</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredStaff.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, staff number, or PSN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>

            <div className="relative">
              <button
                onClick={() =>
                  document
                    .getElementById("export-menu")
                    ?.classList.toggle("hidden")
                }
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>

              <div
                id="export-menu"
                className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
              >
                <div className="py-1">
                  <button
                    onClick={exportToPDF}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as Excel
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sex
                </label>
                <select
                  value={filters.sex}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sex: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LGA
                </label>
                <select
                  value={filters.lga}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, lga: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All LGAs</option>
                  {KWARA_LGAS.map((lga) => (
                    <option key={lga} value={lga}>
                      {lga}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tier
                </label>
                <select
                  value={filters.tier}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, tier: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Tiers</option>
                  {STAFF_TIERS.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cadre
                </label>
                <select
                  value={filters.cadre}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, cadre: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Cadres</option>
                  {STAFF_CADRES.map((cadre) => (
                    <option key={cadre} value={cadre}>
                      {cadre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Age
                </label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.ageRange.min}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      ageRange: { ...prev.ageRange, min: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Age
                </label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.ageRange.max}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      ageRange: { ...prev.ageRange, max: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S/N
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sex
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LGA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {member.sn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {member.name}
                      </div>
                      {member.psn && (
                        <div className="text-sm text-gray-500">
                          PSN: {member.psn}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.sex}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateAge(member.date_of_birth || "")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.lga}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.rank || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {member.cadre || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.tier === "Tier 1"
                          ? "bg-green-100 text-green-800"
                          : member.tier === "Tier 2"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {member.tier || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                        title="Edit staff"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                        title="Delete staff"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No staff found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || Object.values(filters).some((f) => f)
                ? "Try adjusting your search criteria or filters."
                : "Get started by adding a new staff member."}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingStaff && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> Staff number
                    will be automatically generated when you save this record.
                  </p>
                </div>
              )}

              {editingStaff && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Staff Number:</span>{" "}
                    {editingStaff.sn}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PSN
                  </label>
                  <input
                    type="text"
                    value={formData.psn}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, psn: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Level
                  </label>
                  <input
                    type="text"
                    value={formData.gl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, gl: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., GL-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sex *
                  </label>
                  <select
                    required
                    value={formData.sex}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sex: e.target.value as "Male" | "Female",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        date_of_birth: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LGA *
                  </label>
                  <select
                    required
                    value={formData.lga}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, lga: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select LGA</option>
                    {KWARA_LGAS.map((lga) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of First Appointment
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_first_appt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        date_of_first_appt: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Confirmation
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_confirmation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        date_of_confirmation: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Present Appointment
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_present_appt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        date_of_present_appt: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        qualification: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., MBBS, BSc Nursing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rank
                  </label>
                  <input
                    type="text"
                    value={formData.rank}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, rank: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Medical Officer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cadre
                  </label>
                  <select
                    value={formData.cadre}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cadre: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Cadre</option>
                    {STAFF_CADRES.map((cadre) => (
                      <option key={cadre} value={cadre}>
                        {cadre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent MDA
                  </label>
                  <input
                    type="text"
                    value={formData.parent_mda}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parent_mda: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Present Posting
                  </label>
                  <input
                    type="text"
                    value={formData.present_posting}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        present_posting: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile_number}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        mobile_number: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tier
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tier: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Tier</option>
                    {STAFF_TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {editingStaff ? "Update Staff" : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
