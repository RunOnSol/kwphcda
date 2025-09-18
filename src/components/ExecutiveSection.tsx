import React from 'react';

const ExecutiveSection = () => {
  return (
    <section className="py-16 px-4 bg-green-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-green-800 text-center mb-12">
          Executive Secretary
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
          <div className="w-full md:w-1/3">
            <div className="rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105 duration-300">
              <img
                src="http://kwphcda.com.ng/image/ess.jpg"
                alt="Executive Secretary"
                className="w-full aspect-square object-cover"
              />
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <h3 className="text-2xl font-semibold text-green-700 mb-2">
              Prof. Nusirat Elelu
            </h3>
            <p className="text-sm text-green-600 mb-4">
              Executive Secretary, KWPHCDA
            </p>
            <div className="prose text-gray-700">
              <p className="mb-4">
                Prof. Nusirat Elelu is a distinguished scholar, a Doctor of
                Veterinary Medicine from the University of Maiduguri, who
                furthered her academic pursuit by earning a PhD from the
                prestigious University of Bristol (UK). Specializing as a field
                epidemiologist, she delves into the intricate realms of
                vector-borne pathogens, particularly those threatening public
                health in Africa.
              </p>
              <p className="mb-4">
                Under her leadership, KWPHCDA has achieved significant
                milestones in expanding access to essential health services,
                improving maternal and child health outcomes, and strengthening
                healthcare infrastructure in rural communities.
              </p>
              <p>
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
