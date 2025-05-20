import backgroundImage from "../images/sky.avif";
import cloud from "../images/cloud.png";
import airplane from "../images/airplane.png";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Poppins } from "next/font/google";
import Link from "next/link";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const SECTION_HEIGHT = 1500;

export const Hero = () => {
  return (
    <div
      className="relative w-full bg-white"
      style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
    >
      <div
        className={`absolute top-[37vh] left-[20vw] z-20 text-white ${poppins.className}`}
      >
        <h1 className="text-8xl font-bold">odyssey</h1>
        <h3 className="text-2xl pt-3 pl-5 font-semibold">
          Travel planning made easier.
        </h3>
        <div className="ml-[140px] mt-10">
          <Link
            href="/login"
            className="bg-white/10 text-white font-semibold py-2 px-4 border-2 hover:bg-transparent border-white rounded-full "
          >
            Get Started
          </Link>
        </div>
      </div>
      <div className="absolute top-[25vh] left-[35vh] z-20 w-[70px]">
        <img src={airplane.src} alt="Airplane" />
      </div>
      <CenterImage />
      <ParallaxImages />
    </div>
  );
};

export const CenterImage = () => {
  const { scrollY } = useScroll();

  const opacity = useTransform(
    scrollY,
    [SECTION_HEIGHT, SECTION_HEIGHT + 500],
    [1, 0]
  );

  const backgroundSize = useTransform(
    scrollY,
    [0, SECTION_HEIGHT + 500],
    ["100%", "170%"]
  );

  return (
    <motion.div
      className="sticky top-0 h-screen w-full"
      style={{
        opacity,
        backgroundSize,
        backgroundImage: `url(${backgroundImage.src})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    ></motion.div>
  );
};

export const ParallaxImages = () => {
  return (
    <div className="relative z-10 mx-auto max-w-5xl px-4 pt-[200px]">
      <ParallaxImg
        src={cloud.src}
        alt="Cloud"
        start={-750}
        end={-550}
        className="w-[420px]"
        positionClass="top-[1vh] left-[-350px]"
      />
      <ParallaxImg
        src={cloud.src}
        alt="Cloud"
        start={-650}
        end={100}
        className="w-[1300px]"
        positionClass="top-[100px] right-[-800px]"
      />
      <ParallaxImg
        src={cloud.src}
        alt="Cloud"
        start={-300}
        end={300}
        className="w-[1500px]"
        positionClass="top-[50px] left-[-700px]"
      />
      <ParallaxImg
        src={cloud.src}
        alt="Cloud"
        start={90}
        end={900}
        className="w-[1300px]"
        positionClass="top-[50px] right-[-600px]"
      />
    </div>
  );
};

export const ParallaxImg = ({
  className,
  alt,
  src,
  start,
  end,
  positionClass = "",
}: {
  className?: string;
  alt: string;
  src: string;
  start: number;
  end: number;
  positionClass?: string;
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [start, end]);

  return (
    <div ref={ref} className={`absolute ${positionClass} z-10`}>
      <motion.img src={src} alt={alt} className={className} style={{ y }} />
    </div>
  );
};

// FIXED HORIZONTAL SCROLL, CLOUDS ARE MESSED UP THO

// import backgroundImage from "../images/sky.avif";
// import cloud from "../images/cloud.png";
// import airplane from "../images/airplane.png";
// import { motion, useScroll, useTransform } from "framer-motion";
// import { useRef } from "react";
// import { Poppins } from "next/font/google";
// import Link from "next/link";

// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["400", "600", "700"],
// });

// const SECTION_HEIGHT = 1500;

// export const Hero = () => {
//   return (
//     <div
//       className="relative w-full bg-white"
//       style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
//     >
//       <div
//         className={`absolute top-[37vh] left-[20vw] z-20 text-white ${poppins.className}`}
//       >
//         <h1 className="text-8xl font-bold">odyssey</h1>
//         <h3 className="text-2xl pt-3 pl-5 font-semibold">
//           Travel planning made easier.
//         </h3>
//         <div className="ml-[140px] mt-10">
//           <Link
//             href="/login"
//             className="bg-white/10 text-white font-semibold py-2 px-4 border-2 hover:bg-transparent border-white rounded-full"
//           >
//             Get Started
//           </Link>
//         </div>
//       </div>

//       <div className="absolute top-[25vh] left-[35vh] z-20 w-[70px]">
//         <img src={airplane.src} alt="Airplane" />
//       </div>

//       <CenterImage />

//       {/* Parallax clouds wrapper: full-area absolute, hide horizontal overflow, allow vertical */}
//       <div className="absolute inset-0 overflow-x-hidden overflow-y-visible">
//         <ParallaxImages />
//       </div>
//     </div>
//   );
// };

// export const CenterImage = () => {
//   const { scrollY } = useScroll();

//   const opacity = useTransform(
//     scrollY,
//     [SECTION_HEIGHT, SECTION_HEIGHT + 500],
//     [1, 0]
//   );

//   const backgroundSize = useTransform(
//     scrollY,
//     [0, SECTION_HEIGHT + 500],
//     ["100%", "170%"]
//   );

//   return (
//     <motion.div
//       className="sticky top-0 h-screen w-full"
//       style={{
//         opacity,
//         backgroundSize,
//         backgroundImage: `url(${backgroundImage.src})`,
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//       }}
//     />
//   );
// };

// export const ParallaxImages = () => {
//   return (
//     <div className="relative z-10 mx-auto max-w-5xl px-4 pt-[200px]">
//       <ParallaxImg
//         src={cloud.src}
//         alt="Cloud"
//         start={-750}
//         end={-550}
//         className="w-[420px]"
//         positionClass="top-[1vh] left-[-350px]"
//       />
//       <ParallaxImg
//         src={cloud.src}
//         alt="Cloud"
//         start={-650}
//         end={100}
//         className="w-[1300px]"
//         positionClass="top-[100px] right-[-800px]"
//       />
//       <ParallaxImg
//         src={cloud.src}
//         alt="Cloud"
//         start={-300}
//         end={300}
//         className="w-[1500px]"
//         positionClass="top-[50px] left-[-700px]"
//       />
//       <ParallaxImg
//         src={cloud.src}
//         alt="Cloud"
//         start={90}
//         end={900}
//         className="w-[1300px]"
//         positionClass="top-[50px] right-[-600px]"
//       />
//     </div>
//   );
// };

// export const ParallaxImg = ({
//   className,
//   alt,
//   src,
//   start,
//   end,
//   positionClass = "",
// }: {
//   className?: string;
//   alt: string;
//   src: string;
//   start: number;
//   end: number;
//   positionClass?: string;
// }) => {
//   const ref = useRef(null);
//   const { scrollYProgress } = useScroll({
//     target: ref,
//     offset: ["start end", "end start"],
//   });

//   const y = useTransform(scrollYProgress, [0, 1], [start, end]);

//   return (
//     <div ref={ref} className={`absolute ${positionClass} z-10`}>
//       <motion.img src={src} alt={alt} className={className} style={{ y }} />
//     </div>
//   );
// };
