// Current Date
import {
  ManageAccounts,
  Trophy,
  Campaign,
  ConnectWithoutContact,
  DesignServices,
  Palette,
  Language,
  Mobile2,
  SportsEsports,
  Analytics,
  Hub,
  Link,
  Cloud,
} from "@material-symbols-svg/react/outlined";

export const curDay = new Date().getDay();
export const curYear = new Date().getFullYear();
export const curDate = new Date().getDate();
export const curMonth = new Date().getMonth();
export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Contact Links
export const LINKS = {
  instagram: "#",
  discord: "#",
  gmail: "#",
  linkedin: "#",
  x: "#",
};

// Department Details
export const reviews = [
  {
    id: "c21ca066-ab4d-40a3-943c-f170d6312bdc",
    icon: ManageAccounts,
    tone: "#8ab4f8",
    name: "Management",
    description: "The backbone of the organization, turning vision into reality by planning, executing, and improvising. Oversees events, operations, and growth.",
  },
  {
    id: "4499a966-2740-4c36-88dd-8916a909fc77",
    icon: Campaign,
    tone: "#FF7A6B",
    name: "Publicity",
    description: "Drives online presence with creative campaigns, video editing, and storytelling, boosting engagement and promoting events.",
  },
  {
    id: "3936d5a2-acd9-4a98-ac97-42c2c92f5c02",
    icon: ConnectWithoutContact,
    tone: "#FFD45E",
    name: "Outreach",
    description: "Builds partnerships and expands outreach by connecting with communities, sponsors, and collaborators.",
  },
  {
    id: "e2ed9c2c-c36c-457f-a8bb-cf2e8bc7c2e1",
    icon: DesignServices,
    tone: "#FF7A6B",
    name: "UI/UX",
    description: "Designs visually appealing, user-friendly digital interfaces with a focus on accessibility, usability, and aesthetics.",
  },
  {
    id: "d3beefc1-f8b0-4202-b26c-36e9804b6636",
    icon: Palette,
    tone: "#FFD45E",
    name: "Creatives / Design",
    description: "Creates stunning visuals, event posters, and branding materials that capture the organization's identity.",
  },
  {
    id: "8143de1d-db17-42fa-958d-13b10804f894",
    icon: Language,
    tone: "#8AB4F8",
    name: "Web Dev",
    description: "Designs, develops, and maintains responsive, high-performance websites for projects and events using modern web technologies.",
  },
  {
    id: "339f0f8a-72f2-44b9-92ab-2b0d4dcfa0f6",
    icon: Mobile2,
    tone: "#6EE7A0",
    name: "App Dev",
    description: "Builds intuitive, impactful mobile applications, improving accessibility and interaction for members and event participants.",
  },
  {
    id: "9055864f-c7dc-44cd-91d5-8759d32a496a",
    icon: SportsEsports,
    tone: "#FF7A6B",
    name: "Game Dev",
    description: "Combines creativity and technical skills to design engaging, entertaining games with real-world tools and production workflows.",
  },
  {
    id: "c0f3b1d1-ce05-45f6-9e34-ac9443fc5fcb",
    icon: Analytics,
    tone: "#8AB4F8",
    name: "Data Science",
    description: "Applies AI, machine learning, and analytics to transform data into actionable insights and solve complex problems.",
  },
  {
    id: "a1d920df-9eb9-49eb-b3a4-e4a3d1245ede",
    icon: Cloud,
    tone: "#FFD45E",
    name: "Cloud & DevOps",
    description: "Explores cloud computing, infrastructure, containerization, CI/CD pipelines, and automation by building scalable applications.",
  },
  {
    id: "6a89c4e2-7b19-4f32-821e-9821a41b5201",
    icon: Hub,
    tone: "#FF7A6B",
    name: "Blockchain",
    description: "Explores decentralized apps, smart contracts, and Web3 development, giving members hands-on experience with protocols.",
  },
  {
    id: "3e9ac635-01d4-495e-aa87-a7335a2403c2",
    icon: Trophy,
    tone: "#6EE7A0",
    name: "Competitive Programming",
    description: "Promotes problem-solving skills through coding contests, hackathons, and peer learning to sharpen algorithms and logic.",
  },
];

// Questionnaire Data
export const QuestionnaireData = [
  {
    department: "Management",
    questions: [
      {
        name: "You are helping organize a college event, but two important tasks are delayed and the deadline is approaching. How would you handle the situation and make sure the event stays on track?",
        type: "long-text",
        placeholder: "Describe your approach..."
      },
      {
        name: "Imagine you are coordinating a team where different members have different opinions about how an event should be conducted. How would you reach a decision that works for the team?",
        type: "long-text",
        placeholder: "Explain how you would handle it..."
      },
      {
        name: "An event has a limited budget, but the team wants to provide a good experience for participants. How would you prioritize the available resources?",
        type: "long-text",
        placeholder: "Describe your priorities..."
      },
      {
        name: "You are responsible for an event and something unexpected goes wrong on the day of the event. What would be your immediate approach to solving the problem while keeping the team calm?",
        type: "long-text",
        placeholder: "Walk us through your approach..."
      },
      {
        name: "Tell us about a time when you took responsibility for organizing, coordinating, or leading something. What was your role, and what did you learn from the experience?",
        type: "long-text",
        placeholder: "Tell us about your experience..."
      }
    ],
  },
  {
    department: "Publicity",
    questions: [
      {
        name: "Imagine ORG is hosting a technical event and registrations are lower than expected. What kind of publicity strategy would you use to increase participation?",
        type: "long-text",
        placeholder: "Describe your campaign idea..."
      },
      {
        name: "If you had to promote a technical workshop to students who know very little about the topic, how would you create content that makes them interested in attending?",
        type: "long-text",
        placeholder: "Describe the content you would create..."
      },
      {
        name: "Which social media platform would you prioritize for promoting a college technical community, and what type of content would you create for it?",
        type: "long-text",
        placeholder: "Explain your choice..."
      }
    ],
  },
  {
    department: "Outreach",
    questions: [
      {
        name: "Suppose you need to approach a company for sponsorship for a college technical event. How would you introduce the event and communicate why the company should partner with you?",
        type: "long-text",
        placeholder: "Write your approach..."
      },
      {
        name: "A potential sponsor is interested but asks what value they would receive from supporting the event. What would you offer them?",
        type: "long-text",
        placeholder: "Describe the value you would provide..."
      },
      {
        name: "How would you approach another college technical community to establish a collaboration with ORG?",
        type: "long-text",
        placeholder: "Explain how you would initiate the collaboration..."
      },
      {
        name: "Imagine a company or community you contacted does not respond to your initial message. How would you follow up professionally without being intrusive?",
        type: "long-text",
        placeholder: "Describe your follow-up strategy..."
      },
      {
        name: "What qualities do you think are important when representing a technical community while communicating with external organizations?",
        type: "long-text",
        placeholder: "Explain your answer..."
      }
    ],
  },
  {
    department: "UI/UX",
    questions: [
      {
        name: "What is the difference between UI design and UX design? Give an example of how they work together in a website or application.",
        type: "long-text",
        placeholder: "Explain with an example..."
      },
      {
        name: "You are designing a website for students who need to find information quickly. What factors would you consider when designing the navigation?",
        type: "long-text",
        placeholder: "Describe your design considerations..."
      },
      {
        name: "How would you approach designing a responsive interface that works well on both mobile phones and desktop screens?",
        type: "long-text",
        placeholder: "Describe your approach..."
      },
      {
        name: "A user tells you that a website is difficult to use, but cannot explain exactly why. How would you identify the usability problems?",
        type: "long-text",
        placeholder: "Explain your process..."
      },
      {
        name: "What is a wireframe, and how does it help during the design process?",
        type: "long-text",
        placeholder: "Explain in your own words..."
      },
      {
        name: "Imagine you have to redesign the registration page for a college event. What information would you prioritize and how would you structure the page?",
        type: "long-text",
        placeholder: "Describe your proposed layout..."
      },
      {
        name: "How do typography, spacing, contrast, and visual hierarchy affect the usability of an interface?",
        type: "long-text",
        placeholder: "Explain your understanding..."
      },
      {
        name: "Two members of your team disagree strongly about a design decision. How would you decide which design is better?",
        type: "long-text",
        placeholder: "Describe how you would evaluate the designs..."
      },
      {
        name: "What tools have you used or explored for UI/UX design, and what have you created with them?",
        type: "long-text",
        placeholder: "Tell us about your tools and projects..."
      },
      {
        name: "Pick an application or website you use frequently. What is one UX problem you would improve, and how would you redesign it?",
        type: "long-text",
        placeholder: "Describe the problem and your solution..."
      }
    ],
  },
  {
    department: "Creatives / Design",
    questions: [
      {
        name: "What makes a poster visually effective, especially when it needs to communicate information quickly to college students?",
        type: "long-text",
        placeholder: "Explain your design thinking..."
      },
      {
        name: "Suppose you are designing a poster for a technical workshop. How would you decide the typography, layout, imagery, and color palette?",
        type: "long-text",
        placeholder: "Describe your design process..."
      },
      {
        name: "What is the difference between a good-looking design and an effective design?",
        type: "long-text",
        placeholder: "Explain your perspective..."
      },
      {
        name: "If you are given an existing design and asked to make it more visually appealing without changing its core message, what would you improve?",
        type: "long-text",
        placeholder: "Describe the changes you would make..."
      },
      {
        name: "Which design tools have you used, and what kind of work have you created using them?",
        type: "long-text",
        placeholder: "Tell us about your experience..."
      },
      {
        name: "Imagine ORG needs a consistent visual identity across posters, social media posts, certificates, and event banners. How would you maintain that consistency?",
        type: "long-text",
        placeholder: "Describe your approach..."
      }
    ],
  },
  {
    department: "Web Dev",
    questions: [
      {
        name: "Describe a web project you have worked on. What technologies did you use, what was your role, and what was the biggest challenge you faced?",
        type: "long-text",
        placeholder: "Tell us about your project..."
      },
      {
        name: "The statement \"it works on my machine\" is a red flag in team development. What concrete habits or setup choices would you use to make sure your code works reliably in other developers' environments?",
        type: "long-text",
        placeholder: "Explain your approach..."
      },
      {
        name: "How would you approach building a responsive website that works well across different screen sizes and devices?",
        type: "long-text",
        placeholder: "Describe your approach..."
      },
      {
        name: "A website you developed suddenly becomes very slow after adding several new features. How would you investigate and improve its performance?",
        type: "long-text",
        placeholder: "Walk us through your debugging process..."
      },
      {
        name: "How would you structure a frontend project so that its components remain reusable and maintainable as the project grows?",
        type: "long-text",
        placeholder: "Describe your project structure..."
      },
      {
        name: "What web technologies or frameworks are you currently learning, and what would you like to build using them?",
        type: "long-text",
        placeholder: "Tell us what you are learning..."
      },
      {
        name: "Suppose a user reports a bug that you cannot reproduce on your own computer. What steps would you take to identify and fix it?",
        type: "long-text",
        placeholder: "Describe your debugging strategy..."
      },
      {
        name: "If you were asked to build a website for ORG, what would you build and what features would you consider most useful for students?",
        type: "long-text",
        placeholder: "Describe your idea..."
      }
    ],
  },
  {
    department: "App Dev",
    questions: [
      {
        name: "Describe a mobile application you have built or worked on. What technologies did you use, and what was your contribution?",
        type: "long-text",
        placeholder: "Tell us about your application..."
      },
      {
        name: "How would you design an application that needs to work reliably even when the user's internet connection is slow or temporarily unavailable?",
        type: "long-text",
        placeholder: "Describe your approach..."
      },
      {
        name: "What is the difference between native and cross-platform app development? What factors would influence your choice between them?",
        type: "long-text",
        placeholder: "Explain your reasoning..."
      },
      {
        name: "Suppose an application is consuming too much battery and becoming slow on a user's device. How would you investigate the problem?",
        type: "long-text",
        placeholder: "Describe your debugging process..."
      },
      {
        name: "What mobile development technologies are you currently learning, and what kind of application would you like to build with them?",
        type: "long-text",
        placeholder: "Tell us about your interests..."
      }
    ],
  },
  {
    department: "Game Dev",
    questions: [
      {
        name: "Describe a game you have created or worked on. What game engine or technologies did you use, and what was your role?",
        type: "long-text",
        placeholder: "Tell us about your game..."
      },
      {
        name: "What makes a game enjoyable beyond simply having good graphics?",
        type: "long-text",
        placeholder: "Explain your perspective..."
      },
      {
        name: "How would you design the core gameplay loop for a simple game intended to keep players engaged?",
        type: "long-text",
        placeholder: "Describe your game design..."
      },
      {
        name: "Suppose your game runs smoothly in the editor but experiences significant frame drops on a real device. How would you investigate the problem?",
        type: "long-text",
        placeholder: "Explain your debugging process..."
      },
      {
        name: "What is the role of physics, collision detection, and game state management in a typical game?",
        type: "long-text",
        placeholder: "Explain your understanding..."
      },
      {
        name: "Which game-development tools or engines have you explored, such as Unity, Godot, Unreal Engine, or others? What have you built with them?",
        type: "long-text",
        placeholder: "Tell us about your experience..."
      },
      {
        name: "If ORG asked you to build a small game for an event, what would you make and why would students enjoy playing it?",
        type: "long-text",
        placeholder: "Describe your game idea..."
      }
    ],
  },
  {
    department: "Data Science",
    questions: [
      {
        name: "What is the difference between data analysis, machine learning, and artificial intelligence?",
        type: "long-text",
        placeholder: "Explain the differences..."
      },
      {
        name: "You receive a dataset containing missing values, duplicate records, and inconsistent formats. What steps would you take before analyzing it?",
        type: "long-text",
        placeholder: "Describe your preprocessing steps..."
      },
      {
        name: "What is the difference between supervised and unsupervised learning? Give an example of each.",
        type: "long-text",
        placeholder: "Explain with examples..."
      },
      {
        name: "Suppose you train a machine-learning model that performs extremely well on the training data but poorly on new data. What might be happening, and how would you address it?",
        type: "long-text",
        placeholder: "Explain the problem and solution..."
      },
      {
        name: "How would you decide which features to use when building a machine-learning model?",
        type: "long-text",
        placeholder: "Describe your approach..."
      },
      {
        name: "Which programming languages, libraries, or tools have you used for data science or machine learning, and what have you built with them?",
        type: "long-text",
        placeholder: "Tell us about your experience..."
      },
      {
        name: "Imagine ORG has registration data from several events. What useful insights could you extract from that data to help organize future events?",
        type: "long-text",
        placeholder: "Describe the insights you would look for..."
      }
    ],
  },
  {
    department: "Cloud & DevOps",
    questions: [
      {
        name: "Explain what happens when you type a website's URL into your browser and press Enter. Describe the process at a high level.",
        type: "long-text",
        placeholder: "Explain the process..."
      },
      {
        name: "What problem does containerization solve, and why are tools such as Docker useful when developing and deploying applications?",
        type: "long-text",
        placeholder: "Explain in your own words..."
      },
      {
        name: "Suppose an application works correctly during development but fails after being deployed to a server. How would you approach debugging the issue?",
        type: "long-text",
        placeholder: "Describe your debugging process..."
      },
      {
        name: "What is CI/CD, and how could it improve the workflow of a team developing a web or mobile application?",
        type: "long-text",
        placeholder: "Explain with an example..."
      }
    ],
  },
  {
    department: "Blockchain",
    questions: [
      {
        name: "What problem does blockchain technology attempt to solve, and how is it different from a traditional centralized database?",
        type: "long-text",
        placeholder: "Explain your understanding..."
      },
      {
        name: "What is a smart contract? Give an example of a situation where a smart contract could be useful.",
        type: "long-text",
        placeholder: "Explain with an example..."
      },
      {
        name: "What is the difference between a cryptocurrency, a blockchain, and a decentralized application (dApp)?",
        type: "long-text",
        placeholder: "Explain the differences..."
      },
      {
        name: "Suppose you are developing a blockchain application and need to store a large amount of user data. Would you store everything directly on-chain? Explain your approach.",
        type: "long-text",
        placeholder: "Describe your architecture..."
      }
    ],
  },
  {
    department: "Competitive Programming",
    questions: [
      {
        name: "Given an array of integers, how would you find the largest and second-largest elements efficiently? What would be the time complexity?",
        type: "long-text",
        placeholder: "Explain your algorithm and complexity..."
      },
      {
        name: "What is the difference between an array, linked list, stack, and queue? Give one situation where each could be useful.",
        type: "long-text",
        placeholder: "Explain with examples..."
      },
      {
        name: "What is Big-O notation, and why is understanding time and space complexity important in competitive programming?",
        type: "long-text",
        placeholder: "Explain your understanding..."
      },
      {
        name: "Explain the difference between breadth-first search (BFS) and depth-first search (DFS). When would you prefer one over the other?",
        type: "long-text",
        placeholder: "Explain with examples..."
      },
      {
        name: "You are given a problem that can be solved using either brute force or a more optimized approach. How would you identify whether optimization is necessary and decide which approach to use?",
        type: "long-text",
        placeholder: "Describe your problem-solving process..."
      },
      {
        name: "Choose a programming language you are comfortable with for competitive programming. Explain why you prefer it and describe a problem you have solved using it.",
        type: "long-text",
        placeholder: "Tell us about your experience..."
      }
    ],
  },
];

// Sample Admin Data
export const sampleAdminHeader = [
  {
    Header: "SrNo",
    accessor: "srno",
  },
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Email",
    accessor: "email",
  },
  {
    Header: "Department",
    accessor: "department",
  },
];

// Headers for CSV exports
export const CSV_Header = [
  {
    label: "Name",
    key: "Name",
  },
  {
    label: "Email",
    key: "Email",
  },
  {
    label: "Registration Number",
    key: "RegistrationNumber",
  },
  {
    label: "Phone",
    key: "Phone",
  },
  {
    label: "Department",
    key: "Department",
  },

  {
    label: "Preference",
    key: "Pref",
  },
  {
    label: "Shortlisted",
    key: "shortlisted",
  },
  {
    label: "Questions",
    key: "Questions",
  },
];

// Mailing Templates
export const mailingTemplate = {
  Interview:
    "<p>Edit content</p><br><p>Thank you for applying to Organization Name. We are excited to let you know that you have been shortlisted for joining the #dept Department!</p><p>We look forward to your active participation!</p>",
};

export const technicalCards = [
  {
    title: "Blockchain",
    description:
      "Explores decentralized apps, smart contracts, and Web3 development, giving members hands-on experience with blockchain protocols and tools.",
    color: "#FF7A6B",
    image: "/assets/images/icons/blockchain.svg",
    formLink: "/6a89c4e2-7b19-4f32-821e-9821a41b5201",
  },
  {
    title: "Cloud &\nDevOps",
    description:
      "Explores cloud computing, infrastructure, and automation by building scalable applications, hosting hands-on workshops, and educating members about cloud platforms, containerization, CI/CD pipelines, and DevOps practices.",
    color: "#FBBC04",
    image: "/assets/images/icons/cloud.svg",
    formLink: "/a1d920df-9eb9-49eb-b3a4-e4a3d1245ede", // Cloud & DevOps ID
  },
  {
    title: "Game Dev",
    description:
      "Combines creativity and technical skills to design engaging, entertaining games, giving members hands-on experience with real-world game development tools, engines, and production workflows.",
    color: "#4285F4",
    image: "/assets/images/icons/game-dev.svg",
    formLink: "/9055864f-c7dc-44cd-91d5-8759d32a496a", // App Development ID (placeholder)
  },
  {
    title: "App Dev",
    description:
      "Builds intuitive, impactful mobile applications, improving accessibility, interaction, and convenience for members and event participants through functional, user-focused design.",
    color: "#EA4335",
    image: "/assets/images/icons/app-dev.svg",
    formLink: "/339f0f8a-72f2-44b9-92ab-2b0d4dcfa0f6",
  },
  {
    title: "UI/UX",
    description:
      "Designs visually appealing, user-friendly digital interfaces with a focus on accessibility, usability, and aesthetics, ensuring products provide enjoyable, intuitive, and meaningful user experiences.",
    color: "#0F9D58",
    image: "/assets/images/icons/ui-ux.svg",
    formLink: "/e2ed9c2c-c36c-457f-a8bb-cf2e8bc7c2e1",
  },
  {
    title: "Data\nScience",
    description:
      "Applies AI, machine learning, and analytics to transform data into actionable insights, helping solve problems, build predictive models, and inspire innovation across projects.",
    color: "#EA4335",
    image: "/assets/images/icons/data-science.svg",
    formLink: "/c0f3b1d1-ce05-45f6-9e34-ac9443fc5fcb", // App Development ID (placeholder)
  },
  {
    title: "Competitive Programming",
    description:
      "Promotes problem-solving skills through coding contests, hackathons, and peer learning, helping members sharpen algorithms, logic, and efficiency while preparing for real-world tech challenges.",
    color: "#0F9D58",
    image: "/assets/images/icons/cp.svg",
    formLink: "/3e9ac635-01d4-495e-aa87-a7335a2403c2", // App Development ID (placeholder)
  },
  {
    title: "Web Dev",
    description:
      "Designs, develops, and maintains responsive, high-performance websites for projects and events, using modern web technologies to enhance accessibility, user experience, and community engagement online.",
    color: "#FBBC04",
    image: "/assets/images/icons/web-dev.svg",
    formLink: "/8143de1d-db17-42fa-958d-13b10804f894",
  },
  {
    title: "Open\nSource",
    description:
      "Encourages members to contribute to open-source projects, building collaboration skills, real-world coding experience, and a culture of transparency, learning, and global tech impact.",
    color: "#4285F4",
    image: "/assets/images/icons/open-source.svg",
    formLink: "/ae7db51a-c6db-4f8d-9159-40767c5354cb", // App Development ID (placeholder)
  },
];

export const nonTechnicalCards = [
  {
    title: "Design",
    description:
      "Creates stunning visuals, event posters, and branding materials that capture the organization's identity, ensuring every design communicates creativity, professionalism, and excitement to engage the community.",
    color: "#329A4E",
    image: "/assets/images/icons/design.svg",
    formLink: "/d3beefc1-f8b0-4202-b26c-36e9804b6636",
  },
  {
    title: "Outreach",
    description:
      "Builds partnerships and expands outreach by connecting with communities, sponsors, and collaborators, ensuring diverse opportunities and impactful collaborations both within and beyond campus.",
    color: "#4285F4",
    image: "/assets/images/icons/outreach.svg",
    formLink: "/3936d5a2-acd9-4a98-ac97-42c2c92f5c02", // App Development ID (placeholder)
  },
  {
    title: "Publicity",
    description:
      "Drives online presence with creative campaigns, video editing, and storytelling, boosting engagement, promoting events, and showcasing the club to inspire participation and community growth.",
    color: "#EA4335",
    image: "/assets/images/icons/social-media.svg",
    formLink: "/4499a966-2740-4c36-88dd-8916a909fc77", // App Development ID (placeholder)
  },
  {
    title: "Management",
    description:
      "The backbone of the organization, turning vision into reality by planning, executing, and improvising. Oversees events, operations, and growth, ensuring smooth functioning, success, and impactful experiences.",
    color: "#FBBC04",
    image: "/assets/images/icons/management.svg",
    formLink: "/c21ca066-ab4d-40a3-943c-f170d6312bdc", // App Development ID (placeholder)
  },
];
