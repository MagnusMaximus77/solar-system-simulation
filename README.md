# 🌌 Solar System 3D Simulation

<img width="1919" height="1079" alt="Ekran görüntüsü 2025-12-07 171859" src="https://github.com/user-attachments/assets/277540fb-1165-4828-b571-8ac28dd5a540" />


## 🌍 About The Project

**[EN]**
This project is an interactive and ultra-realistic Solar System simulation developed using modern web technologies (**Three.js & WebGL**). It aims to provide both a visual feast and educational value with encyclopedic data. Beyond standard modeling, it features custom shaders, atmospheric refractions, and dynamic orbital mechanics.

**[TR]**
Bu proje, modern web teknolojileri kullanılarak geliştirilmiş, etkileşimli ve ultra gerçekçi bir Güneş Sistemi simülasyonudur. Görsel bir şölen sunmanın yanı sıra ansiklopedik bilgilerle eğitici olmayı amaçlar. Özel shader'lar ve dinamik yörünge mekanikleri içerir.

---

## 🔗 Live Demo

You can view the live project here:

👉 **Launch Simulation:**
**[https://magnusmaximus77.github.io/solar-system-simulation/](https://magnusmaximus77.github.io/solar-system-simulation/)**

---

## 🚀 Features

### 🎨 Visual & Technical Details
* **Three.js & WebGL Core:** High-performance 3D rendering engine.
* **Custom Shader Programs (GLSL):**
    * 🌞 **Sun:** Custom Vertex/Fragment shaders for dynamic surface and coronal glow.
    * 🌍 **Atmosphere:** Realistic atmospheric scattering and glow effects for Earth.
* **Post-Processing:** Cinematic glow and neon effects using `UnrealBloomPass`.
* **High-Res Textures:** Detailed planet surfaces, cloud layers, and star maps.

### 🔭 Simulation Mechanics
* **Realistic Orbital Physics:** Relative orbital speeds calculated based on distance from the Sun (including Dwarf Planets: Pluto, Ceres, Eris).
* **Scaling Modes:**
    * *Artistic Mode:* Cinematic mode for better visibility of planets.
    * *True Scale Mode:* Realistic size and distance ratios to experience the vastness of space.
* **Interactive Camera:** `OrbitControls` for free roaming and automatic planetary focus.

### 🎓 Education & UI
* **Encyclopedia Database:** Real-time data for every celestial body (Temp, Diameter, Gravity, Day Length, Fun Facts).
* **Holographic Comparison:** A hologram mode to compare the selected planet's size side-by-side with Earth.
* **HUD (Head-Up Display):** Sci-fi cockpit style interface showing coordinates and simulation time.
* **Time Control:** Options to speed up, slow down, or pause the simulation.

---

## 🛠️ Installation

To run this project locally on your machine:

1.  Clone the repository:
    ```bash
    git clone [https://github.com/MagnusMaximus77/solar-system-simulation.git](https://github.com/MagnusMaximus77/solar-system-simulation.git)
    ```
2.  Navigate to the project directory:
    ```bash
    cd solar-system-simulation
    ```
3.  Start a local server (e.g., using Python):
    ```bash
    python -m http.server
    ```
4.  Open your browser and go to: `http://localhost:8000`

---

## 🎮 Controls

| Action | Input |
| :--- | :--- |
| **Rotate** | Left Click + Drag |
| **Zoom** | Scroll Wheel |
| **Pan** | Right Click + Drag |
| **Get Info** | Left Click on Planet |
| **Focus** | Middle Click on Planet |

---

## 💻 Technologies

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat&logo=javascript)
![Three.js](https://img.shields.io/badge/Three.js-3D%20Engine-black?style=flat&logo=three.js)
![HTML5](https://img.shields.io/badge/HTML5-Structure-orange?style=flat&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-Styling-blue?style=flat&logo=css3)

---

### 👤 Author

**Barbaros Retro**
* GitHub: [@MagnusMaximus77](https://github.com/MagnusMaximus77)

---
*License: MIT*
