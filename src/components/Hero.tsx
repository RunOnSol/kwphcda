import React, { useEffect, useState } from "react";

// Slide data
const slides = [
  {
    id: 1,
    title: "Immunization Saves Lives",
    description:
      "Protecting our children through comprehensive vaccination programs across Kwara State.",
    imageUrl: "http://kwphcda.com.ng/image/2.jpg",
  },
  {
    id: 2,
    title: "Vaccine Awareness",
    description:
      "Educating communities about the importance of vaccines in preventing diseases.",
    imageUrl: "http://kwphcda.com.ng/image/1.jpg",
  },
  {
    id: 3,
    title: "Maternal Health Services",
    description:
      "Ensuring the health and wellbeing of mothers across all communities in Kwara State.",
    imageUrl: "http://kwphcda.com.ng/image/post1.jpg",
  },
  {
    id: 4,
    title: "Child Health Programs",
    description:
      "Comprehensive healthcare solutions for children from birth through adolescence.",
    imageUrl:
      "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg",
  },
  {
    id: 5,
    title: "Community Health Workers",
    description:
      "Our dedicated professionals bringing healthcare to every doorstep.",
    imageUrl:
      "https://images.pexels.com/photos/5214953/pexels-photo-5214953.jpeg",
  },
  {
    id: 6,
    title: "Disease Prevention",
    description:
      "Proactive measures to prevent communicable and non-communicable diseases.",
    imageUrl:
      "https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg",
  },
  {
    id: 7,
    title: "Healthcare For All",
    description:
      "Making primary healthcare accessible to all residents of Kwara State.",
    imageUrl:
      "https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg",
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
          style={{
            zIndex: index === currentSlide ? 10 : 0,
          }}
        >
          <div className="absolute inset-0 bg-black/50 z-10" />
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="text-center text-white max-w-3xl px-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {slide.title}
              </h2>
              <p className="text-xl md:text-2xl">{slide.description}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-6" : "bg-white/50"
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
