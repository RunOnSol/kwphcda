import React, {
  useEffect,
  useState,
} from 'react';

import {
  Eye,
  EyeOff,
  UserPlus,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';

import { yupResolver } from '@hookform/resolvers/yup';

import { useAuth } from '../../context/AuthContext';
import { getAllPHCs } from '../../lib/supabase';
import {
  KWARA_LGAS,
  SignupData,
} from '../../types';

const schema = yup.object({
  full_name: yup.string().required("Full name is required"),
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  gender: yup
    .string()
    .oneOf(["male", "female"], "Please select a gender")
    .required("Gender is required"),
  lga: yup.string().required("LGA is required"),
  ward: yup.string().required("Ward is required"),
  phc_id: yup.string().optional(),
});

interface SignupFormProps {
  onToggleForm: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onToggleForm }) => {
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [phcs, setPHCs] = useState<any[]>([]);
  const [filteredPHCs, setFilteredPHCs] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: yupResolver(schema),
  });

  const selectedLGA = watch("lga");

  useEffect(() => {
    const fetchPHCs = async () => {
      const { data, error } = await getAllPHCs();
      if (data && !error) {
        setPHCs(data);
      }
    };
    fetchPHCs();
  }, []);

  useEffect(() => {
    if (selectedLGA) {
      const filtered = phcs.filter((phc) => phc.lga === selectedLGA);
      setFilteredPHCs(filtered);
    } else {
      setFilteredPHCs([]);
    }
  }, [selectedLGA, phcs]);

  const onSubmit = async (data: SignupData) => {
    try {
      await signUp(data.email, data.password, {
        full_name: data.full_name,
        username: data.username,
        gender: data.gender,
        lga: data.lga,
        ward: data.ward,
        phc_id: data.phc_id || null,
      });
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join KWSPHCDA
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to access healthcare services
          </p>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit(onSubmit as any)}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                {...register("full_name")}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your full name"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                {...register("username")}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Choose a username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                Gender
              </label>
              <select
                {...register("gender")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.gender.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lga"
                className="block text-sm font-medium text-gray-700"
              >
                Local Government Area
              </label>
              <select
                {...register("lga")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select LGA</option>
                {KWARA_LGAS.map((lga) => (
                  <option key={lga} value={lga}>
                    {lga}
                  </option>
                ))}
              </select>
              {errors.lga && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lga.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="ward"
                className="block text-sm font-medium text-gray-700"
              >
                Ward
              </label>
              <input
                {...register("ward")}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your ward"
              />
              {errors.ward && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.ward.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phc_id"
                className="block text-sm font-medium text-gray-700"
              >
                Primary Health Care Center (Optional)
              </label>
              <select
                {...register("phc_id")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                disabled={!selectedLGA}
              >
                <option value="">Select PHC (Optional)</option>
                {filteredPHCs.map((phc) => (
                  <option key={phc.id} value={phc.id}>
                    {phc.name}
                  </option>
                ))}
              </select>
              {!selectedLGA && (
                <p className="mt-1 text-sm text-gray-500">
                  Please select an LGA first
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleForm}
              className="text-green-600 hover:text-green-500 text-sm font-medium"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
