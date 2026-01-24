import React from 'react';
import { Users, Building2, HeartPulse, Shield } from 'lucide-react';

const stats = [
  {
    icon: Building2,
    number: '200+',
    label: 'PHC Facilities',
    description: 'Across all LGAs',
  },
  {
    icon: Users,
    number: '500+',
    label: 'Healthcare Workers',
    description: 'Dedicated professionals',
  },
  {
    icon: HeartPulse,
    number: '1M+',
    label: 'Lives Impacted',
    description: 'Annual beneficiaries',
  },
  {
    icon: Shield,
    number: '95%',
    label: 'Vaccination Coverage',
    description: 'Immunization rate',
  },
];

const features = [
  {
    title: 'Comprehensive Healthcare',
    description: 'Access to essential health services including immunization, maternal care, and disease prevention programs.',
  },
  {
    title: 'Community Outreach',
    description: 'Active engagement with communities to promote health awareness and preventive care practices.',
  },
  {
    title: 'Quality Assurance',
    description: 'Commitment to maintaining high standards of healthcare delivery across all facilities.',
  },
];

const FeaturesSection = () => {
  return (
    <>
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600" />
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-800 mb-1 sm:mb-2">
                  {stat.number}
                </h3>
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-1">
                  {stat.label}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-800 mb-3 sm:mb-4">
              Why Choose Us
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Committed to providing accessible, quality healthcare services to every citizen of Kwara State
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                  <span className="text-xl sm:text-2xl font-bold text-green-600">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesSection;
