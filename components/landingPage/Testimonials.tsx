import React, { useState, useEffect } from "react";

const testimonials = [
  {
    id: 2,
    name: "Angelina Rose",
    role: "Traveller",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    text: "From start to finish, everything was perfect. The booking process was easy, the locations were stunning. Would highly recommend to anyone.",
  },
  {
    id: 3,
    name: "John Smith",
    role: "Traveller",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    text: "An absolutely incredible experience! The attention to detail and professionalism exceeded all expectations. Would highly recommend to anyone.",
  },
  {
    id: 4,
    name: "Sarah Johnson",
    role: "Traveller",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    text: "The trip was amazing from beginning to end. Every detail was perfectly planned and executed. Truly a memorable adventure!. Would highly recommend to anyone.",
  },
  {
    id: 5,
    name: "Michael Chen",
    role: "Traveller",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    text: "Outstanding service and breathtaking locations. The guides were exceptional and made the entire experience even more special. Would highly recommend to anyone.",
  },
  {
    id: 6,
    name: "Emma Wilson",
    role: "Traveller",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    text: "Everything was seamless and beautiful. The team went above and beyond to ensure we had the best possible experience. Highly recommended!",
  },
];

const Star = ({ filled }: any) => (
  <svg
    className={`w-5 h-5 ${filled ? "text-[#FDB913]" : "text-gray-300"}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const TestimonialCard = ({ testimonial, isCenter }: any) => (
  <div
    className={`bg-white rounded-3xl p-5 md:p-4 lg:p-8 shadow-lg transition-all duration-300 ${
      isCenter ? "scale-100" : "scale-85 md:scale-90"
    }`}
  >
    <div className="flex items-start justify-between mb-4 md:mb-2 lg:mb-6">
      <div className="flex items-center gap-2 md:gap-2 lg:gap-6">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-10 md:w-10 lg:w-14 h-10 md:h-10 lg:h-14 rounded-full object-cover"
        />
        <div>
          <h3 className="text-[#113D48] font-semibold text-sm md:text-sm lg:text-lg">
            {testimonial.name}
          </h3>
          <p className="text-gray-500 text-xs md:text-xs lg:text-sm">
            {testimonial.role}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 md:gap-2">
        <div className="flex gap-0 md:gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} filled={star <= testimonial.rating} />
          ))}
        </div>
        <span className="text-gray-700 font-medium ml-1">
          {testimonial.rating}
        </span>
      </div>
    </div>
    <p className="text-gray-600 leading-tight md:leading-relaxed text-sm md:text-sm lg:text-base pb-4 md:pb-4 lg:pb-0">
      {testimonial.text}
    </p>
    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-serif">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M9.8667 7.89292C9.8667 9.75343 9.8667 10.6836 9.28876 11.2616C8.71075 11.8396 7.78049 11.8396 5.92005 11.8396C4.05957 11.8396 3.12934 11.8396 2.55137 11.2616C1.97339 10.6836 1.97339 9.75343 1.97339 7.89292C1.97339 6.03247 1.97339 5.10224 2.55137 4.52427C3.12934 3.94629 4.05957 3.94629 5.92005 3.94629C7.78049 3.94629 8.71075 3.94629 9.28876 4.52427C9.8667 5.10224 9.8667 6.03247 9.8667 7.89292Z"
          stroke="white"
          strokeWidth="1.11"
        />
        <path
          d="M9.86675 6.90625V11.3286C9.86675 15.2482 7.38461 18.5723 3.94678 19.7329"
          stroke="white"
          strokeWidth="1.11"
          strokeLinecap="round"
        />
        <path
          d="M21.7068 7.89292C21.7068 9.75343 21.7068 10.6836 21.1288 11.2616C20.5508 11.8396 19.6206 11.8396 17.7601 11.8396C15.8997 11.8396 14.9694 11.8396 14.3914 11.2616C13.8135 10.6836 13.8135 9.75343 13.8135 7.89292C13.8135 6.03247 13.8135 5.10224 14.3914 4.52427C14.9694 3.94629 15.8997 3.94629 17.7601 3.94629C19.6206 3.94629 20.5508 3.94629 21.1288 4.52427C21.7068 5.10224 21.7068 6.03247 21.7068 7.89292Z"
          stroke="white"
          strokeWidth="1.11"
        />
        <path
          d="M21.7066 6.90625V11.3286C21.7066 15.2482 19.2245 18.5723 15.7866 19.7329"
          stroke="white"
          strokeWidth="1.11"
          strokeLinecap="round"
        />
      </svg>
    </div>
  </div>
);

export default function TravelersTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials?.length);
  };
  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials?.length) % testimonials?.length
    );
  };

  const goToSlide = (index: any) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentIndex]);

  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = -1; i <= 1; i++) {
      const index =
        (currentIndex + i + testimonials?.length) % testimonials?.length;
      visible.push({
        testimonial: testimonials[index],
        isCenter: i === 0,
        offset: i,
      });
    }
    return visible;
  };

  return (
    <div className="relative w-full h-fit overflow-hidden">
      <div className="relative z-10 w-full">
        {/* Carousel Container */}
        <div
          className="relative py-2"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 md:left-4 bottom-0 md:top-1/3 md:-translate-y-3 z-30 bg-white/90 h-fit hover:bg-white p-1.5 md:p-3 rounded-full shadow-lg transition-all duration-300"
            aria-label="Previous testimonial"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 md:h-6 w-4 md:w-6 text-[#113D48]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 md:right-4 bottom-0 md:top-1/3 md:-translate-y-3 z-30 bg-white/90 h-fit hover:bg-white p-1.5 md:p-3 rounded-full shadow-lg transition-all duration-300"
            aria-label="Next testimonial"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 md:h-6 w-4 md:w-6 text-[#113D48]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Desktop View - 3 Cards */}
          <div className="w-full hidden md:block overflow-hidden py-8 h-fit">
            <div className="w-[100%] flex justify-center items-center h-fit">
              <div className="grid grid-cols-3 gap-0 w-[120%] items-center -mt-4 -mx-[8%]">
                {getVisibleTestimonials().map(
                  ({ testimonial, isCenter, offset }) => (
                    <div
                      key={testimonial.id}
                      className={`relative transition-all duration-500 col-span-1 ${
                        offset === 0 ? "z-20" : "z-10"
                      }`}
                    >
                      <TestimonialCard
                        testimonial={testimonial}
                        isCenter={isCenter}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet View - 1 Card */}
          <div className="md:hidden max-w-xl mx-auto">
            <div className="relative">
              <TestimonialCard
                testimonial={testimonials[currentIndex]}
                isCenter={true}
              />
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-6 mt-22">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "w-3 h-3 bg-white ring-[1px] ring-primary"
                    : "w-3 h-3 bg-white/50 ring-[1px] ring-white"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
