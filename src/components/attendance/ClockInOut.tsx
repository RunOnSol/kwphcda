import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface StaffDetails {
  id: string;
  name: string;
  psn: string;
  sex: string;
  mobile_number: string;
  rank: string;
  present_posting: string;
}

interface AttendanceRecord {
  id: string;
  status: string;
  clock_in_time: string;
  clock_out_time: string | null;
}

export default function ClockInOut() {
  const [step, setStep] = useState<'input' | 'verify' | 'code' | 'success'>('input');
  const [psn, setPsn] = useState('');
  const [gender, setGender] = useState('');
  const [staffDetails, setStaffDetails] = useState<StaffDetails | null>(null);
  const [approvalCode, setApprovalCode] = useState('');
  const [action, setAction] = useState<'clock_in' | 'clock_out' | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRecord, setActiveRecord] = useState<AttendanceRecord | null>(null);

  const handleVerifyStaff = async () => {
    if (!psn || !gender) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('psn', psn)
        .ilike('sex', gender)
        .maybeSingle();

      if (staffError) throw staffError;

      if (!staff) {
        toast.error('Staff not found. Please check PSN and gender.');
        setLoading(false);
        return;
      }

      setStaffDetails(staff);

      const { data: record, error: recordError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('psn', psn)
        .eq('status', 'clocked_in')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recordError && recordError.code !== 'PGRST116') {
        throw recordError;
      }

      setActiveRecord(record);
      setStep('verify');
    } catch (error: any) {
      toast.error(error.message || 'Error verifying staff');
    } finally {
      setLoading(false);
    }
  };

  const handleActionSelect = (selectedAction: 'clock_in' | 'clock_out') => {
    if (selectedAction === 'clock_in' && activeRecord) {
      toast.error('You are already clocked in. Please clock out first.');
      return;
    }

    if (selectedAction === 'clock_out' && !activeRecord) {
      toast.error('You need to clock in first before clocking out.');
      return;
    }

    setAction(selectedAction);
    setStep('code');
  };

  const handleSubmitCode = async () => {
    if (!approvalCode || approvalCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { data: codeData, error: codeError } = await supabase
        .from('attendance_approval_codes')
        .select('*')
        .eq('code', approvalCode)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (codeError || !codeData) {
        toast.error('Invalid or expired code');
        setLoading(false);
        return;
      }

      if (action === 'clock_in') {
        const { error: insertError } = await supabase
          .from('attendance_records')
          .insert({
            staff_id: staffDetails?.id,
            psn: staffDetails?.psn,
            gender: staffDetails?.sex,
            staff_name: staffDetails?.name,
            staff_email: null,
            staff_phone: staffDetails?.mobile_number,
            approval_code_in: approvalCode,
            status: 'clocked_in',
            clock_in_time: new Date().toISOString(),
          });

        if (insertError) throw insertError;
        toast.success('Successfully clocked in!');
      } else if (action === 'clock_out' && activeRecord) {
        const { error: updateError } = await supabase
          .from('attendance_records')
          .update({
            clock_out_time: new Date().toISOString(),
            approval_code_out: approvalCode,
            status: 'clocked_out',
          })
          .eq('id', activeRecord.id);

        if (updateError) throw updateError;
        toast.success('Successfully clocked out!');
      }

      setStep('success');
      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Error processing attendance');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPsn('');
    setGender('');
    setStaffDetails(null);
    setApprovalCode('');
    setAction(null);
    setActiveRecord(null);
    setStep('input');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Staff Attendance</h1>
          <p className="text-gray-600">Clock in and out of your shift</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'input' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Enter Your Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Service Number (PSN)
                </label>
                <input
                  type="text"
                  value={psn}
                  onChange={(e) => setPsn(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your PSN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <button
                onClick={handleVerifyStaff}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </div>
          )}

          {step === 'verify' && staffDetails && (
            <div className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
                Staff Details Verified
              </h2>

              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-gray-900">{staffDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PSN:</span>
                  <span className="font-semibold text-gray-900">{staffDetails.psn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-semibold text-gray-900">{staffDetails.sex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rank:</span>
                  <span className="font-semibold text-gray-900">{staffDetails.rank || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posting:</span>
                  <span className="font-semibold text-gray-900">{staffDetails.present_posting || 'N/A'}</span>
                </div>
              </div>

              {activeRecord && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium">
                    You are currently clocked in since {format(new Date(activeRecord.clock_in_time), 'PPp')}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleActionSelect('clock_in')}
                  disabled={!!activeRecord}
                  className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clock In
                </button>
                <button
                  onClick={() => handleActionSelect('clock_out')}
                  disabled={!activeRecord}
                  className="bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clock Out
                </button>
              </div>

              <button
                onClick={resetForm}
                className="w-full text-gray-600 py-2 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  action === 'clock_in' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {action === 'clock_in' ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {action === 'clock_in' ? 'Clocking In' : 'Clocking Out'}
                </h2>
                <p className="text-gray-600">Enter the 6-digit approval code from the administrator</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Approval Code
                </label>
                <input
                  type="text"
                  value={approvalCode}
                  onChange={(e) => setApprovalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="000000"
                />
              </div>

              <button
                onClick={handleSubmitCode}
                disabled={loading || approvalCode.length !== 6}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Submit'}
              </button>

              <button
                onClick={() => setStep('verify')}
                className="w-full text-gray-600 py-2 hover:text-gray-900 transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6 py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {action === 'clock_in' ? 'Clocked In Successfully!' : 'Clocked Out Successfully!'}
              </h2>
              <p className="text-gray-600">
                Your attendance has been recorded at {format(new Date(), 'PPp')}
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  Have a great {action === 'clock_in' ? 'day at work!' : 'rest of your day!'}
                </p>
              </div>
              <p className="text-sm text-gray-500">Redirecting in 3 seconds...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
