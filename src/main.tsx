import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SlowMo } from "gsap/EasePack";
    
import { Draggable } from "gsap/Draggable";
import { MotionPathHelper } from "gsap/MotionPathHelper";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother"; // ScrollSmoother requires ScrollTrigger
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(useGSAP, Draggable, MotionPathHelper, MotionPathPlugin, ScrollTrigger, ScrollSmoother, ScrollToPlugin, TextPlugin, SlowMo);

createRoot(document.getElementById("root")!).render(<App />);