type Route = {
  title: string,
  path: string
}

type FooterCol = {
  title: string,
  links: {
    name: string,
    link: string,
    icon?: string,
    leavesWebsite: boolean
  }[]
}

type Footer = {
  columns: FooterCol[]
  support: {
    buymeacoffee: string
    paypal: string
    message: string
  }
};

export const routes: Route[] = [
  {
    title: "Home",
    path: "/",
  },
  // {
  //   title: "Blog",
  //   path: "/blog",
  // },
  {
    title: "Projects",
    path: "/projects",
  },
  {
    title: "Designs",
    path: "/designs",
  },
];


export const footer: Footer = {
  columns: [
    {
      title: "Pages",
      links: [
        {
          name: "Home",
          link: "/",
          leavesWebsite: false,
        },
        // {
        //   name: "Blog",
        //   link: "/blog",
        //   leavesWebsite: false,
        // },
        // {
        //   name: "Projects",
        //   link: "/projects",
        //   leavesWebsite: false,
        // },
        // {
        //   name: "Designs",
        //   link: "/designs",
        //   leavesWebsite: false,
        // },
      ],
    },
    {
      title: "Social",
      links: [
        {
          name: "GitHub",
          link: "https://github.com/arjundubeyg",
          icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
          leavesWebsite: true,
        },
        {
          name: "LinkedIn",
          link: "https://www.linkedin.com/in/arjundubeycom/",
          icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linkedin/linkedin-original.svg",
          leavesWebsite: true,
        },
        // {
        //   name: "Dribbble",
        //   link: "https://eentw",
        //   icon: "/static/icons/dribbble-f.svg",
        //   leavesWebsite: true,
        // },
        // {
        //   name: "IndieHackers",
        //   link: "httpsentw",
        //   icon: "/static/icons/indiehackers-f.svg",
        //   leavesWebsite: true,
        // },
        // {
        //   name: "Email",
        //   link: "mailto:f",
        //   icon: "/static/icons/mail-f.svg",
        //   leavesWebsite: true,
        // },
      ],
    },
  ],
  support: {
    buymeacoffee: "",
    paypal: "",
    message: "I appreciate your support very much! 💙",
  },
};