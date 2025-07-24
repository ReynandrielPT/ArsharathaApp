import { Variants, Transition } from "framer-motion";

export const pageVariants: Variants = {
  logininitial: {
    opacity: 0,
    y: "-100vw",
    scale: 0.8,
  },
  loginin: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  loginout: {
    opacity: 0,
    y: "100vw",
    scale: 1.2,
  },

  registinit: {
    opacity: 0,
    x: "-100vw",
    scale: 0.8,
  },
  registin: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  registout: {
    opacity: 0,
    x: "100vw",
    scale: 1.2,
  },
  appinit: {
    opacity: 0,
    x: 0,
    scale: 1,
  },
  appin: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  appout: {
    opacity: 0,
    x: 0,
    scale: 1,
  },
};

export const pageTransition: Transition = {
  type: "tween",
  ease: "anticipate",
  duration: 1,
};
