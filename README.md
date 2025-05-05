# field_of_grass

repo for building a realistic and optimised field of grass

looked up different approaches and pasted PoC code. Need to pick this up later to compare different approaches and formulate my own take on this problem statement.

## Objective:

The goal of this assignment is to develop a realistic and optimized field of grass using a
WebGL-based 3D graphics rendering library. This task aims to assess your skills in visual
fidelity, performance optimization, and physics simulation within a real-time rendering
environment.

## Technical Requirements:

1. Base Requirements:

   Your implementation should include:

   - Field Dimensions: 100m x 100m to simulate a realistic grass field.
   - Wind Physics Integration: Dynamic wind effects with configurable intensity ranging from 0 to 10 m/s.
   - Browser Compatibility: Ensure functionality on Chrome 120+ and Firefox 120+.
   - Target Resolution: 1920x1080 to meet standard display expectations.

2. Performance Achievement Tiers (50%)

   Grass Density & Performance: Your solution should be able to render and maintain smooth performance at different levels of complexity. The performance tiers are as follows:

   - Base Level (70%): Render at least 100,000+ grass blades while maintaining a stable 60 FPS.
   - Achievement Tiers (+30% Maximum Bonus):
     - +10%: 150,000+ blades at 60 FPS.
     - +10%: 250,000+ blades at 60 FPS.
     - +10%: 500,000+ blades at 60 FPS.

   Testing Conditions:

   - 60-second continuous camera movement test to evaluate rendering efficiency.
   - Active wind simulation applied to the entire field.
   - FPS stability requirement: Maximum fluctuation within 10% variation.
   - No frame drops below 50 FPS during testing.

3. Visual Quality (50%)
   Grass Realism: The visual representation of the grass field should be lifelike and dynamic, incorporating:
   - Natural blade height variation to simulate realistic terrain.
   - Wind response physics to ensure blades react naturally to environmental forces.
   - Color variation and lighting interaction to enhance visual depth and authenticity.

## Submission Requirements:

Your final submission must include the following deliverables:

- Live Demo URL demonstrating the working application
- GitHub Repository with well-documented codebase.
- Performance Metrics Report detailing:
  - Achieved blade count at stable FPS.
  - FPS statistics during testing.
  - Memory usage and resource allocation.
  - Optimization techniques used for performance enhancements.
- Setup and Run Instructions to ensure ease of evaluation.
