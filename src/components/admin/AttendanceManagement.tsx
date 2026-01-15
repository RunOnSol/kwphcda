import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Download, Filter, CheckCircle, XCircle, Key } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';

interface AttendanceRecord {
  id: string;
  staff_name: string;
  psn: string;
  gender: string;
  clock_in_time: string;
  clock_out_time: string | null;
  status: string;
  approval_code_in: string;
  approval_code_out: string | null;
  staff_phone: string | null;
}

export default function AttendanceManagement() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'clocked_in' | 'clocked_out'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [approvalCode, setApprovalCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  useEffect(() => {
    fetchRecords();
    const interval = setInterval(fetchRecords, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, filter, dateFilter, searchTerm]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast.error('Error fetching attendance records');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

    if (filter !== 'all') {
      filtered = filtered.filter(r => r.status === filter);
    }

    if (dateFilter) {
      filtered = filtered.filter(r => {
        const recordDate = format(new Date(r.clock_in_time), 'yyyy-MM-dd');
        return recordDate === dateFilter;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.psn.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  };

  const generateApprovalCode = async () => {
    setGeneratingCode(true);
    try {
      await supabase
        .from('attendance_approval_codes')
        .update({ is_active: false })
        .eq('is_active', true);

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 30000);

      const { error } = await supabase
        .from('attendance_approval_codes')
        .insert({
          code,
          generated_by: user?.id,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        });

      if (error) throw error;

      setApprovalCode(code);
      setCodeExpiry(expiresAt);
      toast.success('Approval code generated!');

      setTimeout(() => {
        setApprovalCode('');
        setCodeExpiry(null);
      }, 30000);
    } catch (error: any) {
      toast.error('Error generating approval code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Attendance Records', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on ${format(new Date(), 'PPpp')}`, 14, 30);

    const tableData = filteredRecords.map(record => [
      record.staff_name,
      record.psn,
      record.gender,
      format(new Date(record.clock_in_time), 'Pp'),
      record.clock_out_time ? format(new Date(record.clock_out_time), 'Pp') : 'Not clocked out',
      record.status,
    ]);

    autoTable(doc, {
      head: [['Name', 'PSN', 'Gender', 'Clock In', 'Clock Out', 'Status']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`attendance-records-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF exported successfully!');
  };

  const exportToExcel = () => {
    const exportData = filteredRecords.map(record => ({
      'Staff Name': record.staff_name,
      'PSN': record.psn,
      'Gender': record.gender,
      'Phone': record.staff_phone || 'N/A',
      'Clock In Time': format(new Date(record.clock_in_time), 'PPpp'),
      'Clock Out Time': record.clock_out_time ? format(new Date(record.clock_out_time), 'PPpp') : 'Not clocked out',
      'Status': record.status,
      'Approval Code (In)': record.approval_code_in,
      'Approval Code (Out)': record.approval_code_out || 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Records');
    XLSX.writeFile(wb, `attendance-records-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Excel file exported successfully!');
  };

  const stats = {
    total: records.length,
    clockedIn: records.filter(r => r.status === 'clocked_in').length,
    clockedOut: records.filter(r => r.status === 'clocked_out').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage staff attendance</p>
        </div>
        <button
          onClick={fetchRecords}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Approval Code Generator</h2>
            <p className="text-blue-100">Generate a 6-digit code for staff attendance approval</p>
          </div>
          <Key className="w-12 h-12 text-blue-200" />
        </div>

        {approvalCode ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-5xl font-bold text-blue-600 tracking-widest mb-3">
              {approvalCode}
            </div>
            <div className="text-gray-600 text-sm">
              Expires in {codeExpiry ? Math.max(0, Math.ceil((codeExpiry.getTime() - Date.now()) / 1000)) : 0}s
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-1000"
                style={{
                  width: codeExpiry ? `${Math.max(0, ((codeExpiry.getTime() - Date.now()) / 30000) * 100)}%` : '0%'
                }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={generateApprovalCode}
            disabled={generatingCode}
            className="w-full bg-white text-blue-600 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {generatingCode ? 'Generating...' : 'Generate New Code'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Clock className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Currently Clocked In</p>
              <p className="text-3xl font-bold text-green-600">{stats.clockedIn}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clocked Out</p>
              <p className="text-3xl font-bold text-gray-600">{stats.clockedOut}</p>
            </div>
            <XCircle className="w-12 h-12 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or PSN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('clocked_in')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'clocked_in'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Clocked In
              </button>
              <button
                onClick={() => setFilter('clocked_out')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'clocked_out'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Clocked Out
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading records...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No records found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PSN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Codes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{record.staff_name}</div>
                      {record.staff_phone && (
                        <div className="text-sm text-gray-500">{record.staff_phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.psn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(record.clock_in_time), 'PPp')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.clock_out_time
                        ? format(new Date(record.clock_out_time), 'PPp')
                        : <span className="text-gray-400">Not clocked out</span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === 'clocked_in'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status === 'clocked_in' ? 'Clocked In' : 'Clocked Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="space-y-1">
                        <div className="text-gray-600">In: {record.approval_code_in}</div>
                        {record.approval_code_out && (
                          <div className="text-gray-600">Out: {record.approval_code_out}</div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
