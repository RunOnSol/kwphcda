import React from 'react';

const ExecutiveSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-green-50">
      <div className="container mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-800 text-center mb-10 sm:mb-12 lg:mb-16">
          Executive Secretary
        </h2>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto">
          <div className="w-full sm:w-2/3 md:w-1/2 lg:w-2/5">
            <div className="rounded-2xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <img
                src="http://kwphcda.com.ng/image/ess.jpg"
                alt="Executive Secretary"
                className="w-full aspect-square object-cover"
              />
            </div>
          </div>

          <div className="w-full lg:w-3/5">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700 mb-2 sm:mb-3">
              Prof. Nusirat Elelu
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-green-600 mb-4 sm:mb-6 font-medium">
              Executive Secretary, KWSPHCDA
            </p>
            <div className="prose text-gray-700">
              <p className="mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg leading-relaxed">
                Prof. Nusirat Elelu is a distinguished scholar, a Doctor of
                Veterinary Medicine from the University of Maiduguri, who
                furthered her academic pursuit by earning a PhD from the
                prestigious University of Bristol (UK). Specializing as a field
                epidemiologist, she delves into the intricate realms of
                vector-borne pathogens, particularly those threatening public
                health in Africa.
              </p>
              <p className="mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg leading-relaxed">
                Under her leadership, KWSPHCDA has achieved significant
                milestones in expanding access to essential health services,
                improving maternal and child health outcomes, and strengthening
                healthcare infrastructure in rural communities.
              </p>
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed bg-green-100/50 p-4 sm:p-6 rounded-xl border-l-4 border-green-600 italic">
                "Our vision is to ensure that every citizen of Kwara State has
                access to quality primary healthcare services. We are committed
                to building a resilient health system that responds effectively
                to the needs of our communities."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExecutiveSection;
