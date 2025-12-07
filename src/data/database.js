
// ==========================================
// SHADER DEFINITIONS
// ==========================================
export const sunVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const sunFragmentShader = `
uniform sampler2D globeTexture;
uniform float time;
varying vec2 vUv;
varying vec3 vNormal;
void main() {
    vec4 texColor = texture2D(globeTexture, vUv);
    float intensity = 1.05 - dot(vNormal, vec3(0.0, 0.0, 1.0));
    vec3 glow = vec3(1.0, 0.5, 0.0) * pow(intensity, 3.0);
    gl_FragColor = vec4(texColor.rgb * 1.2 + glow * (0.8 + 0.2*sin(time)), 1.0);
}
`;

export const atmosphereVertexShader = `
varying vec3 vNormal;
void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.05);
}
`;

export const atmosphereFragmentShader = `
varying vec3 vNormal;
void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
    gl_FragColor = vec4(0.2, 0.5, 1.0, 1.0) * intensity;
}
`;

export const starVertexShader = `
uniform float time;
attribute float size;
varying float vOpacity;
void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    // Subtle twinkle effect (0.92 base + 0.08 variation)
    vOpacity = 0.92 + 0.08 * sin(time * 0.8 + position.x * 0.005);
}
`;

export const starFragmentShader = `
uniform vec3 color;
varying float vOpacity;
void main() {
    if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
    gl_FragColor = vec4(color, vOpacity);
}
`;

// ==========================================
// 1. EDUCATIONAL DATABASE (ENCYCLOPEDIA LEVEL)
// ==========================================
export const planetInfo = {
    "SUN": {
        type: "Star (G-Type Main Sequence)",
        temp: "5,500°C (Surface) / 15M°C (Core)",
        diameter: "1.39 Million km (109 × Earth)",
        day: "27 Earth Days (Equator)",
        year: "230 Million Years (Galactic Orbit)",
        gravity: "274 m/s²",
        atmosphere: "74% Hydrogen, 24% Helium",
        escapeVelocity: "617.7 km/s",
        discoveryDate: "Prehistoric",
        moons: 0,
        life: "Impossible",
        funFact: "The Sun is so massive that it contains 99.86% of the total mass of the entire Solar System.",
        desc: "The energy source of our system. Through nuclear fusion in its core, it converts 600 million tons of hydrogen into helium every second."
    },
    "Mercury": {
        type: "Terrestrial Planet",
        temp: "430°C (Day) / -180°C (Night)",
        diameter: "4,880 km",
        day: "59 Earth Days",
        year: "88 Earth Days",
        gravity: "3.7 m/s²",
        atmosphere: "None (Very thin Exosphere)",
        escapeVelocity: "4.3 km/s",
        discoveryDate: "Prehistoric",
        moons: 0,
        life: "Unlikely",
        funFact: "A year on Mercury is shorter than a single day on Mercury.",
        desc: "The closest planet to the Sun and the smallest in the system. Without an atmosphere, the temperature difference between day and night is extreme."
    },
    "Venus": {
        type: "Terrestrial Planet",
        temp: "464°C (Can melt lead)",
        diameter: "12,104 km",
        day: "243 Earth Days (Retrograde)",
        year: "225 Earth Days",
        gravity: "8.87 m/s²",
        atmosphere: "96% Carbon Dioxide (Very Dense)",
        escapeVelocity: "10.4 km/s",
        discoveryDate: "Prehistoric",
        moons: 0,
        life: "Difficult (Possible microbes in upper atmosphere)",
        funFact: "Venus rotates in the opposite direction to most other planets - from east to west.",
        desc: "The brightest planet in the sky, also known as the 'Morning Star' or 'Evening Star'. It has a runaway greenhouse effect."
    },
    "Earth": {
        type: "Terrestrial Planet",
        temp: "15°C (Average)",
        diameter: "12,742 km",
        day: "23 Hours 56 Minutes",
        year: "365.25 Days",
        gravity: "9.80 m/s² (1G)",
        atmosphere: "78% Nitrogen, 21% Oxygen",
        escapeVelocity: "11.2 km/s",
        discoveryDate: "—",
        moons: 1,
        life: "EXISTS (The only known place)",
        funFact: "Earth is not a perfect sphere - it's slightly flattened at the poles, forming an 'oblate spheroid'.",
        desc: "The only celestial body in the universe known to harbor life. 70% of its surface is covered by oceans."
    },
    "Moon": {
        type: "Natural Satellite",
        temp: "-23°C (Average)",
        diameter: "3,474 km",
        day: "27.3 Days",
        year: "27.3 Days (Around Earth)",
        gravity: "1.62 m/s²",
        atmosphere: "None",
        escapeVelocity: "2.4 km/s",
        discoveryDate: "Prehistoric",
        moons: 0,
        life: "None",
        funFact: "The Moon is moving away from Earth at a rate of about 3.8 cm per year.",
        desc: "Earth's only natural satellite. It is the main cause of ocean tides on Earth."
    },
    "Mars": {
        type: "Terrestrial Planet",
        temp: "-65°C (Average)",
        diameter: "6,779 km",
        day: "24 Hours 37 Minutes",
        year: "687 Earth Days",
        gravity: "3.71 m/s²",
        atmosphere: "Thin Carbon Dioxide",
        escapeVelocity: "5.0 km/s",
        discoveryDate: "Prehistoric",
        moons: 2,
        life: "Possible in the past / Under investigation",
        funFact: "Mars is home to Olympus Mons (21km), the tallest mountain in the Solar System.",
        desc: "Known as the 'Red Planet' due to iron oxide on its surface. It is the number one target for colonization."
    },
    "Jupiter": {
        type: "Gas Giant",
        temp: "-110°C (Cloud Top)",
        diameter: "139,820 km (11 × Earth)",
        day: "9 Hours 56 Minutes",
        year: "11.86 Years",
        gravity: "24.79 m/s²",
        atmosphere: "Hydrogen, Helium",
        escapeVelocity: "59.5 km/s",
        discoveryDate: "Prehistoric",
        moons: 95,
        life: "Impossible (Possible on moon Europa)",
        funFact: "Jupiter is 2.5 times more massive than all other planets in the Solar System combined.",
        desc: "The king of planets. The 'Great Red Spot' is a colossal storm larger than Earth itself."
    },
    "Saturn": {
        type: "Gas Giant",
        temp: "-140°C",
        diameter: "116,460 km",
        day: "10 Hours 34 Minutes",
        year: "29.45 Years",
        gravity: "10.44 m/s²",
        atmosphere: "Hydrogen, Helium",
        escapeVelocity: "35.5 km/s",
        discoveryDate: "Prehistoric",
        moons: 146,
        life: "Impossible (Possible on moon Enceladus)",
        funFact: "Saturn's density is less than water. It would float in a sufficiently large ocean.",
        desc: "Known for its magnificent ring system. The rings are made of billions of particles of ice, dust, and rock."
    },
    "Uranus": {
        type: "Ice Giant",
        temp: "-195°C",
        diameter: "50,724 km",
        day: "17 Hours 14 Minutes",
        year: "84 Years",
        gravity: "8.69 m/s²",
        atmosphere: "Hydrogen, Helium, Methane",
        escapeVelocity: "21.3 km/s",
        discoveryDate: "1781 (William Herschel)",
        moons: 28,
        life: "Impossible",
        funFact: "Uranus 'rolls' along its orbit. Its axis is tilted at an extreme 98 degrees.",
        desc: "The coldest planet in the system. It has a turquoise color due to methane in its atmosphere."
    },
    "Neptune": {
        type: "Ice Giant",
        temp: "-200°C",
        diameter: "49,244 km",
        day: "16 Hours 6 Minutes",
        year: "165 Years",
        gravity: "11.15 m/s²",
        atmosphere: "Hydrogen, Helium, Methane",
        escapeVelocity: "23.5 km/s",
        discoveryDate: "1846 (Johann Galle)",
        moons: 16,
        life: "Impossible",
        funFact: "Wind speeds on Neptune can reach 2,100 km/h - faster than the speed of sound.",
        desc: "The farthest major planet from the Sun. Its location was predicted through mathematical calculations before it was observed."
    },
    "Ceres": {
        type: "Dwarf Planet",
        temp: "-105°C",
        diameter: "946 km",
        day: "9 Hours",
        year: "4.6 Years",
        gravity: "0.27 m/s²",
        atmosphere: "None (Traces of water vapor)",
        escapeVelocity: "0.51 km/s",
        discoveryDate: "1801 (Giuseppe Piazzi)",
        moons: 0,
        life: "Unknown",
        funFact: "Ceres alone contains one-third of the total mass of the asteroid belt.",
        desc: "The largest object in the Asteroid Belt. It is the only asteroid massive enough to form a spherical shape."
    },
    "Pluto": {
        type: "Dwarf Planet",
        temp: "-229°C",
        diameter: "2,376 km",
        day: "6.4 Days",
        year: "248 Years",
        gravity: "0.62 m/s²",
        atmosphere: "Thin Nitrogen, Methane",
        escapeVelocity: "1.2 km/s",
        discoveryDate: "1930 (Clyde Tombaugh)",
        moons: 5,
        life: "Impossible",
        funFact: "Pluto's surface area is slightly smaller than the area of Russia.",
        desc: "Was considered the 9th planet until 2006. It features a heart-shaped nitrogen glacier called 'Tombaugh Regio'."
    },
    "Eris": {
        type: "Dwarf Planet",
        temp: "-243°C",
        diameter: "2,326 km",
        day: "25.9 Hours",
        year: "557 Years",
        gravity: "0.82 m/s²",
        atmosphere: "Frozen Methane",
        escapeVelocity: "1.4 km/s",
        discoveryDate: "2005 (Mike Brown)",
        moons: 1,
        life: "Impossible",
        funFact: "Eris is so far away that from its surface, the Sun would appear as just a bright star.",
        desc: "Its discovery led to the reclassification of 'planet' and Pluto's demotion to dwarf planet status."
    },
    "Halley": {
        type: "Comet",
        temp: "Increases as it approaches the Sun",
        diameter: "11 km (Nucleus)",
        day: "2.2 Days (Rotation)",
        year: "76 Years (Orbit)",
        gravity: "Very Low",
        atmosphere: "Gas and Dust (Coma)",
        escapeVelocity: "~0.002 km/s",
        discoveryDate: "1705 (Edmond Halley predicted)",
        moons: 0,
        life: "Impossible",
        funFact: "Mark Twain was born during Halley's passage and died during its next appearance.",
        desc: "The most famous comet in history. It can be seen with the naked eye twice in a human lifetime."
    }
};
