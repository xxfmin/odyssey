// components/ui/cards-carousel.tsx
import React, { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ---------------------------------------------
// Interfaces
// ---------------------------------------------
export interface CardData {
  title: string;
  category: string;
  gradient: string;
}

export interface CarouselProps {
  items: ReactNode[];
  initialScroll?: number;
}

// ---------------------------------------------
// Carousel Component
// ---------------------------------------------
export const Carousel: React.FC<CarouselProps> = ({
  items,
  initialScroll = 0,
}) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  React.useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScroll();
    }
  }, [initialScroll]);

  const checkScroll = () => {
    const el = carouselRef.current!;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth);
  };

  const scrollBy = (delta: number) => {
    carouselRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="relative w-full">
      {canScrollLeft && (
        <button
          onClick={() => scrollBy(-300)}
          className="absolute left-0 top-1/2 z-10 transform -translate-y-1/2 p-2 bg-white rounded-full shadow"
        >
          ‹
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scrollBy(300)}
          className="absolute right-0 top-1/2 z-10 transform -translate-y-1/2 p-2 bg-white rounded-full shadow"
        >
          ›
        </button>
      )}
      <div
        ref={carouselRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto hide-scrollbar scroll-smooth space-x-4 px-4"
      >
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            {item}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------
// Card Component
// ---------------------------------------------
interface CardProps {
  card: CardData;
  href: string;
  layout?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, href, layout = false }) => {
  const router = useRouter();

  return (
    <motion.div
      layoutId={layout ? `card-${card.title}` : undefined}
      onClick={() => router.push(href)}
      className={cn(
        "relative z-10 flex h-80 w-80 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl text-white",
        card.gradient
      )}
    >
      {/* Title */}
      <motion.p
        layoutId={layout ? `title-${card.title}` : undefined}
        className="text-xl font-semibold md:text-3xl"
      >
        {card.title}
      </motion.p>

      {/* Category (now showing dates) */}
      <motion.p
        layoutId={layout ? `category-${card.category}` : undefined}
        className="mt-1 text-sm font-medium md:text-base"
      >
        {card.category}
      </motion.p>
    </motion.div>
  );
};
