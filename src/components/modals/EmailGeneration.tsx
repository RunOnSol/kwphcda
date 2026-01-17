import React, { useState } from 'react';
import { Mail, User, MapPin, Search, CheckCircle, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface StaffData {
  psn: string;
  name: string;
  sex: string;
  lga: string;
  present_posting: string;
}

interface ExistingEmail {
  email: string;
  created_at: string;
}

const EmailGeneration: React.FC = () => {
  const [psn, setPsn] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female'>('Male');
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [existingEmail, setExistingEmail] = useState<ExistingEmail | null>(null);
  const [searching, setSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!psn.trim()) {
      toast.error('Please enter your PSN');
      return;
    }

    setSearching(true);
    setStaffData(null);
    setExistingEmail(null);
    setShowCreateForm(false);

    try {
      // First check if email already exists for this PSN
      const { data: emailData, error: emailError } = await supabase
        .from('staff_emails')
        .select('email, created_at')
        .eq('psn', psn.trim())
        .maybeSingle();

      if (emailData) {
        setExistingEmail(emailData);
        setSearching(false);
        return;
      }

      // Search for staff data
      const { data, error } = await supabase
        .from('staff')
        .select('psn, name, sex, lga, present_posting')
        .eq('psn', psn.trim())
        .eq('sex', sex)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        toast.error('No staff found with the provided PSN and sex. Please verify your details.');
        return;
      }

      setStaffData(data);

      // Generate suggested email
      const nameParts = data.name.toLowerCase().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts[nameParts.length - 1] || '';
      const emailPrefix = `${firstName}.${lastName}`;
      const cleanedPrefix = emailPrefix.replace(/[^a-z.]/g, '');
      const suggestedEmail = `${cleanedPrefix}@KWSPHCDA.gov.ng`;

      setEmail(suggestedEmail);
    } catch (error) {
      console.error('Error searching staff:', error);
      toast.error('Failed to search for staff. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const validatePassword = (pwd: string): boolean => {
    if (pwd.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    if (!/[A-Z]/.test(pwd)) {
      toast.error('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[a-z]/.test(pwd)) {
      toast.error('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/[0-9]/.test(pwd)) {
      toast.error('Password must contain at least one number');
      return false;
    }
    return true;
  };

  const handleCreateEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staffData) return;

    // Validate email format
    const emailRegex = /^[a-z][a-z0-9._-]*@KWSPHCDA\.gov\.ng$/;
    if (!emailRegex.test(email)) {
      toast.error('Invalid email format. Email must be in format: name@KWSPHCDA.gov.ng');
      return;
    }

    // Validate password
    if (!validatePassword(password)) {
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setCreating(true);

    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-staff-email`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          psn: staffData.psn,
          sex: staffData.sex,
          email: email,
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create email');
      }

      toast.success(result.message || 'Email created successfully!');

      // Refresh to show existing email
      setExistingEmail({
        email: email,
        created_at: new Date().toISOString(),
      });
      setStaffData(null);
      setShowCreateForm(false);
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error creating email:', error);
      toast.error(error.message || 'Failed to create email. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleReset = () => {
    setPsn('');
    setSex('Male');
    setStaffData(null);
    setExistingEmail(null);
    setShowCreateForm(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-4 rounded-full">
              <Mail className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Staff Email Creation
          </h1>
          <p className="text-gray-600">
            Create your official KWSPHCDA email address
          </p>
        </div>

        {existingEmail ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-green-900 mb-2">
                    Email Already Created
                  </h3>
                  <p className="text-sm text-green-700 mb-3">
                    An email has already been created for this PSN
                  </p>
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="text-lg font-mono text-green-900 break-all">
                      {existingEmail.email}
                    </p>
                  </div>
                  <p className="text-sm text-green-700 mt-3">
                    Created on: {new Date(existingEmail.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    If you've forgotten your password, please contact IT support for assistance ASAP.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full mt-6 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Check Another PSN
            </button>
          </div>
        ) : !staffData ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label
                  htmlFor="psn"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Personal Staff Number (PSN)
                </label>
                <input
                  type="text"
                  id="psn"
                  value={psn}
                  onChange={(e) => setPsn(e.target.value)}
                  placeholder="Enter your PSN"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="sex"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Sex
                </label>
                <select
                  id="sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value as 'Male' | 'Female')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={searching}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {searching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Verify Staff Details</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-6">
              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-green-900 mb-2">
                      Staff Verification Successful
                    </h3>
                    <p className="text-sm text-green-700">
                      Please verify the details below and create your email
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <User className="h-4 w-4" />
                    <span>Name</span>
                  </div>
                  <p className="font-medium text-gray-900">{staffData.name}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <User className="h-4 w-4" />
                    <span>PSN</span>
                  </div>
                  <p className="font-medium text-gray-900">{staffData.psn}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <User className="h-4 w-4" />
                    <span>Sex</span>
                  </div>
                  <p className="font-medium text-gray-900">{staffData.sex}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <MapPin className="h-4 w-4" />
                    <span>LGA</span>
                  </div>
                  <p className="font-medium text-gray-900">{staffData.lga}</p>
                </div>
              </div>

              {staffData.present_posting && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Present Posting</div>
                  <p className="font-medium text-gray-900">{staffData.present_posting}</p>
                </div>
              )}

              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="h-5 w-5" />
                  <span>Create Email</span>
                </button>
              ) : (
                <form onSubmit={handleCreateEmail} className="space-y-4">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm text-yellow-700">
                          You can only create one email per PSN. Choose your email address carefully.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      placeholder="yourname@kwsphcda.gov.ng"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Must end with @kwsphcda.gov.ng
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Min 8 characters, must include uppercase, lowercase, and number
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {creating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5" />
                          <span>Create Email</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              <button
                onClick={handleReset}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Important Notes</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Each PSN can only create one email address</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Your password must be at least 8 characters with uppercase, lowercase, and numbers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Keep your password secure and do not share it with anyone</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>This service is only available for verified KWSPHCDA staff</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Contact IT support if you encounter any issues or forget your password</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailGeneration;
