# Bite Sized Bible App Design System
## Apple Design Award-Worthy UI Principles

*A comprehensive guide to our premium, conversion-optimized design language*

---

## Table of Contents
1. [Philosophy](#philosophy)
2. [Typography](#typography)
3. [Layout & Spacing](#layout--spacing)
4. [Colors & Opacity](#colors--opacity)
5. [Buttons & CTAs](#buttons--ctas)
6. [Cards & Containers](#cards--containers)
7. [Icons & Visual Elements](#icons--visual-elements)
8. [Animations & Motion](#animations--motion)
9. [Responsive Design](#responsive-design)
10. [Component Patterns](#component-patterns)

---

## Philosophy

### Core Principles
- **Less is More**: Remove non-essential elements
- **Hierarchy First**: Clear visual priority through size, weight, and color
- **Consistent Spacing**: Use 8px grid system (8, 16, 20, 24, 32, 40px)
- **Performance**: Simple, efficient code with smooth animations
- **Accessibility**: Large touch targets (minimum 44px, prefer 56px)
- **Responsive**: Works perfectly on all iOS devices (SE to Pro Max)

### Apple Design Guidelines Followed
✅ **Clarity**: Information is easy to understand  
✅ **Deference**: Content is primary, UI supports it  
✅ **Depth**: Visual layers create hierarchy  
✅ **Fluid Motion**: Natural, purposeful animations  
✅ **Consistency**: Familiar patterns throughout  

---

## Typography

### Font Family
**Primary**: Google Fonts Outfit (clean, modern, readable)  
**Script**: Google Fonts Borel (for special moments like greetings)  
**Monospace**: Google Fonts Montserrat (for numbers/stats)

### Size Scale

```dart
// Headlines
headline1:  48px  weight: 700  spacing: -1.2   // Hero moments
headline2:  44px  weight: 600  spacing: -0.5   // Primary headlines
headline3:  32px  weight: 600  spacing: -0.5   // Section headers
headline4:  28px  weight: 500  spacing: -0.3   // Subsections

// Body Text
body1:      20px  weight: 500  spacing: -0.2   // Primary body
body2:      18px  weight: 400  spacing:  0.0   // Secondary body
body3:      16px  weight: 400  spacing:  0.0   // Tertiary body
body4:      15px  weight: 400  spacing:  0.0   // Small body

// Labels
label1:     17px  weight: 600  spacing: -0.2   // Button text
label2:     15px  weight: 500  spacing:  0.3   // CTA labels
label3:     14px  weight: 500  spacing:  1.5   // Eyebrow (UPPERCASE)
label4:     13px  weight: 400  spacing:  0.0   // Small labels
label5:     12px  weight: 600  spacing:  1.5   // Badges (UPPERCASE)

// Special Numbers
price:      56px  weight: 700  spacing: -2.0   // Price displays
stats:      24px  weight: 600  spacing:  0.0   // Statistics
```

### Font Weight Guidelines
- **700**: Hero elements only (prices, major headlines)
- **600**: Primary headlines, CTAs, important labels
- **500**: Subheadings, emphasized text, buttons
- **400**: Body text, descriptions, secondary info
- **300**: De-emphasized text (use with italic)

### Letter Spacing Rules
- **Large text (32px+)**: Negative spacing (-0.5 to -2.0)
- **Body text (16-20px)**: Zero or slightly negative (-0.2)
- **Small text (14px-)**: Slightly positive (0.2-0.3)
- **Uppercase labels**: Wide spacing (1.5+)

### Line Height
- **Headlines**: 1.1-1.2 (tight)
- **Body text**: 1.3-1.4 (comfortable)
- **Single line**: 1.0 (exact fit)

---

## Layout & Spacing

### Standard Padding
```dart
// Horizontal screen padding
standard:    32px  // Default for all screens
tight:       25px  // Legacy (avoid in new screens)
loose:       40px  // For extra breathing room

// Vertical spacing
xxxl:        40px  // Major section breaks
xxl:         32px  // Between major elements
xl:          28px  // Between medium elements
large:       24px  // Standard element spacing
medium:      20px  // Between related items
small:       16px  // Between card elements
xs:          12px  // Icon-to-text spacing
xxs:         8px   // Minimal spacing
```

### Layout Patterns

#### Centered Content
```dart
Column(
  mainAxisAlignment: MainAxisAlignment.center,
  children: [
    // Content naturally centered
  ],
)
```

#### SpaceBetween Pattern
```dart
Column(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  children: [
    Expanded(
      child: // Main content (centered),
    ),
    // Bottom CTA (fixed position)
  ],
)
```

#### SafeArea Usage
Always use `SafeArea` unless you need full-bleed design:
```dart
SafeArea(
  child: // Your content
)
```

### Grid System
- Base unit: **8px**
- All spacing should be multiples of 8
- Touch targets: **56px** (7 × 8px)
- Minimum touch: **44px** (5.5 × 8px)

---

## Colors & Opacity

### Theme Colors
```dart
// Primary colors (from FlutterFlowTheme)
primary:            Sunrise Gold (#FFB74D) - Brand Title & Primary Accents
secondary:          Olive Green (#6B705C) - Nature/Secondary Accents
tertiary:           Sky Blue (#5D9CEC) - Scarf & Primary Buttons
alternate:          Clay Red (#D76D5B) - Borders, Dividers, & Book Accents

primaryText:        Ink Primary (#2C2520) - Main Text
secondaryText:      Ink Secondary (#6E665E) - De-emphasized Text

primaryBackground:  Paper (#FFFFFF) - Main Page Background
secondaryBackground: Parchment (#FDFBF7) - Scroll/Card Backgrounds
```

### Opacity Levels
```dart
// Background tints
subtle:     0.08   // Card backgrounds
light:      0.1    // Hover states
medium:     0.2    // Borders, overlays
strong:     0.3    // Shadows, emphasis

// Text opacity
deemphasis: 0.75   // Secondary labels
muted:      0.8    // Subdued elements
standard:   0.9    // Normal elements (on dark)
full:       1.0    // Primary elements
```

### Gradient Patterns
```dart
// Button gradient (subtle)
LinearGradient(
  colors: [
    baseColor,
    baseColor.withValues(alpha: 0.9),
  ],
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
)

// Overlay gradient (dramatic)
LinearGradient(
  colors: [
    Colors.transparent,
    color.withValues(alpha: 0.3),
    color.withValues(alpha: 0.8),
    color,
  ],
  stops: [0.0, 0.5, 0.8, 1.0],
)
```

---

## Buttons & CTAs

### Primary Button (Full Width)
```dart
Container(
  height: 56.0,
  decoration: BoxDecoration(
    gradient: LinearGradient(
      colors: [
        FlutterFlowTheme.of(context).tertiary,
        FlutterFlowTheme.of(context).tertiary.withValues(alpha: 0.9),
      ],
    ),
    borderRadius: BorderRadius.circular(14.0),
    boxShadow: [
      BoxShadow(
        color: FlutterFlowTheme.of(context).tertiary.withValues(alpha: 0.3),
        blurRadius: 16.0,
        offset: Offset(0, 8),
      ),
    ],
  ),
  child: Center(
    child: Text(
      'Continue',
      style: GoogleFonts.outfit(
        color: Colors.white,
        fontSize: 17.0,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.2,
      ),
    ),
  ),
)
```

### Secondary Button (Outlined)
```dart
Container(
  height: 56.0,
  decoration: BoxDecoration(
    color: FlutterFlowTheme.of(context).secondaryBackground,
    borderRadius: BorderRadius.circular(14.0),
    border: Border.all(
      color: FlutterFlowTheme.of(context).alternate,
      width: 1.5,
    ),
  ),
  child: // Text or Icon
)
```

### Icon Button (Square)
```dart
Container(
  width: 56.0,
  height: 56.0,
  decoration: BoxDecoration(
    color: secondaryBackground,
    borderRadius: BorderRadius.circular(14.0),
    border: Border.all(
      color: alternate,
      width: 1.5,
    ),
  ),
  child: Icon(
    Icons.arrow_back_ios_new_rounded,
    size: 20.0,
  ),
)
```

### Button Layout Pattern
```dart
Row(
  children: [
    // Back button (56px square)
    SizedBox(width: 16.0),
    // Primary button (Expanded)
  ],
)
```

### Border Radius Standards
- **Buttons**: 14px (modern, comfortable)
- **Cards**: 12-16px (depending on size)
- **Pills/Badges**: 20px (fully rounded sides)
- **Small elements**: 8-10px

---

## Cards & Containers

### Standard Card
```dart
Container(
  padding: EdgeInsets.all(16.0),
  decoration: BoxDecoration(
    color: FlutterFlowTheme.of(context).primaryBackground,
    borderRadius: BorderRadius.circular(16.0),
    border: Border.all(
      color: FlutterFlowTheme.of(context).alternate,
      width: 1.0,
    ),
  ),
  child: // Content
)
```

### Highlighted Card (with tint)
```dart
Container(
  padding: EdgeInsets.symmetric(
    horizontal: 24.0,
    vertical: 20.0,
  ),
  decoration: BoxDecoration(
    color: color.withValues(alpha: 0.08),
    borderRadius: BorderRadius.circular(12.0),
    border: Border.all(
      color: color.withValues(alpha: 0.2),
      width: 1.0,
    ),
  ),
  child: // Content
)
```

### Premium Card (gradient + shadow)
```dart
Container(
  padding: EdgeInsets.symmetric(
    horizontal: 32.0,
    vertical: 20.0,
  ),
  decoration: BoxDecoration(
    gradient: LinearGradient(
      colors: [
        FlutterFlowTheme.of(context).tertiary,
        FlutterFlowTheme.of(context).tertiary.withValues(alpha: 0.8),
      ],
    ),
    borderRadius: BorderRadius.circular(20.0),
    boxShadow: [
      BoxShadow(
        color: FlutterFlowTheme.of(context).tertiary.withValues(alpha: 0.3),
        blurRadius: 20.0,
        offset: Offset(0, 10),
      ),
    ],
  ),
  child: // Content (usually white text)
)
```

### Shadow Standards
```dart
// Subtle elevation
BoxShadow(
  color: Colors.black.withValues(alpha: 0.1),
  blurRadius: 8.0,
  offset: Offset(0, 4),
)

// Medium elevation
BoxShadow(
  color: Colors.black.withValues(alpha: 0.15),
  blurRadius: 16.0,
  offset: Offset(0, 8),
)

// Dramatic elevation
BoxShadow(
  color: Colors.black.withValues(alpha: 0.2),
  blurRadius: 24.0,
  offset: Offset(0, 12),
)

// Colored glow (for brand elements)
BoxShadow(
  color: brandColor.withValues(alpha: 0.3),
  blurRadius: 16-24.0,
  offset: Offset(0, 8-12),
)
```

---

## Icons & Visual Elements

### Icon Sizes
```dart
hero:       28-32px  // Main CTAs, focal points
large:      24px     // Feature icons, card headers
standard:   20px     // Button icons, list items
small:      16-18px  // Inline icons, chevrons
```

### Icon + Text Pattern
```dart
Row(
  children: [
    Icon(
      Icons.icon_name,
      size: 24.0,
      color: color,
    ),
    SizedBox(width: 12.0),  // Standard icon-text spacing
    Expanded(
      child: Text(/* ... */),
    ),
  ],
)
```

### Badge/Pill Component
```dart
Container(
  padding: EdgeInsets.symmetric(
    horizontal: 16.0,
    vertical: 8.0,
  ),
  decoration: BoxDecoration(
    color: color.withValues(alpha: 0.1),
    borderRadius: BorderRadius.circular(20.0),
  ),
  child: Text(
    'LABEL',
    style: GoogleFonts.outfit(
      color: color,
      fontSize: 12.0,
      fontWeight: FontWeight.w600,
      letterSpacing: 1.5,
    ),
  ),
)
```

### Progress Dots
```dart
Row(
  mainAxisAlignment: MainAxisAlignment.center,
  children: List.generate(
    totalSteps,
    (index) => Container(
      width: 8.0,
      height: 8.0,
      margin: EdgeInsets.symmetric(horizontal: 4.0),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: index <= currentStep
            ? activeColor
            : inactiveColor,
      ),
    ),
  ),
)
```

---

## Animations & Motion

### Standard Timing
```dart
fast:     200-300ms   // Micro-interactions
standard: 400-600ms   // Standard transitions
slow:     800-1000ms  // Dramatic reveals
```

### Curves
```dart
// Preferred curves
Curves.easeOut       // Most common (natural deceleration)
Curves.easeInOut     // Smooth both ways
Curves.easeIn        // Acceleration (use sparingly)

// Avoid
Curves.linear        // Too mechanical
```

### Fade Animation
```dart
AnimatedOpacity(
  opacity: isVisible ? 1.0 : 0.0,
  duration: Duration(milliseconds: 400),
  curve: Curves.easeOut,
  child: // Content
)
```

### Slide Animation
```dart
AnimatedSlide(
  offset: isVisible ? Offset.zero : Offset(0, 0.1),
  duration: Duration(milliseconds: 400),
  curve: Curves.easeOut,
  child: // Content
)
```

### Combined Animation (Fade + Slide)
```dart
AnimatedOpacity(
  opacity: isVisible ? 1.0 : 0.0,
  duration: Duration(milliseconds: 400),
  curve: Curves.easeOut,
  child: AnimatedSlide(
    offset: isVisible ? Offset.zero : Offset(0, 0.1),
    duration: Duration(milliseconds: 400),
    curve: Curves.easeOut,
    child: // Content
  ),
)
```

### Haptic Feedback
```dart
// Preferred
HapticFeedback.mediumImpact();  // Standard interactions

// Use sparingly
HapticFeedback.lightImpact();   // Subtle feedback
HapticFeedback.heavyImpact();   // Major actions only

// Avoid
HapticFeedback.vibrate();       // Too aggressive
```

---

## Responsive Design

### Breakpoints (if needed)
```dart
// Generally avoid breakpoints, design should work everywhere
small:   < 375px   // iPhone SE
medium:  375-428px // iPhone standard
large:   > 428px   // iPhone Plus/Pro Max
```

### Responsive Patterns

#### Use Constraints, Not Fixed Sizes
```dart
// Bad
Container(width: 400.0, height: 300.0)

// Good
Container(
  constraints: BoxConstraints(
    maxWidth: 400.0,
    maxHeight: 300.0,
  ),
)
```

#### Percentage-Based Heights (Sparingly)
```dart
// Only for specific elements like carousels
height: MediaQuery.sizeOf(context).height * 0.35
```

#### Expanded for Dynamic Sizing
```dart
Expanded(
  child: // Takes available space
)
```

#### AutoSizeText for Headlines
```dart
AutoSizeText(
  'Long headline that might wrap',
  style: TextStyle(fontSize: 44.0),
  maxLines: 2,
  minFontSize: 28.0,  // Graceful degradation
)
```

---

## Component Patterns

### CTA Section (Bottom)
```dart
Padding(
  padding: EdgeInsets.only(bottom: 40.0),
  child: Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(
        Icons.touch_app_rounded,
        color: secondaryText,
        size: 28.0,
      ),
      SizedBox(height: 8.0),
      Text(
        'Tap to continue',
        style: GoogleFonts.outfit(
          color: secondaryText,
          fontSize: 15.0,
          fontWeight: FontWeight.w500,
          letterSpacing: 0.3,
        ),
      ),
    ],
  ),
)
```

### Section Header
```dart
Column(
  children: [
    // Eyebrow
    Text(
      'SECTION NAME',
      style: GoogleFonts.outfit(
        color: secondaryText,
        fontSize: 14.0,
        fontWeight: FontWeight.w500,
        letterSpacing: 1.5,
      ),
    ),
    SizedBox(height: 16.0),
    // Headline
    Text(
      'Main Headline',
      style: GoogleFonts.outfit(
        color: primary,
        fontSize: 32.0,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.5,
      ),
    ),
  ],
)
```

### Stats Display
```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.center,
  children: [
    // Number
    Text(
      '24',
      style: GoogleFonts.montserrat(
        fontSize: 24.0,
        fontWeight: FontWeight.w600,
      ),
    ),
    SizedBox(height: 2.0),
    // Label
    Text(
      'Times Meshed',
      style: GoogleFonts.outfit(
        color: secondaryText,
        fontSize: 13.0,
        fontWeight: FontWeight.w400,
      ),
    ),
  ],
)
```

### Image Carousel
```dart
CarouselSlider(
  options: CarouselOptions(
    viewportFraction: 0.75,
    enlargeCenterPage: true,
    enlargeFactor: 0.15,
    autoPlay: true,
    autoPlayInterval: Duration(milliseconds: 3500),
    autoPlayAnimationDuration: Duration(milliseconds: 800),
    autoPlayCurve: Curves.easeInOut,
  ),
  items: items.map((item) => 
    ClipRRect(
      borderRadius: BorderRadius.circular(16.0),
      child: // Image with shadow
    ),
  ).toList(),
)
```

---

## Visual Hierarchy Rules

### Size Hierarchy
```
1. Hero element (48-56px)
2. Primary headline (32-44px)
3. Secondary headline (24-28px)
4. Body text (16-20px)
5. Labels/captions (13-15px)
6. Fine print (12px)
```

### Weight Hierarchy
```
1. Hero/CTA (700)
2. Headlines (600)
3. Emphasized text (500)
4. Body text (400)
5. De-emphasized (300)
```

### Color Hierarchy
```
1. Brand color (primary) - Brand Title & Main Accents (Gold)
2. Action color (tertiary) - Buttons & Primary CTAs (Blue)
3. Primary text - Main content (Ink)
4. Secondary text - Supporting info (Muted Ink)
5. Accent colors (secondary/alternate) - Nature & Detail Accents
```

### Spacing Hierarchy
```
Major sections:    40px
Section elements:  24-32px
Related items:     16-20px
Tight groups:      8-12px
```

---

## Conversion Optimization

### Key Principles
1. **Single Primary Action**: One clear CTA per screen
2. **Progressive Disclosure**: Reveal info step-by-step
3. **Visual Proof**: Show real people/results
4. **Reduce Anxiety**: "Change later", "No strings"
5. **Clear Value**: State benefit upfront
6. **Trust Signals**: Professional design = credibility

### CTA Best Practices
- Always at bottom (thumb-friendly)
- High contrast (gradient + shadow)
- Action-oriented text ("Continue", not "Next")
- Minimum 56px height
- Full or near-full width
- Clear tap affordance

### Form Best Practices
- Large touch targets
- Clear labels above inputs
- Inline validation
- Progress indicators
- Save progress automatically
- Minimize required fields

---

## Accessibility

### Touch Targets
- Minimum: 44px × 44px
- Recommended: 56px × 56px
- For text buttons: adequate padding

### Color Contrast
- Text on background: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Use color + icon/text (not color alone)

### Text Scaling
- Support system text scaling
- Use AutoSizeText for headlines
- Test with largest system font

### Motion
- Respect `prefers-reduced-motion`
- Keep animations < 1 second
- Provide static alternatives

---

## Common Mistakes to Avoid

❌ **Don't**:
- Use percentage-based container heights everywhere
- Mix inconsistent spacing (stick to 8px grid)
- Use heavy haptic feedback frequently
- Create buttons smaller than 44px
- Use more than 2-3 font weights per screen
- Overcomplicate with too many animations
- Ignore SafeArea
- Use linear animations (too robotic)
- Create fixed-width designs
- Nest too many containers

✅ **Do**:
- Use Expanded for flexible layouts
- Maintain consistent 32px padding
- Use medium haptic for most interactions
- Make buttons 56px for comfort
- Limit fonts: 600 for headers, 400-500 for body
- Animate purposefully (fade + slide)
- Always wrap in SafeArea
- Use easeOut/easeInOut curves
- Design for all screen sizes
- Keep widget tree shallow

---

## Quick Reference Checklist

### Before Shipping Any Screen
- [ ] Uses SafeArea
- [ ] 32px horizontal padding
- [ ] Typography follows size scale
- [ ] All spacing on 8px grid
- [ ] Touch targets ≥ 56px
- [ ] One clear primary CTA
- [ ] Animations use easeOut curve
- [ ] Works on iPhone SE
- [ ] Works on iPhone Pro Max
- [ ] Medium haptic feedback
- [ ] No linter warnings
- [ ] Follows visual hierarchy
- [ ] Text is scannable (not walls of text)
- [ ] Colors have proper contrast
- [ ] Loading states handled
- [ ] Error states handled

---

## Examples by Screen Type

### Onboarding/Welcome
- Full-screen video/image
- Minimal text (1 headline + 1 subhead)
- Single CTA at bottom
- Optional progress dots
- Swipe gesture support

### Form/Input
- Large input fields
- Labels above fields
- Inline validation
- Progress indicator
- Save & exit option
- Submit button at bottom

### Content/Feed
- Pull-to-refresh
- Infinite scroll or pagination
- Empty states with action
- Loading skeletons
- Error retry options

### Profile/Stats
- Visual hierarchy (name largest)
- Stats in grid or row
- CTAs clearly separated
- Edit affordance clear
- Avatar prominent

---

## Maintenance

### When to Update This Document
- New component patterns emerge
- Accessibility guidelines change
- Platform updates (new iOS design language)
- User testing reveals improvements
- New conversion insights

### Version History
- v1.0 - Initial design system (November 2024)

---

**Remember**: Great design is invisible. Users should feel delighted without knowing why. 🎨✨

