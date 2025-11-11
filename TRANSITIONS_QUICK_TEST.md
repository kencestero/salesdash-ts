# 🎬 MOTION.DEV TRANSITIONS - QUICK REFERENCE

## 🚀 **FOR KENNETH TO TEST LATER**

### Installation Check:
```bash
# You already have framer-motion installed!
# But if needed:
pnpm add framer-motion
```

### Test Page Location:
Create this file: `app/test-transitions/page.tsx`

---

## 📝 **COPY-PASTE TRANSITION STYLES**

### 1. SIMPLE FADE (Fastest)
```tsx
const variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1 },
  exit: { opacity: 0 }
}
```

### 2. SLIDE FROM SIDE
```tsx
const variants = {
  initial: { x: -100, opacity: 0 },
  enter: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 }
}
```

### 3. SCALE UP
```tsx
const variants = {
  initial: { scale: 0.8, opacity: 0 },
  enter: { scale: 1, opacity: 1 },
  exit: { scale: 1.2, opacity: 0 }
}
```

### 4. ROTATE 3D
```tsx
const variants = {
  initial: { rotateY: -90, opacity: 0 },
  enter: { rotateY: 0, opacity: 1 },
  exit: { rotateY: 90, opacity: 0 }
}
```

### 5. SLIDE UP (Mobile style)
```tsx
const variants = {
  initial: { y: "100%" },
  enter: { y: 0 },
  exit: { y: "100%" }
}
```

---

## 🎯 **HOW TO USE**

### Wrap any page:
```tsx
import { motion } from 'framer-motion';

// Pick a variant from above
const variants = {
  initial: { opacity: 0, x: -20 },
  enter: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export default function YourPage() {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {/* Your page content */}
    </motion.div>
  );
}
```

---

## ⚡ **TIMING CONTROLS**

### Make it faster/slower:
```tsx
transition: {
  duration: 0.3,  // Change this (in seconds)
}
```

### Make it bouncy:
```tsx
transition: {
  type: "spring",
  stiffness: 100,  // Lower = bouncier
  damping: 10      // Lower = more bounce
}
```

### Add delay:
```tsx
transition: {
  delay: 0.2  // Wait before starting
}
```

---

## 🔥 **MJ CARGO RECOMMENDATIONS**

### For Login Page:
Use **Scale + Rotate** - Makes a strong first impression

### For Customer List:
Use **Fade + Slide** - Professional and smooth

### For Modals/Popups:
Use **Slide Up** - Familiar mobile pattern

### For Cards:
Use **Scale** on hover - Subtle feedback

---

## 🧪 **EXPERIMENT MODE**

Want to try them all? Here's a playground:

```tsx
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';

const allTransitions = {
  fade: { initial: { opacity: 0 }, enter: { opacity: 1 }},
  slideLeft: { initial: { x: -100 }, enter: { x: 0 }},
  slideRight: { initial: { x: 100 }, enter: { x: 0 }},
  slideUp: { initial: { y: 100 }, enter: { y: 0 }},
  scale: { initial: { scale: 0 }, enter: { scale: 1 }},
  rotate: { initial: { rotate: -180 }, enter: { rotate: 0 }}
};

export default function TestPage() {
  const [style, setStyle] = useState('fade');
  
  return (
    <div>
      {/* Buttons to switch */}
      {Object.keys(allTransitions).map(name => (
        <button 
          key={name}
          onClick={() => setStyle(name)}
          className="m-2 p-2 bg-orange-500 text-white rounded"
        >
          {name}
        </button>
      ))}
      
      {/* Animated content */}
      <motion.div
        key={style}  // This makes it re-animate
        variants={allTransitions[style]}
        initial="initial"
        animate="enter"
        className="p-8 bg-gray-800 text-white rounded m-4"
      >
        <h1>Testing: {style}</h1>
        <p>This is how {style} looks!</p>
      </motion.div>
    </div>
  );
}
```

---

## 🎮 **KEYBOARD SHORTCUTS TO TRY**

Add this for quick testing:
```tsx
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.key === '1') setTransition('fade');
    if (e.key === '2') setTransition('slide');
    if (e.key === '3') setTransition('scale');
    if (e.key === '4') setTransition('rotate');
  };
  window.addEventListener('keypress', handleKeyPress);
  return () => window.removeEventListener('keypress', handleKeyPress);
}, []);
```

Press 1-4 to switch transitions instantly!

---

## 📁 **FILES FOR REFERENCE**

1. **Full Guide**: `TRANSITIONS_COMPLETE_PLAYGROUND.md`
2. **Component**: `components/transitions/page-transition.tsx`
3. **Setup**: `PAGE_TRANSITIONS_SETUP.md`
4. **This File**: Quick reference for testing

---

¡Listo hermano! Everything you need to play with transitions! 🚀